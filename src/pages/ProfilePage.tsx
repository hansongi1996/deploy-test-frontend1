import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import Header from '../components/Header';

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="d-flex flex-column" style={{ height: '100vh' }}>
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
                  {/* 프로필 사진 */}
                  <div 
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: '80px', height: '80px', fontSize: '32px' }}
                  >
                    {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </div>
                  
                  {/* 사용자 정보 */}
                  <h5>{user?.fullName || user?.username}</h5>
                  <p className="text-muted mb-0">{user?.email}</p>
                  <small className="text-muted">{user?.role}</small>
                </div>

                <div className="d-grid gap-2">
                  <Button variant="outline-primary" size="lg">
                    프로필 사진 변경
                  </Button>
                  <Button variant="outline-secondary" size="lg">
                    이름 변경
                  </Button>
                  <Button variant="outline-secondary" size="lg">
                    이메일 변경
                  </Button>
                  <Button variant="outline-secondary" size="lg">
                    비밀번호 변경
                  </Button>
                </div>

                <hr className="my-4" />
                
                <div className="d-grid">
                  <Button variant="outline-danger" size="lg">
                    계정 삭제
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProfilePage;
