import React, { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ProfileDownloadCard from '../components/ProfileDownloadCard';
import ProfileViewModal from '../components/ProfileViewModal';
import { fullName } from '../utils/profileFormHelpers';

import { API_ORIGIN } from '../services/apiBase';

const API_BASE = API_ORIGIN;

const calcAge = (dob) => {
  if (!dob) return null;
  const b = new Date(dob), t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return a;
};

const photoSrc = (p) => (!p ? '' : typeof p === 'string' ? p : p.url || p.imageUrl || '');

const primaryPhoto = (list) => {
  const arr = list || [];
  const primary = arr.find((p) => typeof p === 'object' && p.isPrimary);
  return photoSrc(primary || arr[0]);
};

const box = { border: '1px solid #efe0cc', borderRadius: 14, background: '#fff', padding: 16, marginBottom: 16, boxShadow: '0 8px 24px rgba(92,16,40,0.05)' };
const input = { padding: '9px 12px', border: '1px solid #e4d2bc', borderRadius: 8, boxSizing: 'border-box' };
const btn = { padding: '9px 18px', background: '#8B1E3F', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 };
const ghostBtn = { ...btn, background: '#fff', color: '#8B1E3F', border: '1px solid #C9A227' };

const BrowseProfiles = () => {
  const { token, user, loading: authLoading } = useContext(AuthContext);

  const [me,setMe] = useState(null);
  const [results,setResults] = useState([]);
  const [busy,setBusy] = useState(true);
  const [error,setError] = useState('');
  const [query,setQuery] = useState('');
  const [searchBy,setSearchBy] = useState('name');
  const [selected,setSelected] = useState(null);   // download modal
  const [viewing,setViewing] = useState(null);     // view modal

  const role = user?.role || (user?.isAdmin ? 'admin' : 'member');
  const isAdmin = role === 'admin' || role === 'subadmin';
  const canDownload = isAdmin || role === 'premium' || user?.isPremium === true;

  const myAge = useMemo(() => calcAge(me?.dateOfBirth), [me]);

  useEffect(() => {
    const load = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        if (!isAdmin) {
          const mine = await axios.get(`${API_BASE}/api/profiles/me`, { headers });
          setMe(mine.data.profile);
        }

        const res = await axios.get(`${API_BASE}/api/profiles/browse`, { headers });
        setResults(res.data.profiles || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profiles');
      } finally {
        setBusy(false);
      }
    };

    if (authLoading) return;
    if (!token || !user) {
      setBusy(false);
      return;
    }
    load();
  }, [token,user,authLoading,isAdmin]);

  // client-side mirror of the server rules
  const visible = useMemo(() => {
    if (isAdmin) return results;
    if (!me || !myAge) return [];

    return results.filter((p) => {
      const a = calcAge(p.dateOfBirth);
      if (!a) return false;

      if (me.gender === 'female') return p.gender === 'male' && a > myAge;
      if (me.gender === 'male') return p.gender === 'female' && a <= myAge;
      return false;
    });
  }, [results,me,myAge,isAdmin]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visible;

    return visible.filter((p) => {
      if (searchBy === 'id') {
        const id = String(p.profileId || '');
        return id.toLowerCase().includes(q);
      }
      const name = `${p.firstName || p.userId?.firstName || ''} ${p.lastName || p.userId?.lastName || ''} ${p.userId?.surname || ''}`.toLowerCase();
      return name.includes(q);
    });
  }, [visible, query, searchBy]);

  if (authLoading || busy) return <div style={{ padding: 40 }}>Loading profiles…</div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px 48px' }}>
      <div style={{ marginBottom: 8, fontSize: 13, letterSpacing: 1.4, textTransform: 'uppercase', color: '#C9A227' }}>Kalyanamala</div>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 32, color: '#8B1E3F', margin: '0 0 8px' }}>Browse profiles</h2>

      {error && (
        <div style={{ color: 'red', padding: 10, background: '#ffebee', borderRadius: 6, marginBottom: 15 }}>
          {error}
        </div>
      )}

      {!isAdmin && me && (
        <p style={{ color: '#666', fontSize: 14 }}>
          {me.gender === 'female'
            ? `Showing male profiles above your age (${myAge}).`
            : `Showing female profiles aged ${myAge} or below.`}
        </p>
      )}

      <div style={{ ...box, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {isAdmin && (
          <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)} style={input}>
            <option value="name">Search by Name</option>
            <option value="id">Search by Profile ID</option>
          </select>
        )}
        <input
          style={{ ...input, flex: 1, minWidth: 220 }}
          placeholder={searchBy === 'id' ? 'Profile ID (M00001)' : 'Name'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && <button style={ghostBtn} onClick={() => setQuery('')}>Clear</button>}
      </div>

      <p style={{ color: '#777', fontSize: 13 }}>{filtered.length} profile(s) found</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {filtered.map((p) => {
          const img = primaryPhoto(p.photos);
          const name = fullName(p);

          return (
            <div key={p._id || p.profileId} style={{ ...box, padding: 0, overflow: 'hidden', marginBottom: 0 }}>
              {img ? (
                <img
                  src={img}
                  alt={name}
                  onClick={() => setViewing(p)}
                  style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                />
              ) : (
                <div
                  onClick={() => setViewing(p)}
                  style={{
                    height: 220, background: '#f6eee4', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#b89', cursor: 'pointer'
                  }}
                >
                  No photo
                </div>
              )}

              <div style={{ padding: 14 }}>
                <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 18, color: '#8B1E3F' }}>{name || 'Member'}</div>

                <div style={{ fontSize: 13, color: '#6B5348', marginTop: 4 }}>
                  {calcAge(p.dateOfBirth)} yrs · {p.heightFeet}′{p.heightInches || 0}″
                </div>

                <div style={{ fontSize: 13, color: '#6B5348' }}>
                  {[p.occupation, p.currentAddress?.city].filter(Boolean).join(' · ')}
                </div>

                <div style={{
                  display: 'inline-block', marginTop: 8, fontSize: 12, fontWeight: 700,
                  background: '#f8eadc', color: '#8B1E3F', padding: '3px 8px', borderRadius: 6
                }}>
                  {p.profileId || '-'}
                </div>

                {isAdmin && (
                  <div style={{
                    marginTop: 8, padding: 8, background: '#f5f9ff',
                    border: '1px solid #d6e6ff', borderRadius: 6, fontSize: 12, color: '#345'
                  }}>
                    <div><strong>Full ID:</strong> {p.profileId || '-'}</div>
                    <div><strong>Email:</strong> {p.userId?.email || '-'}</div>
                    <div><strong>Phone:</strong> {p.userId?.phone || '-'}</div>
                    <div><strong>Status:</strong> {p.approvalStatus || '-'}</div>
                  </div>
                )}

                {/* View — everyone */}
                <button
                  style={{ ...btn, marginTop: 12, width: '100%' }}
                  onClick={() => setViewing(p)}
                >
                  View profile
                </button>

                {/* Download — admin / subadmin / premium */}
                {canDownload && (
                  <button
                    style={{ ...ghostBtn, marginTop: 8, width: '100%' }}
                    onClick={() => setSelected(p)}
                  >
                    Download card
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {viewing && (
        <ProfileViewModal
          profile={viewing}
          isAdmin={isAdmin}
          onClose={() => setViewing(null)}
        />
      )}

      {selected && (
        <ProfileDownloadCard
          profile={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

export default BrowseProfiles;
