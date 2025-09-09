import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form, ListGroup, Card, InputGroup } from 'react-bootstrap';
// import api from '../api'; // 현재 미사용이면 제거 또는 주석
import type { ChatRoom } from '../types';

const HomePage: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 백엔드 연동 전까지 플레이스홀더 사용
    const placeholderRooms: ChatRoom[] = [
      { id: 1, roomName: 'General', type: 'GROUP', createdAt: new Date().toISOString() },
      { id: 2, roomName: 'TypeScript Talk', type: 'GROUP', createdAt: new Date().toISOString() },
    ];
    setRooms(placeholderRooms);
  }, []);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;

    // 실제 환경: API로 생성 후 setRooms([...rooms, res.data])
    const newRoom: ChatRoom = {
      id: Math.floor(Math.random() * 100000),
      roomName: newRoomName.trim(),
      type: 'GROUP',
      createdAt: new Date().toISOString(),
    };
    setRooms((prev) => [...prev, newRoom]);
    setNewRoomName('');
  };

  const handleJoinRoom = (roomId: number): void => {
    if (!username.trim()) {
      alert('Please enter a username.');
      return;
    }
    localStorage.setItem('username', username.trim());
    navigate(`/rooms/${roomId}`);
  };

  return (
    <div className="text-center">
      <Card className="mb-4">
        <Card.Header as="h2">PeerFlow Chat</Card.Header>
        <Card.Body>
        <Form.Group className="mb-3">
          <Form.Label>Your Username</Form.Label>
          <InputGroup className="justify-content-center">
            <Form.Control
              type="text"
              placeholder="Enter your username to join a room"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ maxWidth: '400px' }}
            />
          </InputGroup>
        </Form.Group>

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
                <Button size="sm" onClick={() => handleJoinRoom(room.id)}>
                  Join
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>

        <InputGroup className="mb-3 justify-content-center">
          <Form.Control
            type="text"
            placeholder="New room name"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateRoom();
            }}
            style={{ maxWidth: '300px' }}
          />
          <Button variant="outline-secondary" onClick={handleCreateRoom}>
            Create Room
          </Button>
        </InputGroup>
        </Card.Body>
      </Card>
    </div>
  );
};

export default HomePage;
