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

export const prettyLabel = (value, empty = '') => {
  if (value === undefined || value === null || value === '') return empty;
  const map = {
    Nevermarried: 'Never Married',
    never_married: 'Never Married',
    AwaitingDivorce: 'Awaiting Divorce',
    awaiting_divorce: 'Awaiting Divorce',
    Divorced: 'Divorced',
    divorced: 'Divorced',
    Widowed: 'Widowed',
    widowed: 'Widowed',
    male: 'Male',
    female: 'Female',
    any_religion: 'Any Religion',
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
    deleted: 'Deleted',
    draft: 'Draft'
  };
  if (map[value]) return map[value];
  return String(value)
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const displaySurname = (user = {}, profile = {}) => {
  const nested = profile?.userId && typeof profile.userId === 'object' ? profile.userId : {};
  return String(
    user?.surname
    || profile?.surname
    || nested.surname
    || user?.lastName
    || profile?.lastName
    || nested.lastName
    || ''
  ).trim();
};

export const displayAlternativePhone = (user = {}, profile = {}) => {
  const nested = profile?.userId && typeof profile.userId === 'object' ? profile.userId : {};
  return String(
    user?.alternativePhone
    || nested.alternativePhone
    || profile?.alternativePhone
    || ''
  ).trim();
};

export const fullName = (profile) => {
  const user = profile?.userId && typeof profile.userId === 'object' ? profile.userId : {};
  const first = profile?.firstName || user.firstName;
  const last = profile?.lastName || user.lastName;
  const surname = profile?.surname || user.surname;
  const parts = [first];
  if (last && last !== first) parts.push(last);
  if (surname && surname !== last && surname !== first) parts.push(surname);
  return parts.filter(Boolean).join(' ');
};

const LACS_THRESHOLD = 10000;

export const toIncomeRupees = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (n < LACS_THRESHOLD) return Math.round(n * 100000);
  return Math.round(n);
};

export const incomeToLacsInput = (income) => {
  const n = Number(income);
  if (!Number.isFinite(n) || n <= 0) return '';
  const lacs = n < LACS_THRESHOLD ? n : n / 100000;
  const rounded = Math.round(lacs * 10) / 10;
  if (rounded <= 0) return '';
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
};

export const formatIncome = (income) => {
  const amount = incomeToLacsInput(income);
  if (!amount) return '';
  const n = Number(amount);
  const unit = n === 1 ? 'lac' : 'lacs';
  return `${amount} ${unit}`;
};

export const profileToForm = (p = {}, extra = {}) => ({
  gender: p.gender || '',
  dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : '',
  heightFeet: p.heightFeet?.toString() || '',
  heightInches: p.heightInches?.toString() || '',
  height: heightToValue(p.heightFeet, p.heightInches),
  religion: p.religion || '',
  subCaste: p.subCaste || '',
  siblingsCount: p.siblingsCount === 0 || p.siblingsCount ? String(p.siblingsCount) : '',
  maritalStatus: p.maritalStatus || '',
  fatherName: p.fatherName || '',
  fatherOccupation: p.fatherOccupation || '',
  motherName: p.motherName || '',
  motherOccupation: p.motherOccupation || '',
  highestEducation: p.highestEducation || '',
  fieldOfStudy: p.fieldOfStudy || '',
  college: p.college || '',
  occupation: p.occupation || '',
  employmentType: p.employmentType || '',
  companyName: p.companyName || '',
  jobTitle: p.jobTitle || '',
  jobLocation: p.jobLocation || '',
  industry: p.industry || '',
  income: incomeToLacsInput(p.income),
  incomeCurrency: p.incomeCurrency || 'INR',
  streetName: p.currentAddress?.streetName || '',
  city: p.currentAddress?.city || '',
  state: p.currentAddress?.state || '',
  country: p.currentAddress?.country || 'India',
  pinCode: p.currentAddress?.pinCode || '',
  presentStreetName: p.presentAddress?.streetName || '',
  presentCity: p.presentAddress?.city || '',
  presentState: p.presentAddress?.state || '',
  presentCountry: p.presentAddress?.country || 'India',
  presentPinCode: p.presentAddress?.pinCode || '',
  fatherNativePlace: p.fatherNativePlace || '',
  motherNativePlace: p.motherNativePlace || '',
  aboutMe: p.aboutMe || '',
  partnerRequirement: p.partnerRequirement || '',
  preferredMatch: p.preferredMatch || 'any_religion',
  caste: 'Mala',
  alternativePhone: extra.alternativePhone || displayAlternativePhone(extra.user, p),
  showInSearch: !!p.showInSearch,
  approvalStatus: p.approvalStatus || 'pending'
});

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
