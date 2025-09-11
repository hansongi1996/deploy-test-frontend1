import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { getChatRooms, createChatRoom, joinChatRoom } from '../api';
import type { ChatRoom, ChatRoomType } from '../types';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import Header from '../components/Header';

const HomePage: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState<ChatRoomType>('GROUP');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redux에서 사용자 정보 가져오기
  const { user } = useSelector((state: RootState) => state.auth);

  // 현재 활성 탭 결정
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/notices') return 'notices';
    if (path === '/assignments') return 'assignments';
    return 'chat';
  };

  const activeTab = getActiveTab();

  // 검색 필터링된 채팅방 목록
  const filteredRooms = rooms.filter(room => 
    room.roomName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      
    } catch (error: any) {
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
    } catch (error: any) {
      console.error('Failed to join room:', error);
      console.error('Error details:', error.response?.data);
      alert(`방 참여에 실패했습니다. 오류: ${error.response?.status} - ${error.response?.data?.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column" style={{ height: '100vh' }}>
      <Header />

      {/* Main Content */}
      <div className="d-flex flex-grow-1">
        {/* Left Panel - Navigation Sidebar */}
        <div className="bg-light border-end d-flex flex-column" style={{ width: '280px', minWidth: '280px', height: 'calc(100vh - 80px)' }}>
          {/* Main Navigation Tabs */}
          <div className="d-flex border-bottom">
            <Button 
              variant="link" 
              className={`flex-fill text-decoration-none ${activeTab === 'notices' ? 'text-primary border-bottom border-primary' : 'text-dark'}`}
              onClick={() => navigate('/notices')}
            >
              공지사항
            </Button>
            <Button 
              variant="link" 
              className={`flex-fill text-decoration-none ${activeTab === 'assignments' ? 'text-primary border-bottom border-primary' : 'text-dark'}`}
              onClick={() => navigate('/assignments')}
            >
              과제
            </Button>
            <Button 
              variant="link" 
              className={`flex-fill text-decoration-none ${activeTab === 'chat' ? 'text-primary border-bottom border-primary' : 'text-dark'}`}
              onClick={() => navigate('/')}
            >
              채팅
            </Button>
          </div>

          {/* Chat Header (채팅 탭일 때만 표시) */}
          {activeTab === 'chat' && (
            <div className="p-3 border-bottom">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">채팅</h5>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-1 text-primary"
                  onClick={() => setShowSearch(!showSearch)}
                >
                  <i className="bi bi-search"></i>
                </Button>
              </div>
              {showSearch && (
                <div className="mt-2">
                  <Form.Control
                    type="text"
                    placeholder="채팅방 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="sm"
                    className="border-0 bg-light"
                    style={{ borderRadius: '20px' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Chat Rooms List (채팅 탭일 때만 표시) */}
          {activeTab === 'chat' && (
            <>
              <div className="flex-grow-1 overflow-auto" style={{ maxHeight: '400px' }}>
                {filteredRooms.length > 0 ? (
                  filteredRooms.map((room: ChatRoom, index: number) => (
                    <div
                      key={`${room.id}-${index}`}
                      className="d-flex align-items-center p-3 border-bottom hover-bg-light"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleJoinRoom(room.id)}
                    >
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" 
                           style={{ width: '50px', height: '50px', fontSize: '18px' }}>
                        {room.roomName.charAt(0)}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-1">{room.roomName}</h6>
                          <small className="text-muted">
                            {new Date(room.createdAt).toLocaleTimeString('ko-KR', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </small>
                        </div>
                        <p className="mb-0 text-muted small">
                          그룹 채팅
                        </p>
                      </div>
                      {index === 0 && (
                        <span className="badge bg-success rounded-pill ms-2">1</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted p-4">
                    {loading ? (
                      '채팅방 목록을 불러오는 중...'
                    ) : searchTerm ? (
                      <div>
                        <p>'{searchTerm}'에 대한 검색 결과가 없습니다.</p>
                        <p>다른 검색어를 시도해보세요.</p>
                      </div>
                    ) : (
                      <div>
                        <p>현재 사용 가능한 채팅방이 없습니다.</p>
                        <p>새로운 채팅방을 만들어보세요!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Create Room Section */}
              <div className="p-3 border-top bg-white">
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="새 채팅방 이름"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateRoom();
                    }}
                    size="sm"
                  />
                  <Form.Select
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value as ChatRoomType)}
                    size="sm"
                    style={{ maxWidth: '100px' }}
                  >
                    <option value="GROUP">그룹</option>
                    <option value="ONE_TO_ONE">1:1</option>
                  </Form.Select>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={handleCreateRoom}
                    disabled={loading || !newRoomName.trim()}
                  >
                    {loading ? '생성중...' : '생성'}
                  </Button>
                </InputGroup>
              </div>
            </>
          )}

          {/* Other tabs content placeholder */}
          {activeTab !== 'chat' && (
            <div className="flex-grow-1 d-flex align-items-center justify-content-center">
              <div className="text-center text-muted">
                <i className="bi bi-info-circle mb-3" style={{ fontSize: '3rem' }}></i>
                <p>{activeTab === 'notices' ? '공지사항' : '과제'} 페이지로 이동 중...</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Content Area */}
        <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-white p-4">
          {activeTab === 'chat' ? (
            <div className="text-center" style={{ maxWidth: '500px' }}>
              <div className="mb-5">
                <i className="bi bi-chat-dots" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
              </div>
              <h4 className="text-muted mb-4">채팅을 시작하세요</h4>
              <p className="text-muted mb-5" style={{ lineHeight: '1.6' }}>
                왼쪽에서 채팅방을 선택하거나 새로운 채팅방을 만들어보세요.
              </p>
              <div className="mt-4">
                <h6 className="mb-2">안녕하세요, {user?.fullName || user?.username}님!</h6>
                <small className="text-muted">역할: {user?.role}</small>
              </div>
            </div>
          ) : (
            <div className="text-center" style={{ maxWidth: '500px' }}>
              <div className="mb-5">
                <i className={`bi ${activeTab === 'notices' ? 'bi-megaphone' : 'bi-clipboard-check'}`} 
                   style={{ fontSize: '4rem', color: '#6c757d' }}></i>
              </div>
              <h4 className="text-muted mb-4">
                {activeTab === 'notices' ? '공지사항' : '과제'} 페이지로 이동 중...
              </h4>
              <p className="text-muted" style={{ lineHeight: '1.6' }}>
                잠시만 기다려주세요. 페이지가 로드되고 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
