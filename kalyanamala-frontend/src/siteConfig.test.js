import { BRAND, H1, ORG, YEARS_OF_SERVICE } from './siteConfig';

test('public brand is New Kalyanamala mala matrimony in vijayawada', () => {
  expect(BRAND).toBe('New Kalyanamala');
  expect(ORG).toBe('Kalyanamala Seva Samstha');
  expect(YEARS_OF_SERVICE).toBe(20);
  expect(H1).toBe('Where families meet, hopes blossom, and lifelong bonds begin.');
  expect(H1).toMatch(/lifelong bonds/);
  expect(H1).not.toMatch(/Unique profile IDs/);
});

test('Vijayawada office contact and branches are published', () => {
  const { BRANCH_ADDRESS, BRANCHES, HELPLINE_TEL, HELPLINE_DISPLAY } = require('./siteConfig');
  expect(HELPLINE_DISPLAY.replace(/\s/g, '')).toBe('9440545049');
  expect(HELPLINE_TEL).toBe('tel:+919440545049');
  expect(BRANCH_ADDRESS).toMatch(/Manohara Apartments/);
  expect(BRANCH_ADDRESS).toMatch(/Machavaram/);
  expect(BRANCH_ADDRESS).toMatch(/520004/);
  expect(BRANCHES.map((b) => b.city)).toEqual([
    'Vijayawada',
    'Rajamundry',
    'Vishakapatnam',
    'Gudivada',
    'Guntur',
    'Chirala',
    'Ongole',
    'Nellore',
    'Bangalore',
    'Chennai',
    'United States'
  ]);
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
});

test('header topbar no longer shows the Machavaram location line', () => {
  const fs = require('fs');
  const path = require('path');
  const header = fs.readFileSync(path.join(__dirname, 'components/SiteHeader.js'), 'utf8');
  expect(header).not.toMatch(/Vijayawada · Machavaram/);
  expect(header).toMatch(/Helpline/);
});
