import React from 'react';
import type { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className={`d-flex mb-3 ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}>
      <div className={`d-flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} align-items-end`} style={{ maxWidth: '70%' }}>
        {/* Avatar */}
        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
             style={{ width: '32px', height: '32px', fontSize: '12px', minWidth: '32px' }}>
          {message.sender.username.charAt(0).toUpperCase()}
        </div>
        
        {/* Message Content */}
        <div className={`mx-2 ${isCurrentUser ? 'text-end' : 'text-start'}`}>
          {!isCurrentUser && (
            <div className="text-muted small mb-1">
              {message.sender.fullName || message.sender.username}
            </div>
          )}
          <div 
            className={`rounded-3 px-3 py-2 ${
              isCurrentUser 
                ? 'bg-primary text-white' 
                : 'bg-white border'
            }`}
            style={{ 
              wordBreak: 'break-word',
              boxShadow: isCurrentUser ? 'none' : '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            <div className={isCurrentUser ? 'text-white' : 'text-dark'}>
              {message.content}
            </div>
          </div>
          <div className={`text-muted small mt-1 ${isCurrentUser ? 'text-end' : 'text-start'}`}>
            {formatTime(message.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
