import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
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
    // from first file
    email: string;
    verifyCode: string;
    newPassword: string;
    // from second file
    user: AuthUser | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    // from first file
    email: '',
    verifyCode: '',
    newPassword: '',
    // from second file
    user: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Reducers from the first file
        setEmail: (state, action: PayloadAction<string>) => {
            state.email = action.payload;
        },
        setVerifyCode: (state, action: PayloadAction<string>) => {
            state.verifyCode = action.payload;
        },
        setNewPassword: (state, action: PayloadAction<string>) => {
            state.newPassword = action.payload;
        },
        resetAuthState: (state) => {
            // Reset both authentication and password reset states
            state.email = '';
            state.verifyCode = '';
            state.newPassword = '';
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            state.isLoading = false; // Add this line to reset isLoading as well
            localStorage.removeItem('authUser');
            localStorage.removeItem('authToken');
            localStorage.removeItem('tokenExpiry');
        },
        // Reducers from the second file
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem('authUser');
            localStorage.removeItem('authToken');
            localStorage.removeItem('tokenExpiry');
        },
        clearError: (state) => {
            state.error = null;
        },
        initializeAuth: (state, action: PayloadAction<AuthUser | null>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
            state.isLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setUserData: (state, action: PayloadAction<Partial<AuthUser>>) => {
            state.user = {
                id: action.payload.id || 0,
                username: action.payload.username || '',
                fullName: action.payload.fullName || action.payload.nickName || action.payload.username || '',
                email: action.payload.email || '',
                role: action.payload.role || 'STUDENT',
                token: action.payload.token || '',
            } as AuthUser;
            state.isAuthenticated = true;
        },
        clearUserData: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        updateUser: (state, action: PayloadAction<AuthUser>) => {
            state.user = action.payload;
            // Update localStorage as well
            localStorage.setItem('authUser', JSON.stringify(action.payload));
        },
    },
    extraReducers: (builder) => {
        builder
            // Login pending
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            // Login fulfilled
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            // Login rejected
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
            });
    },
});

export const {
    setEmail,
    setVerifyCode,
    setNewPassword,
    resetAuthState,
    logout,
    clearError,
    initializeAuth,
    setLoading,
    setUserData,
    clearUserData,
    updateUser,
} = authSlice.actions;

export default authSlice.reducer;