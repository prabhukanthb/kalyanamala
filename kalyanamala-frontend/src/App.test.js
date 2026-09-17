test('homepage copy lives on the New Kalyanamala site config', () => {
  const { H1, BRAND } = require('./siteConfig');
  expect(BRAND).toBe('New Kalyanamala');
  expect(H1).toMatch(/Where families meet/);
  expect(H1).toMatch(/lifelong bonds/);
});
