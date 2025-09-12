import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import 'bootstrap/dist/css/bootstrap.min.css';

// 사용자 정보의 타입을 수정했습니다.
interface User {
  id: number;
  username: string;
  nickname: string;
  role: string;
  status: string;
  email: string;
}

const MemberManage: React.FC = () => {
  const API_BASE_URL = ''; // Vite 프록시 사용
  const { user } = useSelector((state: RootState) => state.auth);
  const token = user?.token;
  const [users, setUsers] = useState<User[]>([]);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});

  useEffect(() => {
    if (!token) {
      console.error('인증 토큰이 없습니다. 로그인 상태를 확인하세요.');
      return;
    }
    //전체 user 조회
    fetch(`${API_BASE_URL}/api/admin/users`, {
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
      .then(data => {
        if (data && Array.isArray(data.content)) {
          const mappedUsers = data.content.map((user: User) => ({
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            role: user.role,
            status: user.status,
            email: user.email
          }));
          setUsers(mappedUsers);
        } else {
          console.warn('서버 응답이 예상한 페이지 형식(data.content)이 아닙니다:', data);
          setUsers([]);
        }
      })
      .catch(error => {
        console.error('사용자 데이터를 불러오는 데 실패했습니다:', error);
      });
  }, [token]);

  //회원 탈퇴 handler
  const handleDelete = (userid: number) => {
    const userConfirmed = confirm("정말로 회원을 탈퇴시키겠습니까?");

    if (userConfirmed) {
      fetch(`${API_BASE_URL}/api/admin/users/${userid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
          }
          setUsers(users.filter(user => user.id !== userid));
          alert("회원 탈퇴가 성공적으로 완료되었습니다.");
        })
        .catch(error => {
          console.error('사용자 삭제에 실패했습니다:', error);
          alert("회원 탈퇴에 실패했습니다.");
        });
    } else {
      console.log("탈퇴가 취소되었습니다.");
    }
  };
  //정보수정 클릭 handler
  const handleEditClick = (user: User) => {
    if (editingUserId === user.id) {
      setEditingUserId(null);
    } else {
      setEditingUserId(user.id);
      setEditFormData(user);
    }
  };

  // ⭐ HTMLInputElement와 HTMLSelectElement를 모두 처리할 수 있도록 타입을 명확히 정의했습니다.
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSave = async (userid: number) => {
    console.log(editFormData)
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) {
        throw new Error('정보 수정에 실패했습니다.');
      }

      setUsers(prevUsers =>
        prevUsers.map(user => (user.id === userid ? { ...user, ...editFormData } as User : user))
      );
      setEditingUserId(null);
      alert("정보가 성공적으로 수정되었습니다.");

    } catch (error) {
      console.error('사용자 정보 수정에 실패했습니다:', error);
      alert("사용자 정보 수정에 실패했습니다.");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center p-4">
      <div className="bg-white p-4 rounded shadow-lg w-100">
        <h2 className="text-xl fw-bold mb-1 text-dark">사용자 관리</h2>
        <div className="table-responsive">
          <table className="table table-borderless table-spacing text-center w-100">
            <thead>
              <tr className="text-muted">
                <th className="font-normal pb-4 pe-2">NO.</th>
                <th className="font-normal pb-4 pe-2">이름</th>
                <th className="font-normal pb-4 pe-2">닉네임</th>
                <th className="font-normal pb-4 pe-2">권한</th>
                <th className="font-normal pb-4 pe-2">상태</th>
                <th className="font-normal pb-4 pe-2">이메일</th>
                <th className="font-normal pb-4 pe-2">정보수정</th>
                <th className="font-normal pb-4 pe-2">탈퇴</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <React.Fragment key={user.id}>
                  <tr className="bg-light rounded">
                    <td>{index + 1}</td>
                    <td>{user.username}</td>
                    <td>{user.nickname}</td>
                    <td>{user.role}</td>
                    <td>{user.status}</td>
                    <td>{user.email}</td>
                    <td>
                      <button
                        className="btn btn-link p-0"
                        onClick={() => handleEditClick(user)}
                      >
                        {editingUserId === user.id ? "취소" : "정보수정"}
                      </button>
                    </td>
                    <td>
                      <button className="btn btn-link text-danger p-0" onClick={() => handleDelete(user.id)}>탈퇴</button>
                    </td>
                  </tr>
                  {editingUserId === user.id && (
                    <tr>
                      <td colSpan={8}>
                        <div className="d-flex flex-column gap-2 p-4 bg-light border border-light rounded">
                          <div className="d-flex gap-2 align-items-center">
                            <label htmlFor="username" className="form-label mb-0">이름 : </label>
                            <input type="text" name="username" value={editFormData.username || ''} onChange={handleEditChange} placeholder="이름" className="form-control w-25 " />
                            <label htmlFor="nickname" className="form-label mb-0">닉네임 : </label>
                            <input type="text" name="nickname" value={editFormData.nickname || ''} onChange={handleEditChange} placeholder="닉네임" className="form-control w-25 " />
                          </div>
                          <div className="text-end">
                            <button
                              onClick={() => handleSave(user.id)}
                              className="btn btn-success"
                            >
                              저장
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberManage;