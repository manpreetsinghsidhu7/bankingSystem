import api from './api';

export const processTransfer = async (transferData) => {
  return await api.post('transactions/transfer', transferData);
};

export const getTransactionHistory = async (accountId, page = 1, limit = 10, filters = {}) => {
  const query = new URLSearchParams({ page, limit });
  if (filters.startDate) query.append('startDate', filters.startDate);
  if (filters.endDate) query.append('endDate', filters.endDate);
  if (filters.type) query.append('type', filters.type);
  
  return await api.get(`transactions/${accountId}?${query.toString()}`);
};

export const getTransactionDetail = async (transactionId) => {
  return await api.get(`transactions/detail/${transactionId}`);
};
