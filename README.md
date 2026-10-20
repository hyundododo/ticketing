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
src/main/java/com/example/project
├── controller    # 요청/응답 처리
├── service       # 비즈니스 로직
├── repository    # DB 접근
├── domain        # 엔티티
├── dto           # 요청/응답 DTO
├── exception     # 커스텀 예외, 전역 예외 처리
└── config        # 설정, 인터셉터
```

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
