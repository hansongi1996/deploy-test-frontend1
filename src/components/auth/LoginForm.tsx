// src/components/auth/LoginForm.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../../store/slices/authSlice";

const LoginForm = () => {
  const API_BASE_URL = ""; // Vite 프록시 사용
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // ✅ remember-me 상태: 로컬에 저장된 값이 있으면 초기 체크
  const [remember, setRemember] = useState<boolean>(
    localStorage.getItem("rememberMe") === "1"
  );

  // ✅ remember 체크 상태를 로컬에 기억(선택 사항)
  useEffect(() => {
    if (remember) localStorage.setItem("rememberMe", "1");
    else localStorage.removeItem("rememberMe");
  }, [remember]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "remember-me") {
      setRemember(checked);
      return;
    }
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userData = {
      email: formData.email.trim(),
      password: formData.password.trim(),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        console.log("로그인 성공");

        // 서버 응답: { accessToken: string }
        const data: { accessToken: string } = await response.json();
        const token = data.accessToken;

        // ✅ 저장소 분기: remember 체크 시 localStorage, 아니면 sessionStorage
        const store = remember ? localStorage : sessionStorage;

        // 혹시 모를 동시 저장 제거
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("authUser");

        // 토큰 저장
        store.setItem("authToken", token);

        // 토큰으로 사용자 정보 조회
        const userInfoResponse = await fetch(`${API_BASE_URL}/api/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userInfoResponse.ok) {
          throw new Error("사용자 데이터를 불러오는 데 실패했습니다.");
        }

        const userInfoData = await userInfoResponse.json();

        // 사용자 정보도 저장(선택): api 인터셉터가 두 저장소를 다 보도록 수정했으니 어느 쪽이든 OK
        store.setItem("authUser", JSON.stringify(userInfoData));

        // Redux 상태 업데이트
        dispatch(
          setUserData({
            id: userInfoData.id,
            username: userInfoData.username,
            nickName: userInfoData.nickName || userInfoData.username,
            email: userInfoData.email,
            role: userInfoData.role,
            token: token,
          })
        );

        // 라우팅
        if (
          userInfoData.role === "ADMIN" ||
          userInfoData.role === "INSTRUCTOR"
        ) {
          navigate("/admin");
        } else if (userInfoData.role === "STUDENT") {
          navigate("/");
        }
      } else {
        // 에러 응답 처리 (JSON / TEXT 분기)
        const contentType = response.headers.get("content-type");
        let errorMessage = `로그인에 실패했습니다: ${response.statusText}`;

        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          errorMessage = `로그인에 실패했습니다: ${
            errorData.message || response.statusText
          }`;
        } else {
          const errorText = await response.text();
          errorMessage = `로그인에 실패했습니다: ${errorText}`;
        }

        console.error("로그인 실패:", errorMessage);
        alert(errorMessage);
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">PeerFlow</h2>
          <h3 className="text-lg text-gray-600 mb-1">SK쉴더스 루키즈 메신저</h3>
          <p className="text-sm text-gray-500">계정에 로그인하여 시작하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                className="block text-gray-700 text-sm font-semibold mb-2"
                htmlFor="email"
              >
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <label
                className="block text-gray-700 text-sm font-semibold mb-2"
                htmlFor="password"
              >
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            {/* ✅ remember-me 체크박스 (제어 컴포넌트) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember-me"
                  name="remember-me"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={remember}
                  onChange={handleChange}
                />
                <label className="ml-2 text-sm text-gray-600" htmlFor="remember-me">
                  로그인 상태 유지
                </label>
              </div>
            </div>

            <button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              type="submit"
            >
              로그인
            </button>
          </div>
        </form>

        <div className="mt-6 space-y-3">
          <div className="text-center">
            <Link
              to="/findPassword"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">계정이 없으신가요? </span>
            <Link
              to="/register"
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
            >
              회원가입
            </Link>
          </div>
        </div>

        {/* 나중에 지울 부분 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 text-center mb-1">테스트 계정</p>
          <p className="text-xs text-gray-600 text-center">이메일: test@example.com</p>
          <p className="text-xs text-gray-600 text-center">비밀번호: password123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
