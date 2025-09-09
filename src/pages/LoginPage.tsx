import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('사용자명과 비밀번호를 입력해주세요.');
      return;
    }

    const success = await login({ username, password });
    
    if (success) {
      navigate('/');
    } else {
      setError('로그인에 실패했습니다. 사용자명과 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div className="login-page" style={{ 
      minHeight: '100vh', 
      background: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        display: 'flex',
        width: '90%',
        maxWidth: '1500px',
        height: '700px',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Left Side - Blue Background */}
        <div style={{
          flex: 1,
          background: '#4A90E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px'
        }}>
          <div style={{
            color: 'white',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '64px',
              fontWeight: 'bold',
              margin: '0',
              lineHeight: '1.1',
              letterSpacing: '3px'
            }}>
              P<br/>e<br/>e<br/>r<br/>F<br/>l<br/>o<br/>w
            </h1>
          </div>
        </div>

        {/* Right Side - White Background with Form */}
        <div style={{
          flex: 1,
          padding: '80px 60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              학습관리시스템
            </h2>
            <p style={{
              fontSize: '20px',
              color: '#666',
              textAlign: 'center',
              margin: '0'
            }}>
              사용자명
            </p>
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)} style={{
              marginBottom: '20px',
              borderRadius: '8px'
            }}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Control
                type="text"
                placeholder="사용자명을 입력하세요"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                style={{
                  height: '60px',
                  borderRadius: '10px',
                  border: '2px solid #e1e5e9',
                  fontSize: '18px',
                  padding: '0 20px'
                }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Control
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                style={{
                  height: '50px',
                  width: '300px',
                  borderRadius: '10px',
                  border: '2px solid #e1e5e9',
                  fontSize: '18px',
                  padding: '0 20px'
                }}
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
              disabled={isLoading}
              style={{
                height: '60px',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                backgroundColor: '#4A90E2',
                border: 'none'
              }}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </Form>

          <div style={{
            marginTop: '30px',
            textAlign: 'center'
          }}>
            <small style={{
              color: '#999',
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              테스트 계정:<br/>
              학생: student1 / password123<br/>
              강사: instructor1 / password123<br/>
              관리자: admin1 / password123
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
