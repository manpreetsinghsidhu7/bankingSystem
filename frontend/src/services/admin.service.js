import api from './api';

export const getAllUsers = async (page = 1, limit = 50) => {
  return await api.get(`admin/users?page=${page}&limit=${limit}`);
};

export const updateAccountStatus = async (accountId, status) => {
  return await api.patch(`admin/accounts/${accountId}/status`, { status });
};

export const getAllAccounts = async (page = 1, limit = 100, status = '') => {
  const q = new URLSearchParams({ page, limit });
  if (status) q.set('status', status);
  return await api.get(`admin/accounts?${q.toString()}`);
};

export const getAllTransactions = async (page = 1, limit = 100) => {
  return await api.get(`admin/transactions?page=${page}&limit=${limit}`);
};

export const deleteUser = async (userId) => {
  return await api.delete(`admin/users/${userId}`);
};

