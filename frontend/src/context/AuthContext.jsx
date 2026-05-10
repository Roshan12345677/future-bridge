/**
 * Authentication Context
 * Global auth state management
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('fb_token'));

  // Verify token and load user on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('fb_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        const data = await authAPI.getMe();
        setUser(data.user);
      } catch (err) {
        localStorage.removeItem('fb_token');
        localStorage.removeItem('fb_user');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authAPI.login({ email, password });
    localStorage.setItem('fb_token', data.token);
    localStorage.setItem('fb_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name}! 🎉`);
    return data.user;
  }, []);

  const register = useCallback(async (formData) => {
    const data = await authAPI.register(formData);
    localStorage.setItem('fb_token', data.token);
    localStorage.setItem('fb_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    toast.success(`Welcome to Future Bridge, ${data.user.name}! 🚀`);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('fb_token');
    localStorage.removeItem('fb_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback(async (updates) => {
    const data = await authAPI.updateProfile(updates);
    setUser(data.user);
    localStorage.setItem('fb_user', JSON.stringify(data.user));
    toast.success('Profile updated!');
    return data.user;
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await authAPI.getMe();
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isTeacher: user?.role === 'teacher',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
