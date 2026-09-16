import React, { useContext, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  HEIGHT_OPTIONS,
  heightToValue,
  lookupIndianPincode,
  matchStateOption,
  parseHeightValue,
  pinLookupColor,
  pinLookupMessage,
  stateOptions
} from '../../utils/profileFormHelpers';

const API_BASE = 'https://kalyanamala-backend-production.up.railway.app';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  alternativePhone: '',
  gender: '',
  dateOfBirth: '',
  height: '',
  heightFeet: '',
  heightInches: '',
  religion: '',
  subCaste: '',
  siblingsCount: '',
  maritalStatus: '',
  fatherName: '',
  fatherOccupation: '',
  motherName: '',
  motherOccupation: '',
  highestEducation: '',
  fieldOfStudy: '',
  college: '',
  occupation: '',
  employmentType: '',
  companyName: '',
  jobTitle: '',
  jobLocation: '',
  industry: '',
  income: '',
  streetName: '',
  city: '',
  state: '',
  country: 'India',
  pinCode: '',
  presentStreetName: '',
  presentCity: '',
  presentState: '',
  presentCountry: 'India',
  presentPinCode: '',
  nativePlace: '',
  fatherNativePlace: '',
  motherNativePlace: '',
  aboutMe: '',
  partnerRequirement: '',
  preferredMatch: 'any_religion'
};

const southIndianStates = stateOptions(false);

const educationOptions = [
  '10th Pass','12th Pass','Diploma','ITI','B.A','B.Sc','B.Com','B.Tech',
  'M.A','M.Sc','M.Com','M.Tech','MBA','MCA','MBBS','BDS','MD','MS','PhD','Other'
];

const maritalStatusOptions = [
  { label: 'Never married', value: 'Nevermarried' },
  { label: 'Divorced', value: 'Divorced' },
  { label: 'Widowed', value: 'Widowed' },
  { label: 'Awaiting Divorce', value: 'AwaitingDivorce' }
];

const religionOptions = [
  { label: 'Christian', value: 'Christian' },
  { label: 'Hindu', value: 'Hindu' },
  { label: 'Ambedkarist', value: 'Ambedkarist' },
  { label: 'Buddhist', value: 'Buddhist' },
  { label: 'Other', value: 'Other' }
];

const subCasteOptions = [
  { label: 'SC', value: 'SC' },
  { label: 'BC', value: 'BC' },
  { label: 'OC', value: 'OC' },
  { label: 'NA', value: 'NA' }
];

const employmentTypeOptions = [
  { label: 'Private', value: 'private' },
  { label: 'Public', value: 'public' },
  { label: 'Govt', value: 'govt' },
  { label: 'Business', value: 'business' },
  { label: 'Self Employed', value: 'self-employed' },
  { label: 'Other', value: 'other' }
];

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' }
];

const siblingCountOptions = [0,1,2,3];

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginTop: '5px',
  marginBottom: '14px',
  boxSizing: 'border-box'
};

const sectionStyle = {
  border: '1px solid #ddd',
  padding: '18px',
  marginBottom: '20px',
  borderRadius: '8px',
  background: '#fafafa'
};

const buttonStyle = {
  padding: '12px 20px',
  backgroundColor: '#2196F3',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

const successBoxStyle = {
  background: '#e8f5e9',
  border: '1px solid #4CAF50',
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '20px'
};

function getMaxDOBFor18Plus() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split('T')[0];
}

function calculateAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function digitsOnly(value, max) {
  return String(value || '').replace(/\D/g, '').slice(0, max);
}

