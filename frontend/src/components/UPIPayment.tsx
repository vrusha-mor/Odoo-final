import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { generateUPI } from "../utils/upi";
import api from "../services/api";

type Props = {
  amount: number;
};

export default function UPIPayment({ amount }: Props) {
  const [qrCode, setQrCode] = useState<string>("");

  // 🔴 ADD YOUR REAL UPI ID HERE
  const MERCHANT_UPI_ID = "aryankhandare2005@okicici"; // <-- CHANGE THIS
  const MERCHANT_NAME = "POS Store";

  useEffect(() => {
    const upiLink = generateUPI(
      MERCHANT_UPI_ID,
      MERCHANT_NAME,
      amount
    );

    QRCode.toDataURL(upiLink, {
      width: 300,
      margin: 2
    }).then(setQrCode);
  }, [amount]);

  const confirmPayment = async () => {
    try {
      await api.post("/payment/receipt", {
        email: "customer@gmail.com",
        amount
      });

      alert("Payment confirmed & receipt sent!");
    } catch (err) {
      alert("Payment confirmed, but email failed");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>UPI Payment</h2>

      {qrCode && (
        <img
          src={qrCode}
          alt="UPI QR"
          style={{ margin: "20px 0" }}
        />
      )}

      <h3>Amount: ₹{amount}</h3>

      <button onClick={confirmPayment}>
        Confirm Payment
      </button>
    </div>
  );
}
