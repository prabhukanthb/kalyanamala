import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData,setFormData] = useState({
    email: '',
    phone: '',
    alternativePhone: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'alternativePhone') {
      setFormData({ ...formData, [name]: String(value || '').replace(/\D/g, '').slice(0, 10) });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: formData.email,
        phone: formData.phone,
        alternativePhone: formData.alternativePhone || undefined,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };

      await register(payload);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={box}>
      <div style={kicker}>Kalyanamala</div>
      <h2 style={title}>Register</h2>
      {error && <div style={errorBox}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input style={input} name="email" value={formData.email} onChange={handleChange} />

        <label>Phone</label>
        <input style={input} name="phone" value={formData.phone} onChange={handleChange} inputMode="numeric" maxLength={10} />
        {formData.phone.length >= 1 && formData.phone.length <= 9 && (
          <div style={{ color: 'red', marginBottom: '10px' }}>Phone must be 10 digits</div>
        )}

        <label>Alternate Mobile (optional)</label>
        <input style={input} name="alternativePhone" value={formData.alternativePhone} onChange={handleChange} inputMode="numeric" maxLength={10} />
        {formData.alternativePhone.length >= 1 && formData.alternativePhone.length <= 9 && (
          <div style={{ color: 'red', marginBottom: '10px' }}>Alternate mobile must be 10 digits</div>
        )}

        <label>First Name</label>
        <input style={input} name="firstName" value={formData.firstName} onChange={handleChange} />

        <label>Last Name</label>
        <input style={input} name="lastName" value={formData.lastName} onChange={handleChange} />

        <label>Password</label>
        <input style={input} type="password" name="password" value={formData.password} onChange={handleChange} />

        <label>Confirm Password</label>
        <input style={input} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />

        <button style={button} disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
      </form>
      <p onClick={() => navigate('/login')} style={linkStyle}>Login here</p>
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

export default Register;
