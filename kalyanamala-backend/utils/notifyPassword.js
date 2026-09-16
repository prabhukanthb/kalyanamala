const PASSWORD_HINT = require('./defaultPassword').PASSWORD_HINT;

const postJson = async (url, headers, body) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
};

const emailBody = (user, tempPassword) => (
  `Hello ${user.firstName || ''},\n\n` +
  `Your Kalyanamala password has been reset.\n\n` +
  `Temporary password: ${tempPassword}\n` +
  `Format: ${PASSWORD_HINT}.\n\n` +
  `Please log in and change this password. If you did not request this, contact admin.\n`
);

const sendEmail = async (user, tempPassword) => {
  const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM || 'Kalyanamala <noreply@kalyanamala.app>';
  if (!apiKey || !user.email) return false;
  const endpoint = process.env.EMAIL_API_URL || 'https://api.resend.com/emails';
  await postJson(endpoint, { Authorization: `Bearer ${apiKey}` }, {
    from,
    to: [user.email],
    subject: 'Kalyanamala temporary password',
    text: emailBody(user, tempPassword)
  });
  return true;
};

const sendSms = async (user, tempPassword) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = user.phone;
  if (!sid || !token || !from || !to) return false;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const params = new URLSearchParams({
    From: from,
    To: `+91${to}`,
    Body: `Kalyanamala temp password: ${tempPassword}. Change it after login or contact admin.`
  });
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });
  if (!res.ok) throw new Error(`SMS HTTP ${res.status}`);
  return true;
};

const notifyTemporaryPassword = async (user, tempPassword) => {
  const deliveredVia = [];
  try {
    if (await sendEmail(user, tempPassword)) deliveredVia.push('email');
  } catch (err) {
    console.error('Password email failed:', err.message);
  }
  try {
    if (await sendSms(user, tempPassword)) deliveredVia.push('sms');
  } catch (err) {
    console.error('Password SMS failed:', err.message);
  }
  return deliveredVia;
};

module.exports = { notifyTemporaryPassword };
