import http from 'k6/http';
import { check, sleep, fail } from 'k6';
import { Trend, Counter } from 'k6/metrics';

// ===== 환경에 맞춰 바꿀 값 (-e KEY=VALUE 로 덮어쓸 수 있음) =====
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const CONCERT_ID = __ENV.CONCERT_ID || '2';
const VUS = parseInt(__ENV.VUS || '100');            // 동시 접속자 수
const HOT_SEATS = parseInt(__ENV.HOT_SEATS || '20'); // 경합을 만들 인기 좌석 수 (작을수록 충돌 증가)
const SEAT_MIN = parseInt(__ENV.SEAT_MIN || '51');   // 좌석 ID 범위 (좌석 목록 응답을 못 읽을 때의 대비용)
const SEAT_MAX = parseInt(__ENV.SEAT_MAX || '100');
const USE_QUEUE = (__ENV.USE_QUEUE || 'true') === 'true';

const SIGNUP_PATH = __ENV.SIGNUP_PATH || '/user';
const LOGIN_PATH = __ENV.LOGIN_PATH || '/login';
const SIGNUP = (__ENV.SIGNUP || 'true') === 'true';  // 계정을 이미 만들었다면 -e SIGNUP=false
const USER_PREFIX = __ENV.USER_PREFIX || 'loadtest'; // loadtest1 ~ loadtestN
const USER_PASSWORD = __ENV.USER_PASSWORD || 'password1234';

const POLL_INTERVAL_SEC = 2;  // status 폴링 주기 (프론트와 동일하게)
const MAX_WAIT_SEC = 120;     // 이 시간을 넘게 기다리면 타임아웃 처리

// ===== 커스텀 지표 =====
const queueWaitTime = new Trend('queue_wait_time', true); // 진입 ~ 입장 허용까지 걸린 시간
const holdSuccess = new Counter('hold_success');
const holdConflict = new Counter('hold_conflict');         // 이미 선점된 좌석 (정상적인 경합 결과)
const holdError = new Counter('hold_error');               // 403, 5xx 등 예상 밖 실패
const queueTimeout = new Counter('queue_timeout');
const soldOut = new Counter('sold_out');                   // 조회 시점에 남은 좌석이 없던 경우

// 409(좌석 충돌)는 실패로 세지 않기 위해 정상 상태로 등록
// TODO: 서버가 충돌 시 409가 아닌 다른 코드를 준다면 여기도 맞춰야 함
http.setResponseCallback(http.expectedStatuses({ min: 200, max: 299 }, 409));

export const options = {
    setupTimeout: '300s', // 가입/로그인은 비밀번호 해싱 때문에 계정당 수백 ms 걸릴 수 있음
    scenarios: {
        ticketing: {
            executor: 'per-vu-iterations', // 가상 유저 1명 = 예매 시도 1회
            vus: VUS,
            iterations: 1,
            maxDuration: '5m',
        },
    },
    thresholds: {
        'http_req_duration{name:status}': ['p(95)<500'],
        'http_req_duration{name:hold}': ['p(95)<1000'],
        hold_error: ['count==0'],
        queue_timeout: ['count==0'],
    },
};

