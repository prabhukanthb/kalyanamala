import { BRAND, H1, ORG, YEARS_OF_SERVICE } from './siteConfig';

test('public brand is New Kalyanamala mala matrimony in vijayawada', () => {
  expect(BRAND).toBe('New Kalyanamala');
  expect(ORG).toBe('Kalyanamala Seva Samstha');
  expect(YEARS_OF_SERVICE).toBe(15);
  expect(H1).toBe('Where families meet, hopes blossom, and lifelong bonds begin.');
  expect(H1).toMatch(/lifelong bonds/);
  expect(H1).not.toMatch(/Unique profile IDs/);
});

test('Vijayawada is the only published office', () => {
  const {
    BRANCH_ADDRESS,
    BRANCHES,
    HELPLINE_TEL,
    HELPLINE_DISPLAY,
    REGISTRATION_FEE,
    RENEWAL_FEE
  } = require('./siteConfig');
  expect(HELPLINE_DISPLAY.replace(/\s/g, '')).toBe('9440545049');
  expect(HELPLINE_TEL).toBe('tel:+919440545049');
  expect(BRANCH_ADDRESS).toMatch(/Manohara Apartments/);
  expect(BRANCH_ADDRESS).toMatch(/Machavaram/);
  expect(BRANCH_ADDRESS).toMatch(/520004/);
  expect(BRANCHES.map((b) => b.city)).toEqual(['Vijayawada']);
  expect(REGISTRATION_FEE).toMatch(/3,000/);
  expect(RENEWAL_FEE).toMatch(/1,500/);
});

test('homepage no longer promotes the retired main-page chips', () => {
  const fs = require('fs');
  const path = require('path');
  const home = fs.readFileSync(path.join(__dirname, 'pages/Home.js'), 'utf8');
  expect(home).not.toMatch(/Unique profile IDs/);
  expect(home).not.toMatch(/Family, side by side/);
  expect(home).not.toMatch(/Partner requiremen/);
  expect(home).not.toMatch(/Places that matter/);
  expect(home).toMatch(/New Kalyanamala/);
  expect(home).toMatch(/Where families meet/);
  expect(home).toMatch(/lifelong bonds/);
  expect(home).toMatch(/Mala community/);
  expect(home).toMatch(/trusted hand/);
  expect(home).not.toMatch(/Your family's mala Matrimony/);
  expect(home).not.toMatch(/Register Free/);
  expect(home).not.toMatch(/Horoscope matching/);
  expect(home).not.toMatch(/twenty years/);
  expect(home).not.toMatch(/Verified profiles reviewed/);
  expect(home).not.toMatch(/Our branches/);
  expect(home).toMatch(/fifteen years/);
  expect(home).toMatch(/We introduce bride or groom/);
  expect(home).toMatch(/REGISTRATION_FEE/);
  expect(home).toMatch(/RENEWAL_FEE/);
});

test('header topbar no longer shows the Machavaram location line', () => {
  const fs = require('fs');
  const path = require('path');
  const header = fs.readFileSync(path.join(__dirname, 'components/SiteHeader.js'), 'utf8');
  expect(header).not.toMatch(/Vijayawada · Machavaram/);
  expect(header).toMatch(/Helpline/);
});
