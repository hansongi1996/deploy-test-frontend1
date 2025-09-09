const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Mock data
let chatRooms = [
  {
    id: 1,
    roomName: "General",
    type: "GROUP",
    createdAt: "2024-01-01T09:00:00.000Z"
  },
  {
    id: 2,
    roomName: "TypeScript Talk",
    type: "GROUP", 
    createdAt: "2024-01-01T10:00:00.000Z"
  }
];

// Mock participants data
let roomParticipants = {
  1: [
    { id: 1, username: "admin1", nickname: "관리자", role: "ADMIN", status: "ACTIVE" },
    { id: 2, username: "student1", nickname: "김학생", role: "STUDENT", status: "ACTIVE" }
  ],
  2: [
    { id: 1, username: "admin1", nickname: "관리자", role: "ADMIN", status: "ACTIVE" },
    { id: 3, username: "instructor1", nickname: "이강사", role: "INSTRUCTOR", status: "ACTIVE" }
  ]
};

// Mock notices data
let notices = [
  {
    id: 1,
    title: "중간고사 일정 안내",
    content: "2024년 중간고사 일정을 안내드립니다.\n\n- 시험 기간: 2024년 4월 15일 ~ 4월 19일\n- 시험 과목: React, TypeScript, Node.js\n- 시험 장소: 각 강의실\n\n시험 준비에 최선을 다하시기 바랍니다.",
    author: {
      id: 1,
      username: "admin1",
      fullName: "박관리자",
      email: "admin1@example.com",
      role: "ADMIN"
    },
    isImportant: true,
    createdAt: "2024-01-15T09:00:00.000Z",
    updatedAt: "2024-01-15T09:00:00.000Z"
  },
  {
    id: 2,
    title: "과제 제출 마감일 연장 안내",
    content: "React 기초 과제의 제출 마감일을 다음과 같이 연장합니다.\n\n- 기존 마감일: 2024년 1월 20일\n- 연장 마감일: 2024년 1월 25일\n\n연장된 기간 동안 과제를 완성해 주시기 바랍니다.",
    author: {
      id: 3,
      username: "instructor1",
      fullName: "이강사",
      email: "instructor1@example.com",
      role: "INSTRUCTOR"
    },
    isImportant: false,
    createdAt: "2024-01-18T14:30:00.000Z",
    updatedAt: "2024-01-18T14:30:00.000Z"
  },
  {
    id: 3,
    title: "채팅방 이용 규칙 안내",
    content: "채팅방 이용 시 다음 규칙을 준수해 주시기 바랍니다.\n\n1. 상호 존중하는 언어 사용\n2. 학습 관련 주제로 대화\n3. 스팸 메시지 금지\n4. 개인정보 공유 금지\n\n위 규칙을 위반할 경우 채팅방 이용이 제한될 수 있습니다.",
    author: {
      id: 1,
      username: "admin1",
      fullName: "박관리자",
      email: "admin1@example.com",
      role: "ADMIN"
    },
    isImportant: false,
    createdAt: "2024-01-20T10:15:00.000Z",
    updatedAt: "2024-01-20T10:15:00.000Z"
  }
];

