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
    } catch (error) {
      console.error('Failed to load rooms:', error);
      // Fallback to placeholder data
      const placeholderRooms: ChatRoom[] = [
        { id: 1, roomName: 'General', type: 'GROUP', createdAt: new Date().toISOString() },
        { id: 2, roomName: 'TypeScript Talk', type: 'GROUP', createdAt: new Date().toISOString() },
      ];
      setRooms(placeholderRooms);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;

    try {
      setLoading(true);
      const newRoom = await createChatRoom(newRoomName.trim(), newRoomType);
      setRooms((prev) => [...prev, newRoom]);
      setNewRoomName('');
      setNewRoomType('GROUP'); // Reset to default
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('방 생성에 실패했습니다. 다시 시도해주세요.');
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
      await joinChatRoom(roomId);
      localStorage.setItem('username', user.username);
      navigate(`/rooms/${roomId}`);
    } catch (error) {
      console.error('Failed to join room:', error);
      alert('방 참여에 실패했습니다. 다시 시도해주세요.');
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
          {rooms.map((room: ChatRoom) => (
            <ListGroup.Item
              key={room.id}
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
          ))}
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
