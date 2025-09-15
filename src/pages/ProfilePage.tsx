import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import Header from '../components/Header';
import AvatarUploader from '../components/profile/AvatarUploader';

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id ?? 0; // 로그인 연동 전이라면 임시값 0, 실제론 반드시 유저 id 사용

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
