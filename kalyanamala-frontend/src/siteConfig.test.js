import { BRAND, H1, ORG, YEARS_OF_SERVICE } from './siteConfig';

test('public brand is New Kalyanamala mala matrimony in vijayawada', () => {
  expect(BRAND).toBe('New Kalyanamala');
  expect(ORG).toBe('Kalyanamala Seva Samstha');
  expect(YEARS_OF_SERVICE).toBe(20);
  expect(H1).toBe("Your family's mala Matrimony in vijayawada");
  expect(H1).toMatch(/mala Matrimony/);
  expect(H1).toMatch(/vijayawada/);
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
});
