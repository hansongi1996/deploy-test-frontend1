import React from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const Header: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <div className="bg-white border-bottom">
      <div className="d-flex justify-content-between align-items-center p-3">
        <div className="d-flex align-items-center">
          <h4 className="mb-0 text-dark">PeerFlow</h4>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted small">
            안녕하세요, {user?.fullName || user?.username}님
          </span>
          <Button variant="outline-secondary" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;
