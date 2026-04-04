require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());

// ─── Nodemailer Transporter ───────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
app.get('/', (req, res) => res.json({ message: '✅ Server is running!' }));

// ─── OTP Store (in-memory) ────────────────────────────────────────────────────
global.otpStore = {};

// ─── Rate Limiter (max 3 OTP requests per email per hour) ────────────────────
global.rateLimiter = {};

function isRateLimited(email) {
  const now = Date.now();
  if (!global.rateLimiter[email]) global.rateLimiter[email] = [];
  global.rateLimiter[email] = global.rateLimiter[email].filter(t => now - t < 3600000);
  if (global.rateLimiter[email].length >= 3) return true;
  global.rateLimiter[email].push(now);
  return false;
}

// ─── OTP Email Template ───────────────────────────────────────────────────────
function generateOtpEmail(name, otp) {
  const digits = otp.toString().split('');
  const digitBoxes = digits
    .map(d => `
      <td style="
        width:48px;height:56px;
        background-color:#f0f4ff;
        border:2px solid #1a1a2e;
        border-radius:10px;
        text-align:center;
        vertical-align:middle;
        font-size:28px;
        font-weight:700;
        color:#1a1a2e;
      ">${d}</td>
    `)
    .join('<td style="width:8px;"></td>');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#f4f6fb;">
        <tr><td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <tr>
              <td style="background:#1a1a2e;padding:32px 40px;text-align:center;">
                <p style="font-size:26px;font-weight:800;color:#fff;margin:0;letter-spacing:-1px;">
                  R<span style="color:#8a8a9e;">.</span>
                </p>
                <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:6px 0 0;letter-spacing:3px;text-transform:uppercase;">
                  Verification Code
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px;text-align:center;">
                <p style="font-size:18px;font-weight:600;color:#1a1a2e;margin:0 0 8px;">
                  Hello${name ? ', ' + name : ''}! 👋
                </p>
                <p style="font-size:15px;color:#6a6a7e;margin:0 0 32px;line-height:1.6;">
                  Use the code below to complete your verification.<br/>
                  This code expires in <strong>10 minutes</strong>.
                </p>

                <!-- Digit boxes -->
                <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                  <tr>${digitBoxes}</tr>
                </table>

                <!-- OTP number -->
                <p style="font-size:40px;font-weight:800;color:#1a1a2e;letter-spacing:12px;text-align:center;font-family:'Courier New',monospace;margin:0 0 24px;">
                  ${otp}
                </p>

                <p style="font-size:13px;color:#7a6400;background:#fff8e1;padding:12px 18px;border-radius:10px;border-left:4px solid #ffb300;text-align:left;">
                  ⏱️ Expires in <strong>10 minutes</strong>. Do not share this code with anyone.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f4f3ee;padding:20px;text-align:center;border-top:1px solid #e8e6de;">
                <p style="font-size:12px;color:#8a8a9e;margin:0;">
                  &copy; ${new Date().getFullYear()} Rochell Reponte · Cebu, Philippines
                </p>
                <p style="font-size:11px;color:#b8b4a8;margin:4px 0 0;">
                  If you didn't request this code, you can safely ignore this email.
                </p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
}

// ─── Contact Message Email Template ──────────────────────────────────────────
function generateContactEmail(name, email, message) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#f4f6fb;">
        <tr><td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

            <!-- Header -->
            <tr>
              <td style="background:#1a1a2e;padding:32px 40px;">
                <p style="font-size:26px;font-weight:800;color:#fff;margin:0;letter-spacing:-1px;">
                  R<span style="color:#8a8a9e;">.</span>
                </p>
                <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:6px 0 0;letter-spacing:3px;text-transform:uppercase;">
                  New Portfolio Message
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                <p style="font-size:10px;color:#8a8a9e;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">From</p>
                <p style="font-size:20px;font-weight:700;color:#1a1a2e;margin:0 0 24px;">${name}</p>

                <p style="font-size:10px;color:#8a8a9e;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">Email</p>
                <p style="font-size:15px;color:#1a1a2e;margin:0 0 24px;">${email}</p>

                <p style="font-size:10px;color:#8a8a9e;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Message</p>
                <div style="background:#f4f3ee;border-left:3px solid #1a1a2e;border-radius:8px;padding:16px 20px;">
                  <p style="font-size:15px;color:#1a1a2e;line-height:1.8;margin:0;">${message}</p>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f4f3ee;padding:20px 40px;border-top:1px solid #e8e6de;">
                <p style="font-size:12px;color:#8a8a9e;margin:0;">
                  Sent from your portfolio contact form · Cebu, Philippines
                </p>
                <p style="font-size:11px;color:#b8b4a8;margin:4px 0 0;">
                  Reply directly to this email to respond to ${name}.
                </p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
}

