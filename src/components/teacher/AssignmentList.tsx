// src/components/AssignmentList.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssignments, deleteAssignment } from '../../api'; // deleteAssignment 함수를 import 합니다.
import Panel from '../panel';
import type { Assignment } from '../../types';

export default function AssignmentList() {
  const [items, setItems] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 과제 목록을 불러오는 함수
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await getAssignments();
      setItems(data);
    } catch (err) {
      console.error('과제 목록을 불러오는 데 실패했습니다.', err);
      setError('과제 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 과제 목록을 불러옴
  useEffect(() => {
    fetchAssignments();
  }, []);

  // 과제 삭제 핸들러
  const remove = async (id: number) => {
    if (window.confirm('정말로 이 과제를 삭제하시겠습니까?')) {
      try {
        await deleteAssignment(id);
        alert('과제가 성공적으로 삭제되었습니다.');
        setItems(items.filter((i) => i.id !== id)); // 삭제 성공 후 UI 업데이트
      } catch (err) {
        console.error('과제 삭제 중 오류가 발생했습니다:', err);
        alert('과제 삭제 중 오류가 발생했습니다. 권한이 있는지 확인하세요.');
      }
    }
  };

  // ... 로딩 및 오류 처리 부분 (기존 코드)

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>오류: {error}</div>;
  }

  return (
    <div className="d-flex justify-content-center">
      <div className="w-75">
        <Panel title="과제 리스트">
          <div className="fs-6">
            {/* 헤더 */}
            <div className="d-flex border-bottom pb-2 fw-bold text-center">
              <span className="col-4">제목</span>
              <span className="col-2">마감일</span>
              <span className="col-2 ">작업</span>
            </div>

            {/* 리스트 */}
            {items.length > 0 ? (
              items.map((assignment) => (
                <div key={assignment.id} className="d-flex align-items-center py-2 border-bottom text-center">
                  <span className="col-4">{assignment.title}</span>
                  <span className="col-2">{assignment.dueDate}</span>

                  <div className="col-2 d-flex gap-2 justify-content-center">
                    <button onClick={() => navigate(`/assignments/${assignment.id}/edit`, { state: { assignment } })} className="btn btn-primary btn-sm p-2">
                      수정
                    </button>
                    <button onClick={() => remove(assignment.id)} className='btn btn-dark btn-sm p-2'>
                      삭제
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-secondary">
                과제가 없습니다. 과제를 추가해 보세요.
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}