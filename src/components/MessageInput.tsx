import React, { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';

interface MessageInputProps {
  onSendMessage: (message: string, messageType?: 'TEXT' | 'IMAGE' | 'FILE') => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message, 'TEXT');
      setMessage('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일명을 메시지로 전송
      onSendMessage(file.name, 'FILE');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // 이미지 파일명을 메시지로 전송
      onSendMessage(file.name, 'IMAGE');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <InputGroup>
      <Button 
        variant="link" 
        className="p-2 text-muted"
        onClick={() => fileInputRef.current?.click()}
        title="파일 업로드"
      >
        <i className="bi bi-paperclip" style={{ fontSize: '1.2rem' }}></i>
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        accept="*/*"
      />
      <Form.Control
        type="text"
        placeholder="메시지를 입력하세요"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="border-0"
        style={{ 
          borderRadius: '20px',
          backgroundColor: '#f8f9fa'
        }}
      />
      <div className="d-flex align-items-center px-2">
        <Button 
          variant="link" 
          className="p-1 text-muted me-1"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = handleImageUpload;
            input.click();
          }}
          title="이미지 업로드"
        >
          <i className="bi bi-image" style={{ fontSize: '1.2rem' }}></i>
        </Button>
        <Button variant="link" className="p-1 text-muted me-1">
          <i className="bi bi-emoji-smile" style={{ fontSize: '1.2rem' }}></i>
        </Button>
        <Button 
          variant="primary" 
          className="rounded-circle p-2"
          onClick={handleSend}
          disabled={!message.trim()}
          style={{ width: '40px', height: '40px' }}
        >
          <i className="bi bi-send" style={{ fontSize: '0.9rem' }}></i>
        </Button>
      </div>
    </InputGroup>
  );
};

export default MessageInput;
