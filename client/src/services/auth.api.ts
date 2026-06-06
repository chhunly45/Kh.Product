import api from './api';

export interface RegisterPayload {
  displayName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    role?: string;
    emailVerified?: boolean;
  };
  authToken: string;
  refreshToken: string;
}

export interface LoginOtpResponse {
  requiresOtp: boolean;
  expiresIn: number;
  resendCooldownSeconds: number;
}

export interface EmailVerificationResponse {
  requiresEmailVerification: boolean;
  identifier: string;
  expiresIn: number;
  resendCooldownSeconds: number;
}

export interface EmailVerifiedResult {
  verified: boolean;
}

export interface PasswordResetRequestResponse {
  expiresIn: number;
  resendCooldownSeconds: number;
}

export const register = async (payload: RegisterPayload): Promise<AuthResponse | EmailVerificationResponse> => {
  const response = await api.post('/auth/register', payload);
  if (response.data.success && response.data.data && 'requiresEmailVerification' in response.data.data) {
    return response.data.data;
  }

  if (response.data.success && response.data.data) {
    const token = response.data.data.accessToken;
    const refreshToken = response.data.data.refreshToken;
    const user = response.data.data.user;
    if (token) localStorage.setItem('authToken', token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (user) localStorage.setItem('user', JSON.stringify(user));
  }

  return response.data.data;
};

export const login = async (payload: LoginPayload): Promise<AuthResponse | LoginOtpResponse> => {
  const response = await api.post('/auth/login', payload);
  if (response.data.success && response.data.data && 'requiresOtp' in response.data.data) {
    return response.data.data;
  }

  if (response.data.success && response.data.data) {
    const token = response.data.data.accessToken;
    const refreshToken = response.data.data.refreshToken;
    const user = response.data.data.user;
    if (token) localStorage.setItem('authToken', token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (user) localStorage.setItem('user', JSON.stringify(user));
  }
  return response.data.data;
};

export const verifyLoginOtp = async (payload: { identifier: string; code: string }): Promise<AuthResponse> => {
  const response = await api.post('/auth/login/verify', payload);
  if (response.data.success && response.data.data) {
    const token = response.data.data.accessToken;
    const refreshToken = response.data.data.refreshToken;
    const user = response.data.data.user;
    if (token) localStorage.setItem('authToken', token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (user) localStorage.setItem('user', JSON.stringify(user));
  }
  return response.data.data;
};

export const resendLoginOtp = async (payload: { identifier: string }): Promise<LoginOtpResponse> => {
  const response = await api.post('/auth/login/resend', payload);
  return response.data.data;
};

export const verifyEmailCode = async (payload: { identifier: string; code: string }): Promise<EmailVerifiedResult> => {
  const response = await api.post('/auth/register/verify', payload);
  return response.data.data;
};

export const resendEmailVerificationCode = async (payload: { identifier: string }): Promise<EmailVerificationResponse> => {
  const response = await api.post('/auth/register/verify/resend', payload);
  return response.data.data;
};

export const requestPasswordReset = async (payload: { identifier: string }): Promise<PasswordResetRequestResponse> => {
  const response = await api.post('/auth/password-reset/request', payload);
  return response.data.data;
};

export const verifyPasswordResetOtp = async (payload: { identifier: string; code: string }): Promise<{ valid: boolean }> => {
  const response = await api.post('/auth/password-reset/verify', payload);
  return response.data.data;
};

export const resetPassword = async (payload: { identifier: string; code: string; password: string }): Promise<{ success: boolean }> => {
  const response = await api.post('/auth/password-reset/confirm', payload);
  return response.data.data;
};

export const resendPasswordResetCode = async (payload: { identifier: string }): Promise<PasswordResetRequestResponse> => {
  const response = await api.post('/auth/password-reset/resend', payload);
  return response.data.data;
};

export const logout = async (): Promise<void> => {
  const refreshToken = localStorage.getItem('refreshToken');
  await api.post('/auth/logout', { refreshToken });
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export const changePassword = async (payload: { currentPassword: string; newPassword: string }) => {
  const response = await api.post('/auth/change-password', payload);
  return response.data.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data.data;
};

export const updateProfile = async (payload: Record<string, any>) => {
  const response = await api.put('/auth/me', payload);
  return response.data.data;
};

export const requestVerification = async (details?: string) => {
  const response = await api.post('/auth/verification-request', { details });
  return response.data.data;
};

export const refreshAuthToken = async (): Promise<AuthResponse> => {
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await api.post('/auth/refresh', { refreshToken });
  if (response.data.success && response.data.data) {
    const data = response.data.data || response.data;
    const token = data?.accessToken || data?.authToken || response.data?.accessToken || response.data?.authToken || response.data?.token || data?.token;
    const newRefreshToken = data?.refreshToken || response.data?.refreshToken;
    if (token) localStorage.setItem('authToken', token);
    if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
  }
  return response.data.data;
};
