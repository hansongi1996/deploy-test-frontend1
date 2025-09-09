import React from 'react';
import { Card } from 'react-bootstrap';
import type { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  const alignment = isCurrentUser ? 'ms-auto' : 'me-auto';
  const variant = isCurrentUser ? 'primary' : 'secondary';

  return (
    <Card bg={variant.toLowerCase()} text="white" style={{ width: 'fit-content', minWidth: '100px' }} className={`mb-2 ${alignment}`}>
      <Card.Body className="p-2">
        {!isCurrentUser && (
          <Card.Subtitle className="text-white-50" style={{ fontSize: '0.8rem' }}>
            {message.sender.username}
          </Card.Subtitle>
        )}
        <Card.Text>{message.content}</Card.Text>
        <div className="text-end text-white-50" style={{ fontSize: '0.7rem' }}>
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>
      </Card.Body>
    </Card>
  );
};

export default MessageBubble;
