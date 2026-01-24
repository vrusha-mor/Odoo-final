import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

export default function Settings() {
  const navigate = useNavigate();
  const [terminalName, setTerminalName] = useState('Odoo Cafe');
  const [showNewPopup, setShowNewPopup] = useState(false);
  const [newName, setNewName] = useState('');
  
  // Payment States
  const [isCashEnabled, setIsCashEnabled] = useState(true);
  const [isDigitalEnabled, setIsDigitalEnabled] = useState(true);
  const [isUPIEnabled, setIsUPIEnabled] = useState(true);
  const [upiId, setUpiId] = useState('aryankhandare2005@okicici');

  // Load persistence
  useEffect(() => {
    const savedUpi = localStorage.getItem('pos_upi_id');
    if (savedUpi) setUpiId(savedUpi);
    
    const savedName = localStorage.getItem('pos_terminal_name');
    if (savedName) setTerminalName(savedName);
  }, []);

  const handleSave = () => {
    localStorage.setItem('pos_upi_id', upiId);
    localStorage.setItem('pos_terminal_name', terminalName);
    alert('Settings Saved Successfully!');
    navigate('/dashboard');
  };

  const createTerminal = () => {
    if (newName) {
       setTerminalName(newName);
       localStorage.setItem('pos_terminal_name', newName);
       setShowNewPopup(false);
       setNewName('');
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <ChevronLeft size={30} />
            </button>
            <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>
                Point of Sale <span style={{ color: 'var(--text-muted)', margin: '0 15px', fontWeight: '300' }}>/</span> 
                <span className="text-gradient">{terminalName}</span>
            </h1>
            <button 
                onClick={() => setShowNewPopup(true)}
                className="btn-primary" 
                style={{ width: 'auto', marginLeft: 'auto', padding: '10px 24px', borderRadius: '10px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <Plus size={18} /> New
            </button>
        </div>

        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 30px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Terminal Configuration</h3>
                <button onClick={handleSave} className="btn-primary" style={{ width: 'auto', padding: '8px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Save size={16} /> Save Changes
                </button>
            </div>

            <div style={{ padding: '40px' }}>
                <div className="setting-section">
                    <h4 style={{ marginBottom: '20px', opacity: 0.8 }}>Payment Methods</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                        <div>
                            <label className="checkbox-group">
                                <input type="checkbox" checked={isCashEnabled} onChange={(e) => setIsCashEnabled(e.target.checked)} />
                                <span>Cash</span>
                            </label>
                            <label className="checkbox-group">
                                <input type="checkbox" checked={isDigitalEnabled} onChange={(e) => setIsDigitalEnabled(e.target.checked)} />
                                <span>Digital (Bank, Card)</span>
                            </label>
                            <label className="checkbox-group">
                                <input type="checkbox" checked={isUPIEnabled} onChange={(e) => setIsUPIEnabled(e.target.checked)} />
                                <span>QR Payment (UPI)</span>
                            </label>
                        </div>

                        {isUPIEnabled && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="input-group" 
                                style={{ margin: '0' }}
                            >
                                <label>UPI ID</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g: 123@ybl.com" 
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>This ID will be used to generate payment QR codes.</p>
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="setting-section">
                   <h4 style={{ marginBottom: '20px', opacity: 0.8 }}>Interface Options</h4>
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Configure kitchen and customer display settings (Coming soon).</p>
                </div>
            </div>
        </div>
      </div>

      {/* New Terminal Popup */}
      <AnimatePresence>
        {showNewPopup && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="glass-card" 
               style={{ maxWidth: '400px' }}
             >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h2>Create Terminal</h2>
                    <button onClick={() => setShowNewPopup(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20}/></button>
                </div>
                
                <div className="input-group">
                    <label>Terminal Name</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Odoor Cafe" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        autoFocus
                    />
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                    <button onClick={createTerminal} className="btn-primary">Save</button>
                    <button onClick={() => setShowNewPopup(false)} className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>Discard</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
