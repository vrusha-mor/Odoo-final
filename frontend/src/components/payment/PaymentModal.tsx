import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, CreditCard, QrCode, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import QRCode from 'qrcode';

type Props = {
  amount: number;
  email: string;
  cart: { id: number; name: string; price: number; quantity: number; }[];
  onClose: () => void;
  onSuccess: () => void;
};

type Step = 'SELECT' | 'QR' | 'PROCESSING' | 'SUCCESS';

export default function PaymentModal({ amount, email, cart, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('SELECT');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [emailStatus, setEmailStatus] = useState<'IDLE' | 'SENDING' | 'SENT' | 'ERROR'>('IDLE');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (step === 'QR') {
      const upiId = localStorage.getItem('pos_upi_id') || 'aryankhandare2005@okicici';
      const terminalName = localStorage.getItem('pos_terminal_name') || 'POS Store';
      const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(terminalName)}&am=${amount}&cu=INR`;
      QRCode.toDataURL(upiLink, { width: 300, margin: 2 })
        .then(setQrDataUrl)
        .catch(err => console.error("QR Generation Error:", err));
    }
  }, [step, amount]);

  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);

  // Initialize Pending Transaction
  const initiateTransaction = async (method: 'UPI' | 'CARD') => {
    try {
        setStep('PROCESSING');
        const token = localStorage.getItem('token');
        
        // 1. Calculate Amounts
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const taxAmount = subtotal * 0.05;
        const totalAmount = subtotal + taxAmount;

        // 2. Create Pending Order
        // Get active table from localStorage since we are inside modal context
        const activeTable = localStorage.getItem('activeTable') ? JSON.parse(localStorage.getItem('activeTable') || '{}') : null;
        
        const orderRes = await axios.post('http://localhost:3001/orders', {
            items: cart,
            total_amount: totalAmount,
            tax_amount: taxAmount,
            status: 'pending', 
            payment_method: method,
            table_id: activeTable?.id || null
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        const orderId = orderRes.data.orderId;
        setCurrentOrderId(orderId);

        // 3. Create Pending Payment
        await axios.post('http://localhost:3001/payment', {
            amount,
            method: method,
            transactionId: `TXN${Date.now()}`,
            orderId: orderId,
            status: 'pending'
        }, { headers: { Authorization: `Bearer ${token}` } });

        if (method === 'UPI') {
            setStep('QR');
        } else {
            // For CARD, we act as if terminal processed it instantly for now, or add Card step
            // For demo consistency, let's auto-complete card payments after a delay
            setTimeout(() => {
                 simulateSuccess(orderId);
            }, 2000);
        }

    } catch (err: any) {
        console.error("Init Error:", err);
        setErrorMsg('Failed to initialize transaction');
        setStep('SELECT'); // Go back
    }
  };

  // Poll for Payment Status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'QR' && currentOrderId) {
        interval = setInterval(async () => {
            try {
                const res = await axios.get(`http://localhost:3001/payment/status/${currentOrderId}`);
                if (res.data.status === 'success') {
                    handleSuccess(currentOrderId);
                }
            } catch (e) { console.error("Polling error", e); }
        }, 3000); // Poll every 3s
    }
    return () => clearInterval(interval);
  }, [step, currentOrderId]);

  // Handle Success Flow
  const handleSuccess = async (orderId: number) => {
      setStep('SUCCESS');
      setEmailStatus('SENDING');
      
      try {
          const response = await axios.post('http://localhost:3001/payment/receipt', {
            email, amount, items: cart
          });
          
          if (response.data.success) {
            setEmailStatus('SENT');
            if (response.data.previewUrl) setPreviewUrl(response.data.previewUrl);
          } else {
            setEmailStatus('ERROR');
          }
      } catch (e) { setEmailStatus('ERROR'); }
      
      setTimeout(onSuccess, 5000); 
  };
  
  // Dev Helper: Simulate Payment from "Customer"
  const simulateSuccess = async (orderId: number) => {
      try {
          const token = localStorage.getItem('token');
          await axios.patch(`http://localhost:3001/payment/status/${orderId}`, {
              status: 'success'
          }, { headers: { Authorization: `Bearer ${token}` } });
          // Polling will catch it, or if Card call handleSuccess directly
          if (step !== 'QR') handleSuccess(orderId);
      } catch (e) {
          console.error("Simulate error", e);
      }
  };

  const handleStartPayment = (method: 'UPI' | 'CARD') => {
    initiateTransaction(method);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card"
        style={{ maxWidth: '400px', width: '100%', position: 'relative' }}
      >
        {step !== 'PROCESSING' && (
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        )}

        {step === 'SELECT' && (
          <>
            <h2 style={{ marginBottom: '10px' }}>Select Payment</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Paying <span className="text-gradient" style={{ fontWeight: '700' }}>₹{amount}</span> as {email}</p>
            
              <div style={{ display: 'grid', gap: '15px' }}>
                <button 
                  onClick={() => handleStartPayment('UPI')}
                  className="btn-primary" 
                  style={{ 
                      background: '#f5f5f5', 
                      border: '1px solid var(--surface-border)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '15px', 
                      padding: '20px',
                      color: 'var(--text-main)' // Enable dark text
                  }}
                >
                  <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '12px', color: 'white' }}><QrCode size={20} /></div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '600', fontSize: '1rem' }}>UPI / QR Code</div>
                    <div style={{ fontSize: '0.85rem', color: '#666', fontWeight: '400' }}>Scan and pay instantly</div>
                  </div>
                </button>

                <button 
                  onClick={() => handleStartPayment('CARD')}
                  className="btn-primary" 
                  style={{ 
                      background: '#f5f5f5', 
                      border: '1px solid var(--surface-border)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '15px', 
                      padding: '20px',
                      color: 'var(--text-main)'
                  }}
                >
                  <div style={{ background: 'var(--secondary)', padding: '10px', borderRadius: '12px', color: 'white' }}><CreditCard size={20} /></div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '600', fontSize: '1rem' }}>Credit / Debit Card</div>
                    <div style={{ fontSize: '0.85rem', color: '#666', fontWeight: '400' }}>Visa, Mastercard, RuPay</div>
                  </div>
                </button>
              </div>
          </>
        )}

        {step === 'QR' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '20px' }}>Scan to Pay</h2>
            <div style={{ background: 'white', padding: '15px', borderRadius: '16px', display: 'inline-block', marginBottom: '20px' }}>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="UPI QR Code" style={{ width: '250px', height: '250px' }} />
              ) : (
                <div style={{ width: '250px', height: '250px', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                    <Loader2 className="animate-spin" />
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px', color: 'var(--primary)' }}>
                <Loader2 className="animate-spin" size={20} />
                <span style={{ fontWeight: '600' }}>Waiting for payment...</span>
            </div>
            
            {/* Simulation Button for Demo */}
            {currentOrderId && (
                <button 
                    onClick={() => simulateSuccess(currentOrderId)}
                    style={{ 
                        marginTop: '10px', 
                        background: 'transparent', 
                        border: '1px dashed #ccc', 
                        padding: '8px 12px', 
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        color: '#888',
                        cursor: 'pointer'
                    }}
                >
                    (Demo) Simulate Customer Payment
                </button>
            )}
          </div>
        )}

        {step === 'PROCESSING' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{ width: '60px', height: '60px', border: '4px solid var(--glass-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 24px' }}
            />
            <h2>Verifying Payment</h2>
            <p style={{ color: 'var(--text-muted)' }}>Connecting to secure gateway...</p>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ color: 'var(--success)', marginBottom: '20px' }}
            >
              <CheckCircle size={80} style={{ margin: '0 auto' }} />
            </motion.div>
            <h2 style={{ marginBottom: '10px' }}>Payment Confirmed!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Your transaction of ₹{amount} was successful.</p>
            
            <div style={{ 
                margin: '10px 0 20px 0', 
                padding: '16px', 
                borderRadius: '16px', 
                background: emailStatus === 'ERROR' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                border: `1px solid ${emailStatus === 'ERROR' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                textAlign: 'left'
            }}>
                <div style={{ marginTop: '2px' }}>
                    {emailStatus === 'SENDING' && <Loader2 className="animate-spin" size={18} style={{ color: 'var(--primary)' }} />}
                    {emailStatus === 'SENT' && <CheckCircle size={18} style={{ color: 'var(--success)' }} />}
                    {emailStatus === 'ERROR' && <AlertCircle size={18} style={{ color: 'var(--error)' }} />}
                </div>
                
                <div style={{ flex: 1 }}>
                   <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', color: emailStatus === 'ERROR' ? 'var(--error)' : 'var(--text-main)' }}>
                    {emailStatus === 'SENDING' && 'Mailing Receipt...'}
                    {emailStatus === 'SENT' && 'Receipt Sent!'}
                    {emailStatus === 'ERROR' && 'Receipt Email Issue'}
                   </p>
                   <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {emailStatus === 'SENT' && !previewUrl && `A copy has been sent to ${email}`}
                    {emailStatus === 'SENT' && previewUrl && `Testing receipt generated! Click below to view.`}
                    {emailStatus === 'ERROR' && errorMsg}
                    {emailStatus === 'SENDING' && `Sending PDF to ${email}...`}
                   </p>
                </div>
            </div>

            {previewUrl && (
                <a 
                    href={previewUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ marginBottom: '12px', background: 'var(--success)', display: 'block', textDecoration: 'none' }}
                >
                    View Testing Receipt 📄
                </a>
            )}
            
            <button onClick={onSuccess} className="btn-primary" style={{ padding: '12px', fontSize: '0.9rem' }}>
              Done, Return to POS
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
