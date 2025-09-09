# 🚀 PeerFlow 초기 설정 가이드

새로운 사용자를 위한 단계별 설정 가이드입니다.

## 📋 사전 요구사항

- **Node.js** (v16 이상 권장)
- **npm** (Node.js와 함께 설치됨)
- **Git**

## 🔧 1단계: 프로젝트 클론 및 설치

### 1.1 저장소 클론
```bash
git clone [저장소 URL]
cd peerflow-frontend
```

### 1.2 프론트엔드 의존성 설치
```bash
npm install
```

### 1.3 Mock 서버 의존성 설치
```bash
cd mock-server
npm install
cd ..
```

## 🖥️ 2단계: 서버 실행

### 2.1 Mock 서버 실행 (첫 번째 터미널)
```bash
cd mock-server
npm start
```

**성공 메시지:**
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

### 2.2 프론트엔드 개발 서버 실행 (두 번째 터미널)
```bash
npm run dev
```

**성공 메시지:**
```
VITE v7.1.5  ready in 475 ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## 🌐 3단계: 애플리케이션 접속

1. 브라우저에서 `http://localhost:5173` 접속
2. 로그인 페이지에서 테스트 계정으로 로그인:
   - **사용자명**: `admin1`
   - **비밀번호**: `password1`

## 🐛 문제 해결

### ❌ "address already in use" 오류
Mock 서버 포트(3001)가 이미 사용 중일 때:

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID [PID번호] /F

# macOS/Linux
lsof -ti:3001 | xargs kill -9
```

### ❌ "Cannot find module" 오류
의존성이 제대로 설치되지 않았을 때:

```bash
# 프론트엔드
rm -rf node_modules package-lock.json
npm install

# Mock 서버
cd mock-server
rm -rf node_modules package-lock.json
npm install
cd ..
```

### ❌ "Port 5173 is in use" 오류
프론트엔드 포트가 사용 중일 때:
- Vite가 자동으로 다른 포트(5174, 5175 등)를 사용합니다
- 터미널에 표시된 포트 번호를 사용하세요

## ✅ 실행 확인

### Mock 서버 상태 확인
```bash
curl http://localhost:3001/health
```
응답: `{"status": "OK", "message": "Mock server is running"}`

### 프론트엔드 접속 확인
- 브라우저에서 `http://localhost:5173` 접속
- 로그인 페이지가 표시되면 성공

## 📱 사용 가능한 기능

1. **로그인/로그아웃**
2. **채팅방** (`/rooms/1`)
3. **과제 관리** (`/assignments`)
4. **공지사항** (`/notices`)

## 🔄 개발 중 서버 재시작

### Mock 서버 재시작
```bash
# 터미널에서 Ctrl+C로 중지 후
cd mock-server
npm start
```

### 프론트엔드 재시작
```bash
# 터미널에서 Ctrl+C로 중지 후
npm run dev
```

## 📞 도움이 필요하시면

문제가 지속되면 다음 정보와 함께 문의해주세요:
- 운영체제 (Windows/macOS/Linux)
- Node.js 버전 (`node --version`)
- 오류 메시지 전체 내용
- 실행한 명령어들
