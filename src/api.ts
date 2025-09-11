import axios from 'axios';
import type { ChatRoom, ChatRoomType, ChatRoomParticipant, ChatMessage, Assignment, AssignmentSubmission, Notice, LoginRequest, LoginResponse } from './types';

const api = axios.create({
  baseURL: '/api', // Vite 프록시 사용
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenExpiry');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getChatRooms = async (): Promise<ChatRoom[]> => {
  const response = await api.get('/chatrooms/all');
  return response.data;
};

export const createChatRoom = async (roomName: string, type: ChatRoomType = 'GROUP'): Promise<ChatRoom> => {
  const response = await api.post('/chatrooms', { roomName, type });
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
  const response = await api.get(`/chatrooms/${roomId}/messages`);
  return response.data;
};

// Assignment API functions
export const getAssignments = async (): Promise<Assignment[]> => {
  const response = await api.get('/assignments');
  return response.data;
};

export const getAssignment = async (assignmentId: number): Promise<Assignment> => {
  const response = await api.get(`/assignments/${assignmentId}`);
  return response.data;
};

export const getAssignmentSubmissions = async (assignmentId: number): Promise<AssignmentSubmission[]> => {
  const response = await api.get(`/assignments/${assignmentId}/submissions`);
  return response.data;
};

export const submitAssignment = async (
  assignmentId: number,
  submissionType: 'FILE' | 'LINK',
  fileUrl?: string,
  linkUrl?: string
): Promise<AssignmentSubmission> => {
  const response = await api.post(`/assignments/${assignmentId}/submissions`, {
    submissionType,
    fileUrl,
    linkUrl
  });
  return response.data;
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
export const getNotices = async (): Promise<Notice[]> => {
  const response = await api.get('/notices');
  return response.data;
};

export const getNotice = async (noticeId: number): Promise<Notice> => {
  const response = await api.get(`/notices/${noticeId}`);
  return response.data;
};

export const createNotice = async (
  title: string,
  content: string,
  isImportant: boolean = false
): Promise<Notice> => {
  const response = await api.post('/notices', {
    title,
    content,
    isImportant
  });
  return response.data;
};

export const updateNotice = async (
  noticeId: number,
  title: string,
  content: string,
  isImportant: boolean = false
): Promise<Notice> => {
  const response = await api.put(`/notices/${noticeId}`, {
    title,
    content,
    isImportant
  });
  return response.data;
};

export const deleteNotice = async (noticeId: number): Promise<void> => {
  await api.delete(`/notices/${noticeId}`);
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

// ✅ AvatarUploader.tsx 가 기대하는 export 이름을 alias 로 제공
export { uploadAvatar as uploadUserAvatar, deleteAvatar as removeUserAvatar };

export default api;
