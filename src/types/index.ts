export interface User {
  id: number;
  username: string;
  fullName: string;
}

export interface ChatMessage {
  id: number;
  content: string;
  sender: User;
  messageType: 'TEXT' | 'ENTER' | 'LEAVE';
  createdAt: string;
}

export interface ChatRoom {
  id: number;
  roomName: string;
  type: 'ONE_ON_ONE' | 'GROUP';
  createdAt: string;
}
