import { io, Socket } from 'socket.io-client';

const safeImportMetaEnv = () => {
  if (typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined') {
    return import.meta.env as Record<string, string>;
  }

  // Fallback to Node `process.env` when running in non-Vite environments (tests)
  // Cast to Record<string,string> for compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (typeof process !== 'undefined' && (process as any).env) ? (process as any).env : ({} as Record<string, string>);
};

const getSocketBaseUrl = () => {
  const env = safeImportMetaEnv();
  const rawUrl = env.VITE_API_BASE_URL || env.VITE_API_URL || env.VITE_PUBLIC_API_URL || '';
  if (rawUrl) {
    return rawUrl.replace(/\/api\/?$/, '');
  }

  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `${window.location.protocol}//${window.location.hostname}:5000`;
    }
  }

  return 'https://api.konpuk.com';
};

const baseURL = getSocketBaseUrl();
const env = safeImportMetaEnv();
const socketEnabled = String(env.VITE_ENABLE_SOCKET || '').toLowerCase() === 'true';

let socket: Socket | null = null;

const getOrCreateSocket = () => {
  if (!socketEnabled) {
    return null;
  }

  if (!socket) {
    // single socket instance (autoConnect disabled and reconnection disabled for release stability)
    socket = io(baseURL, {
      autoConnect: false,
      transports: ['websocket'],
      reconnection: false,
    });
  }

  return socket;
};

export const connectSocket = (token?: string | null) => {
  const s = getOrCreateSocket();
  if (!s) return null;

  const t = token || localStorage.getItem('authToken') || '';
  if (!s.connected && !s.active) {
    s.auth = { token: t };
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (!socket) return;

  socket.removeAllListeners();
  if (socket.connected || socket.active) {
    socket.disconnect();
  }
};

export const getSocket = () => getOrCreateSocket();

