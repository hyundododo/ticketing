import http from 'k6/http';
import exec from 'k6/execution';
import { Counter } from 'k6/metrics';

const BASE = __ENV.BASE_URL || 'http://localhost:8080';
const SEAT_START = Number(__ENV.SEAT_START || 11189);   // 사용할 첫 좌석 ID
const SEAT_COUNT = Number(__ENV.SEAT_COUNT || 10000);  // 사용할 좌석 개수
const RATE = Number(__ENV.RATE || 100);                // 목표 초당 요청 수 (hold 시작 기준)
const DURATION = Number(__ENV.DURATION || 60);         // 목표 부하 유지 시간(초)
const HOT_RATIO = Number(__ENV.HOT_RATIO || 0);        // 0~1, 인기 좌석에 몰리는 요청 비율
const HOT_SEAT = Number(__ENV.HOT_SEAT || 11190);         // 인기 좌석 ID
const USERS = 100;
const JSON_HEADERS = { 'Content-Type': 'application/json' };

// 409(이미 선택된 좌석)는 정상 응답으로 취급해서 http_req_failed에 안 잡히게 함
http.setResponseCallback(http.expectedStatuses({ min: 200, max: 299 }, 409));

const holdStatus = new Counter('hold_status');
const confirmStatus = new Counter('confirm_status');
const seatExhausted = new Counter('seat_exhausted');

export const options = {
    setupTimeout: '180s',
    scenarios: {
        load: {
            executor: 'ramping-arrival-rate',
            startRate: 1,
            timeUnit: '1s',
            preAllocatedVUs: 50,
            maxVUs: 300,
            stages: [
                { target: RATE, duration: '10s' },            // 워밍업: 서서히 증가
                { target: RATE, duration: `${DURATION}s` },   // 본 측정
                { target: 0, duration: '5s' },                // 종료
            ],
        },
    },
    thresholds: {
        'http_req_duration{name:hold}': ['p(95)<500'],
        'http_req_duration{name:confirm}': ['p(95)<500'],
        'hold_status{status:500}': ['count==0'],
        'confirm_status{status:500}': ['count==0'],
        dropped_iterations: ['count==0'],   // 0이 아니면 VU가 부족하거나 서버가 목표 속도를 못 따라간 것
        // 아래 4줄은 요약에 코드별 건수를 보이게 하는 용도 (판정 기준 아님)
        'hold_status{status:204}': ['count>=0'],
        'hold_status{status:409}': ['count>=0'],
        'confirm_status{status:204}': ['count>=0'],
        'confirm_status{status:409}': ['count>=0'],
    },
};

export function setup() {
    // 필요한 좌석 수 추정: 전체 요청 수 ≈ RATE * (DURATION + 10)
    const need = RATE * (DURATION + 10);
    if (need > SEAT_COUNT) {
        console.warn(`좌석 부족 가능: 예상 요청 ${need}건 > SEAT_COUNT ${SEAT_COUNT}. 초과분은 seat_exhausted로 집계됩니다.`);
    }

    const tokens = [];
    for (let i = 1; i <= USERS; i++) {
        const res = http.post(
            `${BASE}/login`,
            JSON.stringify({ username: `loadtest${i}`, password: 'test1234!' }),
            { headers: JSON_HEADERS }
        );
        if (res.status !== 200) {
            throw new Error(`login failed for user ${i}: ${res.status} ${res.body}`);
        }
        tokens.push(res.json('accessToken'));
    }
    return { tokens };
}

export default function (data) {
    const idx = exec.scenario.iterationInTest;   // 시나리오 전체에서 유일한 요청 번호
    const headers = {
        ...JSON_HEADERS,
        Authorization: `Bearer ${data.tokens[idx % USERS]}`,
    };

    // 좌석 결정: 일부는 인기 좌석(경합), 나머지는 요청마다 고유 좌석(분산)
    let seatId;
    if (Math.random() < HOT_RATIO) {
        seatId = HOT_SEAT;
    } else {
        if (idx >= SEAT_COUNT) {
            seatExhausted.add(1);
            return;
        }
        seatId = SEAT_START + idx;
    }

    // 1단계: hold
    const hold = http.post(`${BASE}/api/seats/${seatId}/hold`, null, {
        headers,
        tags: { name: 'hold' },     // URL이 요청마다 달라도 한 이름으로 묶어서 집계
    });
    holdStatus.add(1, { status: String(hold.status) });
    if (hold.status < 200 || hold.status >= 300) return;   // 실패하면 confirm 안 함

    // 2단계: confirm
    const confirm = http.post(`${BASE}/api/seats/${seatId}/confirm`, null, {
        headers,
        tags: { name: 'confirm' },
    });
    confirmStatus.add(1, { status: String(confirm.status) });
}