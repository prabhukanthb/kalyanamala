const test = require('node:test');
const assert = require('node:assert/strict');
const { toIncomeRupees, incomeToLacs } = require('./income');

test('stores 12 or 12.5 lacs as rupees', () => {
  assert.equal(toIncomeRupees(12), 1200000);
  assert.equal(toIncomeRupees(12.5), 1250000);
  assert.equal(toIncomeRupees(1200000), 1200000);
});

test('converts stored rupees or lacs back to a lacs amount', () => {
  assert.equal(incomeToLacs(1200000), 12);
  assert.equal(incomeToLacs(12), 12);
  assert.equal(incomeToLacs(0), 0);
});
