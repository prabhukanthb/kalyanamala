import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ProfileViewModal from '../components/ProfileViewModal';

const API_BASE = 'https://kalyanamala-backend-production.up.railway.app';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected', 'deleted'];

const statusTone = (status) => {
  switch (status) {
    case 'approved': return { bg: '#e6f7ea', fg: '#1b7a3d', label: 'Approved' };
    case 'pending': return { bg: '#fff6e6', fg: '#8a5a00', label: 'Pending' };
    case 'rejected': return { bg: '#ffebee', fg: '#c0392b', label: 'Rejected' };
    case 'deleted': return { bg: '#f0f0f0', fg: '#666', label: 'Deleted' };
    case 'draft': return { bg: '#eef6ff', fg: '#1565c0', label: 'Draft' };
    default: return { bg: '#eef2f6', fg: '#445', label: status || '-' };
  }
};

const AdminDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profiles,setProfiles] = useState([]);
  const [stats,setStats] = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [search,setSearch] = useState('');
  const [status,setStatus] = useState('all');
  const [viewing,setViewing] = useState(null);
  const [rejecting,setRejecting] = useState(null);
  const [rejectReason,setRejectReason] = useState('');

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const loadStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/dashboard/stats`, { headers });
      setStats(res.data.stats || null);
    } catch (err) {
      setStats(null);
    }
  }, [headers]);

  const loadProfiles = useCallback(async (term = '', statusFilter = 'all') => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (String(term).trim()) params.search = String(term).trim();
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      const res = await axios.get(`${API_BASE}/api/profiles`, { headers, params });
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
    loadStats();
    loadProfiles('', 'all');
  }, [token, user, navigate, loadStats, loadProfiles]);

  const handleApprove = async (profileId) => {
    try {
      await axios.put(`${API_BASE}/api/profiles/${profileId}/approve`, {}, { headers });
      loadProfiles(search, status);
      loadStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve profile');
    }
  };

  const submitReject = async () => {
    if (!rejecting || !rejectReason.trim()) return;
    try {
      await axios.put(
        `${API_BASE}/api/profiles/${rejecting._id}/reject`,
        { rejectedReason: rejectReason.trim() },
        { headers }
      );
      setRejecting(null);
      setRejectReason('');
      loadProfiles(search, status);
      loadStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject profile');
    }
  };

  const handleDelete = async (profile) => {
    const idLabel = profile.profileId || profile._id;
    if (!window.confirm(`Delete profile ${idLabel}? This ID will not be reused.`)) return;
    try {
      await axios.delete(`${API_BASE}/api/profiles/${profile._id}`, { headers });
      loadProfiles(search, status);
      loadStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete profile');
    }
  };

  const counts = {
    total: stats?.totalProfiles ?? profiles.length,
    pending: stats?.pendingProfiles ?? profiles.filter((p) => p.approvalStatus === 'pending').length,
    approved: stats?.approvedProfiles ?? profiles.filter((p) => p.approvalStatus === 'approved').length,
    rejected: stats?.rejectedProfiles ?? profiles.filter((p) => p.approvalStatus === 'rejected').length,
    deleted: stats?.deletedProfiles ?? profiles.filter((p) => p.approvalStatus === 'deleted').length
  };

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.9, letterSpacing: 0.6, textTransform: 'uppercase' }}>Kalyanamala</div>
          <h1 style={{ margin: '6px 0 0', fontSize: 28 }}>Admin Dashboard</h1>
          <div style={{ marginTop: 6, opacity: 0.95 }}>
            {user?.firstName ? `Signed in as ${user.firstName}${user.surname ? ` ${user.surname}` : ''}` : 'Manage profiles, IDs, and approvals'}
          </div>
        </div>
        <button onClick={() => navigate('/admin/profiles/create')} style={primaryBtn}>
          + Create profile
        </button>
      </div>

      <div style={statGrid}>
        <StatCard label="Total profiles" value={counts.total} color="#2196F3" />
        <StatCard label="Pending" value={counts.pending} color="#e6a100" />
        <StatCard label="Approved" value={counts.approved} color="#2e9e57" />
        <StatCard label="Rejected" value={counts.rejected} color="#c0392b" />
        <StatCard label="Deleted" value={counts.deleted} color="#667" />
      </div>

      {error && <div style={errorBox}>{error}</div>}

      <section style={card}>
        <div style={toolbar}>
          <form
            onSubmit={(e) => { e.preventDefault(); loadProfiles(search, status); }}
            style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260, flexWrap: 'wrap' }}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or profile ID (M00001)"
              style={searchInput}
            />
            <button type="submit" style={ghostBtn}>Search</button>
            {search && (
              <button type="button" onClick={() => { setSearch(''); loadProfiles('', status); }} style={ghostBtn}>
                Clear
              </button>
            )}
          </form>
          <button type="button" onClick={() => { loadProfiles(search, status); loadStats(); }} style={ghostBtn}>
            Refresh
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {STATUS_FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => { setStatus(item); loadProfiles(search, item); }}
              style={chip(status === item)}
            >
              {item === 'all' ? 'All' : item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Profile ID</th>
                <th style={th}>Name</th>
                <th style={th}>Gender</th>
                <th style={th}>Religion</th>
                <th style={th}>Marital status</th>
                <th style={th}>Status</th>
                <th style={th}>In search</th>
                <th style={th}>Completion</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={emptyCell}>Loading profiles…</td>
                </tr>
              ) : profiles.length ? (
                profiles.map((p) => {
                  const tone = statusTone(p.approvalStatus);
                  const name = `${p.userId?.firstName || ''} ${p.userId?.lastName || ''}`.trim() || '-';
                  const pct = Number(p.profileCompletion || 0);
                  return (
                    <tr key={p._id} style={tr}>
                      <td style={td}>
                        <span style={idBadge}>{p.profileId || '-'}</span>
                      </td>
                      <td style={{ ...td, fontWeight: 600 }}>{name}</td>
                      <td style={td}>{p.gender || '-'}</td>
                      <td style={td}>{p.religion || '-'}</td>
                      <td style={td}>{p.maritalStatus || '-'}</td>
                      <td style={td}>
                        <span style={{ ...pill, background: tone.bg, color: tone.fg }}>{tone.label}</span>
                      </td>
                      <td style={td}>{p.showInSearch ? 'Yes' : 'No'}</td>
                      <td style={td}>
                        <div style={barTrack}>
                          <div style={{ ...barFill, width: `${Math.min(100, pct)}%` }} />
                        </div>
                        <div style={{ fontSize: 11, color: '#667', marginTop: 4 }}>{pct}%</div>
                      </td>
                      <td style={td}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button type="button" onClick={() => setViewing(p)} style={smallBtn('#2196F3')}>View</button>
                          <button type="button" onClick={() => navigate(`/admin/profiles/${p._id}/edit`)} style={smallBtn('#0d7377')}>Edit</button>
                          {p.approvalStatus !== 'approved' && p.approvalStatus !== 'deleted' && (
                            <button type="button" onClick={() => handleApprove(p._id)} style={smallBtn('#2e9e57')}>Approve</button>
                          )}
                          {p.approvalStatus !== 'rejected' && p.approvalStatus !== 'deleted' && (
                            <button type="button" onClick={() => { setRejecting(p); setRejectReason(''); }} style={smallBtn('#c0392b')}>Reject</button>
                          )}
                          {p.approvalStatus !== 'deleted' && (
                            <button type="button" onClick={() => handleDelete(p)} style={smallBtn('#555')}>Delete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={emptyCell}>No profiles match this search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {viewing && (
        <ProfileViewModal profile={viewing} isAdmin onClose={() => setViewing(null)} />
      )}

      {rejecting && (
        <div style={modalWrap} onClick={() => setRejecting(null)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Reject {rejecting.profileId || 'profile'}</h3>
            <p style={{ color: '#556' }}>Enter a reason. The member will see this on review.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
            <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setRejecting(null)} style={ghostBtn}>Cancel</button>
              <button type="button" onClick={submitReject} disabled={!rejectReason.trim()} style={{ ...primaryBtn, background: '#c0392b', color: '#fff' }}>
                Reject profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div style={statCard}>
    <div style={{ fontSize: 13, color: '#667' }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
  </div>
);

const page = { maxWidth: 1280, margin: '0 auto', padding: '24px 20px 48px', background: '#f4f7fb', minHeight: 'calc(100vh - 64px)' };
const hero = {
  background: 'linear-gradient(90deg,#2196F3,#21CBF3)',
  color: '#fff',
  borderRadius: 14,
  padding: '22px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
  flexWrap: 'wrap',
  marginBottom: 18
};
const statGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 18 };
const statCard = { background: '#fff', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 8px rgba(16,40,80,0.06)' };
const card = { background: '#fff', borderRadius: 14, padding: 18, boxShadow: '0 1px 8px rgba(16,40,80,0.06)' };
const toolbar = { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 };
const searchInput = { flex: 1, minWidth: 220, padding: '10px 12px', border: '1px solid #d5dee8', borderRadius: 8, fontSize: 14 };
const primaryBtn = { padding: '10px 16px', background: '#fff', color: '#1565c0', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 };
const ghostBtn = { padding: '10px 14px', background: '#fff', color: '#1565c0', border: '1px solid #bcd7f5', borderRadius: 8, cursor: 'pointer' };
const chip = (on) => ({
  padding: '6px 12px',
  borderRadius: 999,
  border: on ? '1px solid #2196F3' : '1px solid #d5dee8',
  background: on ? '#e8f4ff' : '#fff',
  color: on ? '#1565c0' : '#445',
  cursor: 'pointer',
  textTransform: 'capitalize'
});
const table = { width: '100%', borderCollapse: 'collapse', minWidth: 1080 };
const th = { textAlign: 'left', padding: '10px 12px', fontSize: 12, color: '#667', borderBottom: '1px solid #e6edf5', background: '#f8fbff', textTransform: 'uppercase', letterSpacing: 0.4 };
const td = { padding: '12px', fontSize: 14, borderBottom: '1px solid #f0f3f8', verticalAlign: 'middle' };
const tr = { background: '#fff' };
const emptyCell = { textAlign: 'center', padding: 36, color: '#778' };
const idBadge = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', background: '#eef6ff', color: '#1565c0', padding: '4px 8px', borderRadius: 6, fontWeight: 700 };
const pill = { display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700 };
const barTrack = { height: 6, background: '#e9eef5', borderRadius: 99, overflow: 'hidden', minWidth: 70 };
const barFill = { height: '100%', background: 'linear-gradient(90deg,#2196F3,#21CBF3)' };
const errorBox = { background: '#ffebee', color: '#c0392b', padding: 12, borderRadius: 8, marginBottom: 16 };
const smallBtn = (bg) => ({ padding: '6px 10px', background: bg, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 });
const modalWrap = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 950, padding: 20 };
const modal = { background: '#fff', borderRadius: 12, padding: 22, width: 'min(480px, 100%)' };

export default AdminDashboard;
