import api from './api';

export const loginUser = async (identifier, password) => {
  const response = await api.post('auth/login', { identifier, password });
  return response;
};

export const loginUserOtp = async (identifier) => {
  const response = await api.post('auth/login-otp', { identifier });
  return response;
};

export const registerUser = async (userData) => {
  return await api.post('auth/register', userData);
};

export const resetPasswordBypass = async (identifier, password) => {
  return await api.patch('auth/reset-password-bypass', { identifier, password });
};
