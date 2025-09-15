import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import type { ChatMessage, ChatRoomParticipant } from '../types';
import { joinChatRoom, leaveChatRoom, getRoomParticipants, getChatMessages, getChatRooms } from '../api';
import socketService from '../services/socketService';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import ParticipantList from '../components/ParticipantList';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import Header from '../components/Header';

const ChatRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ChatRoomParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [roomType, setRoomType] = useState<'ONE_TO_ONE' | 'GROUP'>('GROUP'); // 채팅방 타입 상태 추가
  const [roomName, setRoomName] = useState<string>(''); // 채팅방 이름 상태 추가
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscribedRef = useRef(false);
  const processedMessageIds = useRef<Set<number>>(new Set());
  
  // Redux에서 사용자 정보 가져오기
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Redux에서 사용자 정보를 사용하므로 localStorage에서 가져올 필요 없음

    const initializeRoom = async () => {
      if (!roomId) return;
      
      try {
        setLoading(true);
        
        // 1. 채팅방 참여 시도 (실패해도 계속 진행)
        try {
          console.log(`[ChatRoom] Attempting to join room ${roomId}...`);
          await joinChatRoom(parseInt(roomId));
          console.log(`[ChatRoom] Successfully joined room ${roomId}`);
        } catch (joinError: any) {
          console.warn(`[ChatRoom] Failed to join room ${roomId} via API, but continuing with WebSocket connection:`, joinError);
          console.warn(`[ChatRoom] Join error details:`, {
            status: joinError.response?.status,
            statusText: joinError.response?.statusText,
            data: joinError.response?.data,
            message: joinError.message
          });
        }
        
        // 2. 채팅방 정보 로드 (채팅방 목록에서 해당 방 찾기)
        try {
          const allRooms = await getChatRooms();
          console.log('All rooms from API:', allRooms);
          const currentRoom = allRooms.find(room => room.id === parseInt(roomId));
          console.log('Current room found:', currentRoom);
          if (currentRoom) {
            console.log('Setting room type to:', currentRoom.type);
            console.log('Setting room name to:', currentRoom.roomName);
            setRoomType(currentRoom.type);
            setRoomName(currentRoom.roomName);
            console.log('Successfully loaded room info from rooms list, room type:', currentRoom.type, 'room name:', currentRoom.roomName);
          } else {
            console.warn('Room not found in rooms list, using default GROUP type');
            setRoomType('GROUP');
            setRoomName(`Room #${roomId}`);
          }
        } catch (roomError) {
          console.warn('Failed to load room info from rooms list:', roomError);
          setRoomType('GROUP'); // 기본값으로 그룹 채팅 설정
          setRoomName(`Room #${roomId}`);
        }

        // 3. 참여자 목록 로드 시도 (실패해도 계속 진행)
        try {
          const participantData = await getRoomParticipants(parseInt(roomId));
          setParticipants(participantData);
          console.log('Successfully loaded participants:', participantData.length);
        } catch (participantError) {
          console.warn('Failed to load participants:', participantError);
          // 빈 참여자 목록으로 설정
          setParticipants([]);
        }
        
        // 4. 채팅 히스토리 로드 시도 (실패해도 계속 진행)
        try {
          setMessagesLoading(true);
          console.log(`[ChatRoom] Loading chat history for room ID: ${roomId}`);
          const messageData = await getChatMessages(parseInt(roomId));
          console.log(`[ChatRoom] Raw message data received:`, messageData);
          
          // 메시지를 시간순으로 정렬 (오래된 것부터)
          const sortedMessages = messageData.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.sentAtEpochMs || 0);
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.sentAtEpochMs || 0);
            return timeA - timeB;
          });
          console.log(`[ChatRoom] Sorted messages:`, sortedMessages);
          setMessages(sortedMessages);
          console.log('Successfully loaded chat history:', sortedMessages.length, 'messages');
        } catch (historyError) {
          console.error('Failed to load chat history:', historyError);
          console.error('Error details:', historyError);
          // API 실패 시에도 기존 메시지 유지 (빈 배열로 초기화하지 않음)
          console.log('Keeping existing messages due to API failure');
        } finally {
          setMessagesLoading(false);
        }
        
      } catch (error) {
        console.error('Unexpected error during room initialization:', error);
        // 예상치 못한 오류 시에도 기존 메시지 유지
        console.log('Keeping existing messages due to unexpected error');
      } finally {
        setLoading(false);
      }
    };

    initializeRoom();

    let unsubscribe: (() => void) | null = null;

    (async () => {
      if (subscribedRef.current) return; // guard for StrictMode double mount
      subscribedRef.current = true;

      try {
        console.log('[ChatRoom] Attempting to connect to WebSocket...');
        await socketService.connect();
        console.log('[ChatRoom] WebSocket connected successfully');
        console.log('[ChatRoom] Socket connection status:', socketService.connected);
        console.log('[ChatRoom] Current room type:', roomType);
        
        // 채팅방 타입에 따라 구독 경로 결정
        const subscriptionPath = roomType === 'ONE_TO_ONE' 
          ? `/topic/messages/${roomId}` 
          : `/topic/rooms/${roomId}`;
        console.log('Subscribing to:', subscriptionPath, 'for room type:', roomType);
        
        const subscriptions: any[] = [];
        console.log('Subscribing to topic:', subscriptionPath);
        const sub = await socketService.subscribe(subscriptionPath, (message) => {
          console.log(`[CHAT] Message received on topic ${subscriptionPath}:`, message);
          console.log('[CHAT] Message body:', message.body);
          console.log('[CHAT] Message headers:', message.headers);
          console.log('[CHAT] Room type:', roomType);
          console.log('[CHAT] Room ID:', roomId);
          
          try {
            const raw = JSON.parse(message.body);
            console.log('[CHAT] Parsed message:', raw);
            const newMessage: ChatMessage = {
              id: raw.id ?? Math.floor(Math.random() * 1e9),
              content: raw.content ?? '',
              createdAt: raw.createdAt ?? new Date().toISOString(),
              sender: raw.sender ?? { id: 0, username: 'Unknown', fullName: 'Unknown' },
              messageType: raw.messageType ?? 'TEXT',
            };
            console.log('[CHAT] Creating new message:', newMessage);
            
            // 강력한 중복 메시지 방지
            setMessages((prev) => {
              console.log('[CHAT] Previous messages:', prev);
              
              // 1. 이미 처리된 메시지 ID인지 확인
              if (processedMessageIds.current.has(newMessage.id)) {
                console.log('[CHAT] Message ID already processed, skipping:', newMessage.id);
                return prev;
              }
              
              // 2. 기존 메시지 중에 같은 ID가 있는지 확인
              const existingMessage = prev.find(msg => msg.id === newMessage.id);
              if (existingMessage) {
                console.log('[CHAT] Message with same ID already exists, skipping:', newMessage.id);
                return prev;
              }
              
              // 3. 같은 내용+시간+발신자 조합이 있는지 확인 (내가 보낸 메시지 중복 방지)
              const isDuplicate = prev.some(msg => 
                msg.content === newMessage.content && 
                Math.abs(new Date(msg.createdAt).getTime() - new Date(newMessage.createdAt).getTime()) < 5000 && // 5초 이내
                msg.sender?.username === newMessage.sender?.username
              );
              
              if (isDuplicate) {
                console.log('[CHAT] Duplicate content detected (likely my own message), skipping');
                return prev;
              }
              
              // 메시지 ID를 처리된 목록에 추가
              processedMessageIds.current.add(newMessage.id);
              
              const updated = [...prev, newMessage];
              console.log('[CHAT] Message added successfully:', newMessage.id);
              return updated;
            });
          } catch (e) {
            console.error('Failed to parse message', e);
            console.error('Raw message body:', message.body);
          }
        });
        subscriptions.push(sub);
        
        unsubscribe = () => {
          subscriptions.forEach(sub => sub.unsubscribe());
        };
        console.log('WebSocket subscription established successfully');
      } catch (socketError) {
        console.error('Failed to establish WebSocket connection:', socketError);
        console.error('Socket error details:', socketError);
        // WebSocket 연결 실패해도 채팅 UI는 계속 작동
        console.warn('Continuing without WebSocket - messages will not be received in real-time');
      }
    })();

    return () => {
      if (unsubscribe) unsubscribe();
      subscribedRef.current = false;
      processedMessageIds.current.clear(); // 처리된 메시지 ID 목록 초기화
      setMessagesLoading(true); // 메시지 로딩 상태 초기화
      socketService.disconnect();
      // Note: 자동으로 leave API를 호출하지 않음
      // 사용자가 명시적으로 "Leave Room" 버튼을 클릭할 때만 호출
    };
  }, [roomId]);

  // roomType이 변경될 때 WebSocket 구독 업데이트
  useEffect(() => {
    if (!roomId || !socketService.connected) return;

    const updateSubscription = async () => {
      try {
        // 기존 구독 해제
        if (subscribedRef.current) {
          socketService.disconnect();
          subscribedRef.current = false;
        }

        // 새로운 구독 설정
        await socketService.connect();
        const subscriptionPath = roomType === 'ONE_TO_ONE' 
          ? `/topic/messages/${roomId}` 
          : `/topic/rooms/${roomId}`;
        
        console.log('Updating subscription to:', subscriptionPath, 'for room type:', roomType);
        
        await socketService.subscribe(subscriptionPath, (message) => {
          console.log(`[CHAT] Message received on topic ${subscriptionPath}:`, message);
          
          try {
            const raw = JSON.parse(message.body);
            const newMessage: ChatMessage = {
              id: raw.id ?? Math.floor(Math.random() * 1e9),
              content: raw.content ?? '',
              createdAt: raw.createdAt ?? new Date().toISOString(),
              sender: raw.sender ?? { id: 0, username: 'Unknown', fullName: 'Unknown' },
              messageType: raw.messageType ?? 'TEXT',
            };
            
            setMessages((prev) => {
              if (processedMessageIds.current.has(newMessage.id)) {
                return prev;
              }
              
              const existingMessage = prev.find(msg => msg.id === newMessage.id);
              if (existingMessage) {
                return prev;
              }
              
              const isDuplicate = prev.some(msg => 
                msg.content === newMessage.content && 
                msg.createdAt === newMessage.createdAt && 
                msg.sender?.username === newMessage.sender?.username
              );
              
              if (isDuplicate) {
                return prev;
              }
              
              processedMessageIds.current.add(newMessage.id);
              return [...prev, newMessage];
            });
          } catch (e) {
            console.error('Failed to parse message', e);
          }
        });
        
        subscribedRef.current = true;
        console.log('WebSocket subscription updated successfully');
      } catch (error) {
        console.error('Failed to update WebSocket subscription:', error);
      }
    };

    updateSubscription();
  }, [roomType, roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string, messageType: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT') => {
    if (!roomId) {
      console.error('Room ID is missing');
      return;
    }

    // 메시지 타입에 따른 형식
    const messageToSend: any = { 
      content, 
      roomId: parseInt(roomId),
      timestamp: new Date().toISOString(),
      sender: user?.username || 'unknown',
      type: messageType
    };
    
    // 1:1 채팅인 경우 상대방 이메일 추가
    if (roomType === 'ONE_TO_ONE' && participants.length >= 2) {
      const receiver = participants.find(p => p.id !== user?.id);
      if (receiver && receiver.email) {
        messageToSend.receiverId = receiver.email;
        console.log('[ChatRoom] 1:1 chat - adding receiverId (email):', receiver.email);
      } else {
        console.warn('[ChatRoom] 1:1 chat - receiver email not found');
      }
    }
    
    const endpoint = `/app/chat/rooms/${roomId}`;
    
    console.log('[ChatRoom] Sending message:', messageToSend);
    console.log('[ChatRoom] Socket connected:', socketService.connected);
    console.log('[ChatRoom] Publishing to:', endpoint, 'for room type:', roomType);
    console.log('[ChatRoom] Current user:', user);
    console.log('[ChatRoom] Room ID:', roomId);
    console.log('[ChatRoom] Participants:', participants);
    console.log('[ChatRoom] Room type:', roomType);
    
    // 메시지 전송 전에 즉시 로컬에 추가 (실시간 렌더링을 위해)
    const tempMessage: ChatMessage = {
      id: Math.floor(Math.random() * 1e9),
      content,
      createdAt: new Date().toISOString(),
      sender: { id: user?.id || 0, username: user?.username || 'You', fullName: user?.fullName || 'You' },
      messageType: messageType,
    };
    
    // 즉시 UI에 메시지 추가
    setMessages(prev => [...prev, tempMessage]);
    console.log('✅ Message added to UI immediately');
    
    try {
      await socketService.publish(endpoint, messageToSend);
      console.log('✅ Message sent successfully to server');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      // WebSocket 실패 시 메시지는 이미 UI에 추가되어 있음
    }
  };

  const handleExitChat = () => {
    // 단순히 채팅 화면만 나가기 (방에서 완전히 나가지 않음)
    window.location.href = '/';
  };

  const handleLeaveRoom = async () => {
    if (!roomId) return;
    
    const confirmLeave = window.confirm('정말로 이 채팅방에서 나가시겠습니까? 나가면 다시 들어올 수 없습니다.');
    if (!confirmLeave) return;
    
    try {
      setLoading(true);
      await leaveChatRoom(parseInt(roomId));
      // Leave 성공 후 홈페이지로 이동
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to leave room:', error);
      alert('방 나가기에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column" style={{ height: '100vh' }}>
      <Header />

      {/* Main Content */}
      <div className="d-flex flex-grow-1">
        {/* Left Panel - Participants Sidebar (Fixed) */}
        <div className="bg-light border-end d-flex flex-column" style={{ position: 'fixed', width: '280px', height: 'calc(100vh - 80px)', left: 0, top: '80px', zIndex: 1000 }}>
          {/* Sidebar Header */}
          <div className="p-3 border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-people me-2"></i>
                참여자
              </h5>
              <Button 
                variant="link" 
                size="sm" 
                className="p-1 text-primary"
                onClick={() => window.location.href = '/'}
                title="채팅방 목록으로 돌아가기"
              >
                <i className="bi bi-arrow-left"></i>
              </Button>
            </div>
            <div className="mt-2">
              <small className="text-muted">
                {roomType === 'ONE_TO_ONE' ? '1:1 채팅' : '그룹 채팅'} • {participants.length}명 참여중
              </small>
            </div>
          </div>

          {/* Participants List */}
          <div className="flex-grow-1 p-3">
            <ParticipantList
              participants={participants}
              currentUserId={user?.id}
              roomType={roomType}
              onParticipantClick={(participant) => {
                console.log('Participant clicked:', participant);
                // TODO: 참여자 프로필 모달 또는 상세 정보 표시
              }}
            />
          </div>

          {/* Back to Home Button */}
          <div className="p-3 border-top">
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="w-100"
              onClick={() => window.location.href = '/'}
            >
              <i className="bi bi-arrow-left me-2"></i>
              채팅방 목록으로 돌아가기
            </Button>
          </div>
        </div>

        {/* Right Panel - Chat Room */}
        <div className="d-flex flex-column" style={{ marginLeft: '280px', width: 'calc(100vw - 280px)', height: 'calc(100vh - 80px)' }}>
        {/* Chat Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
          <div className="d-flex align-items-center">
            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" 
                 style={{ width: '40px', height: '40px', fontSize: '16px' }}>
              {roomType === 'ONE_TO_ONE' ? 
                (participants.length >= 2 ? 
                  (participants.find(p => p.id !== user?.id)?.nickname || 
                   participants.find(p => p.id !== user?.id)?.username || '?').charAt(0).toUpperCase() : '1') :
                (roomName || `Room #${roomId}`).charAt(0).toUpperCase()}
            </div>
            <div>
              <h5 className="mb-0">
                {roomType === 'ONE_TO_ONE' ? 
                  (participants.length >= 2 ? 
                    participants.find(p => p.id !== user?.id)?.nickname || 
                    participants.find(p => p.id !== user?.id)?.username || 
                    '1:1 채팅' : '1:1 채팅') : 
                  (roomName || `Room #${roomId}`)}
              </h5>
              <small className="text-muted">
                {participants.length}명 참여중
                {roomType === 'ONE_TO_ONE' && ' (1:1 채팅)'}
              </small>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <Button variant="link" size="sm" className="p-1 me-2">
              <i className="bi bi-search"></i>
            </Button>
            <Button variant="link" size="sm" className="p-1 me-2">
              <i className="bi bi-three-dots-vertical"></i>
            </Button>
            <Button 
              variant="outline-danger" 
              size="sm" 
              className="me-2"
              onClick={handleLeaveRoom}
              disabled={loading}
              title="채팅방에서 완전히 나가기"
            >
              <i className="bi bi-trash"></i>
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={handleExitChat}
            >
              나가기
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-grow-1 overflow-auto p-3 bg-light">
          {messagesLoading ? (
            <div className="text-center text-muted p-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>이전 채팅 기록을 불러오는 중...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted p-5">
              <i className="bi bi-chat-dots mb-3" style={{ fontSize: '3rem' }}></i>
              <p>아직 메시지가 없습니다. 대화를 시작해보세요!</p>
            </div>
          ) : (
            <div>
              {messages
                .filter((msg) => {
                  const isValid = msg && msg.content;
                  if (!isValid) {
                    console.log(`[ChatRoom] Filtered out invalid message:`, msg);
                  }
                  return isValid;
                }) // 유효한 메시지만 필터링 (sender 필드가 없을 수 있으므로 제거)
                .map((msg) => {
                  console.log(`[ChatRoom] Rendering message:`, msg);
                  
                  // 서버 데이터를 프론트엔드 형식으로 변환
                  const transformedMessage: ChatMessage = {
                    id: msg.id || Math.floor(Math.random() * 1e9),
                    content: msg.content,
                    sender: msg.sender || { 
                      id: 0, 
                      username: 'Unknown', 
                      fullName: 'Unknown User' 
                    },
                    messageType: msg.messageType || 'TEXT',
                    createdAt: msg.createdAt || new Date(msg.sentAtEpochMs || Date.now()).toISOString()
                  };
                  
                  return (
                    <MessageBubble
                      key={transformedMessage.id}
                      message={transformedMessage}
                      isCurrentUser={transformedMessage.sender?.id === user?.id}
                    />
                  );
                })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-3 bg-white border-top">
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoomPage;
