import { useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from '../../store';
import { resetAuthState, setNewPassword } from '../../store/slices/authSlice';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS import

const ResetPassword = () => {
    const API_BASE_URL = '';
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { email, verifyCode } = useSelector((state: RootState) => state.auth);

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
        if (!passwordData.newPassword || !passwordData.confirmPassword) {
            alert("새 비밀번호와 비밀번호 확인을 모두 입력해주세요.");
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("입력한 두 비밀번호가 일치하지 않습니다.");
            return;
        }

        dispatch(setNewPassword(passwordData.newPassword));

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
                dispatch(resetAuthState());
                navigate("/");
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
        <div className="d-flex align-items-center justify-content-center min-vh-100 p-4">
            <div className="bg-white p-4 rounded shadow-lg w-100" style={{ maxWidth: '450px' }}>
                <h2 className="text-xl fw-bold text-center mb-1 text-dark">새 비밀번호 설정</h2>
                <div className="d-grid gap-3">
                    <div className="mb-3">
                        <label className="form-label text-start text-dark fw-bold" htmlFor="newPassword">새 비밀번호</label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            placeholder="새 비밀번호 입력"
                            value={passwordData.newPassword}
                            onChange={handleChange}
                            required
                            className="form-control"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label text-start text-dark fw-bold" htmlFor="confirmPassword">비밀번호 확인</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="비밀번호 재입력"
                            value={passwordData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="form-control"
                        />
                    </div>
                    <button
                        className="btn btn-primary fw-bold"
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