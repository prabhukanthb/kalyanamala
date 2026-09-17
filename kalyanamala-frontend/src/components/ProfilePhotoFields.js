import React, { useRef, useState } from 'react';
import {
  MAX_PHOTOS,
  ensurePrimary,
  normalisePhotos,
  photoSrc,
  uploadToCloudinary
} from '../utils/photoUpload';

const ProfilePhotoFields = ({ photos, onChange, disabled, onBusy }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const list = ensurePrimary(photos);
  const full = list.length >= MAX_PHOTOS;
  const busy = disabled || uploading;

  const handleSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setError('');
    setUploading(true);
    onBusy?.(true);
    try {
      const uploaded = await uploadToCloudinary(files, list.length);
      onChange(ensurePrimary([...list, ...uploaded]));
    } catch (err) {
      setError(err.message || 'Photo upload failed.');
    } finally {
      setUploading(false);
      onBusy?.(false);
    }
  };

  const removePhoto = (src) => {
    onChange(ensurePrimary(list.filter((p) => photoSrc(p) !== src)));
  };

  const setPrimary = (src) => {
    onChange(list.map((p) => ({ ...p, isPrimary: photoSrc(p) === src })));
  };

  return (
    <div>
      <p style={{ color: '#555', marginTop: 0 }}>
        Upload up to {MAX_PHOTOS} photos. JPG or PNG, max 5MB each. The first photo, or the one marked primary, is used on biodata.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        disabled={busy || full}
        onChange={handleSelect}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        disabled={busy || full}
        onClick={() => inputRef.current?.click()}
        style={{
          padding: '10px 16px',
          background: busy || full ? '#999' : '#8B1E3F',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontWeight: 700,
          cursor: busy || full ? 'not-allowed' : 'pointer'
        }}
      >
        {uploading ? 'Uploading…' : full ? 'Photo limit reached' : 'Add profile picture'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {list.length > 0 && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
          {list.map((p, i) => {
            const src = photoSrc(p);
            return (
              <div key={src || i} style={{ width: 140, textAlign: 'center' }}>
                <img
                  src={src}
                  alt={p.isPrimary ? 'Primary profile picture' : `Profile picture ${i + 1}`}
                  style={{
                    width: 140,
                    height: 160,
                    objectFit: 'cover',
                    borderRadius: 10,
                    border: p.isPrimary ? '3px solid #C9A227' : '1px solid #efe0cc',
                    display: 'block',
                    background: '#f6eee4'
                  }}
                />
                <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {!p.isPrimary && (
                    <button type="button" disabled={busy} onClick={() => setPrimary(src)}>
                      Primary
                    </button>
                  )}
                  {p.isPrimary && <span style={{ fontSize: 12, fontWeight: 700, color: '#8B1E3F' }}>Primary</span>}
                  <button type="button" disabled={busy} onClick={() => removePhoto(src)}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p style={{ fontSize: 13, color: '#6B5348' }}>{list.length} of {MAX_PHOTOS} used</p>
    </div>
  );
};

export { MAX_PHOTOS, ensurePrimary, normalisePhotos, photoSrc };
export default ProfilePhotoFields;
