export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

export const compactState = (value) => String(value || '').replace(/\s+/g, '');

export const stateOptions = (compact = false) => (
  compact ? INDIAN_STATES.map(compactState) : INDIAN_STATES
);

export const matchStateOption = (apiState, options) => {
  const wanted = compactState(apiState).toLowerCase();
  if (!wanted) return '';
  return options.find((s) => compactState(s).toLowerCase() === wanted) || apiState;
};

export const HEIGHT_OPTIONS = (() => {
  const options = [];
  for (let feet = 4; feet <= 6; feet++) {
    const maxInches = feet === 6 ? 12 : 11;
    for (let inches = 0; inches <= maxInches; inches++) {
      const label = `${feet}.${inches}`;
      let storedFeet = feet;
      let storedInches = inches;
      if (inches === 12) {
        storedFeet = feet + 1;
        storedInches = 0;
      }
      options.push({
        label,
        value: label,
        feet: storedFeet,
        inches: storedInches
      });
    }
  }
  return options;
})();

export const heightToValue = (feet, inches) => {
  if (feet === '' || feet === undefined || feet === null) return '';
  const f = Number(feet);
  const i = Number(inches || 0);
  if (Number.isNaN(f)) return '';
  if (f === 7 && i === 0) return '6.12';
  return `${f}.${i}`;
};

export const parseHeightValue = (value) => {
  if (!value && value !== 0) return { heightFeet: '', heightInches: '' };
  const match = HEIGHT_OPTIONS.find((opt) => opt.value === String(value));
  if (match) {
    return { heightFeet: match.feet, heightInches: match.inches };
  }
  const [rawFeet, rawInches] = String(value).split('.');
  let heightFeet = Number(rawFeet);
  let heightInches = Number(rawInches || 0);
  if (heightInches === 12) {
    heightFeet += 1;
    heightInches = 0;
  }
  return { heightFeet, heightInches };
};

export const formatHeight = (feet, inches) => {
  const value = heightToValue(feet, inches);
  return value || '';
};

export const PIN_LOOKUP_HINT = 'Enter 6-digit PIN to auto-fill city, state and country';

export const pinLookupMessage = (status) => {
  if (status === 'looking') return 'Looking up PIN…';
  if (status === 'filled') return 'City, state and country filled from PIN';
  return PIN_LOOKUP_HINT;
};

export const pinLookupColor = (status) => (status === 'filled' ? '#1b7a3d' : '#555');

export const lookupIndianPincode = async (pin) => {
  if (!/^[0-9]{6}$/.test(pin)) return null;
  const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
  const data = await res.json();
  const offices = data?.[0]?.PostOffice;
  if (!Array.isArray(offices) || !offices.length) return null;
  const po = offices.find((item) => item?.DeliveryStatus === 'Delivery') || offices[0];
  return {
    area: String(po?.Name || '').trim(),
    city: String(po?.District || po?.Block || po?.Name || '').trim(),
    state: String(po?.State || '').trim(),
    country: String(po?.Country || 'India').trim() || 'India'
  };
};
