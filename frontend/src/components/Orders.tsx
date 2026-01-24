import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Archive, X } from 'lucide-react';
import axios from 'axios';
import Navbar from './Navbar';

type Order = {
  id: string;
  orderNo: string;
  session: string;
  date: string;
  total: number;
  customer: string;
  status: 'Draft' | 'Paid';
  items: Array<{ name: string, qty: number, amount: number, tax: string, uom: string }>;
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3001/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const mappedOrders: Order[] = res.data.map((o: any) => ({
        id: o.id.toString(),
        orderNo: o.id.toString().padStart(3, '0'),
        session: o.session_id?.toString().padStart(2, '0') || '01',
        date: new Date(o.dates || o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        total: parseFloat(o.total_amount) || 0,
        customer: o.customer_name || 'Walk-in',
        status: o.status === 'Paid' ? 'Paid' : 'Draft',
        items: [] // Will fetch on details
      }));
      
      setOrders(mappedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrderDetails = async (order: Order) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3001/orders/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const detailedOrder: Order = {
        ...order,
        items: res.data.items.map((item: any) => ({
          name: item.product_name || 'Product',
          qty: item.quantity || 1,
          amount: parseFloat(item.unit_price || item.total_price / item.quantity) || 0,
          tax: '5%',
          uom: 'Unit'
        }))
      };
      setActiveOrder(detailedOrder);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setActiveOrder(order); // Fallback to basic info
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const updateStatus = (id: string, status: 'Draft' | 'Paid') => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    if (activeOrder?.id === id) {
      setActiveOrder(prev => prev ? { ...prev, status } : null);
    }
  };

  const deleteSelected = () => {
    if (confirm(`Are you sure you want to delete ${selectedOrders.length} orders?`)) {
        setOrders(prev => prev.filter(o => !selectedOrders.includes(o.id)));
        setSelectedOrders([]);
    }
  };

  const archiveSelected = () => {
    alert(`${selectedOrders.length} orders have been archived!`);
    setSelectedOrders([]);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      
      <div style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Orders</h1>
            
            {selectedOrders.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600' }}>{selectedOrders.length} Selected</span>
                    <div className="glass-card" style={{ padding: '8px 15px', display: 'flex', gap: '15px', borderRadius: '12px' }}>
                        <button onClick={archiveSelected} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                            <Archive size={16} /> Archive
                        </button>
                        <button onClick={deleteSelected} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                            <Trash2 size={16} /> Delete
                        </button>
                    </div>
                </div>
            )}
        </div>

        <div className="glass-card table-card" style={{ padding: '0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--surface-border)' }}>
                    <tr>
                        <th style={{ padding: '20px', textAlign: 'left', width: '50px' }}>
                             <input type="checkbox" onChange={(e) => setSelectedOrders(e.target.checked ? orders.map((o: Order) => o.id) : [])} />
                        </th>
                        <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '500' }}>Order No</th>
                        <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '500' }}>Session</th>
                        <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '500' }}>Date</th>
                        <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '500' }}>Total</th>
                        <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '500' }}>Customer</th>
                        <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '500' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading orders...</td></tr>
                    ) : orders.length === 0 ? (
                        <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No orders found</td></tr>
                    ) : orders.map(order => (
                        <tr 
                            key={order.id} 
                            onClick={() => fetchOrderDetails(order)}
                            style={{ borderBottom: '1px solid var(--surface-border)', cursor: 'pointer', transition: 'background 0.2s' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                            <td style={{ padding: '20px' }} onClick={(e) => e.stopPropagation()}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedOrders.includes(order.id)} 
                                    onChange={() => toggleSelect(order.id)}
                                />
                            </td>
                            <td style={{ padding: '20px', fontWeight: '600' }}>{order.orderNo}</td>
                            <td style={{ padding: '20px' }}>{order.session}</td>
                            <td style={{ padding: '20px' }}>{order.date}</td>
                            <td style={{ padding: '20px', fontWeight: '700' }} className="text-gradient">₹{order.total}</td>
                            <td style={{ padding: '20px' }}>{order.customer}</td>
                            <td style={{ padding: '20px' }}>
                                <span style={{ 
                                    padding: '6px 12px', 
                                    borderRadius: '8px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: '700',
                                    background: order.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                    color: order.status === 'Paid' ? 'var(--success)' : 'var(--primary)',
                                    border: `1px solid ${order.status === 'Paid' ? 'var(--success)' : 'var(--primary)'}44`
                                }}>
                                    {order.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Order Detail View */}
      <AnimatePresence>
        {activeOrder && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
             <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{ width: '100%', maxWidth: '900px', background: 'var(--background)', borderLeft: '1px solid var(--surface-border)', overflowY: 'auto' }}
             >
                {/* Detail Header */}
                <div style={{ padding: '30px 40px', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <button onClick={() => setActiveOrder(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
                        <h2 style={{ fontSize: '1.5rem' }}>Order {activeOrder.orderNo}</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={() => updateStatus(activeOrder.id, 'Draft')}
                            style={{ padding: '8px 20px', borderRadius: '8px', background: activeOrder.status === 'Draft' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer' }}
                        >
                            Draft
                        </button>
                        <button 
                            onClick={() => updateStatus(activeOrder.id, 'Paid')}
                            style={{ padding: '8px 20px', borderRadius: '8px', background: activeOrder.status === 'Paid' ? 'var(--success)' : 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer' }}
                        >
                            Paid
                        </button>
                    </div>
                </div>

                {/* Detail Body */}
                <div style={{ padding: '40px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order number</label>
                                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{activeOrder.orderNo}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date</label>
                                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{activeOrder.date}</p>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Session</label>
                                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{activeOrder.session}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer</label>
                                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{activeOrder.customer}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--surface-border)' }}>
                            <div style={{ padding: '10px 20px', borderBottom: '2px solid var(--primary)', color: 'var(--primary)', fontWeight: '600' }}>Product</div>
                            <div style={{ padding: '10px 20px', color: 'var(--text-muted)' }}>Extra Info</div>
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                        <thead style={{ borderBottom: '1px solid var(--surface-border)' }}>
                            <tr>
                                <th style={{ padding: '15px 0', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '500' }}>Product</th>
                                <th style={{ padding: '15px 0', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '500' }}>QTY</th>
                                <th style={{ padding: '15px 0', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '500' }}>Amount</th>
                                <th style={{ padding: '15px 0', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '500' }}>Tax</th>
                                <th style={{ padding: '15px 0', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '500' }}>UOM</th>
                                <th style={{ padding: '15px 0', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '500' }}>Sub-Total</th>
                                <th style={{ padding: '15px 0', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '500' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeOrder.items.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                    <td style={{ padding: '15px 0', color: '#60a5fa' }}>{item.name} --&gt;</td>
                                    <td style={{ padding: '15px 0', textAlign: 'right' }}>{item.qty}</td>
                                    <td style={{ padding: '15px 0', textAlign: 'right' }}>₹{item.amount}</td>
                                    <td style={{ padding: '15px 0', textAlign: 'right' }}>{item.tax}</td>
                                    <td style={{ padding: '15px 0', textAlign: 'right' }}>{item.uom}</td>
                                    <td style={{ padding: '15px 0', textAlign: 'right' }}>₹{item.qty * item.amount}</td>
                                    <td style={{ padding: '15px 0', textAlign: 'right' }}>₹{(item.qty * item.amount * 1.05).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: '300px', display: 'grid', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Total w/t:</span>
                                <span>₹{(activeOrder.total * 0.95).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Tax:</span>
                                <span>₹{(activeOrder.total * 0.05).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--surface-border)', paddingTop: '15px' }}>
                                <span style={{ fontWeight: '600' }}>Final Total:</span>
                                <span style={{ fontWeight: '700', fontSize: '1.4rem' }} className="text-gradient">₹{activeOrder.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
