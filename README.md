# nodeCrud

TypeScript 기반 Express 서버와 실시간 협업 도구입니다.

## 주요 기능

### Live Cursor (실시간 커서 공유)

Figma/Notion 스타일의 실시간 커서 공유 기능입니다.

- **실시간 커서**: 여러 사용자의 마우스 위치를 실시간으로 공유
- **드로잉 캔버스**: 함께 그림을 그릴 수 있는 화이트보드
- **실시간 채팅**: 사용자 간 메시지 송수신
- **커서 이펙트**: 클릭 시 리플 효과, 커서 트레일
- **멀티 룸**: URL 파라미터로 여러 룸 생성 및 참여

## 설치 방법

```bash
# 저장소 클론
git clone https://github.com/sinbla78/nodeCrud.git
cd nodeCrud

# 의존성 설치
npm install
```

## 사용 방법

### 개발 모드 실행

```bash
npm start
```

서버가 `http://localhost:4000`에서 실행됩니다.

### PM2로 배포

```bash
# 서버 시작
npm run pm2:start

# 서버 상태 확인
npm run pm2:status

# 로그 확인
npm run pm2:logs

# 서버 재시작
npm run pm2:restart

# 서버 중지
npm run pm2:stop

# 프로세스 삭제
npm run pm2:delete
```

### Live Cursor 사용법

1. 브라우저에서 `http://localhost:4000` 접속
2. 여러 브라우저 탭/창에서 동시 접속
3. 마우스를 움직여 커서 공유
4. 드래그하여 캔버스에 그림 그리기
5. 우측 하단 채팅으로 대화
6. 상단 룸 이름 클릭하여 다른 룸으로 이동

**룸 직접 접속**: `http://localhost:4000?room=방이름`

## 프로젝트 구조

```
nodeCrud/
├── src/
│   ├── index.ts                      # Express + Socket.IO 메인 서버
│   ├── config/
│   │   └── socket.ts                 # Socket.IO 서버 설정
│   ├── socket/
│   │   ├── types/
│   │   │   └── cursor.ts             # 커서 관련 타입 정의
│   │   └── handlers/
│   │       └── cursorHandler.ts      # 커서 이벤트 핸들러
│   └── utils/
│       └── colorGenerator.ts         # 사용자 색상/이름 생성
├── public/
│   └── index.html                    # Live Cursor 프론트엔드
├── ecosystem.config.js               # PM2 설정
├── package.json
├── tsconfig.json
└── README.md
```

## 기술 스택

- **TypeScript** - 타입 안전한 JavaScript
- **Express.js** - 웹 프레임워크
- **Socket.IO** - 실시간 양방향 통신
- **PM2** - 프로세스 관리 및 배포
- **ts-node-dev** - TypeScript 실시간 실행 및 핫 리로드

## Socket.IO 이벤트

### Client → Server

| 이벤트 | 설명 |
|--------|------|
| `cursor:join` | 룸 입장 |
| `cursor:move` | 커서 이동 |
| `cursor:click` | 클릭 이벤트 |
| `chat:send` | 채팅 메시지 전송 |
| `draw:line` | 그리기 |
| `draw:clear` | 캔버스 지우기 |
| `room:list` | 룸 목록 요청 |

### Server → Client

| 이벤트 | 설명 |
|--------|------|
| `cursor:joined` | 새 사용자 입장 |
| `cursor:moved` | 커서 위치 업데이트 |
| `cursor:left` | 사용자 퇴장 |
| `cursor:clicked` | 클릭 이펙트 |
| `chat:message` | 채팅 메시지 수신 |
| `draw:line` | 그리기 데이터 수신 |
| `room:count` | 접속자 수 업데이트 |

## 라이선스

ISC

---

**Made by sinbla78**
