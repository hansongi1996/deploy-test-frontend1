# PeerFlow Frontend

React 기반의 PeerFlow 프론트엔드 애플리케이션입니다.

## 🚀 시작하기

### 1. 저장소 클론
```bash
git clone [저장소 URL]
cd peerflow-frontend
```

### 2. 의존성 설치

#### 프론트엔드 의존성 설치
```bash
npm install
```

#### Mock 서버 의존성 설치
```bash
cd mock-server
npm install
cd ..
```

### 3. 서버 실행

#### Mock 서버 실행 (터미널 1)
```bash
cd mock-server
npm start
```

서버가 성공적으로 실행되면 다음과 같은 메시지가 표시됩니다:
```
🚀 Assignment Mock Server is running on http://localhost:3001
📋 Available endpoints:
   GET    /api/assignments - 과제 목록 조회
   GET    /api/assignments/:id - 과제 상세 조회
   POST   /api/assignments - 과제 생성
   GET    /api/assignments/:id/submissions - 제출 목록 조회
   POST   /api/assignments/:id/submissions - 과제 제출
   POST   /api/upload - 파일 업로드
   PATCH  /api/submissions/:id - 과제 채점
   GET    /health - 서버 상태 확인
🔐 POST /api/auth/login - 로그인 시도
📊 POST /api/rooms/track - 방 접근 추적
```

#### 프론트엔드 개발 서버 실행 (터미널 2)
```bash
npm run dev
```

개발 서버가 실행되면 브라우저에서 `http://localhost:5173` (또는 다른 포트)로 접속할 수 있습니다.

### 4. 로그인 정보

Mock 서버에서 사용할 수 있는 테스트 계정:
- **사용자명**: `admin1`
- **비밀번호**: `password1`

또는

- **사용자명**: `student1`
- **비밀번호**: `password1`

## 📁 프로젝트 구조

```
peerflow-frontend/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   ├── pages/              # 페이지 컴포넌트
│   ├── services/           # API 서비스
│   ├── types/              # TypeScript 타입 정의
│   ├── contexts/           # React Context
│   └── api.ts              # API 클라이언트
├── mock-server/            # Mock 백엔드 서버
│   ├── server.js           # Express 서버
│   └── package.json        # Mock 서버 의존성
└── package.json            # 프론트엔드 의존성
```

## 🔧 주요 기능

- **인증 시스템**: JWT 기반 로그인/로그아웃
- **채팅**: 실시간 WebSocket 채팅
- **과제 관리**: 과제 목록, 제출, 채점
- **공지사항**: 공지사항 조회
- **방 접근 추적**: 채팅방 입장/퇴장 로그

## 🛠️ 개발 도구

- **React 19**: UI 라이브러리
- **TypeScript**: 타입 안전성
- **Vite**: 빌드 도구
- **Bootstrap**: UI 프레임워크
- **Axios**: HTTP 클라이언트
- **STOMP/SockJS**: WebSocket 통신

## 🐛 문제 해결

### 포트 충돌 오류
만약 "address already in use" 오류가 발생하면:

```bash
# Windows에서 포트 3001 사용 중인 프로세스 확인
netstat -ano | findstr :3001

# 해당 PID로 프로세스 종료 (PID는 위 명령어 결과에서 확인)
taskkill /PID [PID번호] /F
```

### 의존성 설치 오류
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# mock-server도 동일하게
cd mock-server
rm -rf node_modules package-lock.json
npm install
```

## 📝 API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

### 과제
- `GET /api/assignments` - 과제 목록
- `GET /api/assignments/:id` - 과제 상세
- `POST /api/assignments/:id/submissions` - 과제 제출
- `POST /api/upload` - 파일 업로드

### 방 추적
- `POST /api/rooms/track` - 방 접근 추적
- `GET /api/rooms/access-log` - 접근 로그 조회

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request