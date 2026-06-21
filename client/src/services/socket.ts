import { io } from 'socket.io-client';

const safeImportMetaEnv = () => {
  try {
    // eslint-disable-next-line no-eval
    return (eval('import.meta.env') as Record<string, string>) || {};
  } catch {
    return {} as Record<string, string>;
  }
};

const getServerBase = () => {
  const env = safeImportMetaEnv();
  const url = env.VITE_API_BASE_URL || env.VITE_API_URL || env.VITE_PUBLIC_API_URL || ''; // may be empty
  if (url) return url.replace(/\/api\/?$/, '');
  // fallback to same host at port 5000
  return `${window.location.protocol}//${window.location.hostname}${window.location.hostname === 'localhost' ? ':5000' : ''}`;
};

const baseURL = getServerBase();

// single socket instance (autoConnect: false)
const socket = io(baseURL, { autoConnect: false, transports: ['websocket'] });

export const connectSocket = (token?: string | null) => {
  const t = token || localStorage.getItem('authToken') || '';
  if (!socket.connected) {
    socket.auth = { token: t };
    socket.connect();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};

export const getSocket = () => socket;

