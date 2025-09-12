import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import type { RootState } from "../../store";
import { setEmail, setVerifyCode } from "../../store/slices/authSlice";

const FindPassword = () => {
    const API_BASE_URL = ''; // Vite 프록시 사용
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux 스토어에서 상태 가져오기
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

    // 비밀번호 찾기 handle
    const handleFindPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        // email 상태는 Redux에서 관리
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

    // 인증코드 받아온 후 검증
    const handleVerify = async () => {
        // email과 verifyCode 상태는 Redux에서 관리
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold text-center mb-1 text-gray-800">비밀번호 찾기</h2>
                <form onSubmit={handleFindPassword}>
                    <div className="space-y-4">
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-2 text-left" htmlFor="email">이메일 </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="user@example.com"
                                value={email} // Redux 상태 사용
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-300 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            {showVerification && (
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-semibold mb-2 text-left" htmlFor="verificationCode">인증번호</label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            id="verifyCode"
                                            name="verifyCode"
                                            placeholder="인증번호 입력"
                                            value={verifyCode} // Redux 상태 사용
                                            onChange={handleChange}
                                            required
                                            className="flex-1 bg-gray-300 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                                            onClick={handleVerify}
                                            type="button">인증</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                            type="submit">비밀번호찾기</button>
                        <br />
                        <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200" onClick={handleCancel}>취소</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FindPassword;

