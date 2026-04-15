const https  = require('https');
const crypto = require('crypto');

// ── Contact email HTML ────────────────────────────────────────────────────────
function contactEmailHtml(name, email, message) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#f4f6fb;"><tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td style="background:#1a1a2e;padding:32px 40px;">
    <p style="font-size:26px;font-weight:800;color:#fff;margin:0;">R<span style="color:#8a8a9e;">.</span></p>
    <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:6px 0 0;letter-spacing:3px;text-transform:uppercase;">New Portfolio Message</p>
  </td></tr>
  <tr><td style="padding:40px;">
    <p style="font-size:10px;color:#8a8a9e;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">From</p>
    <p style="font-size:20px;font-weight:700;color:#1a1a2e;margin:0 0 24px;">${name}</p>
    <p style="font-size:10px;color:#8a8a9e;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">Email</p>
    <p style="font-size:15px;color:#1a1a2e;margin:0 0 24px;">${email}</p>
    <p style="font-size:10px;color:#8a8a9e;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Message</p>
    <div style="background:#f4f3ee;border-left:3px solid #1a1a2e;border-radius:8px;padding:16px 20px;">
      <p style="font-size:15px;color:#1a1a2e;line-height:1.8;margin:0;">${message}</p>
    </div>
  </td></tr>
  <tr><td style="background:#f4f3ee;padding:20px 40px;border-top:1px solid #e8e6de;">
    <p style="font-size:12px;color:#8a8a9e;margin:0;">Sent from portfolio contact form · Cebu, Philippines</p>
    <p style="font-size:11px;color:#b8b4a8;margin:4px 0 0;">Reply directly to this email to respond to ${name}.</p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

// ── Send email via Resend REST API ────────────────────────────────────────────
function sendResendEmail({ apiKey, from, to, replyTo, subject, html }) {
  return new Promise((resolve, reject) => {
    const body = { from, to, subject, html };
    if (replyTo) body.reply_to = replyTo;
    const payload = JSON.stringify(body);
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

// ── Verify HMAC token ─────────────────────────────────────────────────────────
function verifyToken(token, secret) {
  try {
    const decoded   = Buffer.from(token, 'base64').toString();
    const lastPipe  = decoded.lastIndexOf('|');
    if (lastPipe === -1) return null;
    const payload   = decoded.substring(0, lastPipe);
    const sig       = decoded.substring(lastPipe + 1);
    const data      = JSON.parse(payload);
    if (Date.now() > data.expiresAt) return null; // expired
    const expected  = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    if (sig !== expected) return null;
    return data;
  } catch {
    return null;
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  const { email, otp, token } = req.body || {};
  if (!email || !otp || !token)
    return res.status(400).json({ success: false, message: 'Email, OTP, and token are required.' });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return res.status(500).json({ success: false, message: 'Email service not configured.' });

  const data = verifyToken(token, resendKey);
  if (!data)
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  if (data.email !== email)
    return res.status(400).json({ success: false, message: 'Invalid request.' });
  if (data.otp !== String(otp))
    return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });

  try {
    await sendResendEmail({
      apiKey:  resendKey,
      from:    'Portfolio Contact <onboarding@resend.dev>',
      to:      process.env.EMAIL_USER,
      replyTo: email,
      subject: `📬 New message from ${data.name}`,
      html:    contactEmailHtml(data.name, email, data.message),
    });
    res.json({ success: true, message: 'Verified! Your message has been sent successfully.' });
  } catch (err) {
    console.error('Resend error:', err.message);
    res.status(500).json({ success: false, message: 'Verified but failed to send message. Please try again.' });
  }
};
