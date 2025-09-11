import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import type { ChatMessage, ChatRoomParticipant } from '../types';
import { joinChatRoom, leaveChatRoom, getRoomParticipants, getChatMessages } from '../api';
import socketService from '../services/socketService';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

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
        
        // 여러 가능한 토픽을 구독해보기
        const topics = [
          `/topic/chat/rooms/${roomId}`,
          `/topic/rooms/${roomId}`,
          `/topic/chat/${roomId}`,
          `/topic/messages/${roomId}`,
          `/topic/room/${roomId}`
        ];
        
        const subscriptions = [];
        for (const topic of topics) {
          console.log('Subscribing to topic:', topic);
          const sub = await socketService.subscribe(topic, (message) => {
            console.log(`[CHAT] Message received on topic ${topic}:`, message);
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
        }
        
        unsubscribe = () => {
          subscriptions.forEach(sub => sub.unsubscribe());
        };
        console.log('WebSocket subscription established successfully');
      } catch (socketError) {
        console.error('Failed to establish WebSocket connection:', socketError);
        console.error('Socket error details:', socketError);
        // WebSocket 연결 실패해도 채팅 UI는 계속 작동
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

  const handleSendMessage = (content: string) => {
    // 여러 가능한 메시지 형식 시도
    const messageFormats = [
      // 형식 1: 현재 형식
      { 
        content, 
        roomId: roomId ? parseInt(roomId) : 0,
        timestamp: new Date().toISOString()
      },
      // 형식 2: 간단한 형식
      { 
        message: content,
        roomId: roomId ? parseInt(roomId) : 0
      },
      // 형식 3: 서버가 기대할 수 있는 형식
      { 
        text: content,
        roomId: roomId ? parseInt(roomId) : 0,
        sender: user?.username || 'unknown'
      },
      // 형식 4: 최소한의 형식
      { 
        content
      }
    ];
    
    const endpoints = [
      `/app/chat/rooms/${roomId}`,
      `/app/rooms/${roomId}`,
      `/app/chat/${roomId}`,
      `/app/messages/${roomId}`,
      `/app/room/${roomId}`
    ];
    
    console.log('Sending message:', messageFormats[0]);
    console.log('Socket connected:', socketService.connected);
    
    // 첫 번째 형식과 엔드포인트로 시도
    const messageToSend = messageFormats[0];
    const endpoint = endpoints[0];
    console.log('Publishing to:', endpoint);
    
    socketService.publish(endpoint, JSON.stringify(messageToSend));
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
    <div className="d-flex justify-content-center">
      <Card style={{ width: '100%', maxWidth: '800px' }}>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h4>Room #{roomId}</h4>
            <small className="text-muted">
              {participants.length} participants
            </small>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            disabled={loading}
            onClick={handleLeaveRoom}
          >
            {loading ? 'Leaving...' : 'Leave Room'}
          </Button>
        </Card.Header>
        <Card.Body style={{ height: '60vh', overflowY: 'auto' }} className="d-flex flex-column">
          <div className="flex-grow-1">
            {console.log('Rendering messages:', messages)}
            {messages.length === 0 ? (
              <div className="text-center text-muted p-3">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isCurrentUser={msg.sender.username === user?.username}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <MessageInput onSendMessage={handleSendMessage} />
        </Card.Body>
      </Card>
    </div>
  );
};

export default ChatRoomPage;
