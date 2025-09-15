import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { IoNotificationsOutline } from 'react-icons/io5';
import AlarmPage from '../pages/AlarmPage';


const Header: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  // 오프캔버스 상태 관리
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="bg-white border-bottom">
      <div className="d-flex justify-content-between align-items-center p-3">
        <div className="d-flex align-items-center ">
          <h4 className="mb-0 text-dark">PeerFlow</h4>
        </div>
        <div className="d-flex align-items-center gap-3">
          {/* 종모양 알림 아이콘 - Role이 'STUDENT'일 때만 표시 */}
          {user?.role === 'STUDENT' && (
            <div
              className="d-flex align-items-center gap-2 cursor-pointer"
              onClick={handleShow}
            >
              <IoNotificationsOutline size={24} />
            </div>
          )}
          
          {/* 프로필 영역 - 클릭 가능 */}
          <div
            className="d-flex align-items-center gap-2 cursor-pointer"
            onClick={handleProfileClick}
            style={{ cursor: 'pointer' }}
          >
            {/* 프로필 사진 */}
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px', fontSize: '14px' }}
            >
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            {/* 사용자 이름 */}
            <span className="text-dark small fw-medium">
              {user?.fullName || user?.username}
            </span>
          </div>

          <Button variant="outline-secondary" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </div>
      {/* 오프캔버스 컴포넌트 */}
      <div
        className={`offcanvas offcanvas-end ${show ? 'show' : ''}`}
        tabIndex={-1}
        id="offcanvasRight"
        aria-labelledby="offcanvasRightLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasRightLabel">알림</h5>
          <button
            type="button"
            className="btn-close"
            onClick={handleClose}
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <AlarmPage />
        </div>
      </div>
      {/* 배경 오버레이 */}
      {show && <div className="offcanvas-backdrop fade show" onClick={handleClose}></div>}
    </div>
  );
};

export default Header;