// 모든 가상 유저의 가입/로그인을 테스트 시작 전에 처리 (이 부하가 측정에 섞이지 않게)
export function setup() {
    const jsonHeaders = { 'Content-Type': 'application/json' };
    const tokens = [];

    for (let i = 1; i <= VUS; i++) {
        const username = `${USER_PREFIX}${i}`;

        // 1. 회원가입 (이미 있는 계정이라 실패해도 무시)
        if (SIGNUP) {
            const signup = http.post(
                `${BASE_URL}${SIGNUP_PATH}`,
                JSON.stringify({
                    username,
                    password: USER_PASSWORD,
                    email: `${username}@test.com`,
                    nickname: username,
                }),
                { headers: jsonHeaders, tags: { name: 'signup' } }
            );
            if (i === 1 && (signup.status < 200 || signup.status >= 300)) {
                console.warn(`회원가입 응답 (이미 가입된 계정이면 정상): status=${signup.status}, body=${signup.body}`);
            }
        }

        // 2. 로그인
        // TODO: 로그인 요청 바디의 필드명을 실제에 맞출 것
        const res = http.post(
            `${BASE_URL}${LOGIN_PATH}`,
            JSON.stringify({ username, password: USER_PASSWORD }),
            { headers: jsonHeaders, tags: { name: 'login' } }
        );
        if (res.status !== 200) {
            fail(`로그인 실패 (user ${i}): status=${res.status}, body=${res.body}`);
        }

        // TODO: 응답의 토큰 필드명(accessToken)을 실제에 맞출 것
        const token = res.json('accessToken');
        if (!token) {
            fail(`토큰을 찾지 못함 (user ${i}): body=${res.body}`);
        }
        tokens.push(token);
    }
    return { tokens };
}

export default function (data) {
    const token = data.tokens[__VU - 1];
    const reqParams = (name) => ({
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        tags: { name },
    });

    // 1. 대기열 진입 → 입장 허용될 때까지 폴링
    if (USE_QUEUE) {
        const start = Date.now();
        const enter = http.post(`${BASE_URL}/waiting/enter`, null, reqParams('enter'));
        if (!check(enter, { 'enter 200': (r) => r.status === 200 })) {
            holdError.add(1);
            return;
        }

        let allowed = enter.json('status') === 'ALLOWED';
        while (!allowed) {
            if ((Date.now() - start) / 1000 > MAX_WAIT_SEC) {
                queueTimeout.add(1);
                return;
            }
            sleep(POLL_INTERVAL_SEC);

            const st = http.get(`${BASE_URL}/waiting/status`, reqParams('status'));
            if (st.status !== 200) {
                continue;
            }
            const state = st.json('status');
            if (state === 'ALLOWED') {
                allowed = true;
            } else if (state === 'NONE') {
                // 순간적인 공백이거나 토큰 만료 → 다시 진입
                http.post(`${BASE_URL}/waiting/enter`, null, reqParams('enter'));
            }
        }
        queueWaitTime.add(Date.now() - start);
    }

    // 2. 좌석 목록 조회
    const seatsRes = http.get(`${BASE_URL}/api/concerts/${CONCERT_ID}/seats`, reqParams('seats'));
    if (!check(seatsRes, { 'seats 200': (r) => r.status === 200 })) {
        holdError.add(1);
        return;
    }

    // 3. 인기 좌석 몇 개 중에서 골라 hold → 락 경합 발생
    // TODO: 응답 구조에 맞게 수정 (여기서는 [{ id, status }] 배열이라고 가정)
    let seatId;
    const seats = seatsRes.json();
    if (Array.isArray(seats)) {
        const available = seats.filter((s) => s.status === 'AVAILABLE');
        if (available.length === 0) {
            soldOut.add(1);
            return; // 남은 좌석 없음
        }
        const pool = available.slice(0, HOT_SEATS);
        seatId = pool[Math.floor(Math.random() * pool.length)].id;
    } else {
        // 응답 구조를 읽을 수 없으면 ID 범위의 앞쪽 HOT_SEATS개 중에서 랜덤 선택
        const range = Math.min(HOT_SEATS, SEAT_MAX - SEAT_MIN + 1);
        seatId = SEAT_MIN + Math.floor(Math.random() * range);
    }

    // TODO: 실제 hold 경로/바디에 맞출 것
    const hold = http.post(`${BASE_URL}/api/seats/${seatId}/hold`, null, reqParams('hold'));

    if (hold.status >= 200 && hold.status < 300) {
        holdSuccess.add(1);
    } else if (hold.status === 409) {
        holdConflict.add(1);
    } else {
        holdError.add(1); // 403(토큰 문제), 5xx 등
    }
}