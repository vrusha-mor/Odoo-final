// Generates a valid UPI deep link
export const generateUPI = (
  upiId: string,      // example: yourname@oksbi
  merchantName: string,
  amount: number
) => {
  return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    merchantName
  )}&am=${amount}&cu=INR`;
};
