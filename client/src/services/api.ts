import axios from 'axios';

const getViteEnv = (key: string, fallback: string) => {
  try {
    return new Function(`return import.meta.env.${key}`)();
  } catch {
    return process.env[key] || fallback;
  }
};

const api = axios.create({
  baseURL: getViteEnv('VITE_API_BASE_URL', 'http://localhost:4000/api'),
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
