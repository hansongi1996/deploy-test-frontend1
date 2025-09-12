import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import type { RootState } from "../../store";
import { setEmail, setVerifyCode } from "../../store/slices/authSlice";
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS import

const FindPassword = () => {
    const API_BASE_URL = '';
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { email, verifyCode } = useSelector((state: RootState) => state.auth);

    const [showVerification, setShowVerification] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'email') {
            dispatch(setEmail(value));
        } else if (name === 'verifyCode') {
            dispatch(setVerifyCode(value));
        }
    };

    const handleFindPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            alert("이메일을 입력해 주세요.");
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/auth/password/reset?email=${encodeURIComponent(email)}`,
                {
                    method: "POST",
                }
            );

            if (response.ok) {
                setShowVerification(true);
                alert("인증번호가 발송되었습니다. 이메일을 확인해주세요.");
            } else {
                const errorData = await response.text();
                alert(`인증번호 발송 실패: ${errorData}`);
                console.error('API 호출 실패:', response.status, errorData);
            }
        } catch (error) {
            console.error('API 호출 중 오류 발생:', error);
            alert('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
    };

    const handleVerify = async () => {
        const verifyData = {
            email: email,
            code: verifyCode
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/password/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(verifyData)
            });

            const data = await response.text();

            if (response.ok && data === "인증번호 확인 완료") {
                console.log("인증 성공");
                const changePassword = confirm("인증되었습니다. 비밀번호를 바꾸겠습니까?");
                if (changePassword) {
                    navigate("/resetPassword");
                }
            } else {
                alert("인증 실패: " + data);
            }
        } catch (error) {
            console.error('API 호출 중 오류 발생:', error);
            alert('API 호출 중 오류가 발생했습니다.');
        }
    };

    const handleCancel = () => {
        navigate("/");
    };

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light p-4">
            <div className="bg-white p-4 rounded shadow-lg w-100" style={{ maxWidth: '450px' }}>
                <h2 className="text-xl fw-bold text-center mb-1 text-secondary">비밀번호 찾기</h2>
                <form onSubmit={handleFindPassword}>
                    <div className="d-grid gap-3">
                        <div className="mb-3">
                            <label className="form-label text-start text-dark fw-bold" htmlFor="email">이메일 </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="user@example.com"
                                value={email}
                                onChange={handleChange}
                                required
                                className="form-control"
                            />
                        </div>
                        <div>
                            {showVerification && (
                                <div className="mb-3">
                                    <label className="form-label text-start text-dark fw-bold" htmlFor="verificationCode">인증번호</label>
                                    <div className="d-flex gap-2">
                                        <input
                                            type="text"
                                            id="verifyCode"
                                            name="verifyCode"
                                            placeholder="인증번호 입력"
                                            value={verifyCode}
                                            onChange={handleChange}
                                            required
                                            className="form-control flex-grow-1"
                                        />
                                        <button className="btn btn-success fw-bold"
                                            onClick={handleVerify}
                                            type="button">인증</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button className="btn btn-primary fw-bold" type="submit">비밀번호찾기</button>
                        <button className="btn btn-secondary fw-bold" onClick={handleCancel}>취소</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FindPassword;