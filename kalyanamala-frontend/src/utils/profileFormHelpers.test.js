import {
  HEIGHT_OPTIONS,
  formatHeight,
  heightToValue,
  lookupIndianPincode,
  matchStateOption,
  parseHeightValue,
  pinLookupMessage,
  prettyLabel,
  fullName,
  formatIncome,
  stateOptions
} from './profileFormHelpers';

test('height dropdown runs from 4.0 to 6.12', () => {
  expect(HEIGHT_OPTIONS[0].value).toBe('4.0');
  expect(HEIGHT_OPTIONS[HEIGHT_OPTIONS.length - 1].value).toBe('6.12');
  expect(HEIGHT_OPTIONS.find((opt) => opt.value === '5.10')).toEqual({
    label: '5.10',
    value: '5.10',
    feet: 5,
    inches: 10
  });
  expect(parseHeightValue('6.12')).toEqual({ heightFeet: 7, heightInches: 0 });
  expect(heightToValue(7, 0)).toBe('6.12');
  expect(formatHeight(5, 8)).toBe('5.8');
});

test('pincode state names map onto the form options', () => {
  const compact = stateOptions(true);
  const spaced = stateOptions(false);
  expect(matchStateOption('Tamil Nadu', compact)).toBe('TamilNadu');
  expect(matchStateOption('Andhra Pradesh', spaced)).toBe('Andhra Pradesh');
  expect(matchStateOption('Telangana', compact)).toBe('Telangana');
});

test('lookupIndianPincode fills city, state and country', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ([{
      Status: 'Success',
      PostOffice: [{
        Name: 'Hyderabad',
        District: 'Hyderabad',
        State: 'Telangana',
        Country: 'India',
        DeliveryStatus: 'Delivery'
      }]
    }])
  });
  await expect(lookupIndianPincode('500001')).resolves.toEqual({
    area: 'Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India'
  });
  expect(global.fetch).toHaveBeenCalledWith('https://api.postalpincode.in/pincode/500001');
});

test('pin lookup helper text updates after a successful fill', () => {
  expect(pinLookupMessage('')).toMatch(/auto-fill city, state and country/i);
  expect(pinLookupMessage('looking')).toBe('Looking up PIN…');
  expect(pinLookupMessage('filled')).toBe('City, state and country filled from PIN');
});

test('prettyLabel and fullName format profile fields for display', () => {
  expect(prettyLabel('Nevermarried')).toBe('Never Married');
  expect(prettyLabel('male')).toBe('Male');
  expect(prettyLabel('any_religion')).toBe('Any Religion');
  expect(fullName({ firstName: 'Sita', userId: { lastName: 'Devi', surname: 'Reddy' } })).toBe('Sita Devi Reddy');
});

test('formatIncome shows lacs instead of a rupee amount with zeros', () => {
  expect(formatIncome(1200000)).toBe('12 lacs');
  expect(formatIncome(1250000)).toBe('12.5 lacs');
  expect(formatIncome(100000)).toBe('1 lac');
  expect(formatIncome(800000)).toBe('8 lacs');
  expect(formatIncome(0)).toBe('');
  expect(formatIncome('')).toBe('');
});
