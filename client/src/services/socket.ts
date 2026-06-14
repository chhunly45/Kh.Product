import { io, Socket } from 'socket.io-client';

const getViteEnv = (key: string, fallback: string) => {
  const env = safeImportMetaEnv();
  const value = env[key];
  return value || fallback;
};

const safeImportMetaEnv = () => {
  try {
    return eval('import.meta.env') as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
};

const baseURL = getViteEnv('VITE_API_BASE_URL', 'https://kh-product-1.onrender.com/api').replace(/\/api\/?$/, '');

const socket: Socket = io(baseURL, {
  autoConnect: false,
  auth: {
    token: localStorage.getItem('authToken') || ''
  }
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.auth = { token: localStorage.getItem('authToken') || '' };
    socket.connect();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
