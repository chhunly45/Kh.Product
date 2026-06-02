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

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken');
  if (token && config.headers) {
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

export default api;
