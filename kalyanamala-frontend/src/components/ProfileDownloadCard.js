import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { formatHeight, fullName, prettyLabel, formatIncome } from '../utils/profileFormHelpers';

const BRAND = 'New Kalyanamala';
const BRAND_LINE = 'New Kalyanamala Matrimony';
const CONTACT_PERSON = 'B. John Ratnam';
const CONTACT_PHONE = '9440545049';
const WATERMARK_OPACITY = 0.1;
const MAROON = '#8B1E3F';
const GOLD = '#C9A227';
const CREAM = '#FFF8F0';
const INK = '#2C1810';
const CARD_WIDTH = 850;

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

const place = (addr) => [addr?.city, addr?.state].filter(Boolean).join(', ');

const F = ({ label, value }) => (
  <div style={{ display: 'flex', fontSize: 14, padding: '5px 0', borderBottom: '1px solid #f0e4d0' }}>
    <div style={{ flex: '0 0 128px', color: '#7a5a48', letterSpacing: 0.2 }}>{label}</div>
    <div style={{ flex: 1, fontWeight: 700, color: INK }}>{value || '—'}</div>
  </div>
);

const Group = ({ title, children }) => (
  <div style={{ flex: '1 1 280px', minWidth: 0 }}>
    <div style={{
      fontSize: 12, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase',
      color: MAROON, borderBottom: `2px solid ${GOLD}`, paddingBottom: 5, marginBottom: 8
    }}>{title}</div>
    {children}
  </div>
);

