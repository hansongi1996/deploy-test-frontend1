// src/components/auth/RegisterForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;

const RegisterForm = () => {
  const navigate = useNavigate();
  const API_BASE_URL = ""; // Vite 프록시 사용

  const [formData, setFormData] = useState({
    username: "",
    nickname: "",
    email: "",
    role: "STUDENT",
    password: "",
  });

  const handleChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // ✅ 뒤로가기 버튼 처리
  const handleBack = () => {
    // (선택) 작성 중 경고
    // if (Object.values(formData).some(v => v)) {
    //   if (!window.confirm("작성 중인 내용이 사라집니다. 돌아갈까요?")) return;
    // }
    navigate(-1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userData = {
      username: formData.username.trim(),
      nickname: formData.nickname.trim(),
      email: formData.email.trim(),
      role: formData.role,
      password: formData.password.trim(),
    };

    console.log("회원가입 데이터:", userData);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        console.log("회원가입 성공");
        const result = await response.json();
        console.log("응답 데이터:", result);

        // 성공적으로 회원가입되었을 때만 페이지 이동
        navigate("/register-success");
      } else {
        const errorData = await response.json();
        console.error("회원가입 실패:", errorData);
        alert(
          `회원가입에 실패했습니다: ${
            errorData.message || (response as any).statusText
          }`
        );
      }
    } catch (error) {
      console.error("네트워크 오류:", error);
      alert("서버 연결에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        {/* ✅ 상단 헤더 (뒤로가기 + 타이틀) */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              aria-label="뒤로 가기"
            >
              <span className="text-lg">←</span>
              <span className="text-sm font-medium">뒤로 가기</span>
            </button>

            <h2 className="ml-2 text-xl font-semibold text-gray-800">회원가입</h2>
          </div>
          <p className="text-sm text-gray-500 mt-2">PeerFlow에 오신 것을 환영합니다</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-gray-700 text-sm font-semibold mb-2"
              >
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
              <label
                htmlFor="nickname"
                className="block text-gray-700 text-sm font-semibold mb-2"
              >
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
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-semibold mb-2"
              >
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
              <label
                htmlFor="role"
                className="block text-gray-700 text-sm font-semibold mb-2 text-left"
              >
                권한
              </label>
              <select
                name="role"
                id="role-select"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-gray-300 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="STUDENT">학생</option>
                <option value="ADMIN">관리자</option>
                <option value="TEACHER">강사</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 text-sm font-semibold mb-2"
              >
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