let assignments = [
  {
    id: 1,
    title: "React 기초 과제",
    description: "React의 기본 개념을 이해하고 간단한 컴포넌트를 작성하는 과제입니다. useState와 useEffect를 활용하여 동적인 웹 페이지를 제작해보세요.",
    dueDate: "2025-09-10T23:59:59.000Z",
    createdAt: "2024-01-01T09:00:00.000Z",
    updatedAt: "2024-01-01T09:00:00.000Z",
    maxScore: 100,
    tags: ["#web-dev"],
    status: "IN_PROGRESS",
    submissionCount: 15,
    totalStudents: 24,
    attachments: [
      {
        id: 1,
        fileName: "React_과제_가이드.pdf",
        fileUrl: "/uploads/React_과제_가이드.pdf",
        fileType: "PDF"
      },
      {
        id: 2,
        fileName: "예시_코드.zip",
        fileUrl: "/uploads/예시_코드.zip",
        fileType: "ZIP"
      }
    ],
    requirements: [
      "기본적인 React 컴포넌트 작성",
      "useState 혹은 localStorage에 상태 관리",
      "컴포넌트 간의 내부 통신 및 재사용",
      "스타일링은 CSS 또는 Tailwind 사용"
    ]
  },
  {
    id: 2,
    title: "UI 디자인 프로토타입",
    description: "Figma를 사용하여 웹 애플리케이션의 UI 프로토타입을 디자인하세요.",
    dueDate: "2025-09-08T23:59:59.000Z",
    createdAt: "2024-01-05T10:00:00.000Z",
    updatedAt: "2024-01-05T10:00:00.000Z",
    maxScore: 80,
    tags: ["#design", "#figma"],
    status: "LATE",
    submissionCount: 20,
    totalStudents: 24,
    attachments: [],
    requirements: [
      "Figma를 사용한 프로토타입 제작",
      "반응형 디자인 적용",
      "사용자 경험 고려한 UI/UX"
    ]
  },
  {
    id: 3,
    title: "API 연동 실습",
    description: "REST API를 사용하여 데이터를 가져오고 표시하는 웹 애플리케이션을 개발하세요.",
    dueDate: "2025-09-15T23:59:59.000Z",
    createdAt: "2024-01-10T14:00:00.000Z",
    updatedAt: "2024-01-10T14:00:00.000Z",
    maxScore: 90,
    tags: ["#api", "#javascript"],
    status: "SUBMITTED",
    submissionCount: 22,
    totalStudents: 24,
    attachments: [],
    requirements: [
      "REST API 호출 및 데이터 처리",
      "에러 핸들링 구현",
      "로딩 상태 표시"
    ]
  },
  {
    id: 4,
    title: "최종 프로젝트 발표",
    description: "학기 동안 배운 내용을 바탕으로 최종 프로젝트를 발표하세요.",
    dueDate: "2025-09-20T23:59:59.000Z",
    createdAt: "2024-01-15T16:00:00.000Z",
    updatedAt: "2024-01-15T16:00:00.000Z",
    maxScore: 150,
    tags: ["#presentation", "#final"],
    status: "IN_PROGRESS",
    submissionCount: 0,
    totalStudents: 24,
    attachments: [],
    requirements: [
      "프로젝트 기획서 작성",
      "발표 자료 준비",
      "데모 시연"
    ]
  }
];

let submissions = [
  {
    id: 1,
    assignmentId: 1,
    studentId: "student1",
    studentName: "김학생",
    submissionType: "FILE",
    fileUrl: "/uploads/assignment1-submission.pdf",
    linkUrl: null,
    submittedAt: "2024-01-14T15:30:00.000Z",
    grade: null,
    feedback: null
  },
  {
    id: 2,
    assignmentId: 2,
    studentId: "student2", 
    studentName: "이학생",
    submissionType: "LINK",
    fileUrl: null,
    linkUrl: "https://github.com/student2/api-project",
    submittedAt: "2024-01-19T20:15:00.000Z",
    grade: 85,
    feedback: "API 연동은 잘 되었지만 에러 처리가 부족합니다."
  }
];

// Mock users for authentication
const users = [
  {
    id: 1,
    username: 'student1',
    password: 'password123',
    fullName: '김학생',
    email: 'student1@example.com',
    role: 'STUDENT'
  },
  {
    id: 2,
    username: 'instructor1',
    password: 'password123',
    fullName: '이강사',
    email: 'instructor1@example.com',
    role: 'INSTRUCTOR'
  },
  {
    id: 3,
    username: 'admin1',
    password: 'password123',
    fullName: '박관리자',
    email: 'admin1@example.com',
    role: 'ADMIN'
  }
];

// Room access tracking
let roomAccessLog = [];

