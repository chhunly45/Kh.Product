import { io, Socket } from 'socket.io-client';

const getViteEnv = (key: string, fallback: string) => {
  try {
    return new Function(`return import.meta.env.${key}`)();
  } catch {
    return process.env[key] || fallback;
  }
};

const baseURL = getViteEnv('VITE_API_BASE_URL', 'http://localhost:4000/api').replace(/\/api\/?$/, '');

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
