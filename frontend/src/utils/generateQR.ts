import QRCode from 'qrcode';

export const generateQR = async (text: string) => {
  return await QRCode.toDataURL(text);
};