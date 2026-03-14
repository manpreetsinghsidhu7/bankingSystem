import api from './api';

export const getMyAccounts = async () => {
  return await api.get('/accounts');
};

export const getAccountDetails = async (id) => {
  return await api.get(`/accounts/${id}`);
};

export const deposit = async (id, amount, description) => {
  return await api.post(`/accounts/${id}/deposit`, { amount, description });
};

export const withdraw = async (id, amount, description) => {
  return await api.post(`/accounts/${id}/withdraw`, { amount, description });
};

export const verifyReceiver = async (accountNumber) => {
  return await api.get(`/accounts/verify-receiver/${accountNumber}`);
};

export const setPin = async (id, pin) => {
  return await api.patch(`/accounts/${id}/pin`, { pin });
};

export const verifyPin = async (id, pin) => {
  return await api.post(`/accounts/${id}/verify-pin`, { pin });
};

export const deleteAccount = async (id, pin) => {
  return await api.delete(`/accounts/${id}`, { data: { pin } });
};
