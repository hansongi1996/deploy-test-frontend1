import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import type { ChatMessage, ChatRoomParticipant } from '../types';
import { trackRoomAccess, joinChatRoom, leaveChatRoom, getRoomParticipants } from '../api';
import socketService from '../services/socketService';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';

const ChatRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [username, setUsername] = useState('');
  const [participants, setParticipants] = useState<ChatRoomParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscribedRef = useRef(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) setUsername(storedUsername);

    const initializeRoom = async () => {
      if (!roomId) return;
      
      try {
        setLoading(true);
        // Join the room
        await joinChatRoom(parseInt(roomId));
        // Track room access
        await trackRoomAccess(parseInt(roomId), 'JOIN');
        // Load participants
        const participantData = await getRoomParticipants(parseInt(roomId));
        setParticipants(participantData);
      } catch (error) {
        console.error('Failed to join room:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeRoom();

    // Placeholder messages (replace with API call when ready)
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

    let unsubscribe: (() => void) | null = null;

    (async () => {
      if (subscribedRef.current) return; // guard for StrictMode double mount
      subscribedRef.current = true;

      await socketService.connect();
      const sub = await socketService.subscribe(`/topic/rooms/${roomId}`, (message) => {
        try {
          const raw = JSON.parse(message.body);
          console.log('[CHAT] received message:', raw);
          const newMessage: ChatMessage = {
            id: raw.id ?? Math.floor(Math.random() * 1e9),
            content: raw.content ?? '',
            createdAt: raw.createdAt ?? new Date().toISOString(),
            sender: raw.sender ?? { id: 0, username: 'Unknown', fullName: 'Unknown' },
            messageType: raw.messageType ?? 'TEXT',
          };
          setMessages((prev) => [...prev, newMessage]);
        } catch (e) {
          console.error('Failed to parse message', e);
        }
      });
      unsubscribe = () => sub.unsubscribe();
    })();

    return () => {
      if (unsubscribe) unsubscribe();
      subscribedRef.current = false;
      socketService.disconnect();
      // Leave room and track room leave when component unmounts
      if (roomId) {
        leaveChatRoom(parseInt(roomId)).catch(console.error);
        trackRoomAccess(parseInt(roomId), 'LEAVE').catch(console.error);
      }
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (content: string) => {
    const messageToSend = { 
      content, 
      roomId: roomId ? parseInt(roomId) : 0,
      timestamp: new Date().toISOString()
    };
    socketService.publish(`/app/rooms/${roomId}`, JSON.stringify(messageToSend));
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
          <Link to="/">
            <Button variant="secondary" size="sm" disabled={loading}>
              {loading ? 'Leaving...' : 'Leave Room'}
            </Button>
          </Link>
        </Card.Header>
        <Card.Body style={{ height: '60vh', overflowY: 'auto' }} className="d-flex flex-column">
          <div className="flex-grow-1">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isCurrentUser={msg.sender.username === username}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
          <MessageInput onSendMessage={handleSendMessage} />
        </Card.Body>
      </Card>
    </div>
  );
};

export default ChatRoomPage;
