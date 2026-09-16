import React, { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
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

const southIndianStates = stateOptions(false);

const educationOptions = [
  '10th Pass',
  '12th Pass',
  'Diploma',
  'ITI',
  'B.A',
  'B.Sc',
  'B.Com',
  'B.Tech',
  'M.A',
  'M.Sc',
  'M.Com',
  'M.Tech',
  'MBA',
  'MCA',
  'MBBS',
  'BDS',
  'MD',
  'MS',
  'PhD',
  'Other'
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

const EditProfile = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState('');
  const [fieldErrors,setFieldErrors] = useState({});
  const [pinStatus,setPinStatus] = useState({});
  const [form,setForm] = useState({
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
    preferredMatch: 'any_religion',
    showInSearch: false,
    approvalStatus: 'pending'
  });

  const maxDOB = useMemo(() => getMaxDOBFor18Plus(), []);
  const age = useMemo(() => calculateAge(form.dateOfBirth), [form.dateOfBirth]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/profiles/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const p = res.data.profile;

        setForm({
          gender: p.gender || '',
          dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : '',
          heightFeet: p.heightFeet?.toString() || '',
          heightInches: p.heightInches?.toString() || '',
          height: heightToValue(p.heightFeet, p.heightInches),
          religion: p.religion || '',
          subCaste: p.subCaste || '',
          siblingsCount: p.siblingsCount?.toString() || '',
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
          income: p.income?.toString() || '',
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
          nativePlace: p.nativePlace || '',
          fatherNativePlace: p.fatherNativePlace || '',
          motherNativePlace: p.motherNativePlace || '',
          aboutMe: p.aboutMe || '',
          partnerRequirement: p.partnerRequirement || '',
          preferredMatch: p.preferredMatch || 'any_religion',
          showInSearch: p.showInSearch || false,
          approvalStatus: p.approvalStatus || 'pending'
        });
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id,token]);

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
    const { name, value, type, checked } = e.target;
    let next = type === 'checkbox' ? checked : value;
    if (type !== 'checkbox' && (name === 'phone' || name === 'alternativePhone')) {
      next = digitsOnly(value, 10);
    } else if (type !== 'checkbox' && (name === 'pinCode' || name === 'presentPinCode')) {
      next = digitsOnly(value, 6);
    } else if (type !== 'checkbox' && name === 'height') {
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
    setForm((prev) => ({
      ...prev,
      [name]: next
    }));
    setFieldErrors((prev) => ({
      ...prev,
      [name]: ''
    }));
    if (name === 'pinCode' || name === 'presentPinCode') {
      if (next.length === 6) {
        fillAddressFromPin(name, next);
      } else {
        setPinStatus((prev) => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!age || age < 18) {
      setError('User must be at least 18 years old.');
      return;
    }

    const payload = {
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
      approvalStatus: form.approvalStatus,
      showInSearch: form.showInSearch,
      caste: 'Mala'
    };

    try {
      setSaving(true);

      await axios.put(`${API_BASE}/api/profiles/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/admin');
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || data?.error || 'Failed to save profile');

      if (Array.isArray(data?.details)) {
        const mapped = {};
        data.details.forEach((item) => {
          if (item?.field) {
            mapped[item.field] = item.message;
          }
        });
        setFieldErrors(mapped);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '30px' }}>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: '950px', margin: '40px auto', padding: '20px' }}>
      <h2>Edit Profile</h2>

      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', background: '#ffebee', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={sectionStyle}>
          <h3>Basic Details</h3>

          <label htmlFor="gender">Gender</label>
          <select id="gender" name="gender" value={form.gender} onChange={handleChange} style={inputStyle} required>
            <option value="">Select</option>
            {genderOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

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

          <label htmlFor="height">Height</label>
          <select id="height" name="height" value={form.height || heightToValue(form.heightFeet, form.heightInches)} onChange={handleChange} style={inputStyle} required>
            <option value="">Select</option>
            {HEIGHT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div style={sectionStyle}>
          <h3>Religion & Family</h3>

          <label htmlFor="religion">Religion</label>
          <select id="religion" name="religion" value={form.religion} onChange={handleChange} style={inputStyle} required>
            <option value="">Select</option>
            {religionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <label htmlFor="caste">Caste</label>
          <input id="caste" name="caste" value="Mala" readOnly disabled style={inputStyle} />

          <label htmlFor="subCaste">Sub Caste</label>
          <select id="subCaste" name="subCaste" value={form.subCaste} onChange={handleChange} style={inputStyle} required>
            <option value="">Select</option>
            {subCasteOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <label htmlFor="siblingsCount">No. of siblings</label>
          <select id="siblingsCount" name="siblingsCount" value={form.siblingsCount} onChange={handleChange} style={inputStyle} required>
            <option value="">Select</option>
            {siblingCountOptions.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <label htmlFor="maritalStatus">Marital status</label>
          <select id="maritalStatus" name="maritalStatus" value={form.maritalStatus} onChange={handleChange} style={inputStyle} required>
            <option value="">Select</option>
            {maritalStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <label htmlFor="nativePlace">Native Place</label>
          <input id="nativePlace" name="nativePlace" value={form.nativePlace} onChange={handleChange} style={inputStyle} required />

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 280px' }}>
              <label htmlFor="fatherName">Father’s Name</label>
              <input id="fatherName" name="fatherName" value={form.fatherName} onChange={handleChange} style={inputStyle} required />

              <label htmlFor="fatherOccupation">Father Occupation</label>
              <input id="fatherOccupation" name="fatherOccupation" value={form.fatherOccupation} onChange={handleChange} style={inputStyle} required />

              <label htmlFor="fatherNativePlace">Father Native</label>
              <input id="fatherNativePlace" name="fatherNativePlace" value={form.fatherNativePlace} onChange={handleChange} style={inputStyle} required />
            </div>
            <div style={{ flex: '1 1 280px' }}>
              <label htmlFor="motherName">Mother’s Name</label>
              <input id="motherName" name="motherName" value={form.motherName} onChange={handleChange} style={inputStyle} required />

              <label htmlFor="motherOccupation">Mother Occupation</label>
              <input id="motherOccupation" name="motherOccupation" value={form.motherOccupation} onChange={handleChange} style={inputStyle} required />

              <label htmlFor="motherNativePlace">Mother Native</label>
              <input id="motherNativePlace" name="motherNativePlace" value={form.motherNativePlace} onChange={handleChange} style={inputStyle} required />
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h3>Professional & Education</h3>

          <label htmlFor="highestEducation">Highest Education</label>
          <select id="highestEducation" name="highestEducation" value={form.highestEducation} onChange={handleChange} style={inputStyle} required>
            <option value="">Select</option>
            {educationOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <label htmlFor="fieldOfStudy">Field of Study</label>
          <input id="fieldOfStudy" name="fieldOfStudy" value={form.fieldOfStudy} onChange={handleChange} style={inputStyle} required />

          <label htmlFor="college">College</label>
          <input id="college" name="college" value={form.college} onChange={handleChange} style={inputStyle} required />

          <label htmlFor="occupation">Occupation</label>
          <input id="occupation" name="occupation" value={form.occupation} onChange={handleChange} style={inputStyle} required />

          <label htmlFor="employmentType">Employment Type</label>
          <select id="employmentType" name="employmentType" value={form.employmentType} onChange={handleChange} style={inputStyle} required>
            <option value="">Select</option>
            {employmentTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <label htmlFor="companyName">Company Name</label>
          <input id="companyName" name="companyName" value={form.companyName} onChange={handleChange} style={inputStyle} required />

          <label htmlFor="jobTitle">Job Title</label>
          <input id="jobTitle" name="jobTitle" value={form.jobTitle} onChange={handleChange} style={inputStyle} required />

          <label htmlFor="jobLocation">Job Location</label>
          <input id="jobLocation" name="jobLocation" value={form.jobLocation} onChange={handleChange} style={inputStyle} required />

          <label htmlFor="industry">Industry</label>
          <input id="industry" name="industry" value={form.industry} onChange={handleChange} style={inputStyle} required />

          <label htmlFor="income">Income</label>
          <input id="income" type="number" name="income" value={form.income} onChange={handleChange} style={inputStyle} required />
        </div>

        <div style={sectionStyle}>
          <h3>Current Address</h3>

          <label htmlFor="pinCode">Pin Code</label>
          <input id="pinCode" name="pinCode" value={form.pinCode} onChange={handleChange} style={inputStyle} inputMode="numeric" maxLength={6} required />
          <div style={{ color: pinLookupColor(pinStatus.pinCode), fontSize: 12, marginTop: -6, marginBottom: 12 }}>
            {pinLookupMessage(pinStatus.pinCode)}
          </div>
          {fieldErrors.pinCode && <div style={{ color: 'red' }}>{fieldErrors.pinCode}</div>}

          <label htmlFor="city">City</label>
          <input id="city" name="city" value={form.city} onChange={handleChange} style={inputStyle} required />

          <label htmlFor="state">State</label>
          <select id="state" name="state" value={form.state} onChange={handleChange} style={inputStyle} required>
            <option value="">Select State</option>
            {southIndianStates.map((s) => <option key={s} value={s}>{s}</option>)}
            {form.state && !southIndianStates.includes(form.state) && <option value={form.state}>{form.state}</option>}
          </select>

          <label htmlFor="country">Country</label>
          <input id="country" name="country" value={form.country} onChange={handleChange} style={inputStyle} required />

          <label htmlFor="streetName">Street Name</label>
          <input id="streetName" name="streetName" value={form.streetName} onChange={handleChange} style={inputStyle} required />
        </div>

        <div style={sectionStyle}>
          <h3>Present Address</h3>

          <label htmlFor="presentPinCode">Pin Code</label>
          <input id="presentPinCode" name="presentPinCode" value={form.presentPinCode} onChange={handleChange} style={inputStyle} inputMode="numeric" maxLength={6} required />
          <div style={{ color: pinLookupColor(pinStatus.presentPinCode), fontSize: 12, marginTop: -6, marginBottom: 12 }}>
            {pinLookupMessage(pinStatus.presentPinCode)}
          </div>
          {fieldErrors.presentPinCode && <div style={{ color: 'red' }}>{fieldErrors.presentPinCode}</div>}

          <label htmlFor="presentCity">City</label>
          <input id="presentCity" name="presentCity" value={form.presentCity} onChange={handleChange} style={inputStyle} required />

          <label htmlFor="presentState">State</label>
          <select id="presentState" name="presentState" value={form.presentState} onChange={handleChange} style={inputStyle} required>
            <option value="">Select State</option>
            {southIndianStates.map((s) => <option key={s} value={s}>{s}</option>)}
            {form.presentState && !southIndianStates.includes(form.presentState) && <option value={form.presentState}>{form.presentState}</option>}
          </select>

          <label htmlFor="presentCountry">Country</label>
          <input id="presentCountry" name="presentCountry" value={form.presentCountry} onChange={handleChange} style={inputStyle} required />

          <label htmlFor="presentStreetName">Street Name</label>
          <input id="presentStreetName" name="presentStreetName" value={form.presentStreetName} onChange={handleChange} style={inputStyle} required />
        </div>

        <div style={sectionStyle}>
          <h3>About & Preference</h3>

          <label htmlFor="aboutMe">About Me</label>
          <textarea id="aboutMe" name="aboutMe" value={form.aboutMe} onChange={handleChange} rows="5" style={inputStyle} required />

          <label htmlFor="partnerRequirement">Partner Requirement</label>
          <textarea id="partnerRequirement" name="partnerRequirement" value={form.partnerRequirement} onChange={handleChange} rows="5" maxLength={1000} style={inputStyle} required />

          <label htmlFor="preferredMatch">Preferred Match</label>
          <select id="preferredMatch" name="preferredMatch" value={form.preferredMatch} onChange={handleChange} style={inputStyle}>
            <option value="same_religion">Same Religion</option>
            <option value="any_religion">Any Religion</option>
            <option value="open">Open</option>
          </select>

          <label htmlFor="showInSearch">
            <input
              id="showInSearch"
              type="checkbox"
              name="showInSearch"
              checked={form.showInSearch}
              onChange={handleChange}
            />{' '}
            Show in Search
          </label>

          <label htmlFor="approvalStatus">Approval Status</label>
          <select id="approvalStatus" name="approvalStatus" value={form.approvalStatus} onChange={handleChange} style={inputStyle}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>

        <button type="submit" disabled={saving} style={buttonStyle}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
