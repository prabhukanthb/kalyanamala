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
    <div style={box}>
      <h2>Forgot password</h2>
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
  );
};

const box = { maxWidth: '420px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
const input = { width: '100%', padding: '10px', margin: '8px 0 15px 0', boxSizing: 'border-box' };
const button = { width: '100%', padding: '10px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px' };
const errorBox = { color: 'red', marginBottom: '10px' };
const okBox = { color: '#1b7a3d', marginBottom: '12px', padding: 10, background: '#e6f7ea', borderRadius: 6 };
const linkStyle = { cursor: 'pointer', color: 'blue', textDecoration: 'underline' };

export default ForgotPassword;
