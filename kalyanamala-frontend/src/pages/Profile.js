import React, { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  HEIGHT_OPTIONS,
  formatHeight,
  formatIncome,
  heightToValue,
  lookupIndianPincode,
  matchStateOption,
  parseHeightValue,
  pinLookupColor,
  pinLookupMessage,
  stateOptions,
  profileToForm,
  toIncomeRupees,
  displaySurname,
  displayAlternativePhone,
  fullName as personName
} from '../utils/profileFormHelpers';
import { API_ORIGIN } from '../services/apiBase';

const API_BASE = API_ORIGIN;

const CLOUD_NAME = 'bh4nvmuf';
const UPLOAD_PRESET = 'kalyanamala';
const MAX_PHOTOS = 3;

const initialForm = {
  gender: '', dateOfBirth: '', height: '', heightFeet: '', heightInches: '',
  religion: '', subCaste: '', siblingsCount: '', maritalStatus: '',
  fatherName: '', fatherOccupation: '', motherName: '', motherOccupation: '',
  highestEducation: '', fieldOfStudy: '', college: '', occupation: '',
  employmentType: '', companyName: '', jobTitle: '', jobLocation: '',
  industry: '', income: '', incomeCurrency: 'INR',
  streetName: '', city: '', state: '', country: 'India', pinCode: '',
  presentStreetName: '', presentCity: '', presentState: '', presentCountry: 'India', presentPinCode: '',
  fatherNativePlace: '', motherNativePlace: '',
  aboutMe: '', partnerRequirement: '', preferredMatch: 'any_religion', caste: 'Mala',
  alternativePhone: ''
};

const southIndianStates = stateOptions(true);

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
  { label: 'SC', value: 'SC' }, { label: 'BC', value: 'BC' },
  { label: 'OC', value: 'OC' }, { label: 'NA', value: 'NA' }
];

const employmentTypeOptions = [
  { label: 'Private', value: 'private' }, { label: 'Public', value: 'public' },
  { label: 'Govt', value: 'govt' }, { label: 'Business', value: 'business' },
  { label: 'Self Employed', value: 'self-employed' }, { label: 'Other', value: 'other' }
];

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' }
];

const siblingCountOptions = [0,1,2,3];

const inputStyle = {
  width: '100%', padding: '10px', marginTop: '5px',
  marginBottom: '14px', boxSizing: 'border-box'
};

const sectionStyle = {
  border: '1px solid #ddd', padding: '18px', marginBottom: '20px',
  borderRadius: '8px', background: '#fafafa'
};

const buttonStyle = {
  padding: '12px 20px', backgroundColor: '#2196F3', color: 'white',
  border: 'none', borderRadius: '5px', cursor: 'pointer'
};

const secondaryButtonStyle = { ...buttonStyle, backgroundColor: '#666', marginRight: '10px' };
const errorFieldStyle = { ...inputStyle, border: '1px solid red' };

const thumbStyle = {
  width: 110, height: 110, objectFit: 'cover',
  borderRadius: 6, border: '1px solid #ddd', display: 'block'
};

const removeBtnStyle = {
  position: 'absolute', top: -8, right: -8, width: 24, height: 24,
  borderRadius: '50%', border: 'none', background: '#c00', color: '#fff',
  cursor: 'pointer', lineHeight: '24px', padding: 0, fontSize: 15
};

const cardStyle = {
  border: '1px solid #e0e0e0', borderRadius: 12, background: '#fff',
  boxShadow: '0 2px 10px rgba(0,0,0,0.07)', overflow: 'hidden', marginBottom: 24
};

const cardHeaderStyle = {
  background: 'linear-gradient(90deg, #2196F3, #21CBF3)',
  color: '#fff', padding: '18px 22px'
};

const cardBodyStyle = {
  display: 'flex', flexWrap: 'wrap', gap: 24, padding: 22, alignItems: 'flex-start'
};

const photoColStyle = { flex: '0 0 260px', minWidth: 240 };
const detailColStyle = { flex: '1 1 380px', minWidth: 280 };

const mainPhotoStyle = {
  width: '100%', height: 300, objectFit: 'cover',
  borderRadius: 10, border: '1px solid #ddd', display: 'block', background: '#f2f2f2'
};

const stripThumbStyle = (active) => ({
  width: 62, height: 62, objectFit: 'cover', borderRadius: 6,
  border: active ? '3px solid #2196F3' : '1px solid #ddd',
  cursor: 'pointer', display: 'block'
});

const noPhotoStyle = {
  width: '100%', height: 300, borderRadius: 10, border: '2px dashed #ccc',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#999', fontSize: 14, textAlign: 'center', padding: 12, boxSizing: 'border-box'
};

const detailGroupTitle = {
  margin: '18px 0 8px', fontSize: 15, textTransform: 'uppercase',
  letterSpacing: '0.5px', color: '#2196F3', borderBottom: '1px solid #eee', paddingBottom: 6
};

const rowStyle = { display: 'flex', padding: '5px 0', fontSize: 14, borderBottom: '1px solid #f5f5f5' };
const rowLabel = { flex: '0 0 150px', color: '#666' };
const rowValue = { flex: 1, color: '#222', fontWeight: 500, wordBreak: 'break-word' };

