import React, { useState } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import Header from '../components/Header';
import AvatarUploader from '../components/profile/AvatarUploader';
import ProfileEditModal from '../components/profile/ProfileEditModal';
import { deleteAccount } from '../api';
import { logout } from '../store/slices/authSlice';

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const userId = user?.id ?? 0; // 로그인 연동 전이라면 임시값 0, 실제론 반드시 유저 id 사용
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'name' | 'password'>('name');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = (type: 'name' | 'password') => {
    setModalType(type);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleDeleteAccount = async () => {
    const confirmMessage = '정말로 계정을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.';
    
    if (!confirm(confirmMessage)) {
      return;
    }

    const doubleConfirm = '한 번 더 확인합니다.\n계정 삭제를 진행하시겠습니까?';
    if (!confirm(doubleConfirm)) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAccount();
      
      // 계정 삭제 성공 시 로그아웃 처리
      dispatch(logout());
      
      // 성공 메시지 표시 후 로그인 페이지로 이동
      alert('계정이 성공적으로 삭제되었습니다.');
      window.location.href = '/login';
      
    } catch (error: any) {
      console.error('계정 삭제 실패:', error);
      alert(error.response?.data?.message || '계정 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="d-flex flex-column w-100"  style={{ height: '100vh' }}>
      <Header />
      
      <Container className="py-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <Card>
              <Card.Header>
                <h4 className="mb-0">프로필 설정</h4>
              </Card.Header>
              <Card.Body>
                <div className="text-center mb-4">
                  {/* 아바타 업로더 */}
                  <AvatarUploader
                    userId={userId}
                    initialUrl={(user as any)?.avatarUrl ?? null} // 서버에서 avatarUrl 가져오면 여기 넣기
                    onChanged={(url) => {
                      console.log('avatar changed:', url);
                      // TODO: 필요하면 여기서 사용자 정보 재조회(dispatch) 등으로 화면 반영
                    }}
                    className="d-flex flex-column align-items-center"
                  />
                  
                  {/* 사용자 정보 */}
                  <h5 className="mt-3">{user?.fullName || user?.username}</h5>
                  <p className="text-muted mb-0">{user?.email}</p>
                  <small className="text-muted">{user?.role}</small>
                </div>

                <div className="d-grid gap-2">
                  <Button 
                    variant="outline-secondary" 
                    size="lg"
                    onClick={() => handleEditClick('name')}
                  >
                    이름 변경
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    size="lg"
                    onClick={() => handleEditClick('password')}
                  >
                    비밀번호 변경
                  </Button>
                </div>

                <hr className="my-4" />
                
                <div className="d-grid">
                  <Button 
                    variant="outline-danger" 
                    size="lg"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? '삭제 중...' : '계정 삭제'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
      
      <ProfileEditModal
        show={showModal}
        onHide={handleModalClose}
        user={user}
        editType={modalType}
      />
    </div>
  );
};

export default ProfilePage;
