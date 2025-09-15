// src/components/AssignmentReview.tsx

import { useNavigate, useParams } from 'react-router-dom';

import { useEffect, useState } from 'react';
import { getSubmissionsByAssignmentId, getAssignmentDetails } from '../../api';
import Panel from '../panel';
import type { Submission } from '../../types/assignment';


// Submission 타입 정의에 studentName 추가
export type SubmissionWithStudentName = Submission & {
  studentName: string;
};

export default function AssignmentReview() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const assignmentId = id ? parseInt(id, 10) : null;

  const [assignmentTitle, setAssignmentTitle] = useState<string>('');
  const [submissions, setSubmissions] = useState<SubmissionWithStudentName[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assignmentId === null || isNaN(assignmentId)) {
      setError('유효하지 않은 과제 ID입니다.');
      setLoading(false);
      return;
    }

    const fetchDetailsAndSubmissions = async () => {
      try {
        setLoading(true);
        // 과제 상세 정보를 가져와서 제목을 설정합니다.
        const assignmentData = await getAssignmentDetails(assignmentId);
        setAssignmentTitle(assignmentData.title);

        // 제출물 목록을 가져옵니다.
        const submissionsData = await getSubmissionsByAssignmentId(assignmentId);
        setSubmissions(submissionsData.map(s => ({ ...s, studentName: `학생-${s.studentId}` } as SubmissionWithStudentName)));
      } catch (err) {
        console.error('데이터를 불러오는 데 실패했습니다.', err);
        setError('과제 상세 정보 또는 제출물 목록을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetailsAndSubmissions();
  }, [assignmentId]);

  const goGrade = (submission: Submission) => {
    navigate(`/assignments/submissions/${submission.id}/grade`, {
      state: { submission },
    });
  };

  // 로딩 및 오류 처리
  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>오류: {error}</div>;
  }

  return (
    <div className="d-flex justify-content-center">
      <Panel title={` ${assignmentTitle || '과제'} · 제출 현황`}>
        <div className="fs-6 space-y-2">
          {submissions.length > 0 ? (
            submissions.map((s) => (
              <div key={s.id} className="border rounded p-2 d-flex flex-column gap-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="font-weight-bold">학생 ID: {s.studentId}</div>
                  <div className={`text-sm ${s.grade !== undefined ? 'text-black font-weight-bold' : 'text-success'}`}>
                    {s.grade !== undefined ? '채점완료' : '제출'}
                  </div>
                </div>

                {s.grade === undefined && (
                  <div className="d-flex justify-content-between align-items-center">
                    <span>제출일시: {new Date(s.submittedAt).toLocaleDateString()}</span>
                    <button onClick={() => goGrade(s)}>
                      채점하기
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-secondary">
              제출된 과제가 없습니다.
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}