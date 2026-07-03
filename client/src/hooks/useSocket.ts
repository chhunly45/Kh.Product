import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { getSocket } from '../services/socket';

export const useSocket = () => {
  useAuth();
  const socketRef = useRef<any | null>(null);

  useEffect(() => {
    socketRef.current = null;

    return () => {
      socketRef.current = null;
    };
  }, []);

  return {
    socket: getSocket(),
  };
};

export default useSocket;
