import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const API_BASE = 'https://kalyanamala-backend-production.up.railway.app';

const AdminDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profiles,setProfiles] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`
    }),
    [token]
  );

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const res = await axios.get(`${API_BASE}/api/profiles`, {
        headers
      });

      setProfiles(res.data.profiles || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to load profiles'
      );
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin' && user?.role !== 'subadmin') {
      navigate('/');
      return;
    }

    loadProfiles();
  }, [token,user,navigate,loadProfiles]);

  const handleApprove = async (profileId) => {
    try {
      await axios.put(`${API_BASE}/api/profiles/${profileId}/approve`, {}, { headers });
      loadProfiles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve profile');
    }
  };

  const handleReject = async (profileId) => {
    const rejectedReason = prompt('Enter rejection reason:');
    if (!rejectedReason) return;

    try {
      await axios.put(
        `${API_BASE}/api/profiles/${profileId}/reject`,
        { rejectedReason },
        { headers }
      );
      loadProfiles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject profile');
    }
  };

  const handleDelete = async (profileId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this profile?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE}/api/profiles/${profileId}`, { headers });
      loadProfiles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete profile');
    }
  };

  if (loading) {
    return <div style={{ padding: '30px' }}>Loading admin dashboard...</div>;
  }

  return (
    <div style={{ maxWidth: '1300px', margin: '30px auto', padding: '20px' }}>
      <h2>Admin Dashboard</h2>

      {error && (
        <div
          style={{
            background: '#ffebee',
            color: 'red',
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '6px'
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/admin/profiles/create')}
          style={{
            padding: '10px 16px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          Create New Profile
        </button>

        <button
          onClick={loadProfiles}
          style={{
            padding: '10px 16px',
            cursor: 'pointer'
          }}
        >
          Refresh Profiles
        </button>
      </div>

      <section
        style={{
          border: '1px solid #ddd',
          padding: '16px',
          borderRadius: '8px',
          background: '#fff'
        }}
      >
        <h3>Profiles ({profiles.length})</h3>

        <div style={{ overflowX: 'auto' }}>
          <table
            width="100%"
            border="1"
            cellPadding="8"
            style={{ borderCollapse: 'collapse', minWidth: '1100px' }}
          >
            <thead>
              <tr>
                <th>Profile ID</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Religion</th>
                <th>Marital Status</th>
                <th>Status</th>
                <th>Show in Search</th>
                <th>Completion %</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {profiles.length > 0 ? (
                profiles.map((p) => (
                  <tr key={p._id}>
                    <td>{p.profileId || '-'}</td>
                    <td>
                      {(p.userId?.firstName || '') + ' ' + (p.userId?.lastName || '')}
                    </td>
                    <td>{p.gender || '-'}</td>
                    <td>{p.religion || '-'}</td>
                    <td>{p.maritalStatus || '-'}</td>
                    <td>{p.approvalStatus || '-'}</td>
                    <td>{p.showInSearch ? 'Yes' : 'No'}</td>
                    <td>{p.profileCompletion ?? '-'}</td>
                    <td>
                      <button
                        onClick={() => navigate(`/admin/profiles/${p._id}/edit`)}
                        style={{ marginRight: '8px', cursor: 'pointer' }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleApprove(p._id)}
                        style={{ marginRight: '8px', cursor: 'pointer' }}
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleReject(p._id)}
                        style={{ marginRight: '8px', cursor: 'pointer' }}
                      >
                        Reject
                      </button>

                      <button
                        onClick={() => handleDelete(p._id)}
                        style={{ cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                    No profiles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
