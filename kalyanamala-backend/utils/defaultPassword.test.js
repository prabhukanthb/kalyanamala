const test = require('node:test');
const assert = require('node:assert/strict');
const { defaultPassword, PASSWORD_HINT } = require('./defaultPassword');

test('default password is first 4 letters of name + @ + last 4 of mobile', () => {
  assert.equal(defaultPassword('Prabhu', '9876543210'), 'Prab@3210');
  assert.equal(defaultPassword('Raj', '9000011111'), 'Raj@1111');
  assert.equal(defaultPassword('S. Kiran', '8888888888'), 'SKir@8888');
  assert.equal(defaultPassword('', '9876543210'), 'User@3210');
  assert.match(PASSWORD_HINT, /first 4 letters/i);
});
