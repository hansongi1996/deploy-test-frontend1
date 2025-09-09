# Mock Server

PeerFlow 프론트엔드 개발을 위한 Mock 백엔드 서버입니다.

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 서버 실행
```bash
npm start
```

### 3. 서버 상태 확인
```bash
curl http://localhost:3001/health
```

## 📋 API 엔드포인트

### 인증 (Authentication)
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃  
- `GET /api/auth/me` - 현재 사용자 정보

### 과제 (Assignments)
- `GET /api/assignments` - 과제 목록 조회
- `GET /api/assignments/:id` - 과제 상세 조회
- `POST /api/assignments` - 과제 생성
- `GET /api/assignments/:id/submissions` - 제출 목록 조회
- `POST /api/assignments/:id/submissions` - 과제 제출
- `PATCH /api/submissions/:id` - 과제 채점

### 파일 업로드
- `POST /api/upload` - 파일 업로드

### 방 추적 (Room Tracking)
- `POST /api/rooms/track` - 방 접근 추적
- `GET /api/rooms/access-log` - 접근 로그 조회

### 헬스 체크
- `GET /health` - 서버 상태 확인

## 🔐 테스트 계정

### 관리자 계정
- **사용자명**: `admin1`
- **비밀번호**: `password1`
- **역할**: `ADMIN`

### 학생 계정
- **사용자명**: `student1`
- **비밀번호**: `password1`
- **역할**: `STUDENT`

## 📊 Mock 데이터

### 과제 데이터
- 3개의 샘플 과제가 포함되어 있습니다
- 각 과제는 제목, 설명, 마감일, 점수, 태그 등의 정보를 포함합니다

### 방 데이터
- Room ID 1-3까지 3개의 채팅방이 있습니다

## 🛠️ 개발 모드

개발 중 파일 변경 시 자동 재시작:
```bash
npm run dev
```

## 🔧 설정

### 포트 변경
`server.js` 파일에서 포트를 변경할 수 있습니다:
```javascript
const PORT = process.env.PORT || 3001;
```

### JWT 시크릿
환경변수로 JWT 시크릿을 설정할 수 있습니다:
```bash
JWT_SECRET=your-secret-key npm start
```

## 📝 로그

서버는 다음 이벤트를 로그로 출력합니다:
- 🔐 로그인 시도
- 📊 방 접근 추적
- 📋 API 요청

## 🐛 문제 해결

### 포트 충돌
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID [PID번호] /F

# macOS/Linux  
lsof -ti:3001 | xargs kill -9
```

### 의존성 문제
```bash
rm -rf node_modules package-lock.json
npm install
```
