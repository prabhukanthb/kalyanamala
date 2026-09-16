const Counter = require('../models/Counter');
const Profile = require('../models/Profile');

const genderCode = (gender) => (
  String(gender || '').toLowerCase() === 'female' ? 'F' : 'M'
);

const formatProfileId = (gender, seq) => {
  const n = Number(seq);
  if (!Number.isInteger(n) || n < 1) {
    throw new Error('Profile sequence must be a positive integer');
  }
  if (n > 99999) {
    throw new Error('Profile sequence exceeded 5 digits');
  }
  return `${genderCode(gender)}${String(n).padStart(5, '0')}`;
};

const parseSequence = (profileId) => {
  const match = String(profileId || '').match(/^[MF](\d{5})$/i);
  if (!match) return 0;
  const n = parseInt(match[1], 10);
  return Number.isNaN(n) ? 0 : n;
};

const maxExistingSequence = async () => {
  const profiles = await Profile.find({ profileId: { $type: 'string' } })
    .select('profileId')
    .lean();
  let max = 0;
  for (const profile of profiles) {
    const n = parseSequence(profile.profileId);
    if (n > max) max = n;
  }
  return max;
};

const nextProfileSequence = async () => {
  const maxUsed = await maxExistingSequence();
  await Counter.updateOne(
    { _id: 'profile' },
    { $max: { seq: maxUsed } },
    { upsert: true }
  );
  const doc = await Counter.findByIdAndUpdate(
    'profile',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
};

const generateProfileId = async (gender) => {
  const seq = await nextProfileSequence();
  return formatProfileId(gender, seq);
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildProfileSearchFilter = async (search, User) => {
  const q = String(search || '').trim();
  if (!q) return {};
  const rx = new RegExp(escapeRegex(q), 'i');
  const users = await User.find({
    $or: [
      { firstName: rx },
      { lastName: rx },
      { surname: rx }
    ]
  }).select('_id');
  return {
    $or: [
      { profileId: rx },
      { userId: { $in: users.map((u) => u._id) } }
    ]
  };
};

module.exports = {
  genderCode,
  formatProfileId,
  parseSequence,
  generateProfileId,
  buildProfileSearchFilter
};
