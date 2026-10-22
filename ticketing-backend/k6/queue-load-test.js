
import http from 'k6/http';
import { check, sleep, fail } from 'k6';
import { Trend, Counter } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const CONCERT_ID = __ENV.CONCERT_ID || '7';
const VUS = parseInt(__ENV.VUS || '1000', 10);
const HOT_SEATS = parseInt(__ENV.HOT_SEATS || '1252', 10);
const SEAT_MIN = parseInt(__ENV.SEAT_MIN || '1252', 10);
const SEAT_MAX = parseInt(__ENV.SEAT_MAX || '2251', 10);
const USE_QUEUE = (__ENV.USE_QUEUE || 'true') === 'true';
const SIGNUP_PATH = __ENV.SIGNUP_PATH || '/api/user';
const LOGIN_PATH = __ENV.LOGIN_PATH || '/login';
const SIGNUP = (__ENV.SIGNUP || 'false') === 'true';
const USER_PREFIX = __ENV.USER_PREFIX || 'test';
const USER_PASSWORD = __ENV.USER_PASSWORD || 'password1234';

const POLL_INTERVAL_SEC = 5;
const MAX_WAIT_SEC = 120;
const BATCH_SIZE = 100;

const queueWaitTime = new Trend('queue_wait_time', true);
const holdSuccess = new Counter('hold_success');
const holdConflict = new Counter('hold_conflict');
const holdError = new Counter('hold_error');
const queueTimeout = new Counter('queue_timeout');
const soldOut = new Counter('sold_out');

http.setResponseCallback(
    http.expectedStatuses({ min: 200, max: 299 }, 409)
);

export const options = {
    setupTimeout: '10m',

    scenarios: {
        ticketing: {
            executor: 'per-vu-iterations',
            vus: VUS,
            iterations: 1,
            maxDuration: '5m',
            gracefulStop: '30s',
        },
    },

    thresholds: {
        'http_req_duration{name:status}': ['p(95)<500'],
        'http_req_duration{name:hold}': ['p(95)<1000'],
        hold_error: ['count==0'],
        queue_timeout: ['count==0'],
    },
};

// 테스트 전 회원가입 및 로그인
export function setup() {
    const jsonHeaders = {
        'Content-Type': 'application/json',
    };

    // 각 VU가 사용할 JWT를 저장
    const tokens = new Array(VUS);

    // 1. 회원가입: 100명씩 배치 요청
    if (SIGNUP) {
        for (let start = 1; start <= VUS; start += BATCH_SIZE) {
            const end = Math.min(start + BATCH_SIZE, VUS + 1);
            const requests = [];

            for (let i = start; i < end; i++) {
                const username = `${USER_PREFIX}${i}`;

                requests.push({
                    method: 'POST',
                    url: `${BASE_URL}${SIGNUP_PATH}`,
                    body: JSON.stringify({
                        username,
                        password: USER_PASSWORD,
                        email: `${username}@test.com`,
                        nickname: username,
                    }),
                    params: {
                        headers: jsonHeaders,
                        tags: { name: 'signup' },
                    },
                });
            }

            const responses = http.batch(requests);

            for (let j = 0; j < responses.length; j++) {
                const res = responses[j];
                const userNumber = start + j;

                // 서버 오류는 회원가입 단계에서 확인
                if (res.status >= 500) {
                    fail(
                        `회원가입 서버 오류: user=${userNumber}, status=${res.status}`
                            `status=${res.status}, body=${res.body}`
                    );
                }
            }
        }
    }

    // 2. 로그인: 100명씩 배치 요청
    for (let start = 1; start <= VUS; start += BATCH_SIZE) {
        const end = Math.min(start + BATCH_SIZE, VUS + 1);
        const requests = [];

        for (let i = start; i < end; i++) {
            const username = `${USER_PREFIX}${i}`;

            requests.push({
                method: 'POST',
                url: `${BASE_URL}${LOGIN_PATH}`,
                body: JSON.stringify({
                    username,
                    password: USER_PASSWORD,
                }),
                params: {
                    headers: jsonHeaders,
                    tags: { name: 'login' },
                },
            });
        }

        const responses = http.batch(requests);

        for (let j = 0; j < responses.length; j++) {
            const res = responses[j];
            const userNumber = start + j;

            if (res.status !== 200) {
                fail(
                    `로그인 실패: user=${userNumber}, status=${res.status}, body=${res.body}`
                );
            }

            const token = res.json('accessToken');

            if (!token) {
                fail(
                    `토큰을 찾지 못함: user=${userNumber}, body=${res.body}`
                );
            }

            tokens[userNumber - 1] = token;
        }
    }

    return { tokens };
}

