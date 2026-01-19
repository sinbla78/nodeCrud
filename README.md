# nodeCrud

TypeScript 기반 Express 서버와 GitHub 잔디 심기를 위한 Auto Commit 도구입니다.

## 주요 기능

- **Express 서버**: TypeScript로 작성된 간단한 웹 서버
- **Auto Commit Generator**: 지정된 기간 동안 자동으로 커밋을 생성하는 도구

## 설치 방법

```bash
# 저장소 클론
git clone https://github.com/sinbla78/nodeCrud.git
cd nodeCrud

# 의존성 설치
npm install
```

## 사용 방법

### Express 서버 실행

```bash
npm start
```

서버가 `http://localhost:3000`에서 실행됩니다.

### Auto Commit Generator

GitHub 잔디 심기를 위해 지정된 기간 동안 자동으로 커밋을 생성합니다.

```bash
npm run commit:auto [options]
```

#### 옵션

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `-s, --start <date>` | 시작 날짜 (YYYY-MM-DD) | 30일 전 |
| `-e, --end <date>` | 종료 날짜 (YYYY-MM-DD) | 오늘 |
| `--min <number>` | 하루 최소 커밋 수 | 1 |
| `--max <number>` | 하루 최대 커밋 수 | 5 |
| `--no-weekends` | 주말 제외 | false |
| `-h, --help` | 도움말 | - |

#### 예시

```bash
# 기본 실행 (최근 30일)
npm run commit:auto

# 특정 기간 지정
npm run commit:auto -- -s 2024-01-01 -e 2024-12-31

# 커밋 수 조절 및 주말 제외
npm run commit:auto -- --min 2 --max 8 --no-weekends
```

## 프로젝트 구조

```
nodeCrud/
├── src/
│   ├── index.ts        # Express 서버 메인 파일
│   └── autoCommit.ts   # Auto Commit Generator
├── package.json
├── tsconfig.json
└── README.md
```

## 기술 스택

- **TypeScript** - 타입 안전한 JavaScript
- **Express.js** - 웹 프레임워크
- **ts-node-dev** - TypeScript 실시간 실행 및 핫 리로드

## 라이선스

ISC

---

**Made by sinbla78**
