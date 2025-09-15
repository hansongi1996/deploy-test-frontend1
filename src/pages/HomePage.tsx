import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { getChatRooms, createChatRoom, joinChatRoom, deleteChatRoom } from '../api';
import type { ChatRoom, ChatRoomType, User } from '../types';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import Header from '../components/Header';
import UserSelectionModal from '../components/UserSelectionModal';

const HomePage: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState<ChatRoomType>('GROUP');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showUserSelectionModal, setShowUserSelectionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
      
      // 토큰 상태 확인
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token found - user may need to login again');
        setRooms([]);
        return;
      }
      
      const data = await getChatRooms();
      setRooms(data);
      console.log('Successfully loaded chat rooms:', data.length);
    } catch (error: any) {
      console.error('Failed to load rooms:', error);
      
      if (error.response?.status === 403) {
        console.warn('403 Forbidden - insufficient permissions to view chat rooms');
        // 403 오류 시 사용자에게 알림
        alert('채팅방 목록을 볼 권한이 없습니다. 관리자에게 문의하세요.');
      } else if (error.response?.status === 401) {
        console.warn('401 Unauthorized - token may be expired');
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login';
        return;
      } else {
        console.warn('Continuing with empty room list - users can still create new rooms');
        // 네트워크 오류 등 기타 오류의 경우 조용히 처리
      }
      
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;

    // 1:1 채팅인 경우 상대방이 선택되지 않았다면 모달 표시
    if (newRoomType === 'ONE_TO_ONE' && !selectedUser) {
      setShowUserSelectionModal(true);
      return;
    }

    try {
      setLoading(true);
      const newRoom = await createChatRoom(
        newRoomName.trim(), 
        newRoomType, 
        newRoomType === 'ONE_TO_ONE' ? selectedUser?.id : undefined
      );
      
      // 방 생성 성공 후 목록에 추가
      setRooms((prev) => [...prev, newRoom]);
      setNewRoomName('');
      setNewRoomType('GROUP'); // Reset to default
      setSelectedUser(null); // Reset selected user
      
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

  const handleDeleteRoom = async (roomId: number, roomName: string) => {
    if (!window.confirm(`'${roomName}' 채팅방을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setLoading(true);
      await deleteChatRoom(roomId);
      
      // 삭제 성공 후 목록에서 제거
      setRooms(prev => prev.filter(room => room.id !== roomId));
      console.log('Successfully deleted room:', roomName);
    } catch (error: any) {
      console.error('Failed to delete room:', error);
      alert(`채팅방 삭제에 실패했습니다: ${error.response?.data?.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setShowUserSelectionModal(false);
  };

  const handleRoomTypeChange = (type: ChatRoomType) => {
    setNewRoomType(type);
    // 채팅방 타입이 변경되면 선택된 사용자 초기화
    if (type !== 'ONE_TO_ONE') {
      setSelectedUser(null);
    } else if (type === 'ONE_TO_ONE' && !selectedUser) {
      // 1:1 채팅으로 변경하고 아직 사용자가 선택되지 않았다면 모달 열기
      setShowUserSelectionModal(true);
    }
  };

  return (
    <div className="d-flex flex-column" style={{ height: '100vh' }}>
      <Header />

      {/* Main Content */}
      <div className="d-flex flex-grow-1">
        {/* Left Panel - Navigation Sidebar (Fixed) */}
        <div className="bg-light border-end d-flex flex-column" style={{ position: 'fixed', width: '280px', height: 'calc(100vh - 80px)', left: 0, top: '80px', zIndex: 1000 }}>
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
                <div className="d-flex gap-1">
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-1 text-primary"
                    onClick={() => setShowSearch(!showSearch)}
                    title="검색"
                  >
                    <i className="bi bi-search"></i>
                  </Button>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-1 text-secondary"
                    onClick={loadRooms}
                    disabled={loading}
                    title="새로고침"
                  >
                    <i className={`bi bi-arrow-clockwise ${loading ? 'spinning' : ''}`}></i>
                  </Button>
                </div>
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
              <div className="flex-grow-1 overflow-auto" style={{ maxHeight: '600px' }}>
                {filteredRooms.length > 0 ? (
                  filteredRooms.map((room: ChatRoom, index: number) => (
                    <div
                      key={`${room.id}-${index}`}
                      className="d-flex align-items-center p-3 border-bottom hover-bg-light"
                      style={{ cursor: 'pointer' }}
                    >
                      <div 
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" 
                        style={{ width: '50px', height: '50px', fontSize: '18px' }}
                        onClick={() => handleJoinRoom(room.id)}
                      >
                        {room.roomName.charAt(0)}
                      </div>
                      <div 
                        className="flex-grow-1"
                        onClick={() => handleJoinRoom(room.id)}
                      >
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
                          {room.type === 'ONE_TO_ONE' ? '1:1 채팅' : '그룹 채팅'}
                        </p>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {index === 0 && (
                          <span className="badge bg-success rounded-pill">1</span>
                        )}
                        <Button
                          variant="link"
                          size="sm"
                          className="p-1 text-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoom(room.id, room.roomName);
                          }}
                          disabled={loading}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted p-4">
                    {loading ? (
                      <div>
                        <div className="spinner-border text-primary mb-3" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p>채팅방 목록을 불러오는 중...</p>
                      </div>
                    ) : searchTerm ? (
                      <div>
                        <i className="bi bi-search mb-3" style={{ fontSize: '2rem' }}></i>
                        <p>'{searchTerm}'에 대한 검색 결과가 없습니다.</p>
                        <p>다른 검색어를 시도해보세요.</p>
                      </div>
                    ) : (
                      <div>
                        <i className="bi bi-chat-dots mb-3" style={{ fontSize: '2rem' }}></i>
                        <p>현재 사용 가능한 채팅방이 없습니다.</p>
                        <p>새로운 채팅방을 만들어보세요!</p>
                        <small className="text-muted">
                          채팅방 목록을 불러오지 못한 경우, 새로고침을 시도해보세요.
                        </small>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Create Room Section */}
              <div className="p-3 border-top bg-white">
                <InputGroup className="mb-2">
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
                    onChange={(e) => handleRoomTypeChange(e.target.value as ChatRoomType)}
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
                
                {/* 1:1 채팅 선택된 사용자 표시 */}
                {newRoomType === 'ONE_TO_ONE' && selectedUser && (
                  <div className="d-flex align-items-center justify-content-between bg-light p-2 rounded">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" 
                           style={{ width: '30px', height: '30px', fontSize: '12px' }}>
                        {(selectedUser.fullName && selectedUser.fullName.charAt(0)) || (selectedUser.username && selectedUser.username.charAt(0)) || '?'}
                      </div>
                      <div>
                        <small className="fw-bold">{selectedUser.fullName || '이름 없음'}</small>
                        <br />
                        <small className="text-muted">@{selectedUser.username || 'username 없음'}</small>
                      </div>
                    </div>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-1 text-danger"
                      onClick={() => setSelectedUser(null)}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  </div>
                )}
                
                {/* 1:1 채팅이지만 사용자가 선택되지 않은 경우 */}
                {newRoomType === 'ONE_TO_ONE' && !selectedUser && (
                  <div className="text-center py-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => setShowUserSelectionModal(true)}
                    >
                      <i className="bi bi-person-plus me-1"></i>
                      상대방 선택
                    </Button>
                  </div>
                )}
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
        <div className="d-flex align-items-center justify-content-center bg-white p-4" style={{ marginLeft: '280px', width: 'calc(100vw - 280px)', height: 'calc(100vh - 80px)' }}>
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
      
      {/* User Selection Modal */}
      <UserSelectionModal
        show={showUserSelectionModal}
        onHide={() => setShowUserSelectionModal(false)}
        onSelectUser={handleUserSelect}
        currentUserId={user?.id}
      />
    </div>
  );
};

export default HomePage;