// ─── POST /api/send-otp ───────────────────────────────────────────────────────
app.post('/api/send-otp', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message)
    return res.status(400).json({ success: false, message: 'All fields are required.' });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ success: false, message: 'Invalid email address.' });

  if (isRateLimited(email))
    return res.status(429).json({ success: false, message: 'Too many requests. Please wait 1 hour before trying again.' });

  const otp = Math.floor(100000 + Math.random() * 900000);

  global.otpStore[email] = {
    otp,
    name,
    message,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };

  try {
    await transporter.sendMail({
      from: `"Rochell Portfolio" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Your Verification Code',
      html: generateOtpEmail(name, otp),
    });
    res.json({ success: true, message: 'OTP sent successfully!' });
  } catch (error) {
    console.error('❌ Email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
});

// ─── POST /api/verify-otp ─────────────────────────────────────────────────────
app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ success: false, message: 'Email and OTP are required.' });

  const stored = global.otpStore[email];

  if (!stored)
    return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });

  if (Date.now() > stored.expiresAt) {
    delete global.otpStore[email];
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }

  if (parseInt(otp) !== stored.otp)
    return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `📬 New message from ${stored.name}`,
      html: generateContactEmail(stored.name, email, stored.message),
    });

    delete global.otpStore[email];
    res.json({ success: true, message: 'Verified! Your message has been sent successfully.' });
  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({ success: false, message: 'Verified but failed to send message. Please try again.' });
  }
});

// ─── Groq Helper (Llama 3) ────────────────────────────────────────────────────
function callGroq(apiKey, messages) {
  return new Promise((resolve, reject) => {
    const payload = {
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 700,
      temperature: 0.7,
      stream: false,
    };
    const bodyStr = JSON.stringify(payload);
    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

// ─── Roch-Bot System Prompt ───────────────────────────────────────────────────
const ROCH_BOT_SYSTEM = `You are Roch-Bot, the smart AI assistant built into Rochell Reponte's portfolio website.

== ABOUT ROCHELL ==
- Full Name: Rochell Reponte
- Role: Frontend Developer
- Location: Cebu, Philippines
- Education: BS Computer Science, graduating 2026
- Status: Immediately available for opportunities
- Tagline: "I build digital experiences that drive real results."
- Traits: technical precision, keen eye for design, strong problem-solving, attention to detail, collaborative mindset

== SKILLS ==
- HTML / CSS: 95% (Frontend)
- React: 90% (Frontend) — her main framework
- JavaScript: 88% (Language) — modern ES6+
- Tailwind CSS: 85% (Frontend)
- Git & GitHub: 80% (Tools)
- Node.js: 75% (Backend)

== PROJECTS ==
1. E-Commerce Platform — Full-stack online store with cart, secure checkout, payment processing. Stack: React, Node.js, MongoDB
2. Task Manager App — Drag-and-drop task boards with real-time sync. Stack: React, Firebase, Tailwind
3. Portfolio Website — This site! Performance-optimized animations, accessible design. Stack: React, CSS, Vite
4. Weather Dashboard — Real-time weather data with interactive charts & 7-day forecasts. Stack: JavaScript, API, Chart.js

== EXPERIENCE ==
- 2026: BS Computer Science Graduate
- 2025: Frontend Developer Intern at a Tech Company
- 2024: Freelance Web Developer (self-employed)

== CONTACT ==
- Contact form on this page (Contact section)
- She responds within 24 hours
- Social: GitHub, LinkedIn, Twitter
- Open to: full-time roles, freelance, remote or Cebu-based

== YOUR CAPABILITIES ==
You can help visitors with:
1. Questions about Rochell (skills, projects, background, availability, contact)
2. General coding questions: HTML, CSS, JavaScript, React, Python, Git, SQL, TypeScript
3. Math calculations
4. Summarizing text
5. Debugging help and problem solving
6. Web development concepts

== RULES ==
- Be friendly, helpful, and conversational
- Use **bold** for key terms and code formatting where helpful
- For coding questions, provide working code examples
- Keep answers focused and clear
- If asked about Rochell, always answer from the facts above — never invent information
- If a question is completely unrelated to tech or Rochell, politely redirect
- Never mention what AI model or technology powers you`;

// ─── POST /api/rochbot ────────────────────────────────────────────────────────
app.post('/api/rochbot', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages))
      return res.status(400).json({ error: 'Messages array is required.' });

    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) {
      console.error('❌ GROQ_API_KEY is missing from .env');
      return res.status(500).json({ error: 'API key not configured.' });
    }

    const chatMessages = [
      { role: 'system', content: ROCH_BOT_SYSTEM },
      ...messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-20)
        .map(m => ({ role: m.role, content: m.content })),
    ];

    const result = await callGroq(apiKey, chatMessages);

    if (result.status !== 200) {
      const errorMsg = result.body?.error?.message || JSON.stringify(result.body);
      console.error(`❌ Groq API Error (${result.status}):`, errorMsg);
      return res.status(500).json({ error: 'Roch-Bot is temporarily unavailable. Please try again later.' });
    }

    const reply = result.body?.choices?.[0]?.message?.content;

    if (!reply) {
      console.error('❌ Empty reply from Groq:', JSON.stringify(result.body));
      return res.status(500).json({ error: 'No response received. Please try again.' });
    }

    res.json({ reply });

  } catch (error) {
    console.error('❌ Roch-Bot error:', error.message);
    res.status(500).json({ error: 'Roch-Bot is temporarily unavailable. Please try again later.' });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📧 Gmail: ${process.env.EMAIL_USER ? '✅ ' + process.env.EMAIL_USER : '❌ MISSING'}`);
  console.log(`🦙 Groq:  ${process.env.GROQ_API_KEY ? '✅ Found' : '❌ MISSING — add GROQ_API_KEY to .env!'}`);
});