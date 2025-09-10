import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Modal, Form, Badge } from 'react-bootstrap';
import { getNotices, getNotice, createNotice, updateNotice, deleteNotice } from '../api';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { Notice } from '../types';

const NoticePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isImportant: false
  });

  // 권한 확인 함수들
  const isInstructorOrAdmin = () => {
    return user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const data = await getNotices();
      setNotices(data);
    } catch (err) {
      setError('공지사항을 불러오는데 실패했습니다.');
      console.error('Error loading notices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewNotice = async (noticeId: number) => {
    try {
      const notice = await getNotice(noticeId);
      setSelectedNotice(notice);
      setShowModal(true);
    } catch (err) {
      setError('공지사항을 불러오는데 실패했습니다.');
      console.error('Error loading notice:', err);
    }
  };

  const handleEditNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      isImportant: notice.isImportant
    });
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const handleCreateNotice = () => {
    setSelectedNotice(null);
    setFormData({
      title: '',
      content: '',
      isImportant: false
    });
    setIsEditing(false);
    setShowCreateModal(true);
  };

  const handleSaveNotice = async () => {
    try {
      setError(null);
      
      if (isEditing && selectedNotice) {
        await updateNotice(
          selectedNotice.id,
          formData.title,
          formData.content,
          formData.isImportant
        );
      } else {
        await createNotice(
          formData.title,
          formData.content,
          formData.isImportant
        );
      }
      
      setShowCreateModal(false);
      loadNotices();
    } catch (err) {
      setError('공지사항 저장에 실패했습니다.');
      console.error('Error saving notice:', err);
    }
  };

  const handleDeleteNotice = async (noticeId: number) => {
    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      try {
        await deleteNotice(noticeId);
        loadNotices();
      } catch (err) {
        setError('공지사항 삭제에 실패했습니다.');
        console.error('Error deleting notice:', err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" />
        <p className="mt-2">공지사항을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>공지사항</h2>
        {isInstructorOrAdmin() && (
          <Button variant="primary" onClick={handleCreateNotice}>
            새 공지사항 작성
          </Button>
        )}
      </div>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {notices.length === 0 ? (
        <Card className="mx-auto" style={{ maxWidth: '600px' }}>
          <Card.Body className="text-center">
            <p className="text-muted">등록된 공지사항이 없습니다.</p>
          </Card.Body>
        </Card>
      ) : (
        <div className="row justify-content-center">
          {notices.map((notice) => (
            <div key={notice.id} className="col-md-8 mb-3">
              <Card className="h-100">
                <Card.Header className={`d-flex justify-content-between align-items-center ${
                  notice.isImportant ? 'bg-danger text-white' : 'bg-light'
                }`}>
                  <div className="d-flex align-items-center">
                    {notice.isImportant && (
                      <Badge bg="warning" className="me-2">중요</Badge>
                    )}
                    <h5 className="mb-0">{notice.title}</h5>
                  </div>
                  <small>{formatDate(notice.createdAt)}</small>
                </Card.Header>
                <Card.Body>
                  <p className="card-text">
                    {notice.content.length > 100 
                      ? `${notice.content.substring(0, 100)}...` 
                      : notice.content
                    }
                  </p>
                  <small className="text-muted">
                    작성자: {notice.author.fullName}
                  </small>
                </Card.Body>
                <Card.Footer>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleViewNotice(notice.id)}
                    >
                      자세히 보기
                    </Button>
                    {isInstructorOrAdmin() && (
                      <>
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => handleEditNotice(notice)}
                        >
                          수정
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteNotice(notice.id)}
                        >
                          삭제
                        </Button>
                      </>
                    )}
                  </div>
                </Card.Footer>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* View Notice Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedNotice?.isImportant && (
              <Badge bg="warning" className="me-2">중요</Badge>
            )}
            {selectedNotice?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotice && (
            <div>
              <div className="mb-3">
                <small className="text-muted">
                  작성자: {selectedNotice.author.fullName} | 
                  작성일: {formatDate(selectedNotice.createdAt)}
                </small>
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {selectedNotice.content}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create/Edit Notice Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? '공지사항 수정' : '새 공지사항 작성'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>제목</Form.Label>
              <Form.Control
                type="text"
                placeholder="공지사항 제목을 입력하세요"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>내용</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                placeholder="공지사항 내용을 입력하세요"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="중요 공지사항"
                checked={formData.isImportant}
                onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            취소
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveNotice}
            disabled={!formData.title.trim() || !formData.content.trim()}
          >
            {isEditing ? '수정' : '작성'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NoticePage;
