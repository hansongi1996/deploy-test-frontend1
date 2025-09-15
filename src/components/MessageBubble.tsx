import React from 'react';
import type { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  // 디버깅을 위한 메시지 데이터 로그
  console.log('[MessageBubble] Rendering message:', {
    id: message.id,
    content: message.content,
    createdAt: message.createdAt,
    sentAtEpochMs: message.sentAtEpochMs,
    sender: message.sender
  });

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // 유효하지 않은 날짜인지 확인
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return '시간 정보 없음';
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      // 1분 이내
      if (diffMinutes < 1) {
        return '방금 전';
      }
      // 1시간 이내
      else if (diffMinutes < 60) {
        return `${diffMinutes}분 전`;
      }
      // 24시간 이내
      else if (diffHours < 24) {
        return `${diffHours}시간 전`;
      }
      // 7일 이내
      else if (diffDays < 7) {
        return `${diffDays}일 전`;
      }
      // 그 외에는 정확한 시간 표시
      else {
        return date.toLocaleTimeString('ko-KR', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      }
    } catch (error) {
      console.error('Error formatting time:', error, 'Input:', dateString);
      return '시간 정보 없음';
    }
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
