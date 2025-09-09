import axios from 'axios';
import type { ChatRoom } from './types';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export const getChatRooms = async (): Promise<ChatRoom[]> => {
  const response = await api.get('/chatrooms');
  return response.data;
};

export const createChatRoom = async (roomName: string): Promise<ChatRoom> => {
  const response = await api.post('/chatrooms', { roomName, type: 'GROUP' }); // Assuming 'GROUP' as default
  return response.data;
};

export default api;
