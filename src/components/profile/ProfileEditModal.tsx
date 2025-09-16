import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { updateUsername, changePassword } from '../../api';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../store/slices/authSlice';

interface ProfileEditModalProps {
  show: boolean;
  onHide: () => void;
  user: any;
  editType: 'name' | 'password';
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  show,
  onHide,
  user,
  editType
}) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: user?.fullName || user?.username || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editType === 'password') {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('새 비밀번호가 일치하지 않습니다.');
          return;
        }
        if (formData.newPassword.length < 6) {
          setError('비밀번호는 최소 6자 이상이어야 합니다.');
          return;
        }
        
        await changePassword({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        });
        setSuccess('비밀번호가 성공적으로 변경되었습니다.');
      } else {
        if (!formData.username.trim()) {
          setError('이름을 입력해주세요.');
          return;
        }

        const updatedUser = await updateUsername(formData.username.trim());
        dispatch(updateUser(updatedUser));
        
        setSuccess('이름이 성공적으로 변경되었습니다.');
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || '변경 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (editType) {
      case 'name': return '이름 변경';
      case 'password': return '비밀번호 변경';
      default: return '';
    }
  };

  const getPlaceholder = () => {
    switch (editType) {
      case 'name': return '새로운 이름을 입력하세요';
      case 'password': return '새로운 비밀번호를 입력하세요';
      default: return '';
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{getTitle()}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          {editType === 'name' && (
            <Form.Group className="mb-3">
              <Form.Label>이름</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder={getPlaceholder()}
                required
              />
            </Form.Group>
          )}


          {editType === 'password' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>현재 비밀번호</Form.Label>
                <Form.Control
                  type="password"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                  placeholder="현재 비밀번호를 입력하세요"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>새 비밀번호</Form.Label>
                <Form.Control
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="새 비밀번호를 입력하세요"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>새 비밀번호 확인</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  required
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            취소
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? '처리 중...' : '변경'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProfileEditModal;
