import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Search, Plus, List as ListIcon, X, ChevronDown } from 'lucide-react';
import axios from 'axios';
import Navbar from './Navbar';

type Customer = {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  total_sales: number;
};

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<Partial<Customer>>({});

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3001/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
          ...activeCustomer,
          street1: activeCustomer.street1 || '',
          street2: activeCustomer.street2 || '',
      };

      console.log('Sending payload:', payload);

      if (activeCustomer.id) {
        await axios.put(`http://localhost:3001/customers/${activeCustomer.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:3001/customers', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsEditing(false);
      fetchCustomers();
    } catch (err: any) {
      console.error('Error saving customer:', err);
      alert(`Error saving customer: ${err.response?.data?.message || err.message}`);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <div style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button 
                  onClick={() => { setActiveCustomer({}); setIsEditing(true); }}
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}
                >
                    <Plus size={18} /> New
                </button>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Customer</h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div className="glass-card" style={{ padding: '5px 15px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '10px', width: '300px' }}>
                    <Search size={18} style={{ opacity: 0.5 }} />
                    <input 
                      type="text" 
                      placeholder="Search Customer..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ background: 'none', border: 'none', color: 'white', outline: 'none', width: '100%', padding: '8px 0' }}
                    />
                </div>
                <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
                    <ListIcon size={20} />
                </button>
            </div>
        </div>

        <div className="glass-card table-card" style={{ padding: '0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--surface-border)' }}>
                    <tr>
                        <th style={{ padding: '20px', textAlign: 'left', width: '50px' }}>
                             <input type="checkbox" />
                        </th>
                        <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '500' }}>Name</th>
                        <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '500' }}>Contact</th>
                        <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '500' }}>Total Sales</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading customers...</td></tr>
                    ) : filteredCustomers.length === 0 ? (
                        <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No customers found</td></tr>
                    ) : filteredCustomers.map(customer => (
                        <tr 
                          key={customer.id} 
                          onClick={() => { setActiveCustomer(customer); setIsEditing(true); }}
                          style={{ borderBottom: '1px solid var(--surface-border)', cursor: 'pointer', transition: 'background 0.2s' }}
                          className="table-row-hover"
                        >
                            <td style={{ padding: '20px' }} onClick={(e) => e.stopPropagation()}>
                                <input type="checkbox" />
                            </td>
                            <td style={{ padding: '20px', fontWeight: '600' }}>{customer.name}</td>
                            <td style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                        <div style={{ padding: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}><Mail size={12} /></div>
                                        {customer.email}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', opacity: 0.7 }}>
                                        <div style={{ padding: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}><Phone size={12} /></div>
                                        {customer.phone}
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '20px', fontWeight: '700', fontSize: '1.1rem' }}>₹{customer.total_sales.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      <AnimatePresence>
        {isEditing && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card" 
              style={{ width: '100%', maxWidth: '600px', padding: '40px', position: 'relative' }}
            >
                <button onClick={() => setIsEditing(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.5 }}>
                    <X size={24} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <button style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>New</button>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Customer</h2>
                </div>

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '0', top: '-10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>e.g Eric Smith</span>
                        <input 
                          type="text" 
                          placeholder="Name"
                          required
                          value={activeCustomer.name || ''}
                          onChange={(e) => setActiveCustomer({...activeCustomer, name: e.target.value})}
                          style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', padding: '10px 0', color: 'white', fontSize: '1.1rem', outline: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                            <Mail size={18} style={{ opacity: 0.5 }} />
                            <input 
                              type="email" 
                              placeholder="Email"
                              value={activeCustomer.email || ''}
                              onChange={(e) => setActiveCustomer({...activeCustomer, email: e.target.value})}
                              style={{ width: '100%', background: 'none', border: 'none', padding: '10px 0', color: 'white', outline: 'none' }}
                            />
                        </div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                            <Phone size={18} style={{ opacity: 0.5 }} />
                            <input 
                              type="text" 
                              placeholder="Phone"
                              value={activeCustomer.phone || ''}
                              onChange={(e) => setActiveCustomer({...activeCustomer, phone: e.target.value})}
                              style={{ width: '100%', background: 'none', border: 'none', padding: '10px 0', color: 'white', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Address</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input 
                              type="text" 
                              placeholder="St, 1"
                              value={activeCustomer.street1 || ''}
                              onChange={(e) => setActiveCustomer({...activeCustomer, street1: e.target.value})}
                              style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '8px 0', color: 'white', outline: 'none' }}
                            />
                            <input 
                              type="text" 
                              placeholder="St, 2"
                              value={activeCustomer.street2 || ''}
                              onChange={(e) => setActiveCustomer({...activeCustomer, street2: e.target.value})}
                              style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '8px 0', color: 'white', outline: 'none' }}
                            />
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <input 
                                  type="text" 
                                  placeholder="City"
                                  value={activeCustomer.city || ''}
                                  onChange={(e) => setActiveCustomer({...activeCustomer, city: e.target.value})}
                                  style={{ flex: 1, background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '8px 0', color: 'white', outline: 'none' }}
                                />
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <select 
                                      value={activeCustomer.state || ''}
                                      onChange={(e) => setActiveCustomer({...activeCustomer, state: e.target.value})}
                                      style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '8px 0', color: 'white', outline: 'none', appearance: 'none' }}
                                    >
                                        <option value="" disabled style={{ color: 'black' }}>State</option>
                                        {STATES.map(s => <option key={s} value={s} style={{ color: 'black' }}>{s}</option>)}
                                    </select>
                                    <ChevronDown size={14} style={{ position: 'absolute', right: '0', top: '12px', opacity: 0.5, pointerEvents: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <input 
                                  type="text" 
                                  placeholder="Country"
                                  value={activeCustomer.country || 'India'}
                                  onChange={(e) => setActiveCustomer({...activeCustomer, country: e.target.value})}
                                  style={{ flex: 1, background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '8px 0', color: 'white', outline: 'none' }}
                                />
                                <input 
                                  type="text" 
                                  placeholder="Zip Code"
                                  value={activeCustomer.zip_code || ''}
                                  onChange={(e) => setActiveCustomer({...activeCustomer, zip_code: e.target.value})}
                                  style={{ flex: 1, background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '8px 0', color: 'white', outline: 'none' }}
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                      type="submit"
                      style={{ marginTop: '30px', background: 'var(--primary)', color: 'white', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 20px rgba(255,107,107,0.2)' }}
                    >
                        {activeCustomer.id ? 'Update Customer' : 'Create Customer'}
                    </button>
                    {activeCustomer.id && (
                        <button 
                          type="button"
                          onClick={() => { setActiveCustomer({}); setIsEditing(false); }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    )}
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
