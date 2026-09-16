import React from 'react';
import { formatHeight } from '../utils/profileFormHelpers';

const API_BASE = 'https://kalyanamala-backend-production.up.railway.app';

const photoSrc = (p) => (!p ? '' : typeof p === 'string' ? p : p.url || p.imageUrl || '');

const calcAge = (dob) => {
  if (!dob) return '';
  const b = new Date(dob), t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return a;
};

const row = { display: 'flex', padding: '6px 0', fontSize: 14, borderBottom: '1px solid #f2f2f2' };
const lbl = { flex: '0 0 150px', color: '#666' };
const val = { flex: 1, fontWeight: 500, color: '#222' };

const R = ({ label, value }) => (
  <div style={row}><div style={lbl}>{label}</div><div style={val}>{value || '-'}</div></div>
);

const H = ({ children }) => (
  <h4 style={{
    margin: '18px 0 8px', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5,
    color: '#2196F3', borderBottom: '1px solid #eee', paddingBottom: 6
  }}>{children}</h4>
);

const fieldLabels = {
  firstName: 'First Name',
  lastName: 'Last Name',
  surname: 'Surname',
  email: 'Email',
  phone: 'Phone',
  alternativePhone: 'Alternate Mobile'
};

const digitsOnly = (value, max) => String(value || '').replace(/\D/g, '').slice(0, max);

