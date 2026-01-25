import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, UserPlus, CheckCircle, Circle, User } from 'lucide-react';
import axios from 'axios';
import '../styles/Auth.css';

import pizzaLogo from '../assets/logo.png';
import pizzaBg from '../assets/auth_bg_custom.jpg';

const API_BASE = "http://localhost:3001";

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState(2); // Default to Cashier
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation States
  const [validations, setValidations] = useState({
      email: false,
      minLength: false,
      hasUpper: false,
      hasLower: false,
      hasNumber: false
  });

  useEffect(() => {
    setValidations({
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        minLength: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password)
    });
  }, [email, password]);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Block submit if invalid
    if (!validations.email || !validations.minLength || !validations.hasUpper || !validations.hasLower || !validations.hasNumber) {
        // Allow partial submit? User requested validation display, likely blocking.
        // But for UX, usually disable button or show error.
        // Let's assume validation display is enough, but to be safe:
        if(!validations.email) return setError("Invalid email address");
        return setError("Please satisfy all password requirements");
    }

    setLoading(true);

    try {
      await axios.post(`${API_BASE}/auth/signup`, {
        name,
        email,
        password,
        role_id: roleId 
      });

      // Go to OTP page
      navigate('/verify-otp', { state: { email } });

    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const ValidationItem = ({ valid, text }: { valid: boolean, text: string }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: valid ? 'var(--success)' : 'var(--text-muted)', marginTop: '4px' }}>
          {valid ? <CheckCircle size={14} /> : <Circle size={14} />}
          <span>{text}</span>
      </div>
  );

  return (
    <div className="auth-page">
      <img src={pizzaBg} alt="" className="auth-bg-overlay" />

      <div className="auth-card" style={{ maxWidth: '400px', padding: '30px' }}>
        <div className="logo-container">
          <img src={pizzaLogo} alt="Logo" className="auth-logo" />
        </div>

        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Signup to continue to POS system</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p className="error-text">{error}</p>}

          {/* Name Field */}
          <div className="input-field">
            <User className="input-icon" size={18} />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email Field */}
          <div className="input-field" style={{ marginBottom: '25px' }}>
            <Mail className="input-icon" size={18} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
             {email.length > 0 && (
                <div style={{ position: 'absolute', left: '0', bottom: '-22px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                     <ValidationItem valid={validations.email} text="Valid email address" />
                </div>
            )}
          </div>

          {/* Password Field */}
          <div className="input-field">
            <Lock className="input-icon" size={18} />
            <input
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <span className="input-action" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

            <div style={{ margin: '-10px 0 20px 10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <ValidationItem valid={validations.minLength} text="At least 8 characters" />
                <ValidationItem valid={validations.hasUpper} text="One uppercase letter" />
                <ValidationItem valid={validations.hasLower} text="One lowercase letter" />
                <ValidationItem valid={validations.hasNumber} text="One number" />
            </div>

          {/* Role Selection */}
          <div className="input-field" style={{ padding: '0 15px' }}>
              <UserPlus className="input-icon" size={18} />
              <select 
                value={roleId}
                onChange={(e) => setRoleId(Number(e.target.value))}
                style={{ 
                    width: '100%',
                    background: 'transparent', 
                    border: 'none', 
                    color: 'var(--text-main)', 
                    outline: 'none', 
                    padding: '16px 0 16px 30px', /* padding left for icon space */
                    fontSize: '1rem',
                    cursor: 'pointer'
                }}
              >
                  <option value="2">Cashier</option>
                  <option value="3">Kitchen Display</option>
                  <option value="1">Admin</option>
              </select>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Sending OTP...' : 'SIGN UP'}
          </button>
        </form>

        <p className="signup-prompt">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
