import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Facebook, Twitter, Chrome, CheckCircle, Circle } from 'lucide-react';
import axios from 'axios';
import '../styles/Auth.css';

// Assets
import pizzaLogo from '../assets/pizza_logo.png';
import pizzaBg from '../assets/auth_bg_custom.jpg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user_email', res.data.email);
      localStorage.setItem('role', res.data.role.toString());

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="bg-text">Login</div>
      
      {/* Background Asset */}
      <img src={pizzaBg} alt="" className="auth-bg-overlay" />

      <div className="auth-card">
        <div className="logo-container">
          <img src={pizzaLogo} alt="Italian Pizza" className="auth-logo" />
        </div>

        <div className="auth-header">
          <h2>Login</h2>
          <p>More than <span className="highlight-text">35,000 recipes</span> from around the world!</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p style={{ color: '#e91e63', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</p>}
          
          <div className="input-field" style={{ marginBottom: email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '30px' : '20px' }}>
            <Mail className="input-icon" size={18} />
            <input 
              type="email" 
              placeholder="Enter Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            {email.length > 0 && (
                <div style={{ position: 'absolute', left: '0', bottom: '-22px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px', color: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'var(--success)' : 'var(--error)' }}>
                    {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? <CheckCircle size={12} /> : <Circle size={12} />}
                    <span>{/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Valid email address' : 'Invalid email address'}</span>
                </div>
            )}
          </div>

          <div className="input-field">
            <Lock className="input-icon" size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <div className="input-action" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>

          <div className="options-row">
            <label className="remember-me">
              <input type="checkbox" style={{ accentColor: '#e91e63' }} />
              Remember me
            </label>
            <a href="#" className="forgot-link">Forgot Password?</a>
          </div>

          <button type="submit" className="btn-login">
            Login
          </button>
        </form>

        <div className="divider">
          <span>Login with</span>
        </div>

        <div className="social-login">
          <Facebook className="social-icon" style={{ color: '#1877F2' }} />
          <Chrome className="social-icon" style={{ color: '#EA4335' }} />
          <Twitter className="social-icon" style={{ color: '#1DA1F2' }} />
        </div>

        <p className="signup-prompt">
          Don't have an account? <Link to="/signup" className="signup-link">Sign up</Link>
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