// 실제 대기열 및 좌석 선점 부하 테스트
export default function (data) {
    const token = data.tokens[__VU - 1];

    if (!token) {
        holdError.add(1);
        fail(`VU ${__VU}의 JWT 토큰이 없습니다.`);
    }

    const reqParams = (name) => ({
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        tags: {name},
    });

    // 1. 대기열 진입 및 입장 허용 대기
    if (USE_QUEUE) {
        const start = Date.now();

        const enter = http.post(
            `${BASE_URL}/waiting/enter`,
            null,
            reqParams('enter')
        );

        if (
            !check(enter, {
                'enter 200': (r) => r.status === 200,
            })
        ) {
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

            const st = http.get(
                `${BASE_URL}/waiting/status`,
                reqParams('status')
            );

            if (st.status !== 200) {
                continue;
            }

            const state = st.json('status');

            if (state === 'ALLOWED') {
                allowed = true;
            } else if (state === 'NONE') {
                http.post(
                    `${BASE_URL}/waiting/enter`,
                    null,
                    reqParams('enter')
                );
            }
        }

        queueWaitTime.add(Date.now() - start);
    }

    // 2. 좌석 목록 조회
    const seatsRes = http.get(
        `${BASE_URL}/api/concerts/${CONCERT_ID}/seats`,
        reqParams('seats')
    );

    if (
        !check(seatsRes, {
            'seats 200': (r) => r.status === 200,
        })
    ) {
        holdError.add(1);
        return;
    }

    // 3. 선점할 좌석 선택
    let seatId;
    const seats = seatsRes.json();

    if (Array.isArray(seats)) {
        const available = seats.filter(
            (s) => s.status === 'AVAILABLE'
        );

        if (available.length === 0) {
            soldOut.add(1);
            return;
        }

        const pool = available.slice(0, HOT_SEATS);

        seatId = pool[
            Math.floor(Math.random() * pool.length)
            ].id;
    } else {
        const range = Math.min(
            HOT_SEATS,
            SEAT_MAX - SEAT_MIN + 1
        );

        if (range <= 0) {
            holdError.add(1);
            return;
        }

        seatId =
            SEAT_MIN + Math.floor(Math.random() * range);
    }

// 4. 좌석 선점 요청
    const MAX_HOLD_ATTEMPTS = 10;
    let holdSucceeded = false;

    for (let attempt = 1; attempt <= MAX_HOLD_ATTEMPTS; attempt++) {
        const hold = http.post(
            `${BASE_URL}/api/seats/${seatId}/hold`,
            null,
            reqParams('hold')
        );

        if (hold.status >= 200 && hold.status < 300) {
            holdSuccess.add(1);
            holdSucceeded = true;
            break;
        }

        if (hold.status === 409) {
            holdConflict.add(1);

            if (attempt === MAX_HOLD_ATTEMPTS) {
                holdError.add(1);
                break;
            }

            const retrySeatsRes = http.get(
                `${BASE_URL}/api/concerts/${CONCERT_ID}/seats`,
                reqParams('seats')
            );

            if (retrySeatsRes.status !== 200) {
                holdError.add(1);
                break;
            }

            const retrySeats = retrySeatsRes.json();

            if (!Array.isArray(retrySeats)) {
                holdError.add(1);
                break;
            }

            const available = retrySeats.filter(
                (s) => s.status === 'AVAILABLE' && s.id !== seatId
            );

            if (available.length === 0) {
                soldOut.add(1);
                break;
            }

            seatId = available[
                Math.floor(Math.random() * available.length)
                ].id;

            continue;
        }

        // 409 이외의 HTTP 오류
        holdError.add(1);
        break;
    }
};
