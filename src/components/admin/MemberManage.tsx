import React, { useState, useEffect } from 'react';

// 사용자 정보의 타입을 정의합니다.
// 이 부분을 통해 TypeScript의 장점을 활용할 수 있습니다.
interface User {
  username: string;
  nickname: string;
  role: string;
  email: string;
}

const MemberManage: React.FC = () => {
  // 1. 사용자 데이터를 저장할 상태(state)를 정의합니다.
  // 초기값은 빈 배열로 설정하고, 타입은 User 배열로 지정합니다.
  const [users, setUsers] = useState<User[]>([]);

  // 2. 컴포넌트가 처음 마운트될 때 API를 호출합니다.
  useEffect(() => {
    const API_BASE_URL = 'http://localhost:8080';
    
    const token = localStorage.getItem('authToken')
    fetch(`${API_BASE_URL}/api/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        // HTTP 응답이 성공적인지 확인합니다.
        if (!response.ok) {
          throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        return response.json();
      })
      .then(data => {
        // 3. 받아온 데이터를 상태에 저장합니다.
        setUsers(data);
      })
      .catch(error => {
        console.error('사용자 데이터를 불러오는 데 실패했습니다:', error);
      });
  }, []); // 빈 의존성 배열([])을 넣어 컴포넌트가 처음 렌더링될 때만 실행되도록 합니다.

  return (
    <div className="min-h-screen flex items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full">
        <h2 className="text-xl font-bold mb-1 text-gray-800">사용자 관리</h2>
        <table className="w-full table-auto text-center border-separate border-spacing-y-4">
          <thead>
            <tr className="text-gray-500">
              <th className="font-normal pb-4 pr-2">NO.</th>
              <th className="font-normal pb-4 pr-2">이름</th>
              <th className="font-normal pb-4 pr-2">닉네임</th>
              <th className="font-normal pb-4 pr-2">권한</th>
              <th className="font-normal pb-4 pr-2">이메일</th>
              <th className="font-normal pb-4 pr-2">정보수정</th>
              <th className="font-normal pb-4 pr-2">탈퇴</th>
            </tr>
          </thead>
          <tbody>
            {/* 4. users 상태 배열을 map 함수로 순회하며 각 사용자마다 <tr> 요소를 생성합니다. */}
            {users.map((user, index) => (
              <tr key={user.email} >
                <td>{index + 1}</td>
                <td>{user.username}</td>
                <td>{user.nickname}</td>
                <td>{user.role}</td>
                <td>{user.email}</td>
                <td>
                  <button className="text-blue-500 hover:underline">정보수정</button>
                </td>
                <td>
                  <button className="text-red-500 hover:underline">탈퇴</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberManage;
