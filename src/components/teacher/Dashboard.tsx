// src/components/Dashboard.tsx

import type { Assignment, Notice } from '../../types';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssignments, getNotices } from '../../api';
import Panel from '../panel';

export default function Dashboard() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 모든 데이터 가져오기 (과제 및 공지사항)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [assignmentsData, noticesResponse] = await Promise.all([
          getAssignments(),
          getNotices(0, 10, 'createdAt,desc')
        ]);
        setAssignments(assignmentsData);
        
        // 공지사항 응답 처리 (페이지네이션 객체일 수 있음)
        let noticesData: Notice[] = [];
        if (Array.isArray(noticesResponse)) {
          noticesData = noticesResponse;
        } else if (noticesResponse && typeof noticesResponse === 'object') {
          const dataObj = noticesResponse as any;
          
          if (dataObj.content && Array.isArray(dataObj.content)) {
            noticesData = dataObj.content.filter((item: any) => {
              return item && typeof item === 'object' && 
                     item.id && 
                     item.title && 
                     item.content && 
                     item.createdAt;
            });
          } else if (dataObj.data && Array.isArray(dataObj.data)) {
            noticesData = dataObj.data.filter((item: any) => {
              return item && typeof item === 'object' && 
                     item.id && 
                     item.title && 
                     item.content && 
                     item.createdAt;
            });
          }
        }
        setNotices(noticesData);
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
            <Panel title="올린 공지사항">
              <div className="border rounded">
                <div className="border-bottom p-2 bg-light fs-6">최근 공지사항</div>
                <div className="p-2 fs-6">
                  {notices.length > 0 ? (
                    notices.map((notice) => (
                      <div
                        key={notice.id}
                        className="d-flex justify-content-between align-items-center py-1 text-decoration-none text-dark border-bottom"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          // 공지사항 수정 페이지로 이동
                          navigate(`/teacher?page=notice/edit&noticeId=${notice.id}`, {
                            state: {
                              notice: {
                                id: notice.id,
                                title: notice.title,
                                content: notice.content,
                                pinned: notice.pinned
                              }
                            }
                          });
                        }}
                        title="클릭하여 수정"
                      >
                        <div className="d-flex flex-column">
                          <span className="fw-bold">
                            {notice.pinned && <span className="text-danger me-1">[중요]</span>}
                            {notice.title}
                          </span>
                          <small className="text-muted">
                            {new Date(notice.createdAt).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-secondary py-2">
                      등록된 공지사항이 없습니다.
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