const badgeStyle = (status) => ({
  display: 'inline-block', padding: '3px 12px', borderRadius: 20,
  fontSize: 12, fontWeight: 600,
  background: status === 'Approved' ? '#e6f7ea' : status === 'Rejected' ? '#fdecec' : '#fff6e0',
  color: status === 'Approved' ? '#1b7a3d' : status === 'Rejected' ? '#a00' : '#8a6200',
  border: '1px solid rgba(0,0,0,0.08)'
});

const smallBtn = {
  padding: '6px 12px', fontSize: 13, borderRadius: 5,
  border: '1px solid #2196F3', background: '#fff', color: '#2196F3', cursor: 'pointer'
};

function calculateAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getMaxDOBFor18Plus() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split('T')[0];
}

function photoSrc(p) {
  if (!p) return '';
  if (typeof p === 'string') return p;
  return p.url || p.imageUrl || p.secure_url || '';
}

function digitsOnly(value, max) {
  return String(value || '').replace(/\D/g, '').slice(0, max);
}

function normalisePhotos(list) {
  return (list || []).map((p) => (
    typeof p === 'string'
      ? { url: p }
      : { url: photoSrc(p), publicId: p.publicId, isPrimary: !!p.isPrimary }
  ));
}

const Row = ({ label, value }) => (
  <div style={rowStyle}>
    <div style={rowLabel}>{label}</div>
    <div style={rowValue}>{value || '-'}</div>
  </div>
);

const Profile = () => {
  const { token, user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [fieldErrors,setFieldErrors] = useState({});
  const [pinStatus,setPinStatus] = useState({});
  const [profile,setProfile] = useState(null);
  const [mode,setMode] = useState('view');
  const [form,setForm] = useState(initialForm);

  const [photos,setPhotos] = useState([]);
  const [uploading,setUploading] = useState(false);
  const [photoError,setPhotoError] = useState('');
  const [activePhoto,setActivePhoto] = useState(0);

  const age = useMemo(() => calculateAge(form.dateOfBirth), [form.dateOfBirth]);
  const maxDOB = useMemo(() => getMaxDOBFor18Plus(), []);

  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        setError('Please login again.');
        return;
      }

      try {
        const res = await axios.get(`${API_BASE}/api/profiles/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const p = res.data.profile;
        if (res.data.user && setUser) setUser(res.data.user);
        setProfile(p);
        setPhotos(Array.isArray(p.photos) ? p.photos : []);
        const alt = displayAlternativePhone(res.data.user || user, p);
        setForm(profileToForm(p, { user: res.data.user || user, alternativePhone: alt }));

        setMode('view');
      } catch (err) {
        if (err.response?.status === 404) {
          setProfile(null);
          setMode('edit');
          setForm((prev) => ({
            ...prev,
            alternativePhone: user?.alternativePhone || prev.alternativePhone || ''
          }));
        } else if (err.response?.status === 401) {
          navigate('/');
        } else {
          setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token, navigate, user?.alternativePhone, user?.surname]);

  useEffect(() => {
    if (activePhoto > photos.length - 1) setActivePhoto(0);
  }, [photos,activePhoto]);

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

  const uploadToCloudinary = async (files, currentCount) => {
    const room = MAX_PHOTOS - currentCount;
    if (room <= 0) throw new Error(`Maximum ${MAX_PHOTOS} photos allowed. Remove one to add another.`);

    const selected = files.slice(0, room);

    for (const f of selected) {
      if (!f.type.startsWith('image/')) throw new Error('Only image files are allowed.');
      if (f.size > 5 * 1024 * 1024) throw new Error(`"${f.name}" is larger than 5MB.`);
    }

    const uploaded = [];
    for (const file of selected) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: fd }
      );

      const data = await res.json();
      if (!res.ok || !data.secure_url) throw new Error(data?.error?.message || 'Upload failed');

      uploaded.push({ url: data.secure_url, publicId: data.public_id, isPrimary: false });
    }
    return uploaded;
  };

  const ensurePrimary = (list) => {
    const next = [...list];
    if (!next.some((p) => p && p.isPrimary) && next[0]) {
      next[0] = { ...next[0], isPrimary: true };
    }
    return next;
  };

  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = null;
    if (!files.length) return;

    setPhotoError('');
    setUploading(true);
    try {
      const uploaded = await uploadToCloudinary(files, photos.length);
      setPhotos((prev) => ensurePrimary([...normalisePhotos(prev),...uploaded]));
    } catch (err) {
      setPhotoError(err.message || 'Photo upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (src) => {
    setPhotos((prev) => ensurePrimary(normalisePhotos(prev).filter((p) => photoSrc(p) !== src)));
  };

  const persistPhotos = async (nextPhotos) => {
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const res = await axios.put(
        `${API_BASE}/api/profiles/me`,
        { photos: normalisePhotos(nextPhotos) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const saved = res.data.profile;
      setProfile(saved);
      setPhotos(Array.isArray(saved.photos) ? saved.photos : nextPhotos);
      setNotice('Photos updated.');
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || data?.error || 'Failed to update photos');
      setPhotos(Array.isArray(profile?.photos) ? profile.photos : []);
    } finally {
      setSaving(false);
    }
  };

  const handleViewUpload = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = null;
    if (!files.length) return;

    setPhotoError('');
    setUploading(true);
    try {
      const uploaded = await uploadToCloudinary(files, photos.length);
      const next = ensurePrimary([...normalisePhotos(photos),...uploaded]);
      setPhotos(next);
      await persistPhotos(next);
    } catch (err) {
      setPhotoError(err.message || 'Photo upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleViewDelete = async (src) => {
    if (!window.confirm('Remove this photo?')) return;
    const next = ensurePrimary(normalisePhotos(photos).filter((p) => photoSrc(p) !== src));
    setPhotos(next);
    await persistPhotos(next);
  };

  const handleSetPrimary = async (src) => {
    const next = normalisePhotos(photos).map((p) => ({ ...p, isPrimary: photoSrc(p) === src }));
    setPhotos(next);
    await persistPhotos(next);
  };

  const mapServerErrors = (data) => {
    const mapped = {};
    if (Array.isArray(data?.details)) {
      data.details.forEach((item) => {
        if (typeof item === 'string') {
          const msg = item.toLowerCase();
          if (msg.includes('marital')) mapped.maritalStatus = item;
          else if (msg.includes('gender')) mapped.gender = item;
          else if (msg.includes('date of birth')) mapped.dateOfBirth = item;
          else if (msg.includes('height feet')) mapped.heightFeet = item;
          else if (msg.includes('height inches')) mapped.heightInches = item;
          else if (msg.includes('religion')) mapped.religion = item;
          else if (msg.includes('sub caste') || msg.includes('subcaste')) mapped.subCaste = item;
          else if (msg.includes('siblings')) mapped.siblingsCount = item;
          else if (msg.includes('father name')) mapped.fatherName = item;
          else if (msg.includes('father occupation')) mapped.fatherOccupation = item;
          else if (msg.includes('mother name')) mapped.motherName = item;
          else if (msg.includes('mother occupation')) mapped.motherOccupation = item;
          else if (msg.includes('highest education')) mapped.highestEducation = item;
          else if (msg.includes('field of study')) mapped.fieldOfStudy = item;
          else if (msg.includes('college')) mapped.college = item;
          else if (msg.includes('occupation')) mapped.occupation = item;
          else if (msg.includes('employment type')) mapped.employmentType = item;
          else if (msg.includes('company name')) mapped.companyName = item;
          else if (msg.includes('job title')) mapped.jobTitle = item;
          else if (msg.includes('job location')) mapped.jobLocation = item;
          else if (msg.includes('industry')) mapped.industry = item;
          else if (msg.includes('income')) mapped.income = item;
          else if (msg.includes('street name')) mapped.streetName = item;
          else if (msg.includes('city')) mapped.city = item;
          else if (msg.includes('state')) mapped.state = item;
          else if (msg.includes('country')) mapped.country = item;
          else if (msg.includes('pin code')) mapped.pinCode = item;
          else if (msg.includes('present street')) mapped.presentStreetName = item;
          else if (msg.includes('present city')) mapped.presentCity = item;
          else if (msg.includes('present state')) mapped.presentState = item;
          else if (msg.includes('present country')) mapped.presentCountry = item;
          else if (msg.includes('present pin')) mapped.presentPinCode = item;
          else if (msg.includes("father's native") || msg.includes('father native')) mapped.fatherNativePlace = item;
          else if (msg.includes("mother's native") || msg.includes('mother native')) mapped.motherNativePlace = item;
          else if (msg.includes('about me')) mapped.aboutMe = item;
          else if (msg.includes('partner requirement')) mapped.partnerRequirement = item;
          else if (msg.includes('photo')) mapped.photos = item;
        } else if (item?.field) {
          mapped[item.field] = item.message;
        }
      });
    }
    return mapped;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setFieldErrors({});

    if (uploading) {
      setError('Please wait for the photo upload to finish.');
      return;
    }

    if (!age || age < 18) {
      setError('You must be at least 18 years old.');
      return;
    }

    if ((form.partnerRequirement || '').length > 1000) {
      setError('Partner requirement cannot exceed 1000 characters.');
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
      income: toIncomeRupees(form.income),
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
      aboutMe: form.aboutMe,
      partnerRequirement: form.partnerRequirement,
      preferredMatch: form.preferredMatch,
      caste: 'Mala',
      photos: normalisePhotos(photos),
      alternativePhone: form.alternativePhone || ''
    };

    setSaving(true);

    try {
      let res;
      if (profile) {
        res = await axios.put(`${API_BASE}/api/profiles/me`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        res = await axios.post(`${API_BASE}/api/profiles`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      const saved = res.data.profile;
      const savedUser = res.data.user;
      if (savedUser && setUser) setUser(savedUser);
      setProfile(saved);
      setPhotos(Array.isArray(saved.photos) ? saved.photos : photos);
      setForm(profileToForm(saved, {
        user: savedUser || user,
        alternativePhone: savedUser?.alternativePhone || form.alternativePhone
      }));
      try {
        const acctRes = await axios.put(`${API_BASE}/api/auth/account`, {
          alternativePhone: form.alternativePhone || ''
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (acctRes.data?.user && setUser) setUser(acctRes.data.user);
      } catch (acctErr) {
        if (acctErr.response?.status !== 404) {
          throw acctErr;
        }
      }
      setMode('view');
      setError('');
      setFieldErrors({});
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || data?.error || 'Failed to save profile');
      setFieldErrors(mapServerErrors(data));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px' }}>Loading profile...</div>;
  }

    const fullName = personName({
      firstName: user?.firstName,
      lastName: user?.lastName,
      surname: displaySurname(user)
    }) || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const getStyle = (fieldName) => (fieldErrors[fieldName] ? errorFieldStyle : inputStyle);

  const ordered = normalisePhotos(photos);
  const primaryIndex = ordered.findIndex((p) => p.isPrimary);
  const displayIndex = photos.length ? Math.min(activePhoto, photos.length - 1) : 0;
  const currentSrc = photoSrc(ordered[displayIndex]);
  const status = profile?.approvalStatus || 'Pending';

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px' }}>
      <h2>My Profile</h2>

      {error && (
        <div style={{ color: 'red', marginBottom: 15, padding: 10, background: '#ffebee', borderRadius: 6 }}>
          {error}
        </div>
      )}

      {notice && (
        <div style={{ color: '#1b7a3d', marginBottom: 15, padding: 10, background: '#e6f7ea', borderRadius: 6 }}>
          {notice}
        </div>
      )}

      {user?.passwordResetRequired && (
        <div style={{ color: '#8a5a00', marginBottom: 15, padding: 10, background: '#fff6e6', borderRadius: 6 }}>
          Please change your temporary password.{' '}
          <button type="button" onClick={() => navigate('/change-password')} style={{ ...buttonStyle, padding: '6px 12px' }}>
            Change password
          </button>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <button type="button" onClick={() => setMode('view')} style={secondaryButtonStyle}>
          View Profile
        </button>
        <button type="button" onClick={() => setMode('edit')} style={buttonStyle}>
          Edit Profile
        </button>
        <button type="button" onClick={() => navigate('/change-password')} style={{ ...secondaryButtonStyle, backgroundColor: '#0d7377', marginLeft: 10 }}>
          Change password
        </button>
      </div>

      {mode === 'view' && profile ? (
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 24 }}>{fullName || 'Member'}</h2>
                <div style={{ fontSize: 14, opacity: 0.95, marginTop: 4 }}>
                  {age ? `${age} yrs` : ''}
                  {formatHeight(profile.heightFeet, profile.heightInches) ? ` · ${formatHeight(profile.heightFeet, profile.heightInches)}` : ''}
                  {profile.occupation ? ` · ${profile.occupation}` : ''}
                  {profile.currentAddress?.city ? ` · ${profile.currentAddress.city}` : ''}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, opacity: 0.9 }}>ID: {profile.profileId || '-'}</div>
                <div style={{ marginTop: 6 }}><span style={badgeStyle(status)}>{status}</span></div>
              </div>
            </div>
          </div>

          <div style={cardBodyStyle}>
            <div style={photoColStyle}>
              {photos.length === 0 ? (
                <div style={noPhotoStyle}>No photo uploaded yet</div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <img src={currentSrc} alt="profile" style={mainPhotoStyle} />
                  <button
                    type="button"
                    onClick={() => handleViewDelete(currentSrc)}
                    disabled={saving || uploading}
                    title="Delete this photo"
                    style={{ ...removeBtnStyle, top: 8, right: 8, width: 28, height: 28, lineHeight: '28px' }}
                  >
                    ×
                  </button>
                  {primaryIndex === displayIndex && (
                    <span style={{
                      position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.65)',
                      color: '#fff', padding: '3px 10px', borderRadius: 12, fontSize: 11
                    }}>
                      Primary
                    </span>
                  )}
                </div>
              )}

              {photos.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  {ordered.map((p, i) => (
                    <img
                      key={photoSrc(p) || i}
                      src={photoSrc(p)}
                      alt={`thumb ${i + 1}`}
                      style={stripThumbStyle(i === displayIndex)}
                      onClick={() => setActivePhoto(i)}
                    />
                  ))}
                </div>
              )}

              <div style={{ marginTop: 14 }}>
                <label
                  style={{
                    ...smallBtn,
                    display: 'inline-block',
                    opacity: (uploading || saving || photos.length >= MAX_PHOTOS) ? 0.5 : 1,
                    cursor: (uploading || saving || photos.length >= MAX_PHOTOS) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {uploading ? 'Uploading…' : '+ Add photo'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleViewUpload}
                    disabled={uploading || saving || photos.length >= MAX_PHOTOS}
                    style={{ display: 'none' }}
                  />
                </label>

                {photos.length > 1 && primaryIndex !== displayIndex && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(currentSrc)}
                    disabled={saving || uploading}
                    style={{ ...smallBtn, marginLeft: 8 }}
                  >
                    Set as primary
                  </button>
                )}

                <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
                  {photos.length} of {MAX_PHOTOS} used · JPG/PNG, max 5MB
                </div>

                {photoError && <div style={{ color: 'red', marginTop: 8, fontSize: 13 }}>{photoError}</div>}
                {saving && <div style={{ color: '#666', marginTop: 8, fontSize: 13 }}>Saving…</div>}
              </div>
            </div>

            <div style={detailColStyle}>
              <h4 style={{ ...detailGroupTitle, marginTop: 0 }}>Contact</h4>
              <Row label="Surname" value={displaySurname(user, profile)} />
              <Row label="Email" value={user?.email || ''} />
              <Row label="Phone" value={user?.phone || profile.userId?.phone || ''} />
              <Row label="Alternate Mobile" value={displayAlternativePhone(user, profile) || form.alternativePhone || ''} />

              <h4 style={detailGroupTitle}>Basic Details</h4>
              <Row label="Gender" value={profile.gender || ''} />
              <Row label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB') : ''} />
              <Row label="Age" value={age ? `${age} years` : ''} />
              <Row label="Height" value={formatHeight(profile.heightFeet, profile.heightInches)} />
              <Row label="Marital Status" value={profile.maritalStatus || ''} />

              <h4 style={detailGroupTitle}>Religion &amp; Family</h4>
              <Row label="Religion" value={profile.religion || ''} />
              <Row label="Caste" value={profile.caste || 'Mala'} />
              <Row label="Sub Caste" value={profile.subCaste || ''} />
              <Row label="Siblings" value={profile.siblingsCount} />
              <Row label="Father's Name" value={profile.fatherName || ''} />
              <Row label="Father Occupation" value={profile.fatherOccupation || ''} />
              <Row label="Father Native" value={profile.fatherNativePlace || ''} />
              <Row label="Mother's Name" value={profile.motherName || ''} />
              <Row label="Mother Occupation" value={profile.motherOccupation || ''} />
              <Row label="Mother Native" value={profile.motherNativePlace || ''} />

              <h4 style={detailGroupTitle}>Education &amp; Career</h4>
              <Row label="Highest Education" value={profile.highestEducation || ''} />
              <Row label="Field of Study" value={profile.fieldOfStudy || ''} />
              <Row label="College" value={profile.college || ''} />
              <Row label="Occupation" value={profile.occupation || ''} />
              <Row label="Employment Type" value={profile.employmentType || ''} />
              <Row label="Company" value={profile.companyName || ''} />
              <Row label="Job Title" value={profile.jobTitle || ''} />
              <Row label="Job Location" value={profile.jobLocation || ''} />
              <Row label="Industry" value={profile.industry || ''} />
              <Row label="Income" value={formatIncome(profile.income)} />

              <h4 style={detailGroupTitle}>Current Address</h4>
              <Row label="Street" value={profile.currentAddress?.streetName || ''} />
              <Row label="City" value={profile.currentAddress?.city || ''} />
              <Row label="State" value={profile.currentAddress?.state || ''} />
              <Row label="Country" value={profile.currentAddress?.country || ''} />
              <Row label="Pin Code" value={profile.currentAddress?.pinCode || ''} />

              <h4 style={detailGroupTitle}>Present Address</h4>
              <Row label="Street" value={profile.presentAddress?.streetName || ''} />
              <Row label="City" value={profile.presentAddress?.city || ''} />
              <Row label="State" value={profile.presentAddress?.state || ''} />
              <Row label="Country" value={profile.presentAddress?.country || ''} />
              <Row label="Pin Code" value={profile.presentAddress?.pinCode || ''} />

              <h4 style={detailGroupTitle}>About &amp; Preference</h4>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: '#333', margin: '4px 0 12px' }}>
                {profile.aboutMe || ''}
              </p>
              <Row label="Preferred Match" value={profile.preferredMatch || ''} />
              <Row label="Partner Requirement" value={profile.partnerRequirement || ''} />

              {isAdmin && (
                <div style={{ marginTop: 18, padding: 12, background: '#f5f9ff', border: '1px solid #d6e6ff', borderRadius: 8, fontSize: 13, color: '#345' }}>
                  Admin view — you can add, delete or set the primary photo directly from this card.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div style={sectionStyle}>
            <h3>Account</h3>
            <p style={{ marginTop: 0, color: '#555' }}>Registered email and mobile are used for login and password reset.</p>
            <label>Email</label>
            <input value={user?.email || ''} readOnly disabled style={inputStyle} />
            <label>Registered mobile</label>
            <input value={user?.phone || ''} readOnly disabled style={inputStyle} />
            <label htmlFor="alternativePhone">Alternate Mobile</label>
            <input
              id="alternativePhone"
              name="alternativePhone"
              value={form.alternativePhone}
              onChange={handleChange}
              style={getStyle('alternativePhone')}
              inputMode="numeric"
              maxLength={10}
            />
            {(form.alternativePhone || '').length >= 1 && (form.alternativePhone || '').length <= 9 && (
              <div style={{ color: 'red' }}>Alternate mobile must be 10 digits</div>
            )}
            <button type="button" onClick={() => navigate('/change-password')} style={{ ...secondaryButtonStyle, backgroundColor: '#0d7377' }}>
              Change password
            </button>
          </div>

          <div style={sectionStyle}>
            <h3>Photos</h3>
            <p style={{ marginTop: 0, color: '#555' }}>
              Upload up to {MAX_PHOTOS} photos. JPG or PNG, max 5MB each.
            </p>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoSelect}
              disabled={uploading || photos.length >= MAX_PHOTOS}
            />

            {uploading && <p style={{ color: '#555' }}>Uploading…</p>}
            {photoError && <div style={{ color: 'red', marginTop: 8 }}>{photoError}</div>}
            {fieldErrors.photos && <div style={{ color: 'red', marginTop: 8 }}>{fieldErrors.photos}</div>}

            {photos.length > 0 && (
              <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
                {ordered.map((p, i) => {
                  const src = photoSrc(p);
                  return (
                    <div key={src || i} style={{ position: 'relative' }}>
                      <img src={src} alt="profile" style={thumbStyle} />
                      <button type="button" onClick={() => removePhoto(src)} title="Remove photo" style={removeBtnStyle}>
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={sectionStyle}>
            <h3>Basic Details</h3>

            <label htmlFor="gender">Gender</label>
            <select id="gender" name="gender" value={form.gender} onChange={handleChange} style={getStyle('gender')} required>
              <option value="">Select</option>
              {genderOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            {fieldErrors.gender && <div style={{ color: 'red' }}>{fieldErrors.gender}</div>}

            <label htmlFor="dateOfBirth">DOB</label>
            <input id="dateOfBirth" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} style={getStyle('dateOfBirth')} max={maxDOB} required />
            {fieldErrors.dateOfBirth && <div style={{ color: 'red' }}>{fieldErrors.dateOfBirth}</div>}

            <label htmlFor="height">Height</label>
            <select id="height" name="height" value={form.height || heightToValue(form.heightFeet, form.heightInches)} onChange={handleChange} style={getStyle('height')} required>
              <option value="">Select</option>
              {HEIGHT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            {fieldErrors.height && <div style={{ color: 'red' }}>{fieldErrors.height}</div>}
            {fieldErrors.heightFeet && <div style={{ color: 'red' }}>{fieldErrors.heightFeet}</div>}
            {fieldErrors.heightInches && <div style={{ color: 'red' }}>{fieldErrors.heightInches}</div>}
          </div>

          <div style={sectionStyle}>
            <h3>Religion &amp; Family</h3>

            <label htmlFor="religion">Religion</label>
            <select id="religion" name="religion" value={form.religion} onChange={handleChange} style={getStyle('religion')} required>
              <option value="">Select</option>
              {religionOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            {fieldErrors.religion && <div style={{ color: 'red' }}>{fieldErrors.religion}</div>}

            <label htmlFor="caste">Caste</label>
            <input id="caste" name="caste" value="Mala" readOnly disabled style={inputStyle} />

            <label htmlFor="subCaste">Sub Caste</label>
            <select id="subCaste" name="subCaste" value={form.subCaste} onChange={handleChange} style={getStyle('subCaste')} required>
              <option value="">Select</option>
              {subCasteOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            {fieldErrors.subCaste && <div style={{ color: 'red' }}>{fieldErrors.subCaste}</div>}

            <label htmlFor="siblingsCount">No. of siblings</label>
            <select id="siblingsCount" name="siblingsCount" value={form.siblingsCount} onChange={handleChange} style={getStyle('siblingsCount')} required>
              <option value="">Select</option>
              {siblingCountOptions.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            {fieldErrors.siblingsCount && <div style={{ color: 'red' }}>{fieldErrors.siblingsCount}</div>}

            <label htmlFor="maritalStatus">Marital status</label>
            <select id="maritalStatus" name="maritalStatus" value={form.maritalStatus} onChange={handleChange} style={getStyle('maritalStatus')} required>
              <option value="">Select</option>
              {maritalStatusOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            {fieldErrors.maritalStatus && <div style={{ color: 'red' }}>{fieldErrors.maritalStatus}</div>}

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 280px' }}>
                <label htmlFor="fatherName">Father’s Name</label>
                <input id="fatherName" name="fatherName" value={form.fatherName} onChange={handleChange} style={getStyle('fatherName')} required />
                {fieldErrors.fatherName && <div style={{ color: 'red' }}>{fieldErrors.fatherName}</div>}

                <label htmlFor="fatherOccupation">Father Occupation</label>
                <input id="fatherOccupation" name="fatherOccupation" value={form.fatherOccupation} onChange={handleChange} style={getStyle('fatherOccupation')} required />
                {fieldErrors.fatherOccupation && <div style={{ color: 'red' }}>{fieldErrors.fatherOccupation}</div>}

                <label htmlFor="fatherNativePlace">Father Native</label>
                <input id="fatherNativePlace" name="fatherNativePlace" value={form.fatherNativePlace} onChange={handleChange} style={getStyle('fatherNativePlace')} required />
                {fieldErrors.fatherNativePlace && <div style={{ color: 'red' }}>{fieldErrors.fatherNativePlace}</div>}
              </div>
              <div style={{ flex: '1 1 280px' }}>
                <label htmlFor="motherName">Mother’s Name</label>
                <input id="motherName" name="motherName" value={form.motherName} onChange={handleChange} style={getStyle('motherName')} required />
                {fieldErrors.motherName && <div style={{ color: 'red' }}>{fieldErrors.motherName}</div>}

                <label htmlFor="motherOccupation">Mother Occupation</label>
                <input id="motherOccupation" name="motherOccupation" value={form.motherOccupation} onChange={handleChange} style={getStyle('motherOccupation')} required />
                {fieldErrors.motherOccupation && <div style={{ color: 'red' }}>{fieldErrors.motherOccupation}</div>}

                <label htmlFor="motherNativePlace">Mother Native</label>
                <input id="motherNativePlace" name="motherNativePlace" value={form.motherNativePlace} onChange={handleChange} style={getStyle('motherNativePlace')} required />
                {fieldErrors.motherNativePlace && <div style={{ color: 'red' }}>{fieldErrors.motherNativePlace}</div>}
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h3>Professional &amp; Education</h3>

            <label htmlFor="highestEducation">Highest Education</label>
            <select id="highestEducation" name="highestEducation" value={form.highestEducation} onChange={handleChange} style={getStyle('highestEducation')} required>
              <option value="">Select</option>
              {educationOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {fieldErrors.highestEducation && <div style={{ color: 'red' }}>{fieldErrors.highestEducation}</div>}

            <label htmlFor="fieldOfStudy">Field of Study</label>
            <input id="fieldOfStudy" name="fieldOfStudy" value={form.fieldOfStudy} onChange={handleChange} style={getStyle('fieldOfStudy')} required />
            {fieldErrors.fieldOfStudy && <div style={{ color: 'red' }}>{fieldErrors.fieldOfStudy}</div>}

            <label htmlFor="college">College</label>
            <input id="college" name="college" value={form.college} onChange={handleChange} style={getStyle('college')} required />
            {fieldErrors.college && <div style={{ color: 'red' }}>{fieldErrors.college}</div>}

            <label htmlFor="occupation">Occupation</label>
            <input id="occupation" name="occupation" value={form.occupation} onChange={handleChange} style={getStyle('occupation')} required />
            {fieldErrors.occupation && <div style={{ color: 'red' }}>{fieldErrors.occupation}</div>}

            <label htmlFor="employmentType">Employment Type</label>
            <select id="employmentType" name="employmentType" value={form.employmentType} onChange={handleChange} style={getStyle('employmentType')} required>
              <option value="">Select</option>
              {employmentTypeOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            {fieldErrors.employmentType && <div style={{ color: 'red' }}>{fieldErrors.employmentType}</div>}

            <label htmlFor="companyName">Company Name</label>
            <input id="companyName" name="companyName" value={form.companyName} onChange={handleChange} style={getStyle('companyName')} required />
            {fieldErrors.companyName && <div style={{ color: 'red' }}>{fieldErrors.companyName}</div>}

            <label htmlFor="jobTitle">Job Title</label>
            <input id="jobTitle" name="jobTitle" value={form.jobTitle} onChange={handleChange} style={getStyle('jobTitle')} required />
            {fieldErrors.jobTitle && <div style={{ color: 'red' }}>{fieldErrors.jobTitle}</div>}

            <label htmlFor="jobLocation">Job Location</label>
            <input id="jobLocation" name="jobLocation" value={form.jobLocation} onChange={handleChange} style={getStyle('jobLocation')} required />
            {fieldErrors.jobLocation && <div style={{ color: 'red' }}>{fieldErrors.jobLocation}</div>}

            <label htmlFor="industry">Industry</label>
            <input id="industry" name="industry" value={form.industry} onChange={handleChange} style={getStyle('industry')} required />
            {fieldErrors.industry && <div style={{ color: 'red' }}>{fieldErrors.industry}</div>}

            <label htmlFor="income">Annual Income (lacs)</label>
            <input id="income" type="number" name="income" value={form.income} onChange={handleChange} style={getStyle('income')} min="0" step="0.1" placeholder="e.g. 12 or 12.5" required />
            <div style={{ color: '#666', fontSize: 12, marginTop: -8, marginBottom: 12 }}>Enter 12 for 12 lacs, or 12.5 for 12.5 lacs.</div>
            {fieldErrors.income && <div style={{ color: 'red' }}>{fieldErrors.income}</div>}
          </div>

          <div style={sectionStyle}>
            <h3>Current Address</h3>

            <label htmlFor="pinCode">Pin Code</label>
            <input id="pinCode" name="pinCode" value={form.pinCode} onChange={handleChange} style={getStyle('pinCode')} inputMode="numeric" maxLength={6} required />
            <div style={{ color: pinLookupColor(pinStatus.pinCode), fontSize: 12, marginTop: -6, marginBottom: 12 }}>
              {pinLookupMessage(pinStatus.pinCode)}
            </div>
            {fieldErrors.pinCode && <div style={{ color: 'red' }}>{fieldErrors.pinCode}</div>}

            <label htmlFor="city">City</label>
            <input id="city" name="city" value={form.city} onChange={handleChange} style={getStyle('city')} required />
            {fieldErrors.city && <div style={{ color: 'red' }}>{fieldErrors.city}</div>}

            <label htmlFor="state">State</label>
            <select id="state" name="state" value={form.state} onChange={handleChange} style={getStyle('state')} required>
              <option value="">Select State</option>
              {southIndianStates.map((s) => <option key={s} value={s}>{s}</option>)}
              {form.state && !southIndianStates.includes(form.state) && <option value={form.state}>{form.state}</option>}
            </select>
            {fieldErrors.state && <div style={{ color: 'red' }}>{fieldErrors.state}</div>}

            <label htmlFor="country">Country</label>
            <input id="country" name="country" value={form.country} onChange={handleChange} style={getStyle('country')} required />
            {fieldErrors.country && <div style={{ color: 'red' }}>{fieldErrors.country}</div>}

            <label htmlFor="streetName">Street Name</label>
            <input id="streetName" name="streetName" value={form.streetName} onChange={handleChange} style={getStyle('streetName')} required />
            {fieldErrors.streetName && <div style={{ color: 'red' }}>{fieldErrors.streetName}</div>}
          </div>

          <div style={sectionStyle}>
            <h3>Present Address</h3>

            <label htmlFor="presentPinCode">Pin Code</label>
            <input id="presentPinCode" name="presentPinCode" value={form.presentPinCode} onChange={handleChange} style={getStyle('presentPinCode')} inputMode="numeric" maxLength={6} required />
            <div style={{ color: pinLookupColor(pinStatus.presentPinCode), fontSize: 12, marginTop: -6, marginBottom: 12 }}>
              {pinLookupMessage(pinStatus.presentPinCode)}
            </div>
            {fieldErrors.presentPinCode && <div style={{ color: 'red' }}>{fieldErrors.presentPinCode}</div>}

            <label htmlFor="presentCity">City</label>
            <input id="presentCity" name="presentCity" value={form.presentCity} onChange={handleChange} style={getStyle('presentCity')} required />
            {fieldErrors.presentCity && <div style={{ color: 'red' }}>{fieldErrors.presentCity}</div>}

            <label htmlFor="presentState">State</label>
            <select id="presentState" name="presentState" value={form.presentState} onChange={handleChange} style={getStyle('presentState')} required>
              <option value="">Select State</option>
              {southIndianStates.map((s) => <option key={s} value={s}>{s}</option>)}
              {form.presentState && !southIndianStates.includes(form.presentState) && <option value={form.presentState}>{form.presentState}</option>}
            </select>
            {fieldErrors.presentState && <div style={{ color: 'red' }}>{fieldErrors.presentState}</div>}

            <label htmlFor="presentCountry">Country</label>
            <input id="presentCountry" name="presentCountry" value={form.presentCountry} onChange={handleChange} style={getStyle('presentCountry')} required />
            {fieldErrors.presentCountry && <div style={{ color: 'red' }}>{fieldErrors.presentCountry}</div>}

            <label htmlFor="presentStreetName">Street Name</label>
            <input id="presentStreetName" name="presentStreetName" value={form.presentStreetName} onChange={handleChange} style={getStyle('presentStreetName')} required />
            {fieldErrors.presentStreetName && <div style={{ color: 'red' }}>{fieldErrors.presentStreetName}</div>}
          </div>

          <div style={sectionStyle}>
            <h3>About &amp; Preference</h3>

            <label htmlFor="aboutMe">About Me</label>
            <textarea id="aboutMe" name="aboutMe" value={form.aboutMe} onChange={handleChange} rows="5" style={getStyle('aboutMe')} required />
            {fieldErrors.aboutMe && <div style={{ color: 'red' }}>{fieldErrors.aboutMe}</div>}

            <label htmlFor="partnerRequirement">Partner Requirement</label>
            <textarea id="partnerRequirement" name="partnerRequirement" value={form.partnerRequirement} onChange={handleChange} rows="5" maxLength={1000} style={getStyle('partnerRequirement')} required />
            {fieldErrors.partnerRequirement && <div style={{ color: 'red' }}>{fieldErrors.partnerRequirement}</div>}

            <label htmlFor="preferredMatch">Preferred Match</label>
            <select id="preferredMatch" name="preferredMatch" value={form.preferredMatch} onChange={handleChange} style={inputStyle}>
              <option value="same_religion">Same Religion</option>
              <option value="any_religion">Any Religion</option>
              <option value="open">Open</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            style={{
              ...buttonStyle,
              backgroundColor: (saving || uploading) ? '#999' : '#2196F3',
              cursor: (saving || uploading) ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? 'Saving...' : uploading ? 'Uploading photos...' : profile ? 'Update Profile' : 'Create Profile'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Profile;
