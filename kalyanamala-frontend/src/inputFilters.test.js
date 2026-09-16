const digitsOnly = (value, max) => String(value || '').replace(/\D/g, '').slice(0, max);
const phoneOk = (value) => /^[0-9]{10}$/.test(value);
const altPhoneOk = (value) => value == null || value === '' || phoneOk(value);

test('phone inputs strip non-digits and cap at 10', () => {
  expect(digitsOnly('98a76-54321 extra0', 10)).toBe('9876543210');
  expect(digitsOnly('12', 10)).toBe('12');
});

test('PIN inputs keep digits only and cap at 6', () => {
  expect(digitsOnly('500081999', 6)).toBe('500081');
  expect(digitsOnly('50ab00', 6)).toBe('5000');
});

test('incomplete phones of length 1-9 are invalid; empty alternative is allowed', () => {
  expect(phoneOk('9876543210')).toBe(true);
  expect(phoneOk('98765')).toBe(false);
  expect(altPhoneOk('')).toBe(true);
  expect(altPhoneOk('9876543210')).toBe(true);
  expect(altPhoneOk('123')).toBe(false);
});
