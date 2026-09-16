import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { formatHeight } from '../utils/profileFormHelpers';

const BRAND = 'New Kalyanamala Matrimony';
const CONTACT_PERSON = 'B. John Ratnam';
const CONTACT_PHONE = '9440545049';
const WATERMARK_OPACITY = 0.08; // set to 5% / 100

const photoSrc = (p) => (!p ? '' : typeof p === 'string' ? p : p.url || p.imageUrl || '');

const primaryPhoto = (list) => {
  const arr = list || [];
  const pr = arr.find((p) => typeof p === 'object' && p.isPrimary);
  return photoSrc(pr || arr[0]);
};

const calcAge = (dob) => {
  if (!dob) return '';
  const b = new Date(dob), t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return a;
};

const F = ({ label, value }) => (
  <div style={{ display: 'flex', fontSize: 15, padding: '4px 0', borderBottom: '1px solid #eee' }}>
    <div style={{ flex: '0 0 140px', color: '#666' }}>{label}</div>
    <div style={{ flex: 1, fontWeight: 600, color: '#111' }}>{value || '-'}</div>
  </div>
);

const Group = ({ title, children }) => (
  <div style={{ flex: '1 1 300px', minWidth: 280 }}>
    <div style={{
      fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
      color: '#b8860b', borderBottom: '2px solid #b8860b', paddingBottom: 4, marginBottom: 8
    }}>{title}</div>
    {children}
  </div>
);

const ProfileDownloadCard = ({ profile, onClose }) => {
  const cardRef = useRef(null);
  const [busy,setBusy] = useState(false);

  const name = `${profile.firstName || profile.userId?.firstName || ''} ${profile.lastName || profile.userId?.lastName || ''}`.trim();
  const img = primaryPhoto(profile.photos);
  const age = calcAge(profile.dateOfBirth);

  const download = async () => {
    setBusy(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `profile-${String(profile.profileId || '').slice(-6)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      alert('Could not generate the image. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const watermarkRows = Array.from({ length: 14 });

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999,
      overflow: 'auto', padding: 20
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <button onClick={download} disabled={busy}
            style={{ padding: '10px 22px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            {busy ? 'Generating…' : 'Download PNG'}
          </button>
          <button onClick={onClose}
            style={{ padding: '10px 22px', background: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Close
          </button>
        </div>

        {/* ---------- the card ---------- */}
        <div ref={cardRef} style={{
          width: 850, background: '#fff', position: 'relative', overflow: 'hidden',
          fontFamily: 'Georgia, serif', border: '1px solid #ddd'
        }}>
          {/* watermark layer */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
            opacity: WATERMARK_OPACITY, transform: 'rotate(-30deg) scale(1.6)',
            transformOrigin: 'center'
          }}>
            {watermarkRows.map((_, r) => (
              <div key={r} style={{ display: 'flex', gap: 40, whiteSpace: 'nowrap', margin: '28px 0' }}>
                {Array.from({ length: 5 }).map((__, c) => (
                  <span key={c} style={{ fontSize: 30, fontWeight: 700, color: '#000' }}>{BRAND}</span>
                ))}
              </div>
            ))}
          </div>

          {/* header band */}
          <div style={{
            position: 'relative', zIndex: 3,
            background: 'linear-gradient(90deg,#8B0000,#C1272D)', color: '#fff',
            padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 1 }}>{BRAND}</div>
            <div style={{ fontSize: 15 }}>Profile ID: {String(profile.profileId || '').slice(-6)}</div>
          </div>

          {/* top: basics left, photo right */}
          <div style={{ position: 'relative', zIndex: 3, display: 'flex', gap: 24, padding: 24 }}>
            <div style={{ flex: 1 }}>
              <Group title="Basic Details">
                <F label="Full Name" value={name} />
                <F label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB') : ''} />
                <F label="Age" value={age ? `${age} years` : ''} />
                <F label="Height" value={formatHeight(profile.heightFeet, profile.heightInches)} />
                <F label="Marital Status" value={profile.maritalStatus || ''} />
                <F label="City & State" value={[profile.currentAddress?.city, profile.currentAddress?.state].filter(Boolean).join(', ')} />
              </Group>
            </div>

            <div style={{ flex: '0 0 260px' }}>
              {img ? (
                <img src={img} alt={name} crossOrigin="anonymous"
                  style={{ width: 260, height: 320, objectFit: 'cover', border: '4px solid #b8860b', borderRadius: 4 }} />
              ) : (
                <div style={{
                  width: 260, height: 320, border: '4px solid #b8860b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', background: '#f6f6f6'
                }}>No photo</div>
              )}
            </div>
          </div>

          {/* middle: two columns */}
          <div style={{ position: 'relative', zIndex: 3, display: 'flex', gap: 24, padding: '0 24px 20px' }}>
            <Group title="Education & Career">
              <F label="Religion" value={profile.religion || ''} />
              <F label="Education" value={profile.highestEducation || ''} />
              <F label="Occupation" value={profile.occupation || ''} />
              <F label="Annual Income" value={profile.income ? `${profile.incomeCurrency || 'INR'} ${profile.income}` : ''} />
            </Group>

            <Group title="Family">
              <F label="Siblings" value={profile.siblingsCount} />
              <F label="Father's Name" value={profile.fatherName || ''} />
              <F label="Father Occupation" value={profile.fatherOccupation || ''} />
              <F label="Father Native" value={profile.fatherNativePlace || ''} />
              <F label="Mother's Name" value={profile.motherName || ''} />
              <F label="Mother Occupation" value={profile.motherOccupation || ''} />
              <F label="Mother Native" value={profile.motherNativePlace || ''} />
              <F label="Native Place" value={profile.nativePlace || ''} />
            </Group>
          </div>

          {/* full width */}
          <div style={{ position: 'relative', zIndex: 3, padding: '0 24px 24px' }}>
            <Group title="Preference & About">
              <F label="Preferred Match" value={profile.preferredMatch || ''} />
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 10, color: '#b8860b' }}>Partner Requirement</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, marginTop: 4, color: '#222' }}>
                {profile.partnerRequirement || ''}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, marginTop: 8, color: '#222' }}>
                {profile.aboutMe || ''}
              </div>
            </Group>
          </div>

          {/* footer band */}
          <div style={{
            position: 'relative', zIndex: 3, background: '#8B0000', color: '#fff',
            padding: '14px 24px', textAlign: 'center', fontSize: 16
          }}>
            For more details contact {CONTACT_PERSON} &nbsp;·&nbsp; {CONTACT_PHONE}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDownloadCard;
