import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('pr-review-authed') === 'true'
  );
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Fetch user profile whenever we become authenticated
  useEffect(() => {
    if (!isAuthenticated) { setUser(null); return; }
    setLoadingUser(true);
    api.get('/api/users/me')
      .then(res => setUser(res.data))
      .catch(() => {
        // Token may be expired — log out gracefully
        setIsAuthenticated(false);
        localStorage.removeItem('pr-review-authed');
      })
      .finally(() => setLoadingUser(false));
  }, [isAuthenticated]);

  function login() {
    window.location.href = `${api.defaults.baseURL}/api/auth/github`;
  }

  function markLoggedIn() {
    setIsAuthenticated(true);
    localStorage.setItem('pr-review-authed', 'true');
  }

  function logout() {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('pr-review-authed');
  }

  async function deleteAccount() {
    try {
      await api.delete('/api/users/me');
    } catch (err) {
      console.error('Failed to delete account:', err);
      throw err;
    }
    logout();
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loadingUser, login, markLoggedIn, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}