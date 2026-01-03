# 🛡️ 웹 보안 취약점 학습 플랫폼

웹 애플리케이션의 주요 보안 취약점을 학습하고 실습하기 위한 교육용 플랫폼입니다.

> ⚠️ **경고**: 이 프로젝트는 교육 목적으로만 사용해야 하며, 실제 프로덕션 환경에서는 절대 사용하지 마세요.

## 📋 목차

- [프로젝트 소개](#프로젝트-소개)
- [주요 기능](#주요-기능)
- [설치 방법](#설치-방법)
- [사용 방법](#사용-방법)
- [취약점 목록](#취약점-목록)
- [프로젝트 구조](#프로젝트-구조)
- [기술 스택](#기술-스택)
- [라이선스](#라이선스)

## 🎯 프로젝트 소개

이 플랫폼은 OWASP Top 10을 기반으로 한 10가지 주요 웹 보안 취약점을 직접 실습할 수 있는 환경을 제공합니다. 각 취약점에 대해:

- 실제 공격 시나리오 시연
- Swagger UI를 통한 API 테스트
- 직관적인 웹 인터페이스

## ✨ 주요 기능

- 📚 **10가지 보안 취약점 실습**: SQL Injection부터 Insecure Deserialization까지
- 🔍 **Swagger API 문서**: 모든 엔드포인트를 시각적으로 테스트
- 🎨 **직관적인 대시보드**: 각 취약점별 설명과 테스트 방법
- 💾 **메모리 기반 DB**: 서버 재시작 시 초기화되어 안전한 학습 환경

## 🚀 설치 방법

### 사전 요구사항

- Node.js 14.x 이상
- npm 6.x 이상

### 설치 단계

```bash
# 1. 저장소 클론
git clone <repository-url>
cd security-learning-platform

# 2. 의존성 설치
npm install

# 3. 서버 시작
npm start
```

서버가 성공적으로 시작되면 다음 메시지가 표시됩니다:

```
Server running on http://localhost:3000
Swagger UI: http://localhost:3000/api-docs
```

## 📖 사용 방법

### 1. 메인 대시보드 접속

```
http://localhost:3000
```

10가지 취약점 목록과 각각의 설명을 확인할 수 있습니다.

### 2. Swagger API 문서 접속

```
http://localhost:3000/api-docs
```

각 취약점의 API 엔드포인트를 직접 테스트할 수 있습니다.

### 3. 취약점 테스트

각 취약점 카드를 클릭하여 상세 정보를 확인하고, "Test API" 버튼을 통해 Swagger UI로 이동합니다.

## 🐛 취약점 목록

### 1. SQL Injection

- **경로**: `/api/sqli`
- **설명**: 사용자 입력이 SQL 쿼리에 직접 삽입되는 취약점
- **테스트 예시**: `?id=1 OR 1=1`

### 2. XSS (Cross-Site Scripting)

- **경로**: `/api/xss`
- **설명**: 악성 스크립트가 웹 페이지에 삽입되는 취약점
- **테스트 예시**: `<script>alert('XSS')</script>`

### 3. Command Injection

- **경로**: `/api/command`
- **설명**: 사용자 입력이 시스템 명령어에 직접 사용되는 취약점
- **테스트 예시**: `; ls -la`

### 4. Path Traversal

- **경로**: `/api/path-traversal`
- **설명**: 파일 경로를 조작하여 시스템 파일에 접근하는 취약점
- **테스트 예시**: `../../etc/passwd`

### 5. IDOR (Insecure Direct Object Reference)

- **경로**: `/api/idor`
- **설명**: 권한 확인 없이 객체에 직접 접근할 수 있는 취약점
- **테스트 예시**: 다른 사용자의 ID로 조회

### 6. Weak Authentication

- **경로**: `/api/auth`
- **설명**: 약한 인증 메커니즘으로 인한 보안 취약점
- **테스트 예시**: 간단한 비밀번호로 로그인 시도

### 7. Sensitive Data Exposure

- **경로**: `/api/sensitive-data`
- **설명**: 민감한 데이터가 암호화 없이 노출되는 취약점
- **테스트 예시**: API 응답에서 평문 비밀번호 확인

### 8. SSRF (Server-Side Request Forgery)

- **경로**: `/api/ssrf`
- **설명**: 서버가 공격자가 지정한 URL로 요청을 보내는 취약점
- **테스트 예시**: 내부 네트워크 주소 요청

### 9. Mass Assignment

- **경로**: `/api/mass-assignment`
- **설명**: 객체의 모든 속성을 일괄 할당하여 권한 상승이 가능한 취약점
- **테스트 예시**: `role: "admin"` 추가

### 10. Insecure Deserialization

- **경로**: `/api/deserialize`
- **설명**: 신뢰할 수 없는 데이터를 역직렬화하여 발생하는 취약점
- **테스트 예시**: 악의적인 직렬화된 객체 전송

## 📁 프로젝트 구조

```
/
├── .git/                    # Git 버전 관리
├── .gitignore              # Git 무시 파일 목록
├── node_modules/           # npm 의존성 (자동 생성)
├── package.json            # 프로젝트 메타데이터
├── package-lock.json       # 의존성 버전 잠금
├── README.md               # 프로젝트 문서 (이 파일)
│
├── public/                 # 프론트엔드 정적 파일
│   ├── index.html         # 메인 대시보드
│   └── style.css          # 스타일시트
│
└── src/                    # 백엔드 소스 코드
    ├── server.js          # Express 서버 메인 파일
    │
    ├── config/            # 설정 파일
    │   └── swagger.js     # Swagger API 문서 명세
    │
    ├── database/          # 데이터베이스 관련
    │   └── init.js        # 메모리 DB 초기화
    │
    └── routes/            # API 라우트 (취약점별)
        ├── sqli.js
        ├── xss.js
        ├── commandInjection.js
        ├── pathTraversal.js
        ├── idor.js
        ├── weakAuth.js
        ├── sensitiveData.js
        ├── ssrf.js
        ├── massAssignment.js
        └── insecureDeserialization.js
```

## 🛠️ 기술 스택

### Backend

- **Node.js** - JavaScript 런타임
- **Express.js** - 웹 프레임워크
- **Swagger UI** - API 문서화

### Frontend

- **HTML5** - 마크업
- **CSS3** - 스타일링
- **Vanilla JavaScript** - 클라이언트 로직

### 의존성

```json
{
  "express": "^4.18.2",
  "swagger-ui-express": "^5.0.0",
  "swagger-jsdoc": "^6.2.8"
}
```

## 🔒 보안 고려사항

이 프로젝트는 **의도적으로 취약하게 설계**되었습니다:

- ❌ 입력 유효성 검사 없음
- ❌ SQL 파라미터화 없음
- ❌ XSS 필터링 없음
- ❌ CSRF 토큰 없음
- ❌ 암호화되지 않은 비밀번호
- ❌ 세션 관리 취약점

> **다시 한번 강조**: 절대로 프로덕션 환경에서 사용하지 마세요!

## 📚 학습 리소스

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Academy](https://portswigger.net/web-security)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

## 🤝 기여 방법

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 교육 목적으로 만들어졌습니다. 자유롭게 사용 및 수정 가능합니다.

## 📧 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 Issue를 생성해주세요.

---

**Made with sinbla78*
