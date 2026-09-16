const formatProfileId = (gender, seq) => {
  const code = String(gender || '').toLowerCase() === 'female' ? 'F' : 'M';
  return `${code}${String(seq).padStart(5, '0')}`;
};

test('profile IDs share one 5-digit sequence across genders', () => {
  expect(formatProfileId('male', 1)).toBe('M00001');
  expect(formatProfileId('female', 2)).toBe('F00002');
  expect(formatProfileId('male', 12)).toBe('M00012');
});
