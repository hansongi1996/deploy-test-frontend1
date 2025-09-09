import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatRoomPage from './pages/ChatRoomPage';
import AssignmentPage from './pages/AssignmentPage';
import NoticePage from './pages/NoticePage';
import LoginPage from './pages/LoginPage';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
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
  const { user, logout, isAuthenticated } = useAuth();

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
          </Nav>
          <Nav>
            <Navbar.Text className="me-3">
              안녕하세요, {user?.fullName}님 ({user?.role})
            </Navbar.Text>
            <Button variant="outline-light" size="sm" onClick={logout}>
              로그아웃
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

function App() {
  return (
    <AuthProvider>
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
              <Route path="/login" element={<LoginPage />} />
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
    </AuthProvider>
  );
}

export default App;