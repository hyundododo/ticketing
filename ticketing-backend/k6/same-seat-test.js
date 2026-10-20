
import http from 'k6/http';
import { sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

// ===== 환경변수 =====
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const SAME_VUS = parseInt(__ENV.SAME_VUS || '100', 10);
const TARGET_SEAT = parseInt(__ENV.TARGET_SEAT || '42', 10);

const SIGNUP = (__ENV.SIGNUP || 'false') === 'true';
const SIGNUP_PATH = __ENV.SIGNUP_PATH || '/api/user';
const LOGIN_PATH = __ENV.LOGIN_PATH || '/login';
const USER_PREFIX = __ENV.USER_PREFIX || 'loadtestt';
const USER_PASSWORD = __ENV.USER_PASSWORD || 'password1234';
const BATCH_SIZE = parseInt(__ENV.BATCH_SIZE || '20', 10);

const RACE_DELAY_SEC = parseInt(__ENV.RACE_DELAY_SEC || '15', 10);

// ===== 메트릭 =====
const holdOk = new Counter('hold_ok');
const holdConflict = new Counter('hold_conflict');
const holdError = new Counter('hold_error');
const raceSkew = new Trend('race_start_skew_ms');

http.setResponseCallback(
    http.expectedStatuses({ min: 200, max: 299 }, 409)
);

// ===== 테스트 설정 =====
export const options = {
    setupTimeout: '10m',
    scenarios: {
        same_seat: {
            executor: 'per-vu-iterations',
            exec: 'sameSeat',
            vus: SAME_VUS,
            iterations: 1,
            maxDuration: '10m',
            gracefulStop: '30s',
        },
    },
};

// ===== 공통 함수 =====
function params(token, name) {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        tags: { name },
    };
}

// ===== 회원가입(선택) / 로그인 =====
export function setup() {
    const headers = { 'Content-Type': 'application/json' };
    const tokens = new Array(SAME_VUS);

    // 회원가입: 필요한 경우에만 실행
    if (SIGNUP) {
        for (
            let start = 1;
            start <= SAME_VUS;
            start += BATCH_SIZE
        ) {
            const end = Math.min(start + BATCH_SIZE, SAME_VUS + 1);
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
                        headers,
                        tags: { name: 'signup' },
                    },
                });
            }

            const responses = http.batch(requests);

            for (let i = 0; i < responses.length; i++) {
                if (
                    responses[i].status < 200 ||
                    responses[i].status >= 300
                ) {
                    console.warn(
                        `회원가입 확인 필요: status=${responses[i].status}`
                    );
                }
            }
        }
    }

    // 로그인 및 JWT 토큰 저장
    for (
        let start = 1;
        start <= SAME_VUS;
        start += BATCH_SIZE
    ) {
        const end = Math.min(start + BATCH_SIZE, SAME_VUS + 1);
        const requests = [];

        for (let i = start; i < end; i++) {
            requests.push({
                method: 'POST',
                url: `${BASE_URL}${LOGIN_PATH}`,
                body: JSON.stringify({
                    username: `${USER_PREFIX}${i}`,
                    password: USER_PASSWORD,
                }),
                params: {
                    headers,
                    tags: { name: 'login' },
                },
            });
        }

        const responses = http.batch(requests);

        for (let j = 0; j < responses.length; j++) {
            const response = responses[j];

            if (response.status < 200 || response.status >= 300) {
                throw new Error(
                    `로그인 실패: user=${USER_PREFIX}${start + j}, ` +
                    `status=${response.status}, body=${response.body}`
                );
            }

            const token = response.json('accessToken');

            if (!token) {
                throw new Error(
                    `JWT 토큰 없음: user=${USER_PREFIX}${start + j}`
                );
            }

            tokens[start + j - 1] = token;
        }
    }

    return {
        tokens,
        raceAt: Date.now() + RACE_DELAY_SEC * 1000,
    };
}

// ===== 동일 좌석 선점 요청 =====
function race(token, seatId, raceAt) {
    const wait = raceAt - Date.now();

    if (wait > 0) {
        sleep(wait / 1000);
    }

    raceSkew.add(Date.now() - raceAt);

    const res = http.post(
        `${BASE_URL}/api/seats/${seatId}/hold`,
        null,
        params(token, 'hold')
    );

    if (res.status >= 200 && res.status < 300) {
        holdOk.add(1);
    } else if (res.status === 409) {
        holdConflict.add(1);
    } else {
        holdError.add(1);

        console.warn(
            `선점 요청 실패: vu=${__VU}, seat=${seatId}, ` +
            `status=${res.status}, body=${res.body}`
        );
    }
}

// ===== 시나리오: 동일 좌석 경쟁 =====
export function sameSeat(data) {
    const token = data.tokens[__VU - 1];

    if (!token) {
        throw new Error(`JWT 토큰 없음: VU=${__VU}`);
    }

    race(token, TARGET_SEAT, data.raceAt);
}
