// src/components/Dashboard.tsx

import { Link } from 'react-router-dom';
import type { Assignment } from '../../types';

import { useEffect, useState } from 'react';
import { getAssignments } from '../../api';
import Panel from '../panel';

export default function Dashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 모든 과제 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const assignmentsData = await getAssignments();
        setAssignments(assignmentsData);
      } catch (err) {
        console.error('대시보드 데이터를 불러오는 데 실패했습니다.', err);
        setError('대시보드 데이터를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 로딩 및 오류 처리
  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>오류: {error}</div>;
  }

  return (
    <div className="d-flex justify-content-center">
      <div className="my-4 w-75 p-3">
        <div className="text-end">
          <Link to="/assignments/new" className="btn btn-primary">
            새 과제 등록
          </Link>
        </div>
        <h2 className="mb-4">대시보드</h2>
        <div className="row g-4">
          <div className="col-md-6 fs-4
          ">
            <Panel title="등록 과제 관리">
              <div className="border rounded">
                <div className="border-bottom p-2 bg-light fs-6">과제 목록</div>
                <div className="p-2 fs-6">
                  {assignments.length > 0 ? (
                    assignments.map((row) => (
                      <div
                        key={row.id}
                        className="d-flex justify-content-between align-items-center py-1 border-bottom"
                      >
                        <span>
                          {row.title} (마감일 : {new Date(row.dueDate).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          })}
                          {new Date(row.dueDate).toLocaleTimeString('ko-KR', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })})
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-secondary py-2">
                      등록된 과제가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          </div>

          <div className="col-md-6 fs-4">
            <Panel title="제출 과제 확인">
              <div className="border rounded">
                <div className="border-bottom p-2 bg-light fs-6">과제 확인</div>
                <div className="p-2 fs-6">
                  {assignments.length > 0 ? (
                    assignments.map((assignment) => (
                      <Link
                        to={`/assignments/${assignment.id}/review`} // AssignmentReview 페이지로 이동
                        key={assignment.id}
                        className="d-flex justify-content-between align-items-center py-1 text-decoration-none text-dark border-bottom"
                      >
                        <span>{assignment.title}</span>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center text-secondary py-2">
                      확인할 과제가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}