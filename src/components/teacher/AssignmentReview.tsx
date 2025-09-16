// src/components/AssignmentReview.tsx

import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAssignments, getAssignment } from '../../api';
import Panel from '../panel';
import type { Assignment, SubmissionFromAPI } from '../../types';

// Submission 타입 정의에 studentName 추가
export type SubmissionWithStudentName = SubmissionFromAPI & {
  studentName: string;
  submissionId?: number; // 백엔드에서 실제로 오는 속성명
};

export default function AssignmentReview() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionWithStudentName[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'assignments' | 'submissions'>('assignments');

  // 과제 목록 로드
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setLoading(true);
        const data = await getAssignments();
        setAssignments(data);
      } catch (err) {
        console.error('과제 목록을 불러오는 데 실패했습니다.', err);
        setError('과제 목록을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, []);

  // 특정 과제 선택 시 제출물 로드
  const handleSelectAssignment = async (assignment: Assignment) => {
    try {
      setLoading(true);
      setSelectedAssignment(assignment);

      // 제출물 목록을 실제 API로 조회 (/api/assignments/{id})
      const assignmentData = await getAssignment(assignment.id);
      const submissionsData = assignmentData.submissions || [];
      const withNames: SubmissionWithStudentName[] = submissionsData.map((s: SubmissionFromAPI) => ({
        ...s,
        studentName: s.studentName ?? `학생-${s.student_id}`,
      }));

      setSubmissions(withNames);
      setCurrentStep('submissions');
    } catch (err) {
      console.error('제출물을 불러오는 데 실패했습니다.', err);
      setError('제출물을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const goGrade = (submission: SubmissionWithStudentName) => {
    // submissionId 속성 사용 (실제 객체에는 submissionId가 있음)
    const submissionId = submission.submissionId || submission.id;
    
    navigate(`/assignments/submissions/${submissionId}/grade`, {
      state: { submission },
    });
  };

  const goBackToAssignments = () => {
    setCurrentStep('assignments');
    setSelectedAssignment(null);
    setSubmissions([]);
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

  // 로딩 처리
  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <Panel title="과제 체점">
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">로딩 중...</span>
            </div>
            <div className="mt-2">데이터를 불러오는 중...</div>
          </div>
        </Panel>
      </div>
    );
  }

  // 오류 처리
  if (error) {
    return (
      <div className="d-flex justify-content-center">
        <Panel title="과제 체점">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </Panel>
      </div>
    );
  }

  // 과제 목록 표시
  if (currentStep === 'assignments') {
    return (
      <div className="d-flex justify-content-center">
        <Panel title="과제 체점 - 과제 선택">
          <div className="fs-6">
            <div className="mb-3">
              <p className="text-muted">체점할 과제를 선택해주세요.</p>
            </div>
            
            {assignments.length > 0 ? (
              <div className="list-group">
                {assignments.map((assignment, index) => (
                  <div
                    key={assignment.id || `assignment-${index}`}
                    className="list-group-item list-group-item-action cursor-pointer"
                    onClick={() => handleSelectAssignment(assignment)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{assignment.title}</h6>
                        <p className="mb-1 text-muted small">{assignment.description}</p>
                        <div className="d-flex gap-3 text-muted small">
                          <span>마감일: {formatDate(assignment.dueDate)}</span>
                          <span>배점: {assignment.maxScore}점</span>
                          <span>제출: {assignment.submissionCount}/{assignment.totalStudents}명</span>
                        </div>
                      </div>
                      <div className="ms-3">
                        <span className="badge bg-primary">체점하기</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-secondary">
                <i className="bi bi-clipboard-check fs-1"></i>
                <p className="mt-2">등록된 과제가 없습니다.</p>
              </div>
            )}
          </div>
        </Panel>
      </div>
    );
  }

  // 제출물 목록 표시
  return (
    <div className="d-flex justify-content-center">
      <Panel title={`${selectedAssignment?.title || '과제'} - 제출 현황`}>
        <div className="fs-6">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={goBackToAssignments}
            >
              <i className="bi bi-arrow-left me-1"></i>과제 목록으로 돌아가기
            </button>
            <div className="text-muted small">
              총 {submissions.length}명의 제출물
            </div>
          </div>

          <div className="space-y-2">
            {submissions.length > 0 ? (
              submissions.map((submission, index) => (
                <div key={submission.id || `submission-${index}`} className="border rounded p-3 mb-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h6 className="mb-0">{submission.studentName}</h6>
                        <span className={`badge ${submission.status === 'GRADED' ? 'bg-success' : submission.status === 'SUBMITTED' ? 'bg-warning' : 'bg-secondary'}`}>
                          {submission.status === 'GRADED' ? `채점완료 ${submission.grade ? `(${submission.grade}점)` : ''}` : 
                           submission.status === 'SUBMITTED' ? '채점대기' : '미제출'}
                        </span>
                      </div>
                      <div className="text-muted small">
                        제출일시: {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString('ko-KR') : '미제출'}
                      </div>
                    </div>
                    <div>
                      {submission.status === 'SUBMITTED' ? (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => goGrade(submission)}
                        >
                          <i className="bi bi-pencil-square me-1"></i>채점하기
                        </button>
                      ) : submission.status === 'GRADED' ? (
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => goGrade(submission)}
                        >
                          <i className="bi bi-eye me-1"></i>채점보기
                        </button>
                      ) : (
                        <button 
                          className="btn btn-secondary btn-sm"
                          disabled
                        >
                          <i className="bi bi-x-circle me-1"></i>미제출
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-top pt-2">
                    <div className="small text-muted">
                      {/* 디버깅을 위한 콘솔 로그 */}
                      {console.log('=== TEACHER PAGE SUBMISSION DEBUG ===', {
                        submissionId: submission.id || submission.submissionId,
                        file_url: submission.file_url,
                        text_content: submission.text_content,
                        fileUrl: (submission as any).fileUrl,
                        attachmentUrls: (submission as any).attachmentUrls,
                        allKeys: Object.keys(submission),
                        allValues: Object.entries(submission),
                        fullSubmission: submission
                      })}
                      {submission.file_url ? (
                        <div>
                          <i className="bi bi-file-earmark me-1"></i>
                          파일: <a href={submission.file_url} className="text-decoration-none" target="_blank" rel="noopener noreferrer">
                            {submission.file_url}
                          </a>
                        </div>
                      ) : submission.text_content || (submission as any).textContent || (submission as any).content || (submission as any).linkUrl || (submission as any).fileUrl || ((submission as any).attachmentUrls && (submission as any).attachmentUrls.length > 0) ? (
                        <div>
                          {(() => {
                            // 다양한 필드에서 제출 내용 찾기 (백엔드에서 textContent로 보냄)
                            const attachmentUrls = (submission as any).attachmentUrls || [];
                            const content = submission.text_content || 
                                           (submission as any).textContent || 
                                           (submission as any).content || 
                                           (submission as any).linkUrl || 
                                           (submission as any).link_url ||
                                           (submission as any).fileUrl ||
                                           (attachmentUrls.length > 0 ? attachmentUrls[0] : null);
                            
                            console.log('=== CONTENT SEARCH DEBUG ===', {
                              text_content: submission.text_content,
                              textContent: (submission as any).textContent,
                              content: (submission as any).content,
                              linkUrl: (submission as any).linkUrl,
                              fileUrl: (submission as any).fileUrl,
                              attachmentUrls: attachmentUrls,
                              finalContent: content,
                              note: 'Now checking linkUrl field based on SubmissionRequestDTO'
                            });
                            
                            if (content && content.startsWith('http')) {
                              return (
                                <>
                                  <i className="bi bi-link-45deg me-1"></i>
                                  링크: <a href={content} className="text-decoration-none" target="_blank" rel="noopener noreferrer">
                                    <span className="text-truncate" style={{maxWidth: '300px', display: 'inline-block'}}>
                                      {content}
                                    </span>
                                  </a>
                                </>
                              );
                            } else if (content) {
                              return (
                                <>
                                  <i className="bi bi-file-text me-1"></i>
                                  텍스트: <span className="text-truncate" style={{maxWidth: '300px', display: 'inline-block'}}>
                                    {content}
                                  </span>
                                </>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      ) : (
                        <div className="text-muted">
                          <i className="bi bi-question-circle me-1"></i>
                          제출 내용 없음
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-secondary">
                <i className="bi bi-inbox fs-1"></i>
                <p className="mt-2">제출된 과제가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}