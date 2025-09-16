import axios from 'axios';
import type {
  ChatRoom,
  ChatRoomType,
  ChatRoomParticipant,
  ChatMessage,
  Assignment,
  AssignmentSubmission,
  Notice,
  LoginRequest,
  LoginResponse,
  User
} from './types';
import type { AssignmentCreateRequestDTO, AssignmentUpdateRequestDTO, GradeRequestDTO, Submission } from './types/assignment';

// === 세션/로컬 저장소 모두에서 토큰을 읽어오기 (세션 우선) ===
function getToken(): string | null {
  return (
    sessionStorage.getItem('authToken') ||
    localStorage.getItem('authToken') ||
    null
  );
}

const api = axios.create({
  baseURL: '/api', // Vite 프록시 사용
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid -> 두 저장소 모두 정리
      sessionStorage.removeItem('authUser');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('tokenExpiry');

      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenExpiry');

      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // 403 Forbidden - 권한 없음
      console.warn('Access forbidden (403) - insufficient permissions');
      // 403 오류는 로그아웃하지 않고 그대로 전달
    }
    return Promise.reject(error);
  }
);

export const getChatRooms = async (): Promise<ChatRoom[]> => {
  const response = await api.get('/chatrooms/all');
  return response.data;
};

export const createChatRoom = async (roomName: string, type: ChatRoomType = 'GROUP', targetUser?: User): Promise<ChatRoom> => {
  const requestData: any = { roomName, type };
  
  // 1:1 채팅인 경우 상대방 이메일을 receiverId로 전송
  if (type === 'ONE_TO_ONE' && targetUser?.email) {
    requestData.receiverId = targetUser.email;
  }
  
  const response = await api.post('/chatrooms', requestData);
  return response.data;
};

// Join chat room
export const joinChatRoom = async (roomId: number): Promise<{ message: string }> => {
  const response = await api.post(`/chatrooms/${roomId}/join`);
  return response.data;
};

// Delete chat room
export const deleteChatRoom = async (roomId: number): Promise<{ message: string }> => {
  const response = await api.delete(`/chatrooms/${roomId}`);
  return response.data;
};

// Leave chat room
export const leaveChatRoom = async (roomId: number): Promise<{ message: string }> => {
  const response = await api.put(`/chatrooms/${roomId}/leave`);
  return response.data;
};

// Get room participants
export const getRoomParticipants = async (roomId: number): Promise<ChatRoomParticipant[]> => {
  const response = await api.get(`/chatrooms/${roomId}/participants`);
  return response.data;
};

// Get chat room messages (history)
export const getChatMessages = async (roomId: number): Promise<ChatMessage[]> => {
  console.log(`[API] Fetching chat messages for room ID: ${roomId}`);
  const response = await api.get(`/chatrooms/${roomId}/messages`);
  console.log(`[API] Received chat messages:`, response.data);
  return response.data;
};

// Assignment API functions
export const createAssignment = async (payload: AssignmentCreateRequestDTO) => {
  const response = await api.post("/assignments", payload);
  return response.headers.location; // 새로 생성된 과제의 URI를 반환
};

export const getAssignments = async (): Promise<Assignment[]> => {
  const response = await api.get('/assignments');
  return response.data;
};

export const updateAssignment = async (assignmentId: number, payload: AssignmentUpdateRequestDTO) => {
  await api.patch(`/assignments/${assignmentId}`, payload);
};

export const getAssignment = async (assignmentId: number): Promise<Assignment> => {
  const response = await api.get(`/assignments/${assignmentId}`);
  return response.data;
};

export const getAssignmentDetails = async (
  assignmentId: number,
): Promise<Assignment> => {
  const response = await api.get(`/assignments/${assignmentId}`);
  return response.data;
};

// 학생용: 과제 제출
export const submitAssignment = async (
  assignmentId: number,
  textContent: string
): Promise<AssignmentSubmission> => {
  const response = await api.post(`/assignments/${assignmentId}/submissions`, {
    textContent
  });
  return response.data;
};
// 강사용: 제출물 채점
export const gradeSubmission = async (
  submissionId: number,
  payload: GradeRequestDTO
) => await api.patch(`/assignments/submissions/${submissionId}`, payload);

export const deleteAssignment = async (assignmentId: number): Promise<void> => {
  await api.delete(`/assignments/${assignmentId}`);
};


export const uploadFile = async (file: File): Promise<{ fileUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Notice API functions
export const getNotices = async (page: number = 0, size: number = 20, sort: string = 'createdAt,desc'): Promise<Notice[]> => {
  const response = await api.get(`/announcements?page=${page}&size=${size}&sort=${sort}`);
  return response.data;
};

export const getNotice = async (noticeId: number): Promise<Notice> => {
  const response = await api.get(`/announcements/${noticeId}`);
  return response.data;
};

export const createNotice = async (
  title: string,
  content: string,
  pinned: boolean = false
): Promise<Notice> => {
  const requestBody = {
    title,
    content,
    isPinned: pinned  // 백엔드 엔티티와 일치하는 필드명 사용
  };
  
  console.log('API 요청 데이터:', requestBody);
  console.log('isPinned 타입:', typeof requestBody.isPinned);
  console.log('isPinned 값:', requestBody.isPinned);
  
  const response = await api.post('/announcements', requestBody);
  console.log('API 응답:', response.data);
  return response.data;
};

export const updateNotice = async (
  noticeId: number,
  title: string,
  content: string,
  pinned: boolean = false
): Promise<Notice> => {
  const requestBody = {
    title,
    content,
    isPinned: pinned  // 백엔드 엔티티와 일치하는 필드명 사용
  };
  
  console.log('공지사항 수정 API 요청 데이터:', requestBody);
  console.log('isPinned 타입:', typeof requestBody.isPinned);
  console.log('isPinned 값:', requestBody.isPinned);
  
  const response = await api.put(`/announcements/${noticeId}`, requestBody);
  console.log('공지사항 수정 API 응답:', response.data);
  return response.data;
};

export const deleteNotice = async (noticeId: number): Promise<void> => {
  await api.delete(`/announcements/${noticeId}`);
};

// Auth API functions
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const getCurrentUser = async (): Promise<any> => {
  const response = await api.get('/auth/me');
  return response.data;
};

//
// ----- User(프로필) 관련 API -----
//
export const uploadAvatar = async (
  userId: number,
  file: File
): Promise<{ avatarUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/users/${userId}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteAvatar = async (userId: number): Promise<void> => {
  await api.delete(`/users/${userId}/avatar`);
};

// Get all users for 1:1 chat partner selection
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get('/users/all');
  return response.data;
};

// ✅ AvatarUploader.tsx 가 기대하는 export 이름을 alias 로 제공
export { uploadAvatar as uploadUserAvatar, deleteAvatar as removeUserAvatar };

export default api;