const CreateProfile = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form,setForm] = useState(initialForm);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState('');
  const [fieldErrors,setFieldErrors] = useState({});
  const [pinStatus,setPinStatus] = useState({});
  const [createdInfo,setCreatedInfo] = useState(null);

  const maxDOB = useMemo(() => getMaxDOBFor18Plus(), []);
  const age = useMemo(() => calculateAge(form.dateOfBirth), [form.dateOfBirth]);

  const fillAddressFromPin = async (fieldName, pin) => {
    setPinStatus((prev) => ({ ...prev, [fieldName]: 'looking' }));
    try {
      const details = await lookupIndianPincode(pin);
      if (!details) {
        setPinStatus((prev) => ({ ...prev, [fieldName]: '' }));
        setFieldErrors((prev) => ({ ...prev, [fieldName]: 'No address found for this PIN' }));
        return;
      }
      const state = matchStateOption(details.state, southIndianStates);
      if (fieldName === 'presentPinCode') {
        setForm((prev) => ({
          ...prev,
          presentCity: details.city || prev.presentCity,
          presentState: state || prev.presentState,
          presentCountry: details.country || prev.presentCountry || 'India',
          presentStreetName: prev.presentStreetName || details.area || ''
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          city: details.city || prev.city,
          state: state || prev.state,
          country: details.country || prev.country || 'India',
          streetName: prev.streetName || details.area || ''
        }));
      }
      setPinStatus((prev) => ({ ...prev, [fieldName]: 'filled' }));
    } catch (err) {
      setPinStatus((prev) => ({ ...prev, [fieldName]: '' }));
      setFieldErrors((prev) => ({ ...prev, [fieldName]: 'Could not look up this PIN' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'phone' || name === 'alternativePhone') {
      next = digitsOnly(value, 10);
    } else if (name === 'pinCode' || name === 'presentPinCode') {
      next = digitsOnly(value, 6);
    } else if (name === 'height') {
      const parsed = parseHeightValue(next);
      setForm((prev) => ({
        ...prev,
        height: next,
        heightFeet: parsed.heightFeet === '' ? '' : String(parsed.heightFeet),
        heightInches: parsed.heightInches === '' ? '' : String(parsed.heightInches)
      }));
      setFieldErrors((prev) => ({ ...prev, height: '', heightFeet: '', heightInches: '' }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: next }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'pinCode' || name === 'presentPinCode') {
      if (next.length === 6) {
        fillAddressFromPin(name, next);
      } else {
        setPinStatus((prev) => ({ ...prev, [name]: '' }));
      }
    }
  };

  const mapServerErrors = (data) => {
    const mapped = {};
    if (Array.isArray(data?.details)) {
      data.details.forEach((item) => {
        if (item?.field) {
          mapped[item.field] = item.message;
        }
      });
    }
    return mapped;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setCreatedInfo(null);

    if (!age || age < 18) {
      setError('User must be at least 18 years old.');
      return;
    }

    if (!/^[0-9]{10}$/.test(form.phone)) {
      setError('Phone must be 10 digits.');
      return;
    }

    if (form.alternativePhone && !/^[0-9]{10}$/.test(form.alternativePhone)) {
      setError('Alternate mobile must be 10 digits.');
      return;
    }

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      alternativePhone: form.alternativePhone || undefined,

      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      heightFeet: parseHeightValue(form.height || heightToValue(form.heightFeet, form.heightInches)).heightFeet,
      heightInches: parseHeightValue(form.height || heightToValue(form.heightFeet, form.heightInches)).heightInches,
      religion: form.religion,
      subCaste: form.subCaste,
      siblingsCount: Number(form.siblingsCount || 0),
      maritalStatus: form.maritalStatus,
      fatherName: form.fatherName,
      fatherOccupation: form.fatherOccupation,
      fatherNativePlace: form.fatherNativePlace,
      motherName: form.motherName,
      motherOccupation: form.motherOccupation,
      motherNativePlace: form.motherNativePlace,
      highestEducation: form.highestEducation,
      fieldOfStudy: form.fieldOfStudy,
      college: form.college,
      occupation: form.occupation,
      employmentType: form.employmentType,
      companyName: form.companyName,
      jobTitle: form.jobTitle,
      jobLocation: form.jobLocation,
      industry: form.industry,
      income: Number(form.income),
      incomeCurrency: 'INR',
      currentAddress: {
        streetName: form.streetName,
        city: form.city,
        state: form.state,
        country: form.country,
        pinCode: form.pinCode
      },
      presentAddress: {
        streetName: form.presentStreetName,
        city: form.presentCity,
        state: form.presentState,
        country: form.presentCountry,
        pinCode: form.presentPinCode
      },
      nativePlace: form.nativePlace,
      aboutMe: form.aboutMe,
      partnerRequirement: form.partnerRequirement,
      preferredMatch: form.preferredMatch,
      caste: 'Mala'
    };

    try {
      setSaving(true);

      const res = await axios.post(`${API_BASE}/api/profiles/admin-create`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCreatedInfo({
        email: form.email,
        phone: form.phone,
        tempPassword: res.data.tempPassword,
        profileId: res.data.profile?.profileId
      });

      setForm(initialForm);
      window.scrollTo(0, 0);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || data?.error || 'Failed to create profile');
      setFieldErrors(mapServerErrors(data));
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '950px', margin: '40px auto', padding: '20px' }}>
      <h2>Create New Profile</h2>

      <div style={sectionStyle}>
        <p>
          <strong>Admin:</strong> {user?.firstName || '-'} {user?.surname || ''}
        </p>
      </div>

      {createdInfo && (
        <div style={successBoxStyle}>
          <h3 style={{ marginTop: 0 }}>Profile created successfully</h3>
          <p><strong>Profile ID:</strong> {createdInfo.profileId}</p>
          <p style={{ color: '#555' }}>Male IDs start with M and female IDs with F, sharing one 5-digit sequence (M00001, then F00002, and so on).</p>
          <p><strong>Login (email):</strong> {createdInfo.email}</p>
          <p><strong>Login (phone):</strong> {createdInfo.phone}</p>
          <p><strong>Temporary password:</strong> {createdInfo.tempPassword}</p>
          <p style={{ color: '#555' }}>
            Default format is the first 4 letters of the name, then @, then the last 4 digits of the registered mobile.
            Share these details with the user. They should change the password after first login.
          </p>
          <button type="button" onClick={() => navigate('/admin')} style={buttonStyle}>
            Back to Dashboard
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            color: 'red',
            marginBottom: '15px',
            padding: '10px',
            background: '#ffebee',
            borderRadius: '6px'
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={sectionStyle}>
          <h3>Personal Details</h3>

          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          {fieldErrors.firstName && <div style={{ color: 'red' }}>{fieldErrors.firstName}</div>}

          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          {fieldErrors.lastName && <div style={{ color: 'red' }}>{fieldErrors.lastName}</div>}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          {fieldErrors.email && <div style={{ color: 'red' }}>{fieldErrors.email}</div>}

          <label htmlFor="phone">Phone (10 digits)</label>
          <input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            style={inputStyle}
            inputMode="numeric"
            maxLength="10"
            required
          />
          {form.phone.length >= 1 && form.phone.length <= 9 && (
            <div style={{ color: 'red' }}>Phone must be 10 digits</div>
          )}
          {fieldErrors.phone && <div style={{ color: 'red' }}>{fieldErrors.phone}</div>}

          <label htmlFor="alternativePhone">Alternate Mobile</label>
          <input
            id="alternativePhone"
            name="alternativePhone"
            value={form.alternativePhone}
            onChange={handleChange}
            style={inputStyle}
            inputMode="numeric"
            maxLength="10"
          />
          {form.alternativePhone.length >= 1 && form.alternativePhone.length <= 9 && (
            <div style={{ color: 'red' }}>Alternate mobile must be 10 digits</div>
          )}
          {fieldErrors.alternativePhone && <div style={{ color: 'red' }}>{fieldErrors.alternativePhone}</div>}
        </div>

        <div style={sectionStyle}>
          <h3>Basic Details</h3>

          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Select</option>
            {genderOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {fieldErrors.gender && <div style={{ color: 'red' }}>{fieldErrors.gender}</div>}

          <label htmlFor="dateOfBirth">DOB</label>
          <input
            id="dateOfBirth"
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
            style={inputStyle}
            max={maxDOB}
            required
          />
          {fieldErrors.dateOfBirth && <div style={{ color: 'red' }}>{fieldErrors.dateOfBirth}</div>}

          <label htmlFor="height">Height</label>
          <select
            id="height"
            name="height"
            value={form.height || heightToValue(form.heightFeet, form.heightInches)}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Select</option>
            {HEIGHT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {fieldErrors.height && <div style={{ color: 'red' }}>{fieldErrors.height}</div>}
          {fieldErrors.heightFeet && <div style={{ color: 'red' }}>{fieldErrors.heightFeet}</div>}
          {fieldErrors.heightInches && <div style={{ color: 'red' }}>{fieldErrors.heightInches}</div>}
        </div>

        <div style={sectionStyle}>
          <h3>Religion &amp; Family</h3>

          <label htmlFor="religion">Religion</label>
          <select
            id="religion"
            name="religion"
            value={form.religion}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Select</option>
            {religionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {fieldErrors.religion && <div style={{ color: 'red' }}>{fieldErrors.religion}</div>}

          <label htmlFor="caste">Caste</label>
          <input
            id="caste"
            name="caste"
            value="Mala"
            readOnly
            disabled
            style={inputStyle}
          />

          <label htmlFor="subCaste">Sub Caste</label>
          <select
            id="subCaste"
            name="subCaste"
            value={form.subCaste}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Select</option>
            {subCasteOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {fieldErrors.subCaste && <div style={{ color: 'red' }}>{fieldErrors.subCaste}</div>}

          <label htmlFor="siblingsCount">No. of siblings</label>
          <select
            id="siblingsCount"
            name="siblingsCount"
            value={form.siblingsCount}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Select</option>
            {siblingCountOptions.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          {fieldErrors.siblingsCount && <div style={{ color: 'red' }}>{fieldErrors.siblingsCount}</div>}

          <label htmlFor="maritalStatus">Marital status</label>
          <select
            id="maritalStatus"
            name="maritalStatus"
            value={form.maritalStatus}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Select</option>
            {maritalStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {fieldErrors.maritalStatus && <div style={{ color: 'red' }}>{fieldErrors.maritalStatus}</div>}

          <label htmlFor="nativePlace">Native Place</label>
          <input
            id="nativePlace"
            name="nativePlace"
            value={form.nativePlace}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          {fieldErrors.nativePlace && <div style={{ color: 'red' }}>{fieldErrors.nativePlace}</div>}

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 280px' }}>
              <label htmlFor="fatherName">Father’s Name</label>
              <input
                id="fatherName"
                name="fatherName"
                value={form.fatherName}
                onChange={handleChange}
                style={inputStyle}
                required
              />
              {fieldErrors.fatherName && <div style={{ color: 'red' }}>{fieldErrors.fatherName}</div>}

              <label htmlFor="fatherOccupation">Father Occupation</label>
              <input
                id="fatherOccupation"
                name="fatherOccupation"
                value={form.fatherOccupation}
                onChange={handleChange}
                style={inputStyle}
                required
              />
              {fieldErrors.fatherOccupation && <div style={{ color: 'red' }}>{fieldErrors.fatherOccupation}</div>}

              <label htmlFor="fatherNativePlace">Father Native</label>
              <input
                id="fatherNativePlace"
                name="fatherNativePlace"
                value={form.fatherNativePlace}
                onChange={handleChange}
                style={inputStyle}
                required
              />
              {fieldErrors.fatherNativePlace && <div style={{ color: 'red' }}>{fieldErrors.fatherNativePlace}</div>}
            </div>
            <div style={{ flex: '1 1 280px' }}>
              <label htmlFor="motherName">Mother’s Name</label>
              <input
                id="motherName"
                name="motherName"
                value={form.motherName}
                onChange={handleChange}
                style={inputStyle}
                required
              />
              {fieldErrors.motherName && <div style={{ color: 'red' }}>{fieldErrors.motherName}</div>}

              <label htmlFor="motherOccupation">Mother Occupation</label>
              <input
                id="motherOccupation"
                name="motherOccupation"
                value={form.motherOccupation}
                onChange={handleChange}
                style={inputStyle}
                required
              />
              {fieldErrors.motherOccupation && <div style={{ color: 'red' }}>{fieldErrors.motherOccupation}</div>}

              <label htmlFor="motherNativePlace">Mother Native</label>
              <input
                id="motherNativePlace"
                name="motherNativePlace"
                value={form.motherNativePlace}
                onChange={handleChange}
                style={inputStyle}
                required
              />
              {fieldErrors.motherNativePlace && <div style={{ color: 'red' }}>{fieldErrors.motherNativePlace}</div>}
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h3>Professional &amp; Education</h3>

          <label htmlFor="highestEducation">Highest Education</label>
          <select
            id="highestEducation"
            name="highestEducation"
            value={form.highestEducation}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Select</option>
            {educationOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {fieldErrors.highestEducation && <div style={{ color: 'red' }}>{fieldErrors.highestEducation}</div>}

          <label htmlFor="fieldOfStudy">Field of Study</label>
          <input
            id="fieldOfStudy"
            name="fieldOfStudy"
            value={form.fieldOfStudy}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          {fieldErrors.fieldOfStudy && <div style={{ color: 'red' }}>{fieldErrors.fieldOfStudy}</div>}

          <label htmlFor="college">College</label>
          <input
            id="college"
            name="college"
            value={form.college}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          {fieldErrors.college && <div style={{ color: 'red' }}>{fieldErrors.college}</div>}

          <label htmlFor="occupation">Occupation</label>
          <input
            id="occupation"
            name="occupation"
            value={form.occupation}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          {fieldErrors.occupation && <div style={{ color: 'red' }}>{fieldErrors.occupation}</div>}

          <label htmlFor="employmentType">Employment Type</label>
          <select
            id="employmentType"
            name="employmentType"
            value={form.employmentType}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Select</option>
            {employmentTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {fieldErrors.employmentType && <div style={{ color: 'red' }}>{fieldErrors.employmentType}</div>}

          <label htmlFor="companyName">Company Name</label>
          <input
            id="companyName"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          {fieldErrors.companyName && <div style={{ color: 'red' }}>{fieldErrors.companyName}</div>}

          <label htmlFor="jobTitle">Job Title</label>
          <input
            id="jobTitle"
            name="jobTitle"
            value={form.jobTitle}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          {fieldErrors.jobTitle && <div style={{ color: 'red' }}>{fieldErrors.jobTitle}</div>}

          <label htmlFor="jobLocation">Job Location</label>
          <input
            id="jobLocation"
            name="jobLocation"
            value={form.jobLocation}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          {fieldErrors.jobLocation && <div style={{ color: 'red' }}>{fieldErrors.jobLocation}</div>}

          <label htmlFor="industry">Industry</label>
          <input
            id="industry"
            name="industry"
            value={form.industry}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          {fieldErrors.industry && <div style={{ color: 'red' }}>{fieldErrors.industry}</div>}

          <label htmlFor="income">Income</label>
          <input
            id="income"
            type="number"
            name="income"
            value={form.income}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          {fieldErrors.income && <div style={{ color: 'red' }}>{fieldErrors.income}</div>}
        </div>

        <div style={sectionStyle}>
          <h3>Current Address</h3>

          <label htmlFor="pinCode">Pin Code</label>
          <input
            id="pinCode"
            name="pinCode"
            value={form.pinCode}
            onChange={handleChange}
            style={inputStyle}
            inputMode="numeric"
            maxLength="6"
            required
          />
          <div style={{ color: pinLookupColor(pinStatus.pinCode), fontSize: 12, marginTop: -6, marginBottom: 12 }}>
            {pinLookupMessage(pinStatus.pinCode)}
          </div>
          {(fieldErrors.pinCode || fieldErrors['currentAddress.pinCode']) && (
            <div style={{ color: 'red' }}>{fieldErrors.pinCode || fieldErrors['currentAddress.pinCode']}</div>
          )}

          <label htmlFor="city">City</label>
          <input
            id="city"
            name="city"
            value={form.city}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          {fieldErrors['currentAddress.city'] && (
            <div style={{ color: 'red' }}>{fieldErrors['currentAddress.city']}</div>
          )}

          <label htmlFor="state">State</label>
          <select
            id="state"
            name="state"
            value={form.state}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Select State</option>
            {southIndianStates.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            {form.state && !southIndianStates.includes(form.state) && (
              <option value={form.state}>{form.state}</option>
            )}
          </select>
          {fieldErrors['currentAddress.state'] && (
            <div style={{ color: 'red' }}>{fieldErrors['currentAddress.state']}</div>
          )}

          <label htmlFor="country">Country</label>
          <input
            id="country"
            name="country"
            value={form.country}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          {fieldErrors['currentAddress.country'] && (
            <div style={{ color: 'red' }}>{fieldErrors['currentAddress.country']}</div>
          )}

          <label htmlFor="streetName">Street Name</label>
          <input
            id="streetName"
            name="streetName"
            value={form.streetName}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          {fieldErrors['currentAddress.streetName'] && (
            <div style={{ color: 'red' }}>{fieldErrors['currentAddress.streetName']}</div>
          )}
        </div>

        <div style={sectionStyle}>
          <h3>Present Address</h3>

          <label htmlFor="presentPinCode">Pin Code</label>
          <input
            id="presentPinCode"
            name="presentPinCode"
            value={form.presentPinCode}
            onChange={handleChange}
            style={inputStyle}
            inputMode="numeric"
            maxLength="6"
            required
          />
          <div style={{ color: pinLookupColor(pinStatus.presentPinCode), fontSize: 12, marginTop: -6, marginBottom: 12 }}>
            {pinLookupMessage(pinStatus.presentPinCode)}
          </div>
          {(fieldErrors.presentPinCode || fieldErrors['presentAddress.pinCode']) && (
            <div style={{ color: 'red' }}>{fieldErrors.presentPinCode || fieldErrors['presentAddress.pinCode']}</div>
          )}

          <label htmlFor="presentCity">City</label>
          <input
            id="presentCity"
            name="presentCity"
            value={form.presentCity}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          {fieldErrors['presentAddress.city'] && (
            <div style={{ color: 'red' }}>{fieldErrors['presentAddress.city']}</div>
          )}

          <label htmlFor="presentState">State</label>
          <select
            id="presentState"
            name="presentState"
            value={form.presentState}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Select State</option>
            {southIndianStates.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            {form.presentState && !southIndianStates.includes(form.presentState) && (
              <option value={form.presentState}>{form.presentState}</option>
            )}
          </select>
          {fieldErrors['presentAddress.state'] && (
            <div style={{ color: 'red' }}>{fieldErrors['presentAddress.state']}</div>
          )}

          <label htmlFor="presentCountry">Country</label>
          <input
            id="presentCountry"
            name="presentCountry"
            value={form.presentCountry}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          {fieldErrors['presentAddress.country'] && (
            <div style={{ color: 'red' }}>{fieldErrors['presentAddress.country']}</div>
          )}

          <label htmlFor="presentStreetName">Street Name</label>
          <input
            id="presentStreetName"
            name="presentStreetName"
            value={form.presentStreetName}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          {fieldErrors['presentAddress.streetName'] && (
            <div style={{ color: 'red' }}>{fieldErrors['presentAddress.streetName']}</div>
          )}
        </div>

        <div style={sectionStyle}>
          <h3>About &amp; Preference</h3>

          <label htmlFor="aboutMe">About Me</label>
          <textarea
            id="aboutMe"
            name="aboutMe"
            value={form.aboutMe}
            onChange={handleChange}
            rows="5"
            style={inputStyle}
            required
          />
          {fieldErrors.aboutMe && <div style={{ color: 'red' }}>{fieldErrors.aboutMe}</div>}

          <label htmlFor="partnerRequirement">Partner Requirement</label>
          <textarea
            id="partnerRequirement"
            name="partnerRequirement"
            value={form.partnerRequirement}
            onChange={handleChange}
            rows="5"
            maxLength="1000"
            style={inputStyle}
            required
          />
          {fieldErrors.partnerRequirement && <div style={{ color: 'red' }}>{fieldErrors.partnerRequirement}</div>}

          <label htmlFor="preferredMatch">Preferred Match</label>
          <select
            id="preferredMatch"
            name="preferredMatch"
            value={form.preferredMatch}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="same_religion">Same Religion</option>
            <option value="any_religion">Any Religion</option>
            <option value="open">Open</option>
          </select>
        </div>

        <button type="submit" disabled={saving} style={buttonStyle}>
          {saving ? 'Saving...' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
};

export default CreateProfile;
