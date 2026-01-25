import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, DollarSign, CreditCard, QrCode } from 'lucide-react';
import axios from 'axios';
import Navbar from '../Navbar';

type PaymentGroup = {
  method: string;
  icon: any;
  total: number;
  transactions: Array<{ date: string, amount: number }>;
};

const ICON_MAP: { [key: string]: any } = {
    'Card': CreditCard,
    'Cash': DollarSign,
    'UPI': QrCode
};

export default function Payments() {
  const [paymentGroups, setPaymentGroups] = useState<PaymentGroup[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3001/payment', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const groups: { [key: string]: PaymentGroup } = {};
      
      res.data.forEach((p: any) => {
        const method = p.method_name || 'Cash';
        if (!groups[method]) {
          groups[method] = {
            method,
            icon: ICON_MAP[method] || DollarSign,
            total: 0,
            transactions: []
          };
        }
        
        const amount = parseFloat(p.amount) || 0;
        groups[method].total += amount;
        groups[method].transactions.push({
            date: new Date(p.created_at).toLocaleString('en-IN', { 
                day: '2-digit', month: 'short', year: '2-digit', 
                hour: '2-digit', minute: '2-digit' 
            }),
            amount
        });
      });
      
      const sortedGroups = Object.values(groups).sort((a, b) => b.total - a.total);
      setPaymentGroups(sortedGroups);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const toggleExpand = (method: string) => {
    setExpanded(prev => 
      prev.includes(method) ? prev.filter(x => x !== method) : [...prev, method]
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />

      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '30px', color: 'var(--text-main)' }}>Payment History</h1>

        <div style={{ 
            background: 'var(--surface)', 
            borderRadius: '16px', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            border: '1px solid var(--surface-border)',
            overflow: 'hidden'
        }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9fafb', borderBottom: '1px solid var(--surface-border)' }}>
                    <tr>
                        <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>Payment Method</th>
                        <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>Transactions</th>
                        <th style={{ padding: '20px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>Total Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading payments...</td></tr>
                    ) : paymentGroups.length === 0 ? (
                        <tr><td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No payments found</td></tr>
                    ) : paymentGroups.map((group: PaymentGroup) => {
                        const isExpanded = expanded.includes(group.method);
                        return (
                            <React.Fragment key={group.method}>
                                <tr 
                                    onClick={() => toggleExpand(group.method)}
                                    style={{ 
                                        borderBottom: '1px solid var(--surface-border)', 
                                        cursor: 'pointer', 
                                        background: isExpanded ? '#f3f4f6' : 'transparent',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <td style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        {isExpanded ? <ChevronDown size={18} color="var(--text-muted)" /> : <ChevronRight size={18} color="var(--text-muted)" />}
                                        <div style={{ 
                                            padding: '10px', 
                                            background: 'white', 
                                            borderRadius: '10px', 
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                            color: 'var(--primary)'
                                        }}>
                                            <group.icon size={20} />
                                        </div>
                                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{group.method}</span>
                                    </td>
                                    <td style={{ padding: '20px', color: 'var(--text-muted)' }}>
                                        {group.transactions.length} record{group.transactions.length !== 1 ? 's' : ''}
                                    </td>
                                    <td style={{ padding: '20px', textAlign: 'right', fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-main)' }}>
                                        ₹{group.total.toLocaleString()}
                                    </td>
                                </tr>
                                
                                <AnimatePresence>
                                    {isExpanded && (
                                        <tr>
                                            <td colSpan={3} style={{ padding: 0, borderBottom: '1px solid var(--surface-border)' }}>
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <table style={{ width: '100%', background: '#f9fafb' }}>
                                                        <tbody>
                                                            {group.transactions.map((tx, idx) => (
                                                                <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                                                    <td style={{ padding: '12px 20px 12px 80px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                                       transaction #{idx + 1}
                                                                    </td>
                                                                    <td style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                                        {tx.date}
                                                                    </td>
                                                                    <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: '500', color: 'var(--text-main)' }}>
                                                                        ₹{tx.amount.toLocaleString()}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </motion.div>
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
