import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge, ProgressBar, Tab, Tabs, ListGroup } from 'react-bootstrap';
import { getAssignments, submitAssignment, uploadFile } from '../api';
import type { Assignment } from '../types';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const AssignmentPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [submissionType, setSubmissionType] = useState<'FILE' | 'LINK'>('FILE');
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await getAssignments();
      setAssignments(data);
      if (data.length > 0 && !selectedAssignment) {
        setSelectedAssignment(data[0]);
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

      let fileUrl: string | undefined;
      
      if (submissionType === 'FILE') {
        if (!file) {
          setError('파일을 선택해주세요.');
          return;
        }
        const uploadResult = await uploadFile(file);
        fileUrl = uploadResult.fileUrl;
      } else {
        if (!linkUrl.trim()) {
          setError('링크 URL을 입력해주세요.');
          return;
        }
      }

      await submitAssignment(
        selectedAssignment.id,
        submissionType,
        fileUrl,
        submissionType === 'LINK' ? linkUrl : undefined
      );

      setSubmitSuccess(true);
      setFile(null);
      setLinkUrl('');
      setSubmissionType('FILE');
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <Badge bg="primary">진행중</Badge>;
      case 'SUBMITTED':
        return <Badge bg="success">제출완료</Badge>;
      case 'LATE':
        return <Badge bg="danger">지각</Badge>;
      case 'GRADED':
        return <Badge bg="info">채점완료</Badge>;
      default:
        return <Badge bg="secondary">알 수 없음</Badge>;
    }
  };

  const getStatusCounts = () => {
    const notSubmitted = assignments.filter(a => a.status === 'IN_PROGRESS').length;
    const late = assignments.filter(a => a.status === 'LATE').length;
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
    <div className="assignment-page">
      {/* Header */}
      <div className="assignment-header bg-white border-bottom py-3">
        <Container>
          <Row className="align-items-center">
            <Col>
              <h1 className="h3 mb-1">{selectedAssignment?.title || '과제'}</h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">과제</li>
                </ol>
              </nav>
            </Col>
            <Col xs="auto">
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" size="sm">
                  <i className="bi bi-link-45deg"></i> 링크
                </Button>
                <Button variant="outline-secondary" size="sm">
                  <i className="bi bi-copy"></i> 복사
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-4">
        <Row>
          {/* Sidebar */}
          <Col lg={4} className="mb-4">
            <div className="assignment-sidebar">
              {/* My Assignments */}
              <Card className="mb-4">
                <Card.Header className="bg-light">
                  <h6 className="mb-0">나의 과제</h6>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <span>미제출</span>
                    <Badge bg="warning">{notSubmitted}</Badge>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>지각</span>
                    <Badge bg="danger">{late}</Badge>
                  </div>
                </Card.Body>
              </Card>

              {/* All Assignments */}
              <Card>
                <Card.Header className="bg-light">
                  <h6 className="mb-0">전체 과제</h6>
                </Card.Header>
                <Card.Body className="p-0">
                  <ListGroup variant="flush">
                    {assignments.map((assignment) => (
                      <ListGroup.Item
                        key={assignment.id}
                        className={`assignment-item ${selectedAssignment?.id === assignment.id ? 'active' : ''}`}
                        onClick={() => setSelectedAssignment(assignment)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <h6 className="mb-0">{assignment.title}</h6>
                          {assignment.status === 'SUBMITTED' && (
                            <i className="bi bi-check-circle-fill text-success"></i>
                          )}
                        </div>
                        <div className="text-muted small mb-1">
                          마감일 {formatDate(assignment.dueDate)}
                        </div>
                        <div>
                          {getStatusBadge(assignment.status)}
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </div>
          </Col>

          {/* Main Content */}
          <Col lg={8}>
            {selectedAssignment && (
              <div className="assignment-detail">
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

                    {/* Submission Progress */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="small">제출 현황</span>
                        <span className="small">
                          {selectedAssignment.submissionCount}/{selectedAssignment.totalStudents}명
                        </span>
                      </div>
                      <ProgressBar 
                        now={(selectedAssignment.submissionCount / selectedAssignment.totalStudents) * 100}
                        variant="primary"
                        style={{ height: '8px' }}
                      />
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
                  label="파일 업로드"
                  name="submissionType"
                  value="FILE"
                  checked={submissionType === 'FILE'}
                  onChange={(e) => setSubmissionType(e.target.value as 'FILE')}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  label="링크 제출"
                  name="submissionType"
                  value="LINK"
                  checked={submissionType === 'LINK'}
                  onChange={(e) => setSubmissionType(e.target.value as 'LINK')}
                />
              </div>
            </Form.Group>

            {submissionType === 'FILE' ? (
              <Form.Group className="mb-3">
                <Form.Label>파일 선택</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement;
                    setFile(target.files?.[0] || null);
                  }}
                  accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                />
                <Form.Text className="text-muted">
                  지원 형식: PDF, DOC, DOCX, TXT, ZIP, RAR
                </Form.Text>
              </Form.Group>
            ) : (
              <Form.Group className="mb-3">
                <Form.Label>링크 URL</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
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
                          <p className="text-muted">제출 내역이 없습니다.</p>
                        </div>
                      </Tab>

                      <Tab eventKey="feedback" title="피드백">
                        <div className="feedback">
                          <p className="text-muted">아직 피드백이 없습니다.</p>
                        </div>
                      </Tab>
                    </Tabs>
                  </Card.Body>
                </Card>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AssignmentPage;