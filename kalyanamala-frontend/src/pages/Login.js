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
    <div style={box}>
      <h2>Login</h2>
      {error && <div style={errorBox}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>Email or Phone</label>
        <input style={input} value={emailOrPhone} onChange={e => setEmailOrPhone(e.target.value)} />

        <label>Password</label>
        <input style={input} type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />

        <button style={button} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      <p onClick={() => navigate('/register')} style={linkStyle}>Register here</p>
    </div>
  );
};

const box = { maxWidth: '420px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
const input = { width: '100%', padding: '10px', margin: '8px 0 15px 0', boxSizing: 'border-box' };
const button = { width: '100%', padding: '10px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px' };
const errorBox = { color: 'red', marginBottom: '10px' };
const linkStyle = { cursor: 'pointer', color: 'blue', textDecoration: 'underline' };

export default Login;
