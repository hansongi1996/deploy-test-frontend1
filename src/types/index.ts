export interface User {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  role?: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

export interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface ChatMessage {
  id: number;
  content: string;
  sender: User;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'ENTER' | 'LEAVE';
  createdAt: string;
  sentAtEpochMs?: number; // Optional timestamp in milliseconds
}

export type ChatRoomType = 'ONE_TO_ONE' | 'GROUP';

export interface ChatRoom {
  id: number;
  roomName: string;
  type: ChatRoomType;
  participantCount?: number;
  unreadCount?: number;
  date?: string;
  createdAt?: string;
  lastMessageTime?: string;
}

export interface ChatRoomParticipant {
  id: number;
  username: string;
  nickname: string;
  email?: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  status: 'PENDING' | 'ACTIVE' | 'LEFT';
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  maxScore: number;
  tags: string[];
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'LATE' | 'GRADED';
  submissionCount: number;
  totalStudents: number;
  attachments: AssignmentAttachment[];
  requirements: string[];
}

export interface AssignmentAttachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: 'PDF' | 'ZIP' | 'DOC' | 'OTHER';
}

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  userId: number;
  submissionType: 'FILE' | 'LINK';
  fileUrl?: string;
  linkUrl?: string;
  submittedAt: string;
  status: 'SUBMITTED' | 'LATE' | 'GRADED';
  grade?: number;
  feedback?: string;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  author: User;
  pinned: boolean;  // 백엔드 응답과 일치
  createdAt: string;
  updatedAt: string;
}

// Login Component Interface
export interface LoginComponentProps {
  onLogin: (credentials: LoginRequest) => Promise<boolean>;
  isLoading: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
}

// Redux 기반 로그인 컴포넌트 Props (선택적)
export interface ReduxLoginComponentProps {
  // Redux hooks를 직접 사용할 수 있도록 함
  useReduxAuth?: () => {
    user: AuthUser | null;
    login: (credentials: LoginRequest) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    clearError: () => void;
  };
}

export interface LoginComponent {
  component: React.ComponentType<LoginComponentProps | ReduxLoginComponentProps>;
  name: string;
  description?: string;
  useRedux?: boolean; // Redux 사용 여부
}