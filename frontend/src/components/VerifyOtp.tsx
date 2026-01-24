import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, Facebook, Twitter, Chrome, ArrowLeft } from 'lucide-react';
import '../styles/Auth.css';

// Assets
import pizzaLogo from '../assets/pizza_logo.png';
import pizzaBg from '../assets/auth_bg_custom.jpg';

const API_BASE = "http://localhost:3001";

export default function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || 'your email';

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/auth/verify-otp`, {
        email,
        otp,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user_email', email);
      localStorage.setItem('role', res.data.role.toString());

      navigate('/dashboard');

    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    }
  };

  return (
    <div className="auth-page">
      <div className="bg-text">Verify</div>
      
      {/* Background Asset */}
      <img src={pizzaBg} alt="" className="auth-bg-overlay" />

      <div className="auth-card">
        <div className="logo-container">
          <img src={pizzaLogo} alt="Italian Pizza" className="auth-logo" />
        </div>

        <div className="auth-header">
          <h2>Verify OTP</h2>
          <p>Enter the code sent to <span className="highlight-text">{email}</span></p>
        </div>

        <form onSubmit={verifyOtp}>
          {error && <p style={{ color: '#e91e63', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</p>}
          
          <div className="input-field">
            <KeyRound className="input-icon" size={18} />
            <input 
              type="text" 
              placeholder="Enter 6-digit OTP" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required 
              maxLength={6}
            />
          </div>

          <button type="submit" className="btn-login" style={{ marginTop: '20px' }}>
            Verify & Proceed
          </button>
        </form>

        <div className="divider">
          <span>Or</span>
        </div>

        <div className="social-login">
           {/* Reusing social icons for visual consistency even if not functional for OTP */}
          <Facebook className="social-icon" style={{ color: '#1877F2' }} />
          <Chrome className="social-icon" style={{ color: '#EA4335' }} />
          <Twitter className="social-icon" style={{ color: '#1DA1F2' }} />
        </div>

        <p className="signup-prompt">
          Wrong email? <Link to="/signup" className="signup-link">Go back</Link>
        </p>
      </div>

      <footer className="auth-footer">
        <div className="footer-links">
          <a href="#">Explore</a>
          <a href="#">What</a>
          <a href="#">Help & Feedback</a>
          <a href="#">Contact</a>
        </div>
        <div className="footer-copy">
          <div style={{ display: 'flex', gap: '15px' }}>
            <Facebook size={14} />
            <Chrome size={14} />
            <Twitter size={14} />
          </div>
          <p>2023 Company. All rights and Copy rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
