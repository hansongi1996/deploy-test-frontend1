import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatRoomPage from './pages/ChatRoomPage';
import { Container } from 'react-bootstrap';

function App() {
  return (
    <Router>
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rooms/:roomId" element={<ChatRoomPage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;