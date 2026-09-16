import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/api';

const ChangePassword = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form,setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [loading,setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword(form);
      if (user) setUser({ ...user, passwordResetRequired: false });
      setNotice('Password changed successfully.');
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Could not change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={box}>
      <h2>Change password</h2>
      {error && <div style={errorBox}>{error}</div>}
      {notice && <div style={okBox}>{notice}</div>}
      <form onSubmit={handleSubmit}>
        <label>Current password</label>
        <input style={input} type="password" name="oldPassword" value={form.oldPassword} onChange={handleChange} required />

        <label>New password</label>
        <input style={input} type="password" name="newPassword" value={form.newPassword} onChange={handleChange} minLength={6} required />

        <label>Confirm new password</label>
        <input style={input} type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} minLength={6} required />

        <button style={button} disabled={loading}>{loading ? 'Saving…' : 'Update password'}</button>
      </form>
      <p onClick={() => navigate('/profile')} style={linkStyle}>Back to profile</p>
    </div>
  );
};

const box = { maxWidth: '420px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
const input = { width: '100%', padding: '10px', margin: '8px 0 15px 0', boxSizing: 'border-box' };
const button = { width: '100%', padding: '10px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px' };
const errorBox = { color: 'red', marginBottom: '10px' };
const okBox = { color: '#1b7a3d', marginBottom: '12px', padding: 10, background: '#e6f7ea', borderRadius: 6 };
const linkStyle = { cursor: 'pointer', color: 'blue', textDecoration: 'underline' };

export default ChangePassword;