// Routes

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('🔐 POST /api/auth/login - 로그인 시도');
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    user: userWithoutPassword,
    token,
    expiresIn: 86400 // 24 hours in seconds
  });
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  console.log('🚪 POST /api/auth/logout - 로그아웃');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  console.log('👤 GET /api/auth/me - 현재 사용자 정보');
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Room tracking routes
app.post('/api/rooms/track', authenticateToken, (req, res) => {
  const { roomId, action } = req.body;
  
  console.log(`📊 POST /api/rooms/track - Room ${roomId} ${action} by user ${req.user.username}`);
  
  const logEntry = {
    id: roomAccessLog.length + 1,
    userId: req.user.id,
    username: req.user.username,
    roomId,
    action,
    timestamp: new Date().toISOString()
  };
  
  roomAccessLog.push(logEntry);
  
  res.json({ message: 'Room access tracked successfully', logEntry });
});

app.get('/api/rooms/access-log', authenticateToken, (req, res) => {
  console.log('📋 GET /api/rooms/access-log - Room access log');
  res.json(roomAccessLog);
});

// GET /api/assignments - 과제 목록 조회 (now requires auth)
app.get('/api/assignments', authenticateToken, (req, res) => {
  console.log(`📋 GET /api/assignments - 과제 목록 조회 by ${req.user.username}`);
  res.json(assignments);
});

// GET /api/assignments/:id - 과제 상세 조회
app.get('/api/assignments/:id', authenticateToken, (req, res) => {
  const assignmentId = parseInt(req.params.id);
  const assignment = assignments.find(a => a.id === assignmentId);
  
  console.log(`📄 GET /api/assignments/${assignmentId} - 과제 상세 조회 by ${req.user.username}`);
  
  if (!assignment) {
    return res.status(404).json({ error: '과제를 찾을 수 없습니다.' });
  }
  
  res.json(assignment);
});

// POST /api/assignments - 과제 생성 (강사/관리자용)
app.post('/api/assignments', (req, res) => {
  const { title, description, dueDate } = req.body;
  
  console.log('➕ POST /api/assignments - 과제 생성');
  
  if (!title || !description || !dueDate) {
    return res.status(400).json({ error: '제목, 설명, 마감일은 필수입니다.' });
  }
  
  const newAssignment = {
    id: assignments.length + 1,
    title,
    description,
    dueDate,
    createdAt: new Date().toISOString(),
    createdBy: "현재강사" // 실제로는 인증된 사용자 정보
  };
  
  assignments.push(newAssignment);
  res.status(201).json(newAssignment);
});

// GET /api/assignments/:id/submissions - 과제 제출 목록 조회
app.get('/api/assignments/:id/submissions', (req, res) => {
  const assignmentId = parseInt(req.params.id);
  const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignmentId);
  
  console.log(`📊 GET /api/assignments/${assignmentId}/submissions - 제출 목록 조회`);
  
  res.json(assignmentSubmissions);
});

// POST /api/assignments/:id/submissions - 과제 제출
app.post('/api/assignments/:id/submissions', (req, res) => {
  const assignmentId = parseInt(req.params.id);
  const { submissionType, fileUrl, linkUrl } = req.body;
  
  console.log(`📤 POST /api/assignments/${assignmentId}/submissions - 과제 제출`);
  
  const assignment = assignments.find(a => a.id === assignmentId);
  if (!assignment) {
    return res.status(404).json({ error: '과제를 찾을 수 없습니다.' });
  }
  
  if (submissionType === 'FILE' && !fileUrl) {
    return res.status(400).json({ error: '파일 URL이 필요합니다.' });
  }
  
  if (submissionType === 'LINK' && !linkUrl) {
    return res.status(400).json({ error: '링크 URL이 필요합니다.' });
  }
  
  const newSubmission = {
    id: submissions.length + 1,
    assignmentId,
    studentId: "current-student", // 실제로는 인증된 사용자 정보
    studentName: "현재학생",
    submissionType,
    fileUrl: submissionType === 'FILE' ? fileUrl : null,
    linkUrl: submissionType === 'LINK' ? linkUrl : null,
    submittedAt: new Date().toISOString(),
    grade: null,
    feedback: null
  };
  
  submissions.push(newSubmission);
  res.status(201).json(newSubmission);
});

// POST /api/upload - 파일 업로드
app.post('/api/upload', upload.single('file'), (req, res) => {
  console.log('📁 POST /api/upload - 파일 업로드');
  
  if (!req.file) {
    return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
  }
  
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ fileUrl });
});

