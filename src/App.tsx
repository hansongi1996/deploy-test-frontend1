import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatRoomPage from './pages/ChatRoomPage';
import AssignmentPage from './pages/AssignmentPage';
import NoticePage from './pages/NoticePage';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import FindPassword from './components/auth/FindPassword';
import Mainpage from './components/auth/Mainpage';
import RegisterSuccess from './components/auth/RegisterSuccess';
import AdminHome from './components/admin/AdminHome';
import SignupApprove from './components/admin/SignupApprove';
import MemberManage from './components/admin/MemberManage';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './store';
import { logout, initializeAuth } from './store/slices/authSlice';
import { useEffect, useRef } from 'react';

// Protected Route Component (Redux)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Navigation Component
const Navigation: React.FC = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!isAuthenticated) return null;

  return (
    <Navbar bg="dark" variant="dark" expand="lg" style={{ width: '100%' }}>
      <Container>
        <Navbar.Brand href="/">PeerFlow</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">홈</Nav.Link>
            <Nav.Link href="/assignments">과제</Nav.Link>
            <Nav.Link href="/notices">공지사항</Nav.Link>
            {(user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') && (
              <Nav.Link href="/admin">관리자</Nav.Link>
            )}
          </Nav>
          <Nav>
            <Navbar.Text className="me-3">
              안녕하세요, {user?.fullName || user?.username}님 ({user?.role})
            </Navbar.Text>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              로그아웃
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  ); 
};

// 메인 App 컴포넌트
function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const hasInitialized = useRef(false);

  // 앱 초기화 시 localStorage에서 인증 정보 복원 (한 번만 실행)
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeAuthState = async () => {
      const authToken = localStorage.getItem('authToken');
      
      if (authToken) {
        try {
          // 토큰이 있으면 사용자 정보를 다시 가져와서 Redux에 저장
          const response = await fetch('http://localhost:3001/api/auth/me', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          });
          
          if (response.ok) {
            const userInfoData = await response.json();
            dispatch(initializeAuth({
              id: userInfoData.id,
              username: userInfoData.username,
              fullName: userInfoData.fullName || userInfoData.username,
              email: userInfoData.email,
              role: userInfoData.role,
              token: authToken
            }));
          } else {
            // 토큰이 유효하지 않으면 제거
            localStorage.removeItem('authToken');
            dispatch(initializeAuth(null));
          }
        } catch (error) {
          console.error('인증 정보 복원 실패:', error);
          localStorage.removeItem('authToken');
          dispatch(initializeAuth(null));
        }
      } else {
        dispatch(initializeAuth(null));
      }
    };

    initializeAuthState();
  }, [dispatch]); // 의존성 배열에서 isAuthenticated 제거

  return (
    <Router>
      <div style={{ 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <Navigation />
        
        <Container className="mt-4" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          maxWidth: '1200px'
        }}>
          <Routes>
            {/* 인증 관련 라우트 */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/findPassword" element={<FindPassword />} />
            <Route path="/register-success" element={<RegisterSuccess />} />
            
            {/* 관리자 메인 페이지 */}
            <Route path="/adminmain" element={
              <ProtectedRoute>
                <Mainpage />
              </ProtectedRoute>
            } />
            
            {/* 관리자 기능 */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminHome />
              </ProtectedRoute>
            } />
            <Route path="/approve" element={
              <ProtectedRoute>
                <SignupApprove />
              </ProtectedRoute>
            } />
            <Route path="/member" element={
              <ProtectedRoute>
                <MemberManage />
              </ProtectedRoute>
            } />
            
            {/* 일반 사용자 페이지 */}
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/rooms/:roomId" element={
              <ProtectedRoute>
                <ChatRoomPage />
              </ProtectedRoute>
            } />
            <Route path="/assignments" element={
              <ProtectedRoute>
                <AssignmentPage />
              </ProtectedRoute>
            } />
            <Route path="/notices" element={
              <ProtectedRoute>
                <NoticePage />
              </ProtectedRoute>
            } />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;