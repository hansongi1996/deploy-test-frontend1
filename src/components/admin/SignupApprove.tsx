import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import 'bootstrap/dist/css/bootstrap.min.css';

// 사용자 정보의 타입을 정의합니다.
interface User {
  id: string;
  username: string;
  nickname: string;
  role: string;
  email: string;
  // 초기 승인 상태를 관리하기 위해 status를 추가합니다.
  status?: 'pending' | 'approved' | 'denied';
}

const SignupApprove: React.FC = () => {
  // 사용자 데이터와 로딩 상태를 관리하는 state를 정의합니다.
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const token = user?.token;

  // 컴포넌트 마운트 시 프록시를 통해 데이터 가져오기
  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/users/status/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.content)) {
          const usersWithStatus = data.content.map((user: User) => ({
            ...user,
            status: 'pending' as 'pending' | 'approved' | 'denied'
          }));
          setUsers(usersWithStatus);
        } else {
          // 응답 형식이 예상과 다를 경우 처리합니다.
          console.error('서버 응답이 유효한 페이지 형식이 아닙니다:', data);
          setUsers([]); // 빈 배열로 상태를 초기화
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('사용자 데이터를 불러오는 데 실패했습니다:', err);
        setError('사용자 데이터를 불러올 수 없습니다.');
        setLoading(false);
      });
  }, [token]);

  // 승인/거부 버튼 클릭 핸들러 (프록시를 통한 호출)
  const handleApprove = async (userEmail: string) => {
    try {
      const user = users.find(u => u.email === userEmail);
      if (!user) return;

      const response = await fetch(`/api/admin/users/${user.id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        console.log(`${userEmail} 승인 처리 완료`);
        setUsers(prevUsers =>
          prevUsers.filter(u => u.email !== userEmail)
        );
      } else {
        console.error('승인 처리 실패');
      }
    } catch (error) {
      console.error('승인 처리 중 오류:', error);
    }
  };

  const handleDeny = async (userEmail: string) => {
    try {
      const user = users.find(u => u.email === userEmail);
      if (!user) return;

      const response = await fetch(`/api/admin/users/${user.id}/deny`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        console.log(`${userEmail} 거부 처리 완료`);
        setUsers(prevUsers =>
          prevUsers.filter(u => u.email !== userEmail)
        );
      } else {
        console.error('거부 처리 실패');
      }
    } catch (error) {
      console.error('거부 처리 중 오류:', error);
    }
  };

  // 로딩 및 에러 상태 처리
  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>오류: {error}</div>;
  }

  return (
    <div className="d-flex align-items-center justify-content-center p-4">
      <div className="bg-white p-4 rounded shadow-lg w-100">
        <h2 className="text-xl fw-bold mb-1 text-dark">회원가입 승인</h2>
        <div className="table-responsive">
          <table className="table table-borderless table-spacing w-100">
            <thead>
              <tr className="text-muted">
                <th className="font-normal pb-4 pe-2">이름</th>
                <th className="font-normal pb-4 pe-2">닉네임</th>
                <th className="font-normal pb-4 pe-2">권한</th>
                <th className="font-normal pb-4 pe-2">이메일</th>
                <th className="font-normal pb-4 pe-2">승인여부</th>
                <th className="font-normal pb-4 pe-2">액션</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map(user => (
                  <tr key={user.email} className="bg-light rounded">
                    <td className="p-4 pe-2">
                      <p className="fw-bold">{user.username}</p>
                    </td>
                    <td className="p-4 px-2">
                      <span className="text-muted">{user.nickname}</span>
                    </td>
                    <td className="p-4 px-2">
                      <span className="text-muted">{user.role}</span>
                    </td>
                    <td className="p-4 px-2">
                      <span className="text-muted">{user.email}</span>
                    </td>
                    <td className="p-4 px-2">
                      <span className="text-muted">대기중</span>
                    </td>
                    <td className="p-4 px-2">
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => handleApprove(user.email)}
                          className="btn btn-success"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => handleDeny(user.email)}
                          className="btn btn-danger"
                        >
                          거부
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    <span className="text-muted">대기 중인 회원이 없습니다.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SignupApprove;