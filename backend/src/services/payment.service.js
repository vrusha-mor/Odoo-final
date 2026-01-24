const mailService = require('./mail.service');

const processPayment = async (paymentData) => {
  // Simulate payment processing
  const paymentId = 'PAY' + Date.now();
  const status = 'success';

  // Send receipt
  await mailService.sendReceipt(paymentData.email, 'Receipt HTML');

  return { paymentId, status };
};

module.exports = { processPayment };