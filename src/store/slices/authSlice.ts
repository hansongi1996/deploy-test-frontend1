import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthUser, LoginRequest, LoginResponse } from '../../types';


// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data: LoginResponse = await response.json();
      
      // Store in localStorage
      const authUser: AuthUser = {
        ...data.user,
        role: data.user.role || 'STUDENT',
        token: data.token,
      };

      localStorage.setItem('authUser', JSON.stringify(authUser));
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('tokenExpiry', (new Date().getTime() + data.expiresIn * 1000).toString());

      return authUser;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: true, // 초기 로딩 상태를 true로 변경
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 로그아웃
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenExpiry');
    },
    // 에러 클리어
    clearError: (state) => {
      state.error = null;
    },
    // 초기 인증 상태 설정 (localStorage에서 복원)
    initializeAuth: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
    },
    // 로딩 상태 설정
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    // SKRookies 스타일의 사용자 데이터 설정
    setUserData: (state, action) => {
      state.user = {
        id: action.payload.id || 0,
        username: action.payload.username || '',
        fullName: action.payload.fullName || action.payload.username || '',
        email: action.payload.email || '',
        role: action.payload.role,
        token: action.payload.token,
      } as AuthUser;
      state.isAuthenticated = true;
    },
    // 사용자 데이터 클리어
    clearUserData: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 로그인 요청
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // 로그인 성공
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      // 로그인 실패
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, initializeAuth, setLoading, setUserData, clearUserData } = authSlice.actions;
export default authSlice.reducer;
