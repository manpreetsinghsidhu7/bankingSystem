import api from './api';

export const getProfile = async () => {
  return await api.get('/users/profile');
};

export const updateProfile = async (userData) => {
  return await api.patch('/users/profile', userData);
};

export const closeProfile = async () => {
  return await api.delete('/users/profile');
};