const ProfileDownloadCard = ({ profile, onClose }) => {
  const cardRef = useRef(null);
  const [busy,setBusy] = useState(false);

  const name = fullName(profile);
  const img = primaryPhoto(profile.photos);
  const age = calcAge(profile.dateOfBirth);
  const id = profile.profileId || '—';

  const download = async () => {
    setBusy(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: CREAM
      });
      const link = document.createElement('a');
      link.download = `profile-${profile.profileId || 'card'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      alert('Could not generate the image. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const watermarkRows = Array.from({ length: 18 });

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
      position: 'fixed', inset: 0, background: 'rgba(44,24,16,0.72)', zIndex: 1100,
      overflow: 'auto', padding: 20
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <button onClick={download} disabled={busy}
            style={{
              padding: '11px 22px', background: MAROON, color: '#fff', border: 'none',
              borderRadius: 8, cursor: 'pointer', fontWeight: 700
            }}>
            {busy ? 'Generating…' : 'Download PNG'}
          </button>
          <button onClick={onClose}
            style={{
              padding: '11px 22px', background: '#fff', border: `1px solid ${GOLD}`,
              borderRadius: 8, cursor: 'pointer', color: MAROON, fontWeight: 600
            }}>
            Close
          </button>
        </div>

        <div ref={cardRef} style={{
          width: CARD_WIDTH, background: CREAM, position: 'relative', overflow: 'hidden',
          fontFamily: 'Georgia, "Times New Roman", serif',
          border: `3px solid ${GOLD}`, boxSizing: 'border-box'
        }}>
          <div style={{
            position: 'absolute', inset: 8, border: `1px solid ${MAROON}`, pointerEvents: 'none', zIndex: 4
          }} />

          <div style={{
            position: 'absolute', inset: '-20%', pointerEvents: 'none', zIndex: 2,
            opacity: WATERMARK_OPACITY, transform: 'rotate(-18deg)',
            transformOrigin: 'center'
          }}>
            {watermarkRows.map((_, r) => (
              <div key={r} style={{
                display: 'flex', gap: 56, whiteSpace: 'nowrap',
                margin: '22px 0', justifyContent: r % 2 ? 'flex-end' : 'flex-start'
              }}>
                {Array.from({ length: 6 }).map((__, c) => (
                  <span key={c} style={{
                    fontSize: 13, fontWeight: 600, color: MAROON,
                    letterSpacing: 0.6
                  }}>{BRAND_LINE}</span>
                ))}
              </div>
            ))}
          </div>

          <div style={{
            position: 'relative', zIndex: 3,
            background: `linear-gradient(90deg, ${MAROON}, #b43b4a)`,
            color: '#fff',
            padding: '18px 28px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 2.4, color: GOLD, textTransform: 'uppercase' }}>
                Mala community
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 1.2 }}>{BRAND}</div>
              <div style={{ fontSize: 13, opacity: 0.92, marginTop: 2 }}>{BRAND_LINE}</div>
            </div>
            <div style={{
              background: GOLD, color: MAROON, padding: '10px 16px', borderRadius: 8,
              textAlign: 'right', minWidth: 140
            }}>
              <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' }}>Profile ID</div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>{id}</div>
            </div>
          </div>

          <div style={{ height: 4, background: GOLD, position: 'relative', zIndex: 3 }} />

          <div style={{
            position: 'relative', zIndex: 3, display: 'flex',
            alignItems: 'stretch', padding: '20px 20px 8px 24px', gap: 16
          }}>
            <div style={{ width: '65%', minWidth: 0, boxSizing: 'border-box' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: MAROON, marginBottom: 12 }}>
                {name || 'Member'}
              </div>
              <Group title="Basic Details">
                <F label="Gender" value={prettyLabel(profile.gender)} />
                <F label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB') : ''} />
                <F label="Age" value={age ? `${age} years` : ''} />
                <F label="Height" value={formatHeight(profile.heightFeet, profile.heightInches)} />
                <F label="Marital Status" value={prettyLabel(profile.maritalStatus)} />
                <F label="Religion" value={profile.religion || ''} />
                <F label="Caste" value={profile.caste || 'Mala'} />
                <F label="City & State" value={place(profile.currentAddress)} />
              </Group>

              <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                <Group title="Father">
                  <F label="Name" value={profile.fatherName || ''} />
                  <F label="Occupation" value={profile.fatherOccupation || ''} />
                  <F label="Native" value={profile.fatherNativePlace || ''} />
                </Group>
                <Group title="Mother">
                  <F label="Name" value={profile.motherName || ''} />
                  <F label="Occupation" value={profile.motherOccupation || ''} />
                  <F label="Native" value={profile.motherNativePlace || ''} />
                </Group>
              </div>

              <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                <Group title="Education & Career">
                  <F label="Education" value={profile.highestEducation || ''} />
                  <F label="Occupation" value={profile.occupation || ''} />
                  <F label="Company" value={profile.companyName || ''} />
                  <F label="Annual Income" value={formatIncome(profile.income)} />
                </Group>
                <Group title="Places">
                  <F label="Siblings" value={profile.siblingsCount === 0 || profile.siblingsCount ? String(profile.siblingsCount) : ''} />
                  <F label="Present City" value={place(profile.presentAddress)} />
                  <F label="Current City" value={place(profile.currentAddress)} />
                </Group>
              </div>

              <div style={{ marginTop: 16 }}>
                <Group title="Preference & About">
                  <F label="Preferred Match" value={prettyLabel(profile.preferredMatch)} />
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 10, color: MAROON, letterSpacing: 0.4 }}>
                    Partner Requirement
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.65, marginTop: 4, color: INK }}>
                    {profile.partnerRequirement || ''}
                  </div>
                  {profile.aboutMe ? (
                    <div style={{ fontSize: 14, lineHeight: 1.65, marginTop: 10, color: INK }}>
                      {profile.aboutMe}
                    </div>
                  ) : null}
                </Group>
              </div>
            </div>

            <div style={{
              width: '35%', boxSizing: 'border-box',
              display: 'flex', paddingBottom: 12
            }}>
              {img ? (
                <img src={img} alt={name} crossOrigin="anonymous"
                  style={{
                    width: '100%', height: '100%', minHeight: 420, objectFit: 'cover',
                    border: `5px solid ${GOLD}`, borderRadius: 6, background: '#eee',
                    display: 'block'
                  }} />
              ) : (
                <div style={{
                  width: '100%', minHeight: 420, border: `5px solid ${GOLD}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#b89', background: '#f6eee4', borderRadius: 6
                }}>No photo</div>
              )}
            </div>
          </div>

          <div style={{
            position: 'relative', zIndex: 3, background: MAROON, color: '#fff',
            padding: '14px 24px', textAlign: 'center', fontSize: 15
          }}>
            For more details contact {CONTACT_PERSON} &nbsp;·&nbsp; {CONTACT_PHONE}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDownloadCard;
