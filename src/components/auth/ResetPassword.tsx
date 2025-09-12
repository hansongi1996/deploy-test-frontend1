import { useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from '../../store';
import { resetAuthState, setNewPassword } from '../../store/slices/authSlice';

const ResetPassword = () => {
    const API_BASE_URL = ''; // Vite 프록시 사용
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // Redux에서 이메일과 인증 코드 가져오기
    const { email, verifyCode } = useSelector((state: RootState) => state.auth);
    
    // 로컬 상태로 새 비밀번호와 확인 비밀번호 관리
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleResetPassword = async () => {
        // 비밀번호 유효성 검사 및 일치 여부 확인
        if (!passwordData.newPassword || !passwordData.confirmPassword) {
            alert("새 비밀번호와 비밀번호 확인을 모두 입력해주세요.");
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("입력한 두 비밀번호가 일치하지 않습니다.");
            return;
        }

        // Redux에 새 비밀번호 저장
        dispatch(setNewPassword(passwordData.newPassword));
        
        // API 요청에 필요한 데이터 객체 생성
        const resetData = {
            email: email,
            code: verifyCode,
            newPassword: passwordData.newPassword
        };

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/auth/password/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resetData)
            });

            if (response.ok) {
                alert("비밀번호가 재설정 되었습니다.");
                dispatch(resetAuthState()); // 비밀번호 재설정 성공 시 Redux 상태 초기화
                navigate("/"); // 로그인 페이지 등 초기 화면으로 이동
            } else {
                const errorData = await response.text();
                alert(`비밀번호 재설정 실패: ${errorData}`);
                console.error('API 호출 실패:', response.status, errorData);
            }
        } catch (error) {
            console.error('API 호출 중 오류 발생:', error);
            alert('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold text-center mb-1 text-gray-800">새 비밀번호 설정</h2>
                <div className="space-y-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2 text-left" htmlFor="newPassword">새 비밀번호</label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            placeholder="새 비밀번호 입력"
                            value={passwordData.newPassword}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-300 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2 text-left" htmlFor="confirmPassword">비밀번호 확인</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="비밀번호 재입력"
                            value={passwordData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-300 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                        onClick={handleResetPassword}
                    >
                        새 비밀번호 설정
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;