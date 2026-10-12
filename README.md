# 명당

> 공연 예매 시스템
<!-- 배포했다면 링크, 시연 GIF나 대표 스크린샷을 여기에 넣으세요 -->

<br>

## 📌 프로젝트 소개

- **개발 기간**: 2026.10.03 ~ 현재
- **개발 인원**: 1명 (개인 프로젝트)
- **만든 이유**: 이 프로젝트를 왜 시작했는지, 무엇을 학습하고 싶었는지

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

## 🚀 실행 방법

### 1. 사전 준비
- JDK 17 이상
- MySQL 8.x (H2 사용 시 불필요)

### 2. 프로젝트 클론

```bash
git clone https://github.com/{username}/{repository}.git
cd {repository}
```

### 3. 설정 파일 작성

`src/main/resources/application.yml`을 아래 형식으로 작성합니다.

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/{db_name}
    username: {username}
    password: {password}
```

> ⚠️ DB 비밀번호 같은 민감 정보는 커밋하지 마세요. `application-example.yml`을 만들어 두고 실제 설정 파일은 `.gitignore`에 추가하는 것을 추천합니다.

### 4. 실행

```bash
./gradlew bootRun
```

실행 후 `http://localhost:8080` 으로 접속합니다.

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

<!-- ERD 이미지를 첨부하세요 (dbdiagram.io, ERDCloud 등으로 제작) -->

![ERD](./docs/erd.png)

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