const prettyLabel = (value) => {
  if (!value) return '';
  return String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const ProfileViewModal = ({ profile, isAdmin, onClose }) => {
  const [active,setActive] = React.useState(0);

  const [editing,setEditing] = React.useState(false);
  const [savingAcct,setSavingAcct] = React.useState(false);
  const [acctMsg,setAcctMsg] = React.useState('');
  const [acctOk,setAcctOk] = React.useState(false);
  const [resetting,setResetting] = React.useState(false);
  const [tempPassword,setTempPassword] = React.useState('');

  const [acct,setAcct] = React.useState({
    firstName: profile.userId?.firstName || '',
    lastName: profile.userId?.lastName || '',
    surname: profile.userId?.surname || '',
    email: profile.userId?.email || '',
    phone: profile.userId?.phone || '',
    alternativePhone: profile.userId?.alternativePhone || ''
  });

  const photos = profile.photos || [];
  const age = calcAge(profile.dateOfBirth);

  const name = editing || acctOk
    ? `${acct.firstName} ${acct.lastName}`.trim()
    : `${profile.firstName || profile.userId?.firstName || ''} ${profile.lastName || profile.userId?.lastName || ''}`.trim();

  const saveAccount = async () => {
    setSavingAcct(true);
    setAcctMsg('');
    setAcctOk(false);

    try {
      const token = localStorage.getItem('token');
      const userId = profile.userId?._id || profile.userId;

      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(acct)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Update failed');
      }

      setAcctMsg('Account details saved.');
      setAcctOk(true);
      setEditing(false);
    } catch (e) {
      setAcctMsg(e.message);
      setAcctOk(false);
    } finally {
      setSavingAcct(false);
    }
  };

  const resetPassword = async () => {
    setResetting(true);
    setAcctMsg('');
    setAcctOk(false);
    setTempPassword('');
    try {
      const token = localStorage.getItem('token');
      const userId = profile.userId?._id || profile.userId;
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Reset failed');
      setTempPassword(data.tempPassword || '');
      setAcctMsg(data.message || 'Password reset to the default format.');
      setAcctOk(true);
    } catch (e) {
      setAcctMsg(e.message);
      setAcctOk(false);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 900, overflow: 'auto', padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 12, overflow: 'hidden' }}
      >
        <div style={{
          background: 'linear-gradient(90deg,#2196F3,#21CBF3)', color: '#fff', padding: '16px 22px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22 }}>{name || 'Member'}</h2>
            <div style={{ fontSize: 13, opacity: 0.95 }}>
              {age ? `${age} yrs` : ''}
              {formatHeight(profile.heightFeet, profile.heightInches) ? ` · ${formatHeight(profile.heightFeet, profile.heightInches)}` : ''}
              {profile.currentAddress?.city ? ` · ${profile.currentAddress.city}` : ''}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.25)', border: 'none', color: '#fff',
            width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 18
          }}>×</button>
        </div>

        <div style={{ display: 'flex', gap: 24, padding: 22, flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 260px' }}>
            {photos.length ? (
              <>
                <img src={photoSrc(photos[active])} alt={name}
                  style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 10, border: '1px solid #ddd' }} />
                {photos.length > 1 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    {photos.map((p, i) => (
                      <img key={i} src={photoSrc(p)} alt={`thumb ${i + 1}`} onClick={() => setActive(i)}
                        style={{
                          width: 60, height: 60, objectFit: 'cover', borderRadius: 6, cursor: 'pointer',
                          border: i === active ? '3px solid #2196F3' : '1px solid #ddd'
                        }} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{
                height: 300, border: '2px dashed #ccc', borderRadius: 10, display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: '#999'
              }}>No photo</div>
            )}
          </div>

          <div style={{ flex: '1 1 380px', minWidth: 280 }}>
            {isAdmin && (
              <>
                <H>Account (admin only)</H>

                {!editing ? (
                  <>
                    <R label="Profile ID" value={profile.profileId} />
                    <R label="First Name" value={acct.firstName} />
                    <R label="Last Name" value={acct.lastName} />
                    <R label="Surname" value={acct.surname} />
                    <R label="Email" value={acct.email || ''} />
                    <R label="Phone" value={acct.phone || ''} />
                    <R label="Alternate Mobile" value={acct.alternativePhone || ''} />
                    <R label="Status" value={profile.approvalStatus} />

                    <button
                      onClick={() => { setEditing(true); setAcctMsg(''); setTempPassword(''); }}
                      style={{
                        marginTop: 10, padding: '7px 14px', border: '1px solid #2196F3',
                        background: '#fff', color: '#2196F3', borderRadius: 5, cursor: 'pointer'
                      }}
                    >
                      Edit account details
                    </button>
                    <button
                      onClick={resetPassword}
                      disabled={resetting}
                      style={{
                        marginTop: 10, marginLeft: 8, padding: '7px 14px', border: '1px solid #c0392b',
                        background: resetting ? '#999' : '#c0392b', color: '#fff', borderRadius: 5,
                        cursor: resetting ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {resetting ? 'Resetting…' : 'Reset password'}
                    </button>
                    {tempPassword && (
                      <div style={{ marginTop: 10, padding: 10, background: '#e6f7ea', borderRadius: 6, color: '#1b7a3d' }}>
                        Temporary password: <strong>{tempPassword}</strong>
                        <div style={{ fontSize: 12, marginTop: 4 }}>
                          Format: first 4 letters of name + @ + last 4 digits of registered mobile. Share this with the user.
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ background: '#f5f9ff', padding: 14, borderRadius: 8, border: '1px solid #d6e6ff' }}>
                    {Object.keys(fieldLabels).map((f) => (
                      <div key={f} style={{ marginBottom: 10 }}>
                        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 3 }}>
                          {fieldLabels[f]}
                        </label>
                        <input
                          value={acct[f]}
                          onChange={(e) => {
                            const next = (f === 'phone' || f === 'alternativePhone')
                              ? digitsOnly(e.target.value, 10)
                              : e.target.value;
                            setAcct({ ...acct, [f]: next });
                          }}
                          style={{
                            width: '100%', padding: 8, border: '1px solid #ccc',
                            borderRadius: 5, boxSizing: 'border-box'
                          }}
                        />
                        {(f === 'phone' || f === 'alternativePhone') && acct[f].length >= 1 && acct[f].length <= 9 && (
                          <div style={{ color: 'red', fontSize: 12, marginTop: 3 }}>
                            {f === 'phone' ? 'Phone' : 'Alternate mobile'} must be 10 digits
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={saveAccount}
                      disabled={savingAcct}
                      style={{
                        padding: '8px 16px', background: savingAcct ? '#999' : '#2196F3', color: '#fff',
                        border: 'none', borderRadius: 5, cursor: savingAcct ? 'not-allowed' : 'pointer', marginRight: 8
                      }}
                    >
                      {savingAcct ? 'Saving…' : 'Save'}
                    </button>

                    <button
                      onClick={() => { setEditing(false); setAcctMsg(''); }}
                      style={{
                        padding: '8px 16px', background: '#fff', border: '1px solid #999',
                        borderRadius: 5, cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {acctMsg && (
                  <div style={{ marginTop: 10, fontSize: 13, color: acctOk ? '#1b7a3d' : '#c00' }}>
                    {acctMsg}
                  </div>
                )}
              </>
            )}

            <H>Basic Details</H>
            <R label="Gender" value={prettyLabel(profile.gender)} />
            <R label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB') : ''} />
            <R label="Age" value={age ? `${age} years` : ''} />
            <R label="Height" value={formatHeight(profile.heightFeet, profile.heightInches)} />
            <R label="Marital Status" value={prettyLabel(profile.maritalStatus)} />

            <H>Religion &amp; Family</H>
            <R label="Religion" value={profile.religion || ''} />
            <R label="Caste" value={profile.caste || 'Mala'} />
            <R label="Sub Caste" value={profile.subCaste || ''} />
            <R label="Siblings" value={profile.siblingsCount} />
            <R label="Native Place" value={profile.nativePlace || ''} />
            <R label="Father's Name" value={profile.fatherName || ''} />
            <R label="Father Occupation" value={profile.fatherOccupation || ''} />
            <R label="Father Native" value={profile.fatherNativePlace || ''} />
            <R label="Mother's Name" value={profile.motherName || ''} />
            <R label="Mother Occupation" value={profile.motherOccupation || ''} />
            <R label="Mother Native" value={profile.motherNativePlace || ''} />

            <H>Education &amp; Career</H>
            <R label="Education" value={profile.highestEducation || ''} />
            <R label="Field of Study" value={profile.fieldOfStudy || ''} />
            <R label="College" value={profile.college || ''} />
            <R label="Occupation" value={profile.occupation || ''} />
            <R label="Company" value={profile.companyName || ''} />
            <R label="Job Location" value={profile.jobLocation || ''} />
            <R label="Income" value={profile.income ? `${profile.incomeCurrency || 'INR'} ${profile.income}` : ''} />

            <H>Current Address</H>
            <R label="Street" value={profile.currentAddress?.streetName || ''} />
            <R label="City" value={profile.currentAddress?.city || ''} />
            <R label="State" value={profile.currentAddress?.state || ''} />
            <R label="Country" value={profile.currentAddress?.country || ''} />
            <R label="Pin Code" value={profile.currentAddress?.pinCode || ''} />

            <H>Present Address</H>
            <R label="Street" value={profile.presentAddress?.streetName || ''} />
            <R label="City" value={profile.presentAddress?.city || ''} />
            <R label="State" value={profile.presentAddress?.state || ''} />
            <R label="Country" value={profile.presentAddress?.country || ''} />
            <R label="Pin Code" value={profile.presentAddress?.pinCode || ''} />

            <H>About &amp; Preference</H>
            <p style={{ fontSize: 14, lineHeight: 1.6 }}>{profile.aboutMe || ''}</p>
            <R label="Preferred Match" value={profile.preferredMatch || ''} />
            <R label="Partner Requirement" value={profile.partnerRequirement || ''} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileViewModal;
