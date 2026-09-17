import { ensurePrimary, normalisePhotos, photoSrc } from './photoUpload';

test('normalisePhotos keeps urls and marks admin uploads approved', () => {
  expect(photoSrc({ url: 'https://img.example/a.jpg' })).toBe('https://img.example/a.jpg');
  const list = normalisePhotos(['https://img.example/a.jpg', { url: 'https://img.example/b.jpg', isPrimary: true }]);
  expect(list).toHaveLength(2);
  expect(list[1].isPrimary).toBe(true);
  expect(list[0].isApproved).toBe(true);
});

test('ensurePrimary sets the first photo when none is primary', () => {
  const list = ensurePrimary([{ url: 'https://img.example/a.jpg' }, { url: 'https://img.example/b.jpg' }]);
  expect(list[0].isPrimary).toBe(true);
  expect(list[1].isPrimary).toBe(false);
});
