import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, loginUserOtp } from '../services/auth.service';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check localStorage on load
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    try {
      const response = await loginUser(identifier, password);
      // Based on our backend spec: response.data.user & response.data.token
      const { user: userData, token: accessToken } = response.data;
      
      setUser(userData);
      setToken(accessToken);
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', accessToken);
      
      toast.success('Login successful!');
      navigate(userData.role === 'ADMIN' ? '/admin/accounts' : '/dashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const loginWithOtp = async (identifier) => {
    try {
      const response = await loginUserOtp(identifier);
      const { user: userData, token: accessToken } = response.data;
      
      setUser(userData);
      setToken(accessToken);
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', accessToken);
      
      toast.success('Login successful via Secure OTP!');
      navigate(userData.role === 'ADMIN' ? '/admin/accounts' : '/dashboard');
    } catch (error) {
      toast.error(error.message || 'OTP Login failed');
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const updateUserProfile = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithOtp, logout, updateUserProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
