const bcrypt = require('bcryptjs');

const PASSWORD_HINT =
  'first 4 letters of your name + @ + last 4 digits of your registered mobile';

const defaultPassword = (name, phone) => {
  const namePart = String(name || '').replace(/[^a-zA-Z]/g, '').slice(0, 4) || 'User';
  const last4 = String(phone || '').replace(/\D/g, '').slice(-4);
  if (last4.length !== 4) {
    throw new Error('Registered mobile number is required to create a default password');
  }
  return `${namePart}@${last4}`;
};

const hashPassword = async (plain) => (
  bcrypt.hash(plain, parseInt(process.env.BCRYPT_ROUNDS || '10', 10))
);

const applyDefaultPassword = async (user) => {
  const tempPassword = defaultPassword(user.firstName, user.phone);
  user.password = await hashPassword(tempPassword);
  user.passwordResetRequired = true;
  return tempPassword;
};

const findUserByEmailOrPhone = (User, emailOrPhone) => {
  const raw = String(emailOrPhone || '').trim();
  if (!raw) return null;
  const email = raw.toLowerCase();
  const digits = raw.replace(/\D/g, '');
  const or = [{ email: raw }, { email }];
  if (digits.length === 10) or.push({ phone: digits });
  return User.findOne({
    $or: or,
    status: { $ne: 'deleted' }
  });
};

const publicUser = (user) => ({
  id: user._id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  surname: user.surname || '',
  phone: user.phone,
  alternativePhone: user.alternativePhone || '',
  role: user.role,
  passwordResetRequired: !!user.passwordResetRequired
});

module.exports = {
  PASSWORD_HINT,
  defaultPassword,
  hashPassword,
  applyDefaultPassword,
  findUserByEmailOrPhone,
  publicUser
};
