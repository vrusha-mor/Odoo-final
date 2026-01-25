import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, LogOut, Settings, User, Mic } from 'lucide-react';

export default function Navbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('user_email') || 'User';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const MENU_STRUCTURE = {
    Orders: ['Orders', 'Payment', 'Customer'],
    Products: ['Products', 'Category'],
    Reporting: ['Dashboard'],
  };

  return (
    <nav className="nav-top">
      {/* LOGO */}
      <div
        className="text-gradient"
        style={{ fontWeight: 800, fontSize: '1.4rem', cursor: 'pointer' }}
        onClick={() => navigate('/dashboard')}
      >
        Odoo Cafe
      </div>

      {/* NAV LINKS */}
      <div className="nav-links">
        {Object.entries(MENU_STRUCTURE).map(([category, items]) => (
          <div
            key={category}
            className="nav-item-container"
            onMouseEnter={() => setActiveMenu(category)}
            onMouseLeave={() => setActiveMenu(null)}
            style={{ position: 'relative' }}
          >
            <div className={`nav-item ${activeMenu === category ? 'active' : ''}`}>
              {category}
              <ChevronDown size={14} style={{ marginLeft: 6, opacity: 0.5 }} />
            </div>

            {activeMenu === category && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="dropdown-menu"
              >
                {items.map(item => (
                  <NavLink
                    key={item}
                    to={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="dropdown-item"
                    onClick={() => setActiveMenu(null)}
                  >
                    {item}
                  </NavLink>
                ))}
              </motion.div>
            )}
          </div>
        ))}

        {/* 🎤 VOICE BOOKING */}
        <button
          onClick={() => navigate('/voice-booking')}
          className="nav-item"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 600,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Mic size={16} /> Voice Booking
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
          <User size={18} /> {userEmail}
        </div>

        <button
          onClick={() => navigate('/settings')}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Settings size={20} />
        </button>

        <button
          onClick={handleLogout}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}
