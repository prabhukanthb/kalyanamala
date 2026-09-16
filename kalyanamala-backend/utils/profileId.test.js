const test = require('node:test');
const assert = require('node:assert/strict');
const { formatProfileId, genderCode, parseSequence } = require('./profileId');

test('male and female prefixes with a shared 5-digit sequence', () => {
  assert.equal(genderCode('male'), 'M');
  assert.equal(genderCode('female'), 'F');
  assert.equal(formatProfileId('male', 1), 'M00001');
  assert.equal(formatProfileId('female', 2), 'F00002');
  assert.equal(formatProfileId('female', 1), 'F00001');
  assert.equal(formatProfileId('male', 12), 'M00012');
});

test('deleted numbers stay represented as 5-digit suffixes', () => {
  assert.equal(parseSequence('M00001'), 1);
  assert.equal(parseSequence('F00002'), 2);
  assert.equal(parseSequence('KM-2609M00009'), 0);
  assert.equal(parseSequence(''), 0);
});
