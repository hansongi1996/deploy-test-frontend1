import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import type { ChatMessage, ChatRoomParticipant } from '../types';
import { joinChatRoom, leaveChatRoom, getRoomParticipants, getChatMessages } from '../api';
import socketService from '../services/socketService';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import Header from '../components/Header';

const ChatRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ChatRoomParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscribedRef = useRef(false);
  
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
          await joinChatRoom(parseInt(roomId));
          console.log('Successfully joined room');
        } catch (joinError) {
          console.warn('Failed to join room via API, but continuing with WebSocket connection:', joinError);
        }
        
        // 2. 참여자 목록 로드 시도 (실패해도 계속 진행)
        try {
          const participantData = await getRoomParticipants(parseInt(roomId));
          setParticipants(participantData);
          console.log('Successfully loaded participants');
        } catch (participantError) {
          console.warn('Failed to load participants:', participantError);
          // 빈 참여자 목록으로 설정
          setParticipants([]);
        }
        
        // 3. 채팅 히스토리 로드 시도 (실패해도 계속 진행)
        try {
          const messageData = await getChatMessages(parseInt(roomId));
          setMessages(messageData);
          console.log('Successfully loaded chat history');
        } catch (historyError) {
          console.warn('Failed to load chat history:', historyError);
          // 플레이스홀더 메시지로 설정
          const placeholderMessages: ChatMessage[] = [
            {
              id: 1,
              content: 'Welcome to the chat! (History unavailable)',
              createdAt: new Date().toISOString(),
              sender: { id: 0, username: 'System', fullName: 'System' },
              messageType: 'TEXT',
            },
          ];
          setMessages(placeholderMessages);
        }
        
      } catch (error) {
        console.error('Unexpected error during room initialization:', error);
        // 최소한의 플레이스홀더 메시지 설정
        const placeholderMessages: ChatMessage[] = [
          {
            id: 1,
            content: 'Welcome to the chat!',
            createdAt: new Date().toISOString(),
            sender: { id: 0, username: 'System', fullName: 'System' },
            messageType: 'TEXT',
          },
        ];
        setMessages(placeholderMessages);
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
        console.log('Attempting to connect to WebSocket...');
        await socketService.connect();
        console.log('WebSocket connected successfully');
        console.log('Socket connection status:', socketService.connected);
        
        console.log('Subscribing to:', `/topic/chat/rooms/${roomId}`);
        
        // 기본 토픽만 구독 (서버 에러 방지)
        const primaryTopic = `/topic/chat/rooms/${roomId}`;
        
        const subscriptions: any[] = [];
        console.log('Subscribing to topic:', primaryTopic);
        const sub = await socketService.subscribe(primaryTopic, (message) => {
          console.log(`[CHAT] Message received on topic ${primaryTopic}:`, message);
          console.log('[CHAT] Message body:', message.body);
          console.log('[CHAT] Message headers:', message.headers);
          
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
            setMessages((prev) => {
              console.log('[CHAT] Previous messages:', prev);
              const updated = [...prev, newMessage];
              console.log('[CHAT] Updated messages:', updated);
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
      socketService.disconnect();
      // Note: 자동으로 leave API를 호출하지 않음
      // 사용자가 명시적으로 "Leave Room" 버튼을 클릭할 때만 호출
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!roomId) {
      console.error('Room ID is missing');
      return;
    }

    // 기본 메시지 형식
    const messageToSend = { 
      content, 
      roomId: parseInt(roomId),
      timestamp: new Date().toISOString(),
      sender: user?.username || 'unknown'
    };
    
    const endpoint = `/app/chat/rooms/${roomId}`;
    
    console.log('Sending message:', messageToSend);
    console.log('Socket connected:', socketService.connected);
    console.log('Publishing to:', endpoint);
    
    try {
      await socketService.publish(endpoint, messageToSend);
      console.log('✅ Message sent successfully to server');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      // WebSocket 실패 시 로컬에 메시지 추가 (임시)
      const tempMessage: ChatMessage = {
        id: Math.floor(Math.random() * 1e9),
        content,
        createdAt: new Date().toISOString(),
        sender: { id: user?.id || 0, username: user?.username || 'You', fullName: user?.fullName || 'You' },
        messageType: 'TEXT',
      };
      setMessages(prev => [...prev, tempMessage]);
    }
  };

  const handleLeaveRoom = async () => {
    if (!roomId) return;
    
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
        {/* Left Panel - Chat List (Same as HomePage) */}
        <div className="bg-light border-end d-flex flex-column" style={{ width: '280px', minWidth: '280px', height: 'calc(100vh - 80px)' }}>
          {/* Chat Header */}
          <div className="p-3 border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">채팅</h5>
              <Button 
                variant="link" 
                size="sm" 
                className="p-1 text-primary"
                onClick={() => window.location.href = '/'}
              >
                <i className="bi bi-search"></i>
              </Button>
            </div>
          </div>


        {/* Back to Home Button */}
        <div className="p-3 mt-auto">
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
        <div className="flex-grow-1 d-flex flex-column">
        {/* Chat Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
          <div className="d-flex align-items-center">
            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" 
                 style={{ width: '40px', height: '40px', fontSize: '16px' }}>
              {roomId?.charAt(0) || 'R'}
            </div>
            <div>
              <h5 className="mb-0">Room #{roomId}</h5>
              <small className="text-muted">
                {participants.length}명 참여중
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
              variant="outline-secondary" 
              size="sm" 
              disabled={loading}
              onClick={handleLeaveRoom}
            >
              {loading ? '나가는 중...' : '나가기'}
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-grow-1 overflow-auto p-3 bg-light">
          {messages.length === 0 ? (
            <div className="text-center text-muted p-5">
              <i className="bi bi-chat-dots mb-3" style={{ fontSize: '3rem' }}></i>
              <p>아직 메시지가 없습니다. 대화를 시작해보세요!</p>
            </div>
          ) : (
            <div>
              {messages
                .filter((msg) => msg && msg.sender && msg.content) // 유효한 메시지만 필터링
                .map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isCurrentUser={msg.sender?.username === user?.username}
                  />
                ))}
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
