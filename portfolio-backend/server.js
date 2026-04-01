require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get('/', (req, res) => res.json({ message: 'Server running!' }));

// ─── Helper: call Groq API (Llama 3 — open source) via Node built-in https ───
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
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function generateOtpEmail(name, otp) {
  const digits = otp.toString().split('');
  const digitBoxes = digits
    .map((d) => `<td style="width:48px;height:56px;background-color:#f0f4ff;border:2px solid #4f6ef7;border-radius:10px;text-align:center;vertical-align:middle;font-size:28px;font-weight:700;color:#1a1a2e;">${d}</td>`)
    .join('<td style="width:8px;"></td>');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#f4f6fb;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#4f6ef7,#7c3aed);padding:32px 40px;text-align:center;">
<span style="font-size:22px;font-weight:700;color:#fff;">🔐 Verification Code</span></td></tr>
<tr><td style="padding:36px 40px 20px;">
<p style="font-size:18px;font-weight:600;color:#1a1a2e;">Hello${name ? ', ' + name : ''}! 👋</p>
<p style="font-size:15px;color:#555b6e;">Use the code below to complete verification.</p>
<table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;"><tr>${digitBoxes}</tr></table>
<p style="font-size:36px;font-weight:700;color:#4f6ef7;letter-spacing:10px;text-align:center;font-family:'Courier New',monospace;">${otp}</p>
<p style="font-size:13px;color:#7a6400;background:#fff8e1;padding:12px 18px;border-radius:10px;border-left:4px solid #ffb300;">⏱️ Expires in <strong>10 minutes</strong>. Do not share.</p>
</td></tr>
<tr><td style="background:#f8f9fc;padding:20px;text-align:center;border-top:1px solid #e8ecf2;">
<p style="font-size:12px;color:#aaa;">&copy; ${new Date().getFullYear()} Rochell Reponte</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

// ─── Send OTP ────────────────────────────────────────────────────────────────
app.post('/api/send-otp', async (req, res) => {
  const { name, email, message } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  if (!global.otpStore) global.otpStore = {};
  global.otpStore[email] = { otp, name, message, expiresAt: Date.now() + 10 * 60 * 1000 };
  try {
    await transporter.sendMail({
      from: `"Rochell Portfolio" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Your Verification Code',
      html: generateOtpEmail(name, otp),
    });
    res.json({ success: true, message: 'OTP sent successfully!' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP.' });
  }
});

// ─── Verify OTP ──────────────────────────────────────────────────────────────
app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!global.otpStore || !global.otpStore[email])
    return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });
  const stored = global.otpStore[email];
  if (Date.now() > stored.expiresAt) {
    delete global.otpStore[email];
    return res.status(400).json({ success: false, message: 'OTP has expired.' });
  }
  if (parseInt(otp) !== stored.otp)
    return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Message from ${stored.name}`,
      html: `<div style="font-family:Arial,sans-serif;padding:20px;">
        <h2 style="color:#4f6ef7;">New Contact Message</h2>
        <p><strong>Name:</strong> ${stored.name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p style="background:#f4f6fb;padding:16px;border-radius:8px;">${stored.message}</p>
      </div>`,
    });
    delete global.otpStore[email];
    res.json({ success: true, message: 'Verified! Your message has been sent.' });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Verified, but failed to send message.' });
  }
});

// ─── Roch-Bot (powered by Llama 3 via Groq — open source) ───────────────────
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
- Keep answers focused and clear — not too long unless the question needs detail
- If asked about Rochell, always answer from the facts above — never invent information
- If a question is completely unrelated to tech or Rochell, politely redirect
- Never mention what AI model or technology powers you`;

app.post('/api/rochbot', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages))
      return res.status(400).json({ error: 'Messages array is required.' });

    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) {
      console.error('GROQ_API_KEY is missing from .env');
      return res.status(500).json({ error: 'API key not configured.' });
    }

    // Build OpenAI-compatible message array with system prompt first
    const chatMessages = [
      { role: 'system', content: ROCH_BOT_SYSTEM },
      ...messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content })),
    ];

    const result = await callGroq(apiKey, chatMessages);

    if (result.status !== 200) {
      const errorMsg = result.body?.error?.message || JSON.stringify(result.body);
      console.error(`❌ Groq API Error (${result.status}):`, errorMsg);
      return res.status(500).json({ error: 'Roch-Bot is temporarily unavailable. Please try again later.' });
    }

    const reply = result.body?.choices?.[0]?.message?.content;

    if (!reply) {
      console.error('Empty reply from Groq:', JSON.stringify(result.body));
      return res.status(500).json({ error: 'No response received. Please try again.' });
    }

    res.json({ reply });

  } catch (error) {
    console.error('Roch-Bot error:', error.message);
    res.status(500).json({ error: 'Roch-Bot is temporarily unavailable. Please try again later.' });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🦙 Groq (Llama 3) key: ${process.env.GROQ_API_KEY ? '✅ Found' : '❌ MISSING — add GROQ_API_KEY to .env!'}`)
});