// PATCH /api/submissions/:id - 과제 채점 (강사/관리자용)
app.patch('/api/submissions/:id', (req, res) => {
  const submissionId = parseInt(req.params.id);
  const { grade, feedback } = req.body;
  
  console.log(`✏️ PATCH /api/submissions/${submissionId} - 과제 채점`);
  
  const submission = submissions.find(s => s.id === submissionId);
  if (!submission) {
    return res.status(404).json({ error: '제출물을 찾을 수 없습니다.' });
  }
  
  submission.grade = grade;
  submission.feedback = feedback;
  
  res.json(submission);
});

// Chat Room API routes
app.get('/api/chatrooms', (req, res) => {
  console.log('📋 GET /api/chatrooms - 채팅방 목록 조회');
  res.json(chatRooms);
});

app.post('/api/chatrooms', (req, res) => {
  const { roomName, type } = req.body;
  
  if (!roomName || !type) {
    return res.status(400).json({ error: 'roomName and type are required' });
  }
  
  if (!['ONE_TO_ONE', 'GROUP'].includes(type)) {
    return res.status(400).json({ error: 'type must be ONE_TO_ONE or GROUP' });
  }
  
  const newRoom = {
    id: Date.now(),
    roomName: roomName.trim(),
    type: type,
    createdAt: new Date().toISOString()
  };
  
  chatRooms.push(newRoom);
  // 새 방에 빈 참여자 목록 초기화
  roomParticipants[newRoom.id] = [];
  
  console.log(`🏠 POST /api/chatrooms - 새 채팅방 생성: ${newRoom.roomName} (${newRoom.type})`);
  res.status(201).json(newRoom);
});

// Join chat room
app.post('/api/chatrooms/:roomId/join', authenticateToken, (req, res) => {
  const roomId = parseInt(req.params.roomId);
  const userId = req.user.id;
  const username = req.user.username;
  
  // 방이 존재하는지 확인
  const room = chatRooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: 'Chat room not found' });
  }
  
  // 참여자 목록 초기화 (없는 경우)
  if (!roomParticipants[roomId]) {
    roomParticipants[roomId] = [];
  }
  
  // 이미 참여 중인지 확인
  const existingParticipant = roomParticipants[roomId].find(p => p.id === userId);
  if (existingParticipant) {
    if (existingParticipant.status === 'ACTIVE') {
      return res.status(400).json({ error: 'Already joined this room' });
    } else {
      // 상태를 ACTIVE로 변경
      existingParticipant.status = 'ACTIVE';
    }
  } else {
    // 새 참여자 추가
    const newParticipant = {
      id: userId,
      username: username,
      nickname: username, // 기본값으로 username 사용
      role: req.user.role || 'STUDENT',
      status: 'ACTIVE'
    };
    roomParticipants[roomId].push(newParticipant);
  }
  
  console.log(`🚪 POST /api/chatrooms/${roomId}/join - 사용자 ${username} 참여`);
  res.json({ message: 'Successfully joined the room' });
});

// Leave chat room
app.post('/api/chatrooms/:roomId/leave', authenticateToken, (req, res) => {
  const roomId = parseInt(req.params.roomId);
  const userId = req.user.id;
  const username = req.user.username;
  
  // 방이 존재하는지 확인
  const room = chatRooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: 'Chat room not found' });
  }
  
  // 참여자 찾기
  const participant = roomParticipants[roomId]?.find(p => p.id === userId);
  if (!participant) {
    return res.status(400).json({ error: 'Not a member of this room' });
  }
  
  // 상태를 LEFT로 변경
  participant.status = 'LEFT';
  
  console.log(`🚪 POST /api/chatrooms/${roomId}/leave - 사용자 ${username} 퇴장`);
  res.json({ message: 'Successfully left the room' });
});

// Get room participants
app.get('/api/chatrooms/:roomId/participants', authenticateToken, (req, res) => {
  const roomId = parseInt(req.params.roomId);
  
  // 방이 존재하는지 확인
  const room = chatRooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: 'Chat room not found' });
  }
  
  const participants = roomParticipants[roomId] || [];
  console.log(`👥 GET /api/chatrooms/${roomId}/participants - 참여자 ${participants.length}명 조회`);
  res.json(participants);
});

// Notice API routes
app.get('/api/notices', authenticateToken, (req, res) => {
  console.log(`📢 GET /api/notices - 공지사항 목록 조회 by ${req.user.username}`);
  res.json(notices);
});

app.get('/api/notices/:id', authenticateToken, (req, res) => {
  const noticeId = parseInt(req.params.id);
  const notice = notices.find(n => n.id === noticeId);
  
  if (!notice) {
    return res.status(404).json({ error: 'Notice not found' });
  }
  
  console.log(`📢 GET /api/notices/${noticeId} - 공지사항 상세 조회 by ${req.user.username}`);
  res.json(notice);
});

app.post('/api/notices', authenticateToken, (req, res) => {
  const { title, content, isImportant } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  
  const newNotice = {
    id: Date.now(),
    title: title.trim(),
    content: content.trim(),
    author: {
      id: req.user.id,
      username: req.user.username,
      fullName: req.user.username, // Mock에서는 username을 fullName으로 사용
      email: `${req.user.username}@example.com`,
      role: req.user.role
    },
    isImportant: isImportant || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  notices.unshift(newNotice); // 최신 공지사항을 맨 위에 추가
  console.log(`📢 POST /api/notices - 새 공지사항 생성: ${newNotice.title} by ${req.user.username}`);
  res.status(201).json(newNotice);
});

app.put('/api/notices/:id', authenticateToken, (req, res) => {
  const noticeId = parseInt(req.params.id);
  const { title, content, isImportant } = req.body;
  
  const noticeIndex = notices.findIndex(n => n.id === noticeId);
  if (noticeIndex === -1) {
    return res.status(404).json({ error: 'Notice not found' });
  }
  
  // 작성자만 수정 가능 (관리자는 모든 공지사항 수정 가능)
  const notice = notices[noticeIndex];
  if (req.user.role !== 'ADMIN' && notice.author.id !== req.user.id) {
    return res.status(403).json({ error: 'Only the author or admin can edit this notice' });
  }
  
  notices[noticeIndex] = {
    ...notice,
    title: title.trim(),
    content: content.trim(),
    isImportant: isImportant || false,
    updatedAt: new Date().toISOString()
  };
  
  console.log(`📢 PUT /api/notices/${noticeId} - 공지사항 수정: ${title} by ${req.user.username}`);
  res.json(notices[noticeIndex]);
});

app.delete('/api/notices/:id', authenticateToken, (req, res) => {
  const noticeId = parseInt(req.params.id);
  const noticeIndex = notices.findIndex(n => n.id === noticeId);
  
  if (noticeIndex === -1) {
    return res.status(404).json({ error: 'Notice not found' });
  }
  
  // 작성자만 삭제 가능 (관리자는 모든 공지사항 삭제 가능)
  const notice = notices[noticeIndex];
  if (req.user.role !== 'ADMIN' && notice.author.id !== req.user.id) {
    return res.status(403).json({ error: 'Only the author or admin can delete this notice' });
  }
  
  notices.splice(noticeIndex, 1);
  console.log(`📢 DELETE /api/notices/${noticeId} - 공지사항 삭제: ${notice.title} by ${req.user.username}`);
  res.json({ message: 'Notice deleted successfully' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Assignment Mock Server is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: '요청한 엔드포인트를 찾을 수 없습니다.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Assignment Mock Server is running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET    /api/assignments - 과제 목록 조회`);
  console.log(`   GET    /api/assignments/:id - 과제 상세 조회`);
  console.log(`   POST   /api/assignments - 과제 생성`);
  console.log(`   GET    /api/assignments/:id/submissions - 제출 목록 조회`);
  console.log(`   POST   /api/assignments/:id/submissions - 과제 제출`);
  console.log(`   POST   /api/upload - 파일 업로드`);
  console.log(`   PATCH  /api/submissions/:id - 과제 채점`);
  console.log(`   GET    /health - 서버 상태 확인`);
});
