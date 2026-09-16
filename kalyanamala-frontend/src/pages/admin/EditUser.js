import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const API_BASE = 'https://kalyanamala-backend-production.up.railway.app';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState('');
  const [form,setForm] = useState({
    firstName: '',
    lastName: '',
    surname: '',
    phone: '',
    alternativePhone: '',
    role: '',
    status: ''
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const u = res.data.user;
        setForm({
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          surname: u.surname || '',
          phone: u.phone || '',
          alternativePhone: u.alternativePhone || '',
          role: u.role || '',
          status: u.status || ''
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id,token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: (name === 'phone' || name === 'alternativePhone') ? String(value || '').replace(/\D/g, '').slice(0, 10) : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await axios.put(`${API_BASE}/api/users/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '30px' }}>Loading user...</div>;
  }

  return (
    <div style={{ maxWidth: '700px', margin: '30px auto', padding: '20px' }}>
      <h2>Edit User</h2>

      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      <form onSubmit={handleSave}>
        <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
        <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
        <input name="surname" value={form.surname} onChange={handleChange} placeholder="Surname" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} inputMode="numeric" maxLength={10} />
        {form.phone.length >= 1 && form.phone.length <= 9 && (
          <div style={{ color: 'red', marginBottom: '10px' }}>Phone must be 10 digits</div>
        )}
        <input name="alternativePhone" value={form.alternativePhone || ''} onChange={handleChange} placeholder="Alternate Mobile" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} inputMode="numeric" maxLength={10} />
        {(form.alternativePhone || '').length >= 1 && (form.alternativePhone || '').length <= 9 && (
          <div style={{ color: 'red', marginBottom: '10px' }}>Alternate mobile must be 10 digits</div>
        )}
        <input name="role" value={form.role} onChange={handleChange} placeholder="Role" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
        <input name="status" value={form.status} onChange={handleChange} placeholder="Status" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save User'}
        </button>
      </form>
    </div>
  );
};

export default EditUser;
