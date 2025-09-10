import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
    // useNavigate 훅은 컴포넌트의 최상위 레벨에서 호출해야 합니다.
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        nickname: '',
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const userData = {
            username: formData.username.trim(),
            nickname: formData.nickname.trim(),
            email: formData.email.trim(),
            password: formData.password.trim(),
        };

        console.log("회원가입 데이터:", userData);

        const API_BASE_URL = 'http://localhost:3001';

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            // 응답 상태 코드를 확인합니다.
            if (response.ok) { // 상태 코드가 200-299 범위인 경우
                console.log("회원가입 성공");
                const result = await response.json();
                console.log("응답 데이터:", result);

                // 성공적으로 회원가입되었을 때만 페이지 이동
                navigate("/register-success"); 

            } else { // 상태 코드가 200-299 범위가 아닌 경우 (예: 400, 500 등)
                const errorData = await response.json();
                console.error("회원가입 실패:", errorData);
                alert(`회원가입에 실패했습니다: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error("네트워크 오류:", error);
            alert("서버 연결에 실패했습니다. 다시 시도해주세요.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">회원가입</h2>
                    <p className="text-sm text-gray-500">PeerFlow에 오신 것을 환영합니다</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-gray-700 text-sm font-semibold mb-2">
                                이름
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder="홍길동"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="nickname" className="block text-gray-700 text-sm font-semibold mb-2">
                                닉네임
                            </label>
                            <input
                                type="text"
                                id="nickname"
                                name="nickname"
                                placeholder="닉네임을 입력하세요"
                                required
                                value={formData.nickname}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                                이메일
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="user@example.com"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
                                비밀번호
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="비밀번호를 입력하세요"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            회원가입
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;
