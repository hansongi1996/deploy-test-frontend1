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
      <div className={`d-flex flex-column ${isCurrentUser ? 'align-items-end' : 'align-items-start'}`} style={{ maxWidth: '70%' }}>
        {/* Avatar and Name Row */}
        <div className={`d-flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} align-items-center mb-2`}>
          {/* Avatar */}
          <div className={`rounded-circle bg-primary text-white d-flex align-items-center justify-content-center ${isCurrentUser ? 'ms-2' : 'me-2'}`} 
               style={{ width: '32px', height: '32px', fontSize: '12px', minWidth: '32px' }}>
            {message.sender?.username?.charAt(0)?.toUpperCase() || '?'}
          </div>
          
          {/* Sender Name */}
          {!isCurrentUser && (
            <div className="text-muted small">
              {message.sender?.fullName || message.sender?.username || 'Unknown User'}
            </div>
          )}
        </div>
        
        {/* Message Content */}
        <div className={`${isCurrentUser ? 'text-end' : 'text-start'}`}>
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
