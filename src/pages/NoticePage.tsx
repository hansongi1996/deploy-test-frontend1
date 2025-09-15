import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Modal, Form, Badge } from 'react-bootstrap';
import { getNotices, getNotice, createNotice, updateNotice, deleteNotice } from '../api';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { Notice } from '../types';
import Header from '../components/Header';
import { useNavigate, useLocation } from 'react-router-dom';

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
    pinned: false
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotalElements] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 활성 탭 결정
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/notices') return 'notices';
    if (path === '/assignments') return 'assignments';
    return 'chat';
  };

  const activeTab = getActiveTab();

  // 권한 확인 함수들
  const isInstructorOrAdmin = () => {
    return user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async (page: number = 0) => {
    try {
      setLoading(true);
      const data = await getNotices(page, 20, 'createdAt,desc');
      console.log('Raw API response:', data);
      console.log('Data type:', typeof data);
      console.log('Is array:', Array.isArray(data));
      
      let noticesData: Notice[] = [];
      
      // API 응답이 배열인지 확인하고 안전하게 처리
      if (Array.isArray(data)) {
        noticesData = data;
        setTotalPages(1);
        setTotalElements(data.length);
      } else if (data && typeof data === 'object') {
        // 백엔드에서 페이지네이션 객체로 래핑된 경우
        const dataObj = data as any;
        
        if (dataObj.content && Array.isArray(dataObj.content)) {
          console.log('Found content array:', dataObj.content);
          console.log('Content array length:', dataObj.content.length);
          console.log('First item:', dataObj.content[0]);
          
          // content 배열의 각 항목이 실제 공지사항인지 확인
          noticesData = dataObj.content.filter((item: any) => {
            return item && typeof item === 'object' && 
                   item.id && 
                   item.title && 
                   item.content && 
                   item.createdAt;
          });
          
          // 페이지네이션 정보 설정
          setTotalPages(dataObj.totalPages || 1);
          setTotalElements(dataObj.totalElements || 0);
          
          console.log('Filtered notices:', noticesData);
          console.log('Pagination info:', {
            totalPages: dataObj.totalPages,
            totalElements: dataObj.totalElements,
            currentPage: dataObj.number
          });
        } else if (dataObj.data && Array.isArray(dataObj.data)) {
          noticesData = dataObj.data.filter((item: any) => {
            return item && typeof item === 'object' && 
                   item.id && 
                   item.title && 
                   item.content && 
                   item.createdAt;
          });
          setTotalPages(dataObj.totalPages || 1);
          setTotalElements(dataObj.totalElements || 0);
        } else {
          console.warn('Unexpected data structure:', data);
          noticesData = [];
        }
      } else {
        console.warn('Invalid data type received:', typeof data, data);
        noticesData = [];
      }
      
      console.log('Final notices data:', noticesData);
      setNotices(noticesData);
      setCurrentPage(page);
    } catch (err) {
      setError('공지사항을 불러오는데 실패했습니다.');
      console.error('Error loading notices:', err);
      setNotices([]); // 에러 시 빈 배열로 초기화
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
      pinned: notice.pinned
    });
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const handleCreateNotice = () => {
    setSelectedNotice(null);
    setFormData({
      title: '',
      content: '',
      pinned: false
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
          formData.pinned
        );
      } else {
        await createNotice(
          formData.title,
          formData.content,
          formData.pinned
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
    <div className="d-flex flex-column" style={{ height: '100vh' }}>
      <Header />
      
      <div className="d-flex flex-grow-1">
        {/* Left Panel - Navigation Sidebar (Fixed) */}
        <div className="bg-light border-end d-flex flex-column" style={{ position: 'fixed', width: '280px', height: 'calc(100vh - 80px)', left: 0, top: '80px', zIndex: 1000, overflow: 'hidden' }}>
          {/* Main Navigation Tabs */}
          <div className="d-flex border-bottom">
            <Button 
              variant="link" 
              className={`flex-fill text-decoration-none ${activeTab === 'notices' ? 'text-primary border-bottom border-primary' : 'text-dark'}`}
              onClick={() => navigate('/notices')}
            >
              공지사항
            </Button>
            <Button 
              variant="link" 
              className={`flex-fill text-decoration-none ${activeTab === 'assignments' ? 'text-primary border-bottom border-primary' : 'text-dark'}`}
              onClick={() => navigate('/assignments')}
            >
              과제
            </Button>
            <Button 
              variant="link" 
              className={`flex-fill text-decoration-none ${activeTab === 'chat' ? 'text-primary border-bottom border-primary' : 'text-dark'}`}
              onClick={() => navigate('/')}
            >
              채팅
            </Button>
          </div>

          {/* Notice Statistics */}
          <div className="p-3" style={{ overflowY: 'auto', flex: 1 }}>
            <Card className="mb-3">
              <Card.Header className="bg-light py-2">
                <h6 className="mb-0">공지사항 현황</h6>
              </Card.Header>
              <Card.Body className="py-2">
                <div className="d-flex justify-content-between mb-2">
                  <span className="small">전체</span>
                  <Badge bg="primary" className="small">{notices.length}</Badge>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="small">중요</span>
                  <Badge bg="danger" className="small">{notices.filter(n => n.pinned).length}</Badge>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="small">일반</span>
                  <Badge bg="secondary" className="small">{notices.filter(n => !n.pinned).length}</Badge>
                </div>
              </Card.Body>
            </Card>


            {/* Recent Notices */}
            {notices.length > 0 && (
              <Card>
                <Card.Header className="bg-light py-2">
                  <h6 className="mb-0">최근 공지사항</h6>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="list-group list-group-flush">
                    {notices
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 3)
                      .map((notice) => (
                        <div 
                          key={notice.id}
                          className="list-group-item list-group-item-action py-2"
                          onClick={() => handleViewNotice(notice.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <h6 className="mb-0 small text-truncate" style={{ maxWidth: '150px' }}>
                              {notice.title}
                            </h6>
                            {notice.pinned && (
                              <Badge bg="danger" className="small">!</Badge>
                            )}
                          </div>
                          <small className="text-muted">
                            {new Date(notice.createdAt).toLocaleDateString('ko-KR', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </small>
                        </div>
                      ))}
                  </div>
                </Card.Body>
              </Card>
            )}
          </div>
        </div>

        {/* Right Panel - Notice Content */}
        <div className="d-flex flex-column" style={{ marginLeft: '280px', width: 'calc(100vw - 280px)', height: 'calc(100vh - 80px)' }}>
          {/* Notice Header */}
          <div className="bg-white border-bottom py-4 px-4">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="mb-0">공지사항</h2>
              {isInstructorOrAdmin() && (
                <Button variant="primary" onClick={handleCreateNotice}>
                  새 공지사항 작성
                </Button>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-grow-1 p-4">
            {!notices || !Array.isArray(notices) || notices.length === 0 ? (
              <div className="d-flex align-items-center justify-content-center h-100">
                <div className="text-center">
                  <div className="mb-4">
                    <i className="bi bi-megaphone" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                  </div>
                  <h4 className="text-muted mb-3">공지사항이 없습니다</h4>
                  <p className="text-muted">
                    현재 등록된 공지사항이 없습니다. 새로운 공지사항이 등록되면 여기에 표시됩니다.
                  </p>
                </div>
              </div>
            ) : (
              <div>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!notices || !Array.isArray(notices) || notices.length === 0 ? (
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
                  notice.pinned ? 'bg-danger text-white' : 'bg-light'
                }`}>
                  <div className="d-flex align-items-center">
                    {notice.pinned && (
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
                    작성자: {notice.author?.fullName || notice.author?.username || '알 수 없음'}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => loadNotices(0)}
                  disabled={currentPage === 0}
                >
                  처음
                </button>
              </li>
              <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => loadNotices(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  이전
                </button>
              </li>
              
              {/* 페이지 번호들 */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const startPage = Math.max(0, currentPage - 2);
                const pageNum = startPage + i;
                if (pageNum >= totalPages) return null;
                
                return (
                  <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => loadNotices(pageNum)}
                    >
                      {pageNum + 1}
                    </button>
                  </li>
                );
              })}
              
              <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => loadNotices(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  다음
                </button>
              </li>
              <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => loadNotices(totalPages - 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  마지막
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}


      {/* View Notice Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedNotice?.pinned && (
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
                  작성자: {selectedNotice.author?.fullName || selectedNotice.author?.username || '알 수 없음'} | 
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
                checked={formData.pinned}
                onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticePage;
