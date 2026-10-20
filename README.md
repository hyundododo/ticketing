# 명당

> 공연 예매 시스템
<!-- 배포했다면 링크, 시연 GIF나 대표 스크린샷을 여기에 넣으세요 -->

<br>

## 📌 프로젝트 소개

- **개발 기간**: 2026.10.12 ~ 현재
- **개발 인원**: 1명 (개인 프로젝트)
- **만든 이유**: 부산 국제 영화제의 예매시스템을 사용하며 결제까지 진행이됐는데도 다른사람이 먼저 결제를하면 실패하는 경험을 하고 예매 시스템의 궁금함이 생겨 직접 만들게 됐습니다.

<br>

## 🛠 기술 스택

| 구분 | 기술 |
| --- | --- |
| Language | Java 21 |
| Framework | Spring Boot 4.1.1 |
| Persistence | JPA |
| Database | MySQL |
| Build Tool | Gradle |
| Frontend | React |
| Cache | Redis |
| Container | Docker, Docker Compose | 
| Deployment / Infrastructure | AWS EC2, Nginx |
| Etc. | Git, GitHub, IntelliJ |

<br>

## ✨ 주요 기능

### 회원
- [ ] 회원가입 / 로그인 / 로그아웃
- [ ] JWT 기반 인증

### 공연
- [ ] 공연 생성 / 조회 / 삭제
- [ ] 관리자만 공연 삭제 가능

### 예매
- [ ] 예매 티켓 조회 / 삭제
- [ ] 장바구니 / 결제

<br>

## 📂 프로젝트 구조

```
ticketing/
├── README.md
├── ticketing-backend/
│   ├── build.gradle
│   ├── docker-compose.yaml       # MySQL, Redis 컨테이너
│   └── src/
│       ├── main/
│       │   ├── java/com/hello/ticketingbackend/
│       │   │   ├── TicketingBackendApplication.java
│       │   │   ├── config/       # Spring, Security, Redis, 스케줄러 설정
│       │   │   ├── controller/   # REST API 엔드포인트
│       │   │   ├── domain/       # 도메인별 비즈니스 모듈
│       │   │   │   ├── user/     # 회원 및 소셜 로그인
│       │   │   │   ├── jwt/      # JWT 및 refresh token
│       │   │   │   ├── concert/  # 공연 관리
│       │   │   │   ├── seat/     # 좌석 조회 및 점유
│       │   │   │   ├── cart/     # 장바구니 및 좌석 홀드
│       │   │   │   ├── ticket/   # 예매 티켓
│       │   │   │   └── waiting/  # 대기열 및 입장 스케줄러
│       │   │   ├── exception/    # 예외 및 에러 응답
│       │   │   ├── fillter/      # JWT, 로그인 필터
│       │   │   ├── handler/      # 로그인 성공 및 전역 예외 처리
│       │   │   ├── interceptor/  # 좌석 홀드 검증
│       │   │   └── util/         # JWT 유틸리티
│       │   └── resources/
│       │       └── application.properties
│       └── test/                 # 백엔드 테스트
└── ticketing-frontend/
    ├── package.json
    ├── vite.config.js            # Vite 및 백엔드 프록시 설정
    └── src/
        ├── main.jsx              # 애플리케이션 진입점
        ├── app/                  # 라우팅 및 앱 루트
        ├── pages/                # 화면 단위 페이지
        │   ├── AuthPage.jsx
        │   ├── ConcertPage.jsx
        │   ├── SeatPage.jsx
        │   ├── CartPage.jsx
        │   ├── PaymentPage.jsx
        │   ├── TicketsPage.jsx
        │   └── UserPage.jsx
        ├── features/             # 기능 단위 모듈
        │   ├── auth/             # 인증 API, 폼, 인증 훅
        │   ├── concert/          # 공연 목록 및 조회
        │   ├── seat/             # 좌석 맵, 좌석 상태, 예매
        │   ├── cart/             # 장바구니
        │   └── waiting/          # 대기열 모달 및 상태 조회
        ├── shared/
        │   ├── api/              # Axios 클라이언트 및 공통 API 설정
        │   └── layout/           # 공통 레이아웃
        ├── App.css               # 전역 컴포넌트 스타일
        └── index.css             # 전역 기본 스타일
```

### 구조 설계

- **Backend**는 도메인별로 `dto`, `entity`, `repository`, `service`를 분리한 모듈형 구조입니다.
- **Frontend**는 화면(`pages`)과 기능(`features`)을 분리하고, 각 기능에서 API·컴포넌트·훅을 함께 관리합니다.
- **대기열**은 Redis 기반 백엔드 로직과 프론트엔드 대기 모달이 `waiting` 도메인으로 연결됩니다.
- **인프라**는 `docker-compose.yaml`로 MySQL과 Redis를 함께 실행할 수 있습니다.

<br>

## 🗄 ERD



<img width="1468" height="1124" alt="image" src="https://github.com/user-attachments/assets/248d9eb4-5591-497c-b4ae-dbee61a4b1d6" />


<br>

## 📑 API 명세

| 기능 | Method | URL | 설명 |
| --- | --- | --- | --- |
| 게시글 목록 | GET | `/api/posts` | 페이징 조회 |
| 게시글 상세 | GET | `/api/posts/{id}` | 단건 조회 |
| 게시글 작성 | POST | `/api/posts` | 로그인 필요 |
| 게시글 수정 | PUT | `/api/posts/{id}` | 작성자만 가능 |
| 게시글 삭제 | DELETE | `/api/posts/{id}` | 작성자만 가능 |

<details>
<summary>요청/응답 예시 (펼치기)</summary>

**POST `/api/posts`**

```json
// Request
{
  "title": "제목",
  "content": "내용"
}

// Response 201
{
  "id": 1,
  "title": "제목",
  "content": "내용",
  "writer": "홍길동"
}
```

</details>

<br>

## 🔥 트러블슈팅

### 1. 문제 상황 제목
- **문제**: 어떤 상황에서 어떤 문제가 발생했는지
- **원인**: 왜 발생했는지 (어떻게 원인을 찾았는지)
- **해결**: 어떻게 해결했는지
- **배운 점**: 이 경험으로 알게 된 것

### 2. 문제 상황 제목
- **문제**:
- **원인**:
- **해결**:
- **배운 점**:

<br>

## 💡 기술적 고민

- **왜 이 기술/구조를 선택했는가?** (예: Entity와 DTO를 분리한 이유)
- **다른 선택지와 비교했을 때의 장단점**

<br>

## 📝 회고

- **잘한 점**:
- **아쉬운 점**:
- **앞으로 개선할 점**:
  - [ ] 테스트 코드 추가
  - [ ] 배포 (AWS 등)
  - [ ] 성능 개선 (N+1, 인덱스 등)
