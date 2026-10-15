import http from 'k6/http';
import { check, sleep, fail } from 'k6';
import { Trend, Counter } from 'k6/metrics';

// ===== 환경에 맞춰 바꿀 값 (-e KEY=VALUE 로 덮어쓸 수 있음) =====
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const CONCERT_ID = __ENV.CONCERT_ID || '2';          // 아래 좌석 ID 범위가 속한 콘서트 ID
const VUS = parseInt(__ENV.VUS || '100');            // 동시 접속자 수
const HOT_SEATS = parseInt(__ENV.HOT_SEATS || '20'); // 경합을 만들 인기 좌석 수 (작을수록 충돌 증가)
const SEAT_MIN = parseInt(__ENV.SEAT_MIN || '89');   // 좌석 ID 범위 (좌석 목록 응답을 못 읽을 때의 대비용)
const SEAT_MAX = parseInt(__ENV.SEAT_MAX || '188');
const USE_QUEUE = (__ENV.USE_QUEUE || 'true') === 'true';
const CONFIRM = (__ENV.CONFIRM || 'true') === 'true'; // hold 성공 후 confirm까지 진행할지

const SIGNUP = (__ENV.SIGNUP || 'false') === 'true'; // loadtest1~N 계정이 없을 때만 -e SIGNUP=true
const USER_PREFIX = __ENV.USER_PREFIX || 'loadtest';
const USER_PASSWORD = __ENV.USER_PASSWORD || 'test1234!';

const POLL_INTERVAL_SEC = 2;  // status 폴링 주기 (프론트와 동일하게)
const MAX_WAIT_SEC = 120;     // 이 시간을 넘게 기다리면 타임아웃 처리
const JSON_HEADERS = { 'Content-Type': 'application/json' };

// ===== 커스텀 지표 =====
const queueWaitTime = new Trend('queue_wait_time', true); // 진입 ~ 입장 허용까지 걸린 시간
const holdSuccess = new Counter('hold_success');
const holdConflict = new Counter('hold_conflict');         // 이미 선점된 좌석 (정상적인 경합 결과)
const holdError = new Counter('hold_error');               // 403, 5xx 등 예상 밖 실패
const confirmSuccess = new Counter('confirm_success');
const confirmFail = new Counter('confirm_fail');
const queueTimeout = new Counter('queue_timeout');
const soldOut = new Counter('sold_out');                   // 조회 시점에 남은 좌석이 없던 경우
const holdStatus = new Counter('hold_status');             // hold 응답 코드별 집계
const confirmStatus = new Counter('confirm_status');       // confirm 응답 코드별 집계

// 409(좌석 충돌)는 실패로 세지 않기 위해 정상 상태로 등록
http.setResponseCallback(http.expectedStatuses({ min: 200, max: 299 }, 409));

export const options = {
    setupTimeout: '300s', // 로그인은 비밀번호 해싱 때문에 계정당 수백 ms 걸릴 수 있음
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
        // 요약에 응답 코드별 건수를 보이게 하는 설정 (통과/실패 기준 아님)
        'hold_status{status:204}': ['count>=0'],
        'hold_status{status:403}': ['count>=0'],
        'hold_status{status:409}': ['count>=0'],
        'hold_status{status:500}': ['count>=0'],
        'confirm_status{status:204}': ['count>=0'],
        'confirm_status{status:400}': ['count>=0'],
        'confirm_status{status:409}': ['count>=0'],
        'confirm_status{status:500}': ['count>=0'],
    },
};

const isOk = (status) => status >= 200 && status < 300;

// 모든 가상 유저의 (가입 →) 로그인을 테스트 시작 전에 처리 (이 부하가 측정에 섞이지 않게)
export function setup() {
    const tokens = [];

    for (let i = 1; i <= VUS; i++) {
        const username = `${USER_PREFIX}${i}`;

        if (SIGNUP) {
            const signup = http.post(
                `${BASE_URL}/user`,
                JSON.stringify({
                    username,
                    email: `${username}@test.com`,
                    nickname: username,
                    password: USER_PASSWORD,
                }),
                { headers: JSON_HEADERS, tags: { name: 'signup' } }
            );
            if (i === 1) {
                console.log(`signup: ${signup.status} ${signup.body}`);
            }
        }

        const res = http.post(
            `${BASE_URL}/login`,
            JSON.stringify({ username, password: USER_PASSWORD }),
            { headers: JSON_HEADERS, tags: { name: 'login' } }
        );
        if (res.status !== 200) {
            fail(`로그인 실패 (user ${i}): status=${res.status}, body=${res.body}`);
        }
        tokens.push(res.json('accessToken'));
    }
    return { tokens };
}

export default function (data) {
    const reqParams = (name) => ({
        headers: { ...JSON_HEADERS, Authorization: `Bearer ${data.tokens[__VU - 1]}` },
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
    const seats = seatsRes.json();
    if (__VU === 1) {
        console.log(`좌석 목록 응답 형태 확인: ${JSON.stringify(seats).slice(0, 300)}`);
    }

    let seatId;
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

    const hold = http.post(`${BASE_URL}/api/seats/${seatId}/hold`, null, reqParams('hold'));
    holdStatus.add(1, { status: String(hold.status) });
    if (__VU <= 3) {
        console.log(`VU${__VU} hold(seat ${seatId}): ${hold.status} ${hold.body}`);
    }

    if (isOk(hold.status)) {
        holdSuccess.add(1);
    } else if (hold.status === 409) {
        holdConflict.add(1);
        return;
    } else {
        holdError.add(1); // 403(토큰 문제), 5xx 등
        return;
    }

    // 4. 확정 (hold 성공자만)
    if (!CONFIRM) {
        return;
    }
    const confirm = http.post(`${BASE_URL}/api/seats/${seatId}/confirm`, null, reqParams('confirm'));
    confirmStatus.add(1, { status: String(confirm.status) });
    if (__VU <= 3) {
        console.log(`VU${__VU} confirm(seat ${seatId}): ${confirm.status} ${confirm.body}`);
    }
    if (isOk(confirm.status)) {
        confirmSuccess.add(1);
    } else {
        confirmFail.add(1);
    }
}