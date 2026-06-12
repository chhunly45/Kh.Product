import axios from 'axios';

const getViteEnv = (key: string, fallback: string) => {
  const value = (import.meta.env as Record<string, string>)[key];
  return value || fallback;
};

const api = axios.create({
  baseURL: getViteEnv('VITE_API_BASE_URL', 'https://kh-product-1.onrender.com/api'),
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

let csrfToken: string | null = null;

const fetchCsrfToken = async () => {
  const response = await api.get('/csrf-token');
  csrfToken = response.data.csrfToken;
  return csrfToken;
};

const clearExpiredSession = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('sessionExpired'));
};

const redirectToLogin = () => {
  const url = new URL(window.location.href);
  url.pathname = '/login';
  url.searchParams.set('sessionExpired', '1');
  window.location.href = url.toString();
};

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken');
  config.headers = config.headers || {};
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    if (csrfToken && config.headers) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const response = error?.response;
    const message = response?.data?.message;
    if (
      response?.status === 401 &&
      typeof message === 'string' &&
      message.toLowerCase().includes('invalid or expired')
    ) {
      clearExpiredSession();
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

export default api;
