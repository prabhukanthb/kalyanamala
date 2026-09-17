const LACS_THRESHOLD = 10000;

const toIncomeRupees = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (n < LACS_THRESHOLD) return Math.round(n * 100000);
  return Math.round(n);
};

const incomeToLacs = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (n < LACS_THRESHOLD) return Math.round(n * 10) / 10;
  return Math.round((n / 100000) * 10) / 10;
};

module.exports = {
  LACS_THRESHOLD,
  toIncomeRupees,
  incomeToLacs
};
