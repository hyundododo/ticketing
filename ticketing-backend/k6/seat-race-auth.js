import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

const BASE = __ENV.BASE_URL || 'http://localhost:8080';
const MIN_SEAT = 89;
const MAX_SEAT = 188;
const USERS = 100;
const JSON_HEADERS = { 'Content-Type': 'application/json' };

const holdOk = new Counter('hold_success');
const holdFail = new Counter('hold_rejected');
const holdOther = new Counter('hold_other');
const confirmOk = new Counter('confirm_success');
const confirmFail = new Counter('confirm_fail');
const holdStatus = new Counter('hold_status');       // hold 응답 코드별 집계
const confirmStatus = new Counter('confirm_status'); // confirm 응답 코드별 집계

export const options = {
    setupTimeout: '180s',
    scenarios: {
        race: {
            executor: 'per-vu-iterations',
            vus: USERS,
            iterations: 1,
            maxDuration: '60s',
        },
    },
    thresholds: {
        // 요약에 코드별 건수를 보이게 하는 설정 (통과/실패 기준 아님)
        'hold_status{status:204}': ['count>=0'],
        'hold_status{status:400}': ['count>=0'],
        'hold_status{status:403}': ['count>=0'],
        'hold_status{status:404}': ['count>=0'],
        'hold_status{status:409}': ['count>=0'],
        'hold_status{status:500}': ['count>=0'],
        'confirm_status{status:204}': ['count>=0'],
        'confirm_status{status:400}': ['count>=0'],
        'confirm_status{status:409}': ['count>=0'],
        'confirm_status{status:500}': ['count>=0'],
    },
};

const isOk = (status) => status >= 200 && status < 300;

export function setup() {
    // 좌석은 여기서 한 번만 결정해서 모든 VU가 같은 좌석을 노리게 함
    const seatId = __ENV.SEAT_ID
        ? Number(__ENV.SEAT_ID)
        : Math.floor(Math.random() * (MAX_SEAT - MIN_SEAT + 1)) + MIN_SEAT;
    console.log(`target seatId: ${seatId}`);

    const tokens = [];
    for (let i = 1; i <= USERS; i++) {
        const username = `loadtest${i}`;
        const password = 'test1234!';

        // 가입: POST /user (이미 가입된 계정이면 실패해도 무시)
        const signup = http.post(
            `${BASE}/user`,
            JSON.stringify({
                username,
                email: `${username}@test.com`,
                nickname: username,
                password,
            }),
            { headers: JSON_HEADERS }
        );
        if (i === 1) console.log(`signup: ${signup.status} ${signup.body}`);

        // 로그인: POST /login
        const res = http.post(
            `${BASE}/login`,
            JSON.stringify({ username, password }),
            { headers: JSON_HEADERS }
        );
        if (res.status !== 200) {
            throw new Error(`login failed for user ${i}: ${res.status} ${res.body}`);
        }
        tokens.push(res.json('accessToken'));
    }
    return { tokens, seatId };
}

export default function (data) {
    const seatId = data.seatId;
    const headers = {
        ...JSON_HEADERS,
        Authorization: `Bearer ${data.tokens[__VU - 1]}`,
    };

    // 1단계: 임시 점유 (여기서 경합 발생)
    const hold = http.post(`${BASE}/api/seats/${seatId}/hold`, null, { headers });
    holdStatus.add(1, { status: String(hold.status) });
    if (__VU <= 3) console.log(`VU${__VU} hold: ${hold.status} ${hold.body}`);

    if (isOk(hold.status)) {
        holdOk.add(1);
    } else if (hold.status === 409) {
        holdFail.add(1);
        return;                    // 점유 실패자는 confirm 시도 안 함
    } else {
        holdOther.add(1);
        return;
    }

    // 2단계: 확정 (hold 성공자만)
    const confirm = http.post(`${BASE}/api/seats/${seatId}/confirm`, null, { headers });
    confirmStatus.add(1, { status: String(confirm.status) });
    if (__VU <= 3) console.log(`VU${__VU} confirm: ${confirm.status} ${confirm.body}`);

    if (isOk(confirm.status)) confirmOk.add(1);
    else confirmFail.add(1);

    check(confirm, { 'confirm ok': (r) => isOk(r.status) });
}