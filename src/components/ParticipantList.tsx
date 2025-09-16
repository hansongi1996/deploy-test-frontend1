import React from 'react';
import { Button } from 'react-bootstrap';
import type { ChatRoomParticipant } from '../types';

interface ParticipantListProps {
  participants: ChatRoomParticipant[];
  currentUserId?: number;
  roomType: 'ONE_TO_ONE' | 'GROUP';
  onParticipantClick?: (participant: ChatRoomParticipant) => void;
}

const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  currentUserId,
  roomType,
  onParticipantClick
}) => {
  const getParticipantDisplayName = (participant: ChatRoomParticipant) => {
    return participant.nickname || participant.username;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-danger';
      case 'TEACHER':
        return 'bg-primary';
      case 'STUDENT':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '관리자';
      case 'TEACHER':
        return '강사';
      case 'STUDENT':
        return '학생';
      default:
        return role;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <i className="bi bi-circle-fill text-success" style={{ fontSize: '8px' }}></i>;
      case 'PENDING':
        return <i className="bi bi-clock text-warning" style={{ fontSize: '8px' }}></i>;
      case 'LEFT':
        return <i className="bi bi-circle text-muted" style={{ fontSize: '8px' }}></i>;
      default:
        return <i className="bi bi-circle text-muted" style={{ fontSize: '8px' }}></i>;
    }
  };

  if (participants.length === 0) {
    return (
      <div className="text-center text-muted p-3">
        <i className="bi bi-people mb-2" style={{ fontSize: '1.5rem' }}></i>
        <p className="mb-0 small">참여자가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="participant-list">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">
          <i className="bi bi-people me-2"></i>
          참여자 ({participants.length}명)
        </h6>
      </div>
      
      <div className="participants-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {participants.map((participant) => {
          const isCurrentUser = participant.id === currentUserId;
          const displayName = getParticipantDisplayName(participant);
          
          return (
            <div
              key={participant.id}
              className={`d-flex align-items-center p-2 mb-2 rounded hover-bg-light ${
                isCurrentUser ? 'bg-primary bg-opacity-10' : ''
              }`}
              style={{ 
                cursor: onParticipantClick ? 'pointer' : 'default',
                transition: 'background-color 0.2s ease'
              }}
              onClick={() => onParticipantClick?.(participant)}
              title={isCurrentUser ? '나' : displayName}
            >
              {/* 프로필 아바타 */}
              <div className="position-relative me-3">
                <div 
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                  style={{ width: '32px', height: '32px', fontSize: '12px' }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
                {/* 온라인 상태 표시 */}
                <div className="position-absolute" style={{ bottom: '-2px', right: '-2px' }}>
                  {getStatusIcon(participant.status)}
                </div>
              </div>

              {/* 사용자 정보 */}
              <div className="flex-grow-1 min-width-0">
                <div className="d-flex align-items-center">
                  <span className={`fw-medium ${isCurrentUser ? 'text-primary' : ''}`}>
                    {displayName}
                    {isCurrentUser && ' (나)'}
                  </span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <span className={`badge ${getRoleBadgeColor(participant.role)} text-white`} 
                        style={{ fontSize: '10px' }}>
                    {getRoleDisplayName(participant.role)}
                  </span>
                  {participant.email && (
                    <small className="text-muted text-truncate" style={{ fontSize: '10px' }}>
                      {participant.email}
                    </small>
                  )}
                </div>
              </div>

              {/* 1:1 채팅에서 상대방에게 메시지 보내기 버튼 */}
              {roomType === 'ONE_TO_ONE' && !isCurrentUser && onParticipantClick && (
                <Button
                  variant="link"
                  size="sm"
                  className="p-1 text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onParticipantClick(participant);
                  }}
                  title="프로필 보기"
                >
                  <i className="bi bi-person-lines-fill"></i>
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParticipantList;
