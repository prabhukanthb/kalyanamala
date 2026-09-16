import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData,setFormData] = useState({
    email: '',
    phone: '',
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
    if (name === 'phone') {
      setFormData({ ...formData, phone: String(value || '').replace(/\D/g, '').slice(0, 10) });
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
    <div style={box}>
      <h2>Register</h2>
      {error && <div style={errorBox}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input style={input} name="email" value={formData.email} onChange={handleChange} />

        <label>Phone</label>
        <input style={input} name="phone" value={formData.phone} onChange={handleChange} inputMode="numeric" maxLength={10} />
        {formData.phone.length >= 1 && formData.phone.length <= 9 && (
          <div style={{ color: 'red', marginBottom: '10px' }}>Phone must be 10 digits</div>
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
  );
};

const box = { maxWidth: '420px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
const input = { width: '100%', padding: '10px', margin: '8px 0 15px 0', boxSizing: 'border-box' };
const button = { width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' };
const errorBox = { color: 'red', marginBottom: '10px' };
const linkStyle = { cursor: 'pointer', color: 'blue', textDecoration: 'underline' };

export default Register;
