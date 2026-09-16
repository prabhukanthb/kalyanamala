const defaultPassword = (name, phone) => {
  const namePart = String(name || '').replace(/[^a-zA-Z]/g, '').slice(0, 4) || 'User';
  const last4 = String(phone || '').replace(/\D/g, '').slice(-4);
  return `${namePart}@${last4}`;
};

test('temporary password is first 4 letters of name + @ + last 4 of mobile', () => {
  expect(defaultPassword('Prabhu', '9876543210')).toBe('Prab@3210');
  expect(defaultPassword('Raj', '9000011111')).toBe('Raj@1111');
});
