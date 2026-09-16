import React, { createContext, useEffect, useState } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,setUser] = useState(null);
  const [token,setToken] = useState(localStorage.getItem('token') || '');
  const [isAuthenticated,setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const savedToken = localStorage.getItem('token');

      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await authService.getCurrentUser();

        setToken(savedToken);
        setUser(res.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth load error:', error);
        localStorage.removeItem('token');
        setToken('');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const login = async (emailOrPhone, password) => {
    const res = await authService.login({ emailOrPhone, password });

    const { token: newToken, user: loggedInUser } = res.data;

    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(loggedInUser);
    setIsAuthenticated(true);

    return res.data;
  };

  const register = async (formData) => {
    const res = await authService.register(formData);

    const { token: newToken, user: registeredUser } = res.data;

    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(registeredUser);
    setIsAuthenticated(true);

    return res.data;
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        setUser,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
