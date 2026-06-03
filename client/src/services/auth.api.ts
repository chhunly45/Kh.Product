import api from './api';

export interface RegisterPayload {
  displayName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
  };
  authToken: string;
  refreshToken: string;
}

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', payload);
  if (response.data.success && response.data.data) {
    const { accessToken, refreshToken } = response.data.data;
    if (accessToken) {
      localStorage.setItem('authToken', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }
  return response.data.data;
};

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', payload);
  if (response.data.success && response.data.data) {
    const { accessToken, refreshToken } = response.data.data;
    if (accessToken) {
      localStorage.setItem('authToken', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }
  return response.data.data;
};

export const logout = async (): Promise<void> => {
  const refreshToken = localStorage.getItem('refreshToken');
  await api.post('/auth/logout', { refreshToken });
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
};

export const getProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data.data;
};

export const updateProfile = async (payload: Record<string, any>) => {
  const response = await api.put('/auth/me', payload);
  return response.data.data;
};

export const refreshAuthToken = async (): Promise<AuthResponse> => {
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await api.post('/auth/refresh', { refreshToken });
  if (response.data.success && response.data.data) {
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    if (accessToken) {
      localStorage.setItem('authToken', accessToken);
    }
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
  }
  return response.data.data;
};
