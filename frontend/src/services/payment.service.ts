import api from './api';

export const processPayment = async (paymentData: any) => {
  const response = await api.post('/payment', paymentData);
  return response.data;
};