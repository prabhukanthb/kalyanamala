export const CLOUD_NAME = 'bh4nvmuf';
export const UPLOAD_PRESET = 'kalyanamala';
export const MAX_PHOTOS = 3;

export function photoSrc(p) {
  if (!p) return '';
  if (typeof p === 'string') return p;
  return p.url || p.imageUrl || p.secure_url || '';
}

export function normalisePhotos(list) {
  return (list || [])
    .map((p) => (
      typeof p === 'string'
        ? { url: p, isPrimary: false, isApproved: true }
        : {
          url: photoSrc(p),
          publicId: p.publicId,
          isPrimary: !!p.isPrimary,
          isApproved: p.isApproved !== false
        }
    ))
    .filter((p) => p.url)
    .slice(0, MAX_PHOTOS);
}

export function ensurePrimary(list) {
  const next = normalisePhotos(list);
  if (!next.some((p) => p.isPrimary) && next[0]) {
    next[0] = { ...next[0], isPrimary: true };
  }
  return next;
}

export async function uploadToCloudinary(files, currentCount) {
  const room = MAX_PHOTOS - currentCount;
  if (room <= 0) throw new Error(`Maximum ${MAX_PHOTOS} photos allowed. Remove one to add another.`);

  const selected = Array.from(files).slice(0, room);

  for (const f of selected) {
    if (!f.type.startsWith('image/')) throw new Error('Only image files are allowed.');
    if (f.size > 5 * 1024 * 1024) throw new Error(`"${f.name}" is larger than 5MB.`);
  }

  const uploaded = [];
  for (const file of selected) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: fd }
    );

    const data = await res.json();
    if (!res.ok || !data.secure_url) throw new Error(data?.error?.message || 'Upload failed');

    uploaded.push({
      url: data.secure_url,
      publicId: data.public_id,
      isPrimary: false,
      isApproved: true
    });
  }
  return uploaded;
}
