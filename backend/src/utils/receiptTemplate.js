const receiptTemplate = (orderData) => {
  return `
    <h1>Payment Receipt</h1>
    <p>Order ID: ${orderData.id}</p>
    <p>Total: ${orderData.total}</p>
  `;
};

module.exports = receiptTemplate;