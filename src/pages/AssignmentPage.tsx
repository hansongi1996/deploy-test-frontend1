import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Alert, Spinner, Badge, ProgressBar, Tab, Tabs, ListGroup } from 'react-bootstrap';
import { getAssignments, getAssignment, submitAssignment, uploadFile } from '../api';
import type { Assignment, SubmissionFromAPI } from '../types';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import Header from '../components/Header';
import { useNavigate, useLocation } from 'react-router-dom';

const AssignmentPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [submissionType, setSubmissionType] = useState<'FILE' | 'LINK'>('LINK');
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 활성 네비게이션 탭 결정
  const getActiveNavTab = () => {
    const path = location.pathname;
    if (path === '/notices') return 'notices';
    if (path === '/assignments') return 'assignments';
    return 'chat';
  };

  const activeNavTab = getActiveNavTab();

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await getAssignments();
      
      // 각 과제의 상세 정보를 불러와서 제출물 데이터 포함
      const assignmentsWithDetails = await Promise.all(
        data.map(async (assignment) => {
          try {
            const detailedAssignment = await getAssignment(assignment.id);
            return detailedAssignment;
          } catch (error) {
            console.error(`Failed to load details for assignment ${assignment.id}:`, error);
            return assignment; // 실패시 기본 정보만 사용
          }
        })
      );
      
      setAssignments(assignmentsWithDetails);
      if (assignmentsWithDetails.length > 0 && !selectedAssignment) {
        setSelectedAssignment(assignmentsWithDetails[0]);
      }
    } catch (err) {
      setError('과제 목록을 불러오는데 실패했습니다.');
      console.error('Error loading assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) return;

    try {
      setSubmitting(true);
      setError(null);

      // 파일 제출은 현재 비활성화, URL 제출만 가능
      if (!linkUrl.trim()) {
        setError('링크 URL을 입력해주세요.');
        return;
      }

      console.log('=== STUDENT SUBMISSION DEBUG ===', {
        assignmentId: selectedAssignment.id,
        linkUrl: linkUrl,
        submissionType: submissionType,
        linkUrlLength: linkUrl.length,
        linkUrlTrimmed: linkUrl.trim()
      });

      await submitAssignment(
        selectedAssignment.id,
        linkUrl
      );

      // 제출 후 해당 과제의 상세 정보를 다시 불러와서 제출 내역을 업데이트
      try {
        const updatedAssignment = await getAssignment(selectedAssignment.id);
        setSelectedAssignment(updatedAssignment);
      } catch (refreshError) {
        console.error('Failed to refresh assignment details:', refreshError);
      }

      setSubmitSuccess(true);
      setFile(null);
      setLinkUrl('');
      setSubmissionType('LINK');
      setActiveTab('submission-history');
    } catch (err) {
      setError('과제 제출에 실패했습니다.');
      console.error('Error submitting assignment:', err);
    } finally {
      setSubmitting(false);
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

  // 현재 사용자의 제출물을 찾는 함수
  const getUserSubmission = (): SubmissionFromAPI | null => {
    if (!selectedAssignment?.submissions || !user?.id) {
      return null;
    }
    
    // 방법 1: studentName으로 매칭 시도
    const userSubmissionByName = selectedAssignment.submissions.find(
      submission => {
        const nameMatches = 
          (submission as any).studentName === user.fullName ||
          (submission as any).studentName === user.username;
        
        return nameMatches;
      }
    );
    
    if (userSubmissionByName) {
      return userSubmissionByName;
    }
    
    // 방법 2: 제출물이 하나뿐이라면 현재 사용자 것으로 간주
    if (selectedAssignment.submissions.length === 1) {
      return selectedAssignment.submissions[0];
    }
    
    // 방법 3: 모든 제출물을 현재 사용자 것으로 간주 (임시)
    // 학생 페이지에서는 보통 자신의 제출물만 보여주므로
    return selectedAssignment.submissions[0] || null;
  };

  // 과제의 실제 상태를 결정하는 함수
  const getAssignmentStatus = (assignment: Assignment): string => {
    // 제출물 데이터가 없는 경우
    if (!assignment.submissions || assignment.submissions.length === 0) {
      return 'NOT_SUBMITTED';
    }

    // 학생 페이지에서는 첫 번째 제출물을 현재 사용자 것으로 간주
    // (학생은 보통 자신의 제출물만 볼 수 있음)
    const submission = assignment.submissions.length > 0 ? assignment.submissions[0] : null;

    if (!submission) {
      return 'NOT_SUBMITTED';
    }

    // 제출물의 상태에 따라 반환
    if (submission.status === 'GRADED') {
      return 'GRADED';
    } else if (submission.status === 'SUBMITTED') {
      return 'SUBMITTED';
    } else {
      return 'NOT_SUBMITTED';
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    const status = getAssignmentStatus(assignment);
    
    switch (status) {
      case 'NOT_SUBMITTED':
        return <Badge bg="secondary">미제출</Badge>;
      case 'SUBMITTED':
        return <Badge bg="success">제출완료</Badge>;
      case 'LATE':
        return <Badge bg="danger">지각</Badge>;
      case 'GRADED':
        return <Badge bg="info">채점완료</Badge>;
      case 'IN_PROGRESS':
        return <Badge bg="primary">진행중</Badge>;
      default:
        return <Badge bg="secondary">미제출</Badge>;
    }
  };

  const getStatusCounts = () => {
    const notSubmitted = assignments.filter(a => getAssignmentStatus(a) === 'NOT_SUBMITTED').length;
    const late = assignments.filter(a => getAssignmentStatus(a) === 'LATE').length;
    return { notSubmitted, late };
  };

  const { notSubmitted, late } = getStatusCounts();

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">과제 목록을 불러오는 중...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="d-flex flex-column" style={{ height: '100vh' }}>
      <Header />

      <div className="d-flex flex-grow-1">
        {/* Left Panel - Navigation Sidebar (Fixed) */}
        <div className="bg-light border-end d-flex flex-column" style={{ position: 'fixed', width: '280px', height: 'calc(100vh - 80px)', left: 0, top: '80px', zIndex: 1000 }}>
          {/* Main Navigation Tabs */}
          <div className="d-flex border-bottom">
            <Button
              variant="link"
              className={`flex-fill text-decoration-none ${activeNavTab === 'notices' ? 'text-primary border-bottom border-primary' : 'text-dark'}`}
              onClick={() => navigate('/notices')}
            >
              공지사항
            </Button>
            <Button
              variant="link"
              className={`flex-fill text-decoration-none ${activeNavTab === 'assignments' ? 'text-primary border-bottom border-primary' : 'text-dark'}`}
              onClick={() => navigate('/assignments')}
            >
              과제
            </Button>
            <Button
              variant="link"
              className={`flex-fill text-decoration-none ${activeNavTab === 'chat' ? 'text-primary border-bottom border-primary' : 'text-dark'}`}
              onClick={() => navigate('/')}
            >
              채팅
            </Button>
          </div>

          {/* Assignment List */}
          <div className="flex-grow-1 p-3">
            {/* My Assignments */}
            <Card className="mb-3">
              <Card.Header className="bg-light py-2">
                <h6 className="mb-0">나의 과제</h6>
              </Card.Header>
              <Card.Body className="py-2">
                <div className="d-flex justify-content-between mb-2">
                  <span className="small">미제출</span>
                  <Badge bg="warning" className="small">{notSubmitted}</Badge>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="small">지각</span>
                  <Badge bg="danger" className="small">{late}</Badge>
                </div>
              </Card.Body>
            </Card>

            {/* All Assignments */}
            <Card>
              <Card.Header className="bg-light py-2">
                <h6 className="mb-0">전체 과제</h6>
              </Card.Header>
              <Card.Body className="p-0">
                <ListGroup variant="flush">
                  {assignments.map((assignment) => (
                    <ListGroup.Item
                      key={assignment.id}
                      className={`assignment-item ${selectedAssignment?.id === assignment.id ? 'active' : ''}`}
                      onClick={() => {
                        // 이미 상세 정보가 포함되어 있으므로 바로 설정
                        setSelectedAssignment(assignment);
                        setLinkUrl('');
                        setFile(null);
                        setSubmissionType('LINK');
                        setError(null);
                        setSubmitSuccess(false);
                      }}
                      style={{ cursor: 'pointer', padding: '12px' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="mb-0 small">{assignment.title}</h6>
                        {assignment.status === 'SUBMITTED' && (
                          <i className="bi bi-check-circle-fill text-success small"></i>
                        )}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        마감일 {formatDate(assignment.dueDate)}
                      </div>
                      <div className="mt-1">
                        {getStatusBadge(assignment)}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* Right Panel - Assignment Content */}
        <div className="d-flex flex-column" style={{ marginLeft: '280px', width: 'calc(100vw - 280px)', height: 'calc(100vh - 80px)' }}>
          {/* Assignment Header */}
          <div className="assignment-header bg-white border-bottom py-4 px-4">
            <div>
              <h1 className="h3 mb-2">{selectedAssignment?.title || '과제'}</h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">과제</li>
                </ol>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-grow-1 p-4">
            {assignments.length === 0 ? (
              <div className="d-flex align-items-center justify-content-center h-100">
                <div className="text-center">
                  <div className="mb-4">
                    <i className="bi bi-clipboard-check" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                  </div>
                  <h4 className="text-muted mb-3">과제가 없습니다</h4>
                  <p className="text-muted">
                    현재 등록된 과제가 없습니다. 새로운 과제가 등록되면 여기에 표시됩니다.
                  </p>
                </div>
              </div>
            ) : selectedAssignment ? (
              <div>
                {/* Assignment Info */}
                <Card className="mb-4">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h4 className="mb-1">{selectedAssignment.title}</h4>
                        <div className="text-muted small">
                          마감일: {formatDate(selectedAssignment.dueDate)} |
                          배점: {selectedAssignment.maxScore}점
                        </div>
                        <div className="mt-1">
                          {selectedAssignment.tags?.map((tag, index) => (
                            <Badge key={index} bg="secondary" className="me-1">
                              {tag}
                            </Badge>
                          )) || []}
                        </div>
                      </div>
                    </div>

                  </Card.Body>
                </Card>

                {/* Tabs */}
                <Card>
                  <Card.Body>
                    <Tabs
                      activeKey={activeTab}
                      onSelect={(k) => setActiveTab(k || 'description')}
                      className="mb-3"
                    >
                      <Tab eventKey="description" title="과제 설명">
                        <div className="assignment-description">
                          <p className="mb-4">{selectedAssignment.description}</p>

                          <h6 className="mb-3">요구사항</h6>
                          <ol className="mb-4">
                            {selectedAssignment.requirements?.map((req, index) => (
                              <li key={index} className="mb-1">{req}</li>
                            )) || []}
                          </ol>

                          {selectedAssignment.attachments && selectedAssignment.attachments.length > 0 && (
                            <>
                              <h6 className="mb-3">첨부 파일</h6>
                              <div className="attachment-list">
                                {selectedAssignment.attachments.map((attachment) => (
                                  <div key={attachment.id} className="d-flex justify-content-between align-items-center p-2 border rounded mb-2">
                                    <div className="d-flex align-items-center">
                                      <i className={`bi bi-file-${attachment.fileType.toLowerCase()}-fill me-2`}></i>
                                      <span>{attachment.fileName}</span>
                                    </div>
                                    <Button variant="outline-primary" size="sm">
                                      다운로드
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </Tab>

                      <Tab eventKey="submit" title="제출하기">
                        <div className="assignment-submit">
                          {error && (
                            <Alert variant="danger" dismissible onClose={() => setError(null)}>
                              {error}
                            </Alert>
                          )}

                          {submitSuccess && (
                            <Alert variant="success" dismissible onClose={() => setSubmitSuccess(false)}>
                              과제가 성공적으로 제출되었습니다!
                            </Alert>
                          )}

                          <Form>
                            <Form.Group className="mb-3">
                              <Form.Label>제출 방식</Form.Label>
                              <div>
                                <Form.Check
                                  type="radio"
                                  label="파일 업로드 (현재 비활성화)"
                                  name="submissionType"
                                  value="FILE"
                                  checked={Boolean(submissionType === 'FILE')}
                                  onChange={(e) => setSubmissionType(e.target.value as 'FILE')}
                                  className="mb-2"
                                  disabled
                                />
                                <Form.Check
                                  type="radio"
                                  label="링크 제출"
                                  name="submissionType"
                                  value="LINK"
                                  checked={Boolean(submissionType === 'LINK')}
                                  onChange={(e) => setSubmissionType(e.target.value as 'LINK')}
                                />
                              </div>
                            </Form.Group>

                            {submissionType === 'FILE' ? (
                              <Form.Group className="mb-3">
                                <Form.Label>파일 선택 (현재 비활성화)</Form.Label>
                                <Form.Control
                                  type="file"
                                  onChange={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    setFile(target.files?.[0] || null);
                                  }}
                                  accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                                  disabled
                                />
                                <Form.Text className="text-muted">
                                  파일 업로드 기능은 현재 비활성화되어 있습니다.
                                </Form.Text>
                              </Form.Group>
                            ) : (
                              <Form.Group className="mb-3">
                                <Form.Label>링크 URL</Form.Label>
                                <Form.Control
                                  type="url"
                                  placeholder="https://example.com"
                                  value={linkUrl || ''}
                                  onChange={(e) => setLinkUrl(e.target.value)}
                                />
                                <Form.Text className="text-muted">
                                  GitHub, Google Drive, Dropbox 등의 링크를 입력해주세요.
                                </Form.Text>
                              </Form.Group>
                            )}

                            <Button
                              variant="primary"
                              onClick={handleSubmit}
                              disabled={submitting}
                              className="w-100"
                            >
                              {submitting ? (
                                <>
                                  <Spinner size="sm" className="me-2" />
                                  제출 중...
                                </>
                              ) : (
                                '과제 제출'
                              )}
                            </Button>
                          </Form>
                        </div>
                      </Tab>

                      <Tab eventKey="submission-history" title="제출내역">
                        <div className="submission-history">
                          {(() => {
                            const userSubmission = getUserSubmission();
                            if (!userSubmission) {
                              return <p className="text-muted">제출 내역이 없습니다.</p>;
                            }
                            
                            return (
                              <div className="submission-details">
                                <div className="mb-3">
                                  <h6>제출 정보</h6>
                                  <div className="border rounded p-3 bg-light">
                                    <div className="row mb-2">
                                      <div className="col-sm-3"><strong>제출일시:</strong></div>
                                      <div className="col-sm-9">
                                        {userSubmission.submitted_at 
                                          ? formatDate(userSubmission.submitted_at)
                                          : '정보 없음'}
                                      </div>
                                    </div>
                                    <div className="row mb-2">
                                      <div className="col-sm-3"><strong>제출 상태:</strong></div>
                                      <div className="col-sm-9">
                                        {userSubmission.status === 'SUBMITTED' && <Badge bg="success">제출완료</Badge>}
                                        {userSubmission.status === 'GRADED' && <Badge bg="primary">채점완료</Badge>}
                                        {userSubmission.status === 'NOT_SUBMITTED' && <Badge bg="secondary">미제출</Badge>}
                                      </div>
                                    </div>
                                    {userSubmission.grade && (
                                      <div className="row mb-2">
                                        <div className="col-sm-3"><strong>점수:</strong></div>
                                        <div className="col-sm-9">
                                          <span className="badge bg-success fs-6">{userSubmission.grade}점</span>
                                        </div>
                                      </div>
                                    )}
                                    {userSubmission.text_content ? (
                                      <div className="row mb-2">
                                        <div className="col-sm-3"><strong>제출 내용:</strong></div>
                                        <div className="col-sm-9">
                                          <div className="border rounded p-2 bg-white">
                                            {userSubmission.text_content}
                                          </div>
                                        </div>
                                      </div>
                                    ) : null}
                                    {userSubmission.file_url ? (
                                      <div className="row mb-2">
                                        <div className="col-sm-3"><strong>첨부파일:</strong></div>
                                        <div className="col-sm-9">
                                          <a href={userSubmission.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                                            <i className="bi bi-download me-1"></i>파일 다운로드
                                          </a>
                                        </div>
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                                
                                {userSubmission.feedback && (
                                  <div className="mb-3">
                                    <h6>강사 피드백</h6>
                                    <div className="border rounded p-3 bg-info bg-opacity-10">
                                      {userSubmission.feedback}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </Tab>

                      <Tab eventKey="feedback" title="피드백">
                        <div className="feedback">
                          {(() => {
                            const userSubmission = getUserSubmission();
                            if (!userSubmission || !userSubmission.feedback) {
                              return <p className="text-muted">아직 피드백이 없습니다.</p>;
                            }
                            
                            return (
                              <div className="feedback-content">
                                <div className="border rounded p-3 bg-info bg-opacity-10">
                                  <h6 className="mb-2">강사 피드백</h6>
                                  <p className="mb-0">{userSubmission.feedback}</p>
                                </div>
                                {userSubmission.grade && (
                                  <div className="mt-3">
                                    <span className="badge bg-success fs-6">점수: {userSubmission.grade}점</span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </Tab>
                    </Tabs>
                  </Card.Body>
                </Card>
              </div>
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100">
                <div className="text-center">
                  <div className="mb-4">
                    <i className="bi bi-clipboard-check" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                  </div>
                  <h4 className="text-muted mb-3">과제를 선택해주세요</h4>
                  <p className="text-muted">
                    왼쪽에서 과제를 선택하면 상세 내용을 확인할 수 있습니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentPage;