import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, InputGroup, Spinner } from 'react-bootstrap';
import { getAllUsers } from '../api';
import type { User } from '../types';

interface UserSelectionModalProps {
  show: boolean;
  onHide: () => void;
  onSelectUser: (user: User) => void;
  currentUserId?: number;
}

const UserSelectionModal: React.FC<UserSelectionModalProps> = ({
  show,
  onHide,
  onSelectUser,
  currentUserId
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    if (show) {
      loadUsers();
      setSearchTerm('');
      setSelectedUserId(null);
    }
  }, [show]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Loading users from /api/users/all...');
      const allUsers = await getAllUsers();
      console.log('Received users:', allUsers);
      
      // 각 사용자 데이터 구조 확인
      allUsers.forEach((user, index) => {
        console.log(`User ${index}:`, {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role
        });
      });
      
      // 현재 사용자를 제외한 사용자 목록만 표시
      const filteredUsers = currentUserId 
        ? allUsers.filter(user => user.id !== currentUserId)
        : allUsers;
      
      console.log('Filtered users (excluding current user):', filteredUsers);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      console.error('Error details:', error);
      alert('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleUserSelect = (user: User) => {
    setSelectedUserId(user.id);
  };

  const handleConfirm = () => {
    if (selectedUserId) {
      const selectedUser = users.find(user => user.id === selectedUserId);
      if (selectedUser) {
        onSelectUser(selectedUser);
        onHide();
      }
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>1:1 채팅 상대방 선택</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="사용자 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline-secondary" onClick={loadUsers} disabled={loading}>
              <i className={`bi bi-arrow-clockwise ${loading ? 'spinning' : ''}`}></i>
            </Button>
          </InputGroup>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">사용자 목록을 불러오는 중...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-4">
            <i className="bi bi-person-x" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
            <p className="mt-2 text-muted">
              {searchTerm ? '검색 결과가 없습니다.' : '사용자가 없습니다.'}
            </p>
          </div>
        ) : (
          <ListGroup style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {filteredUsers.map((user) => (
              <ListGroup.Item
                key={user.id}
                action
                active={selectedUserId === user.id}
                onClick={() => handleUserSelect(user)}
                style={{ cursor: 'pointer' }}
                className="d-flex align-items-center"
              >
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" 
                     style={{ width: '40px', height: '40px', fontSize: '16px' }}>
                  {(user.fullName && user.fullName.charAt(0)) || (user.username && user.username.charAt(0)) || '?'}
                </div>
                <div className="flex-grow-1">
                  <div className="fw-bold">{user.fullName || '이름 없음'}</div>
                  <small className="text-muted">@{user.username || 'username 없음'}</small>
                  {user.role && (
                    <span className={`badge ms-2 ${
                      user.role === 'ADMIN' ? 'bg-danger' :
                      user.role === 'INSTRUCTOR' ? 'bg-warning' :
                      'bg-secondary'
                    }`}>
                      {user.role === 'ADMIN' ? '관리자' :
                       user.role === 'INSTRUCTOR' ? '강사' :
                       '학생'}
                    </span>
                  )}
                </div>
                {selectedUserId === user.id && (
                  <i className="bi bi-check-circle-fill text-primary"></i>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          취소
        </Button>
        <Button 
          variant="primary" 
          onClick={handleConfirm}
          disabled={!selectedUserId}
        >
          선택
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserSelectionModal;
