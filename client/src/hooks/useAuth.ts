import { useState } from 'react';

const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const login = () => setUser({ displayName: 'Guest' });
  const logout = () => setUser(null);
  return { user, login, logout };
};

export default useAuth;
