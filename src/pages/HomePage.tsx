import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form, ListGroup, Card, InputGroup } from 'react-bootstrap';
import { getChatRooms, createChatRoom, joinChatRoom } from '../api';
import type { ChatRoom, ChatRoomType } from '../types';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const HomePage: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState<ChatRoomType>('GROUP');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Redux에서 사용자 정보 가져오기
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await getChatRooms();
      setRooms(data);
      console.log('Successfully loaded chat rooms:', data.length);
    } catch (error) {
      console.error('Failed to load rooms:', error);
      console.warn('Continuing with empty room list - users can still create new rooms');
      setRooms([]);
      
      // 사용자에게 알림 (선택사항)
      // alert('채팅방 목록을 불러올 수 없습니다. 새 방을 만들어보세요!');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;

    try {
      setLoading(true);
      const newRoom = await createChatRoom(newRoomName.trim(), newRoomType);
      
      // 방 생성 성공 후 목록에 추가
      setRooms((prev) => [...prev, newRoom]);
      setNewRoomName('');
      setNewRoomType('GROUP'); // Reset to default
      
      console.log('Successfully created room:', newRoom.roomName);
      
      // 생성된 방으로 바로 이동 (선택사항)
      // navigate(`/rooms/${newRoom.id}`);
      
    } catch (error) {
      console.error('Failed to create room:', error);
      alert(`방 생성에 실패했습니다: ${error.response?.data?.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: number) => {
    if (!user?.username) {
      alert('사용자 정보를 찾을 수 없습니다.');
      return;
    }
    
    try {
      setLoading(true);
      
      // 디버깅: 현재 토큰과 요청 정보 확인
      const token = localStorage.getItem('authToken');
      console.log('Current token:', token ? 'Token exists' : 'No token');
      console.log('Joining room ID:', roomId);
      console.log('User info:', user);
      
      await joinChatRoom(roomId);
      localStorage.setItem('username', user.username);
      navigate(`/rooms/${roomId}`);
    } catch (error) {
      console.error('Failed to join room:', error);
      console.error('Error details:', error.response?.data);
      alert(`방 참여에 실패했습니다. 오류: ${error.response?.status} - ${error.response?.data?.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <Card className="mb-4">
        <Card.Header as="h2">PeerFlow Chat</Card.Header>
        <Card.Body>
        <div className="mb-3">
          <h5>안녕하세요, {user?.fullName || user?.username}님!</h5>
          <p className="text-muted">역할: {user?.role}</p>
        </div>

        <hr />

        <Card.Title>Available Chat Rooms</Card.Title>
        <ListGroup className="mb-3">
          {rooms.length > 0 ? (
            rooms.map((room: ChatRoom, index: number) => (
              <ListGroup.Item
                key={`${room.id}-${index}`}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <div className="fw-semibold">{room.roomName}</div>
                  <small className="text-muted">
                    {new Date(room.createdAt).toLocaleString()}
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <Link to={`/rooms/${room.id}`} className="btn btn-outline-secondary btn-sm">
                    View
                  </Link>
                  <Button 
                    size="sm" 
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={loading}
                  >
                    {loading ? 'Joining...' : 'Join'}
                  </Button>
                </div>
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item className="text-center text-muted">
              {loading ? (
                '채팅방 목록을 불러오는 중...'
              ) : (
                <div>
                  <p>현재 사용 가능한 채팅방이 없습니다.</p>
                  <p>새로운 채팅방을 만들어보세요!</p>
                </div>
              )}
            </ListGroup.Item>
          )}
        </ListGroup>

        <div className="mb-3 d-flex flex-column align-items-center gap-2">
          <InputGroup style={{ maxWidth: '400px' }}>
            <Form.Control
              type="text"
              placeholder="New room name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateRoom();
              }}
            />
            <Form.Select
              value={newRoomType}
              onChange={(e) => setNewRoomType(e.target.value as ChatRoomType)}
              style={{ maxWidth: '150px' }}
            >
              <option value="GROUP">Group</option>
              <option value="ONE_TO_ONE">1:1</option>
            </Form.Select>
            <Button 
              variant="outline-secondary" 
              onClick={handleCreateRoom}
              disabled={loading || !newRoomName.trim()}
            >
              {loading ? 'Creating...' : 'Create Room'}
            </Button>
          </InputGroup>
        </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default HomePage;
