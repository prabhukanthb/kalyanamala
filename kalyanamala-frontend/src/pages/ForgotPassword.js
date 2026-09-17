import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const ForgotPassword = () => {
  const [emailOrPhone,setEmailOrPhone] = useState('');
  const [error,setError] = useState('');
  const [result,setResult] = useState(null);
  const [loading,setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await authService.forgotPassword({ emailOrPhone: emailOrPhone.trim() });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={box}>
      <div style={kicker}>New Kalyanamala</div>
      <h2 style={title}>Forgot password</h2>
      <p style={{ color: '#555', lineHeight: 1.5 }}>
        Enter your registered email or mobile number. If it matches an account, the password
        is reset to the default: first 4 letters of your name, then @, then the last 4 digits
        of your registered mobile. We email or SMS it when that is configured; otherwise contact admin.
      </p>
      {error && <div style={errorBox}>{error}</div>}
      {result && (
        <div style={okBox}>
          <div>{result.message}</div>
          {result.passwordHint && (
            <div style={{ marginTop: 8 }}>
              Default password format: <strong>{result.passwordHint}</strong>
            </div>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label>Registered email or mobile</label>
        <input
          style={input}
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          required
        />
        <button style={button} disabled={loading}>{loading ? 'Checking…' : 'Reset password'}</button>
      </form>
      <p onClick={() => navigate('/login')} style={linkStyle}>Back to login</p>
      </div>
    </div>
  );
};

const page = { minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 16px' };
const box = { maxWidth: '420px', width: '100%', padding: '28px 26px', borderRadius: 14, background: '#fff', boxShadow: '0 12px 32px rgba(92,16,40,0.08)', borderTop: '4px solid #C9A227' };
const kicker = { fontSize: 12, letterSpacing: 1.6, textTransform: 'uppercase', color: '#C9A227' };
const title = { fontFamily: 'Georgia, serif', color: '#8B1E3F', margin: '6px 0 18px' };
const input = { width: '100%', padding: '10px', margin: '8px 0 15px 0', boxSizing: 'border-box', border: '1px solid #e4d2bc', borderRadius: 8 };
const button = { width: '100%', padding: '12px', backgroundColor: '#8B1E3F', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' };
const errorBox = { color: '#c0392b', marginBottom: '10px' };
const okBox = { color: '#1b7a3d', marginBottom: '12px', padding: 10, background: '#e6f7ea', borderRadius: 6 };
const linkStyle = { cursor: 'pointer', color: '#8B1E3F', textDecoration: 'underline' };

export default ForgotPassword;
