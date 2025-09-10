import { useNavigate } from "react-router-dom";

const RegisterSuccess = () => {
    const navigate = useNavigate()
    const handleLogin = () => {
        navigate("/login")
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md text-center border border-gray-100">
                <div className="mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">회원가입 완료</h2>
                    <p className="text-gray-600">회원가입이 성공적으로 완료되었습니다.</p>
                    <p className="text-sm text-gray-500 mt-2">관리자 승인을 기다려주세요.</p>
                </div>

                <button 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
                    onClick={handleLogin}
                >
                    로그인 페이지로 이동
                </button>
            </div>
        </div>
    );
};

export default RegisterSuccess;

