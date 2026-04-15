const https   = require('https');
const crypto  = require('crypto');

// ── Email HTML ────────────────────────────────────────────────────────────────
function otpEmailHtml(name, otp) {
  const digits = otp.toString().split('');
  const boxes  = digits
    .map(d => `<td style="width:48px;height:56px;background:#f0f4ff;border:2px solid #1a1a2e;border-radius:10px;text-align:center;vertical-align:middle;font-size:28px;font-weight:700;color:#1a1a2e;">${d}</td>`)
    .join('<td style="width:8px;"></td>');
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#f4f6fb;"><tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td style="background:#1a1a2e;padding:32px 40px;text-align:center;">
    <p style="font-size:26px;font-weight:800;color:#fff;margin:0;">R<span style="color:#8a8a9e;">.</span></p>
    <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:6px 0 0;letter-spacing:3px;text-transform:uppercase;">Verification Code</p>
  </td></tr>
  <tr><td style="padding:40px;text-align:center;">
    <p style="font-size:18px;font-weight:600;color:#1a1a2e;margin:0 0 8px;">Hello${name ? ', ' + name : ''}! 👋</p>
    <p style="font-size:15px;color:#6a6a7e;margin:0 0 32px;line-height:1.6;">Use the code below to send your message.<br/>This code expires in <strong>10 minutes</strong>.</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;"><tr>${boxes}</tr></table>
    <p style="font-size:40px;font-weight:800;color:#1a1a2e;letter-spacing:12px;font-family:'Courier New',monospace;margin:0 0 24px;">${otp}</p>
    <p style="font-size:13px;color:#7a6400;background:#fff8e1;padding:12px 18px;border-radius:10px;border-left:4px solid #ffb300;text-align:left;">⏱️ Expires in <strong>10 minutes</strong>. Do not share this code.</p>
  </td></tr>
  <tr><td style="background:#f4f3ee;padding:20px;text-align:center;border-top:1px solid #e8e6de;">
    <p style="font-size:12px;color:#8a8a9e;margin:0;">&copy; ${new Date().getFullYear()} Rochell Reponte · Cebu, Philippines</p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

// ── Send email via Resend REST API (no npm package needed) ───────────────────
function sendResendEmail({ apiKey, from, to, subject, html }) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ from, to, subject, html });
    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(JSON.parse(data));
        else reject(new Error(`Resend ${res.statusCode}: ${data}`));
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ── Stateless HMAC token (replaces in-memory otpStore) ──────────────────────
function createToken({ email, otp, expiresAt, name, message }, secret) {
  const payload = JSON.stringify({ email, otp, expiresAt, name, message });
  const sig     = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(payload + '|' + sig).toString('base64');
}

// ── Rate limiting (in-memory, best-effort for serverless) ───────────────────
const rateLimiter = {};
function isRateLimited(email) {
  const now = Date.now();
  if (!rateLimiter[email]) rateLimiter[email] = [];
  rateLimiter[email] = rateLimiter[email].filter(t => now - t < 3600000);
  if (rateLimiter[email].length >= 3) return true;
  rateLimiter[email].push(now);
  return false;
}

// ── Handler ──────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  const { name, email, message } = req.body || {};
  if (!name || !email || !message)
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ success: false, message: 'Invalid email address.' });
  if (isRateLimited(email))
    return res.status(429).json({ success: false, message: 'Too many requests. Please wait before trying again.' });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return res.status(500).json({ success: false, message: 'Email service not configured.' });

  const otp       = Math.floor(100000 + Math.random() * 900000);
  const expiresAt = Date.now() + 10 * 60 * 1000;
  const token     = createToken({ email, otp: String(otp), expiresAt, name, message }, resendKey);

  try {
    await sendResendEmail({
      apiKey:  resendKey,
      from:    'Rochell Portfolio <onboarding@resend.dev>',
      to:      email,
      subject: '🔐 Your Verification Code',
      html:    otpEmailHtml(name, otp),
    });
    res.json({ success: true, message: 'OTP sent successfully!', token });
  } catch (err) {
    console.error('Resend error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
};
