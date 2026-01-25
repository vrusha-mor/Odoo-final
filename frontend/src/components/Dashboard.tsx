import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Play, Settings as SettingsIcon, Monitor, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState<number | null>(null);
  const [stats, setStats] = useState({ lastOpened: 'Loading...', dailySales: '₹0' });

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:3001/dashboard/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const date = new Date(res.data.lastOpened);
            const formattedDate = date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            setStats({
                lastOpened: formattedDate,
                dailySales: '₹' + (res.data.dailySales || 0)
            });
        } catch (err) {
            console.error("Error fetching stats", err);
        }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const terminals = [
    { id: 1, name: 'Odoo Cafe', lastOpen: stats.lastOpened, lastSell: stats.dailySales }
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      
      <div style={{ padding: '40px' }}>
        <h1 style={{ marginBottom: '30px', fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>Dashboard</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '30px' }}>
          {terminals.map(terminal => (
            <motion.div 
              key={terminal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card terminal-card"
              style={{ padding: '0', display: 'flex', flexDirection: 'column', position: 'relative' }}
            >
              <div style={{ padding: '30px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--primary)' }}>{terminal.name}</h2>
                  <div style={{ position: 'relative' }}>
                    <button 
                        onClick={() => setShowMenu(showMenu === terminal.id ? null : terminal.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px' }}
                    >
                        <MoreVertical size={24} />
                    </button>

                    {showMenu === terminal.id && (
                        <div className="dropdown-menu" style={{ top: '35px', right: '0', left: 'auto', width: '200px', borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
                            <div className="dropdown-item" onClick={() => navigate('/settings')}><SettingsIcon size={16} style={{ marginRight: '10px' }} /> Settings</div>
                            <div className="dropdown-item" onClick={() => navigate('/kitchen')}><Monitor size={16} style={{ marginRight: '10px' }} /> Kitchen Display</div>
                            <div className="dropdown-item" onClick={() => navigate('/pos')}><Users size={16} style={{ marginRight: '10px' }} /> Customer Display</div>
                        </div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                   <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '12px' }}>
                     <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>Last opened</p>
                     <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>{terminal.lastOpen}</p>
                   </div>
                   <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '12px' }}>
                     <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>Last Sales</p>
                     <p style={{ fontWeight: '600', color: 'var(--success)' }}>{terminal.lastSell}</p>
                   </div>
                </div>
              </div>

              <div style={{ padding: '20px 30px', background: '#fafafa', borderTop: '1px solid var(--surface-border)', borderRadius: '0 0 20px 20px' }}>
                <button 
                    onClick={() => navigate('/floor-plan')}
                    className="btn-primary" 
                    style={{ width: 'auto', padding: '12px 30px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)' }}
                >
                  <Play size={18} fill="white" /> Open Session
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
