import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [emailOrPhone,setEmailOrPhone] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(emailOrPhone, password);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={box}>
      <div style={kicker}>Kalyanamala</div>
      <h2 style={title}>Login</h2>
      {error && <div style={errorBox}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>Email or Phone</label>
        <input style={input} value={emailOrPhone} onChange={e => setEmailOrPhone(e.target.value)} />

        <label>Password</label>
        <input style={input} type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />

        <button style={button} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      <p onClick={() => navigate('/forgot-password')} style={linkStyle}>Forgot password?</p>
      <p onClick={() => navigate('/register')} style={linkStyle}>Register here</p>
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
const linkStyle = { cursor: 'pointer', color: '#8B1E3F', textDecoration: 'underline' };

export default Login;
