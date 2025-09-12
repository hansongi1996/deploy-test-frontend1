import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

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
    <div className="min-h-screen flex items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full">
        <h2 className="text-xl font-bold mb-1 text-gray-800">회원가입 승인</h2>
        <table className="w-full table-auto text-left border-separate border-spacing-y-4">
          <thead>
            <tr className="text-gray-500">
              <th className="font-normal pb-4 pr-2">이름</th>
              <th className="font-normal pb-4 pr-2">닉네임</th>
              <th className="font-normal pb-4 pr-2">권한</th>
              <th className="font-normal pb-4 pr-2">이메일</th>
              <th className="font-normal pb-4 pr-2">승인여부</th>
              <th className="font-normal pb-4 pr-2">액션</th>
            </tr>
          </thead>
          <tbody>
            {/* users 배열을 순회하며 각 사용자에 대한 테이블 행을 동적으로 생성합니다. */}
            {users.length > 0 ? (
              users.map(user => (
                <tr key={user.email} className="bg-gray-100 rounded-lg">
                  <td className="p-4 pr-2">
                    <p className="font-bold">{user.username}</p>
                  </td>
                  <td className="p-4 px-2">
                    <span className="text-gray-500">{user.nickname}</span>
                  </td>
                  <td className="p-4 px-2">
                    <span className="text-gray-500">{user.role}</span>
                  </td>
                  <td className="p-4 px-2">
                    <span className="text-gray-500">{user.email}</span>
                  </td>
                  <td className="p-4 px-2">
                    {/* 사용자 상태에 따라 텍스트를 표시합니다. */}
                    <span className="text-gray-500">대기중</span>
                  </td>
                  <td className="p-4 px-2 space-x-2">
                    <button
                      onClick={() => handleApprove(user.email)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      승인
                    </button>
                    <button
                      onClick={() => handleDeny(user.email)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      거부
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  <span className="text-gray-500">대기 중인 회원이 없습니다.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SignupApprove;
