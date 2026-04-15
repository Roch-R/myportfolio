require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.get('/', (req, res) => res.json({ message: '✅ Server is running!' }));

global.otpStore = {};
global.rateLimiter = {};

function isRateLimited(email) {
  const now = Date.now();
  if (!global.rateLimiter[email]) global.rateLimiter[email] = [];
  global.rateLimiter[email] = global.rateLimiter[email].filter(t => now - t < 3600000);
  if (global.rateLimiter[email].length >= 3) return true;
  global.rateLimiter[email].push(now);
  return false;
}

function generateOtpEmail(name, otp) {
  const digits = otp.toString().split('');
  const digitBoxes = digits.map(d => `<td style="width:48px;height:56px;background-color:#f0f4ff;border:2px solid #1a1a2e;border-radius:10px;text-align:center;vertical-align:middle;font-size:28px;font-weight:700;color:#1a1a2e;">${d}</td>`).join('<td style="width:8px;"></td>');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#f4f6fb;"><tr><td align="center"><table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background:#1a1a2e;padding:32px 40px;text-align:center;"><p style="font-size:26px;font-weight:800;color:#fff;margin:0;letter-spacing:-1px;">R<span style="color:#8a8a9e;">.</span></p><p style="font-size:13px;color:rgba(255,255,255,0.5);margin:6px 0 0;letter-spacing:3px;text-transform:uppercase;">Verification Code</p></td></tr><tr><td style="padding:40px;text-align:center;"><p style="font-size:18px;font-weight:600;color:#1a1a2e;margin:0 0 8px;">Hello${name ? ', ' + name : ''}! 👋</p><p style="font-size:15px;color:#6a6a7e;margin:0 0 32px;line-height:1.6;">Use the code below to complete your verification.<br/>This code expires in <strong>10 minutes</strong>.</p><table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;"><tr>${digitBoxes}</tr></table><p style="font-size:40px;font-weight:800;color:#1a1a2e;letter-spacing:12px;text-align:center;font-family:'Courier New',monospace;margin:0 0 24px;">${otp}</p><p style="font-size:13px;color:#7a6400;background:#fff8e1;padding:12px 18px;border-radius:10px;border-left:4px solid #ffb300;text-align:left;">⏱️ Expires in <strong>10 minutes</strong>. Do not share this code with anyone.</p></td></tr><tr><td style="background:#f4f3ee;padding:20px;text-align:center;border-top:1px solid #e8e6de;"><p style="font-size:12px;color:#8a8a9e;margin:0;">&copy; ${new Date().getFullYear()} Rochell Reponte · Cebu, Philippines</p><p style="font-size:11px;color:#b8b4a8;margin:4px 0 0;">If you didn't request this code, you can safely ignore this email.</p></td></tr></table></td></tr></table></body></html>`;
}

function generateContactEmail(name, email, message) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#f4f6fb;"><tr><td align="center"><table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background:#1a1a2e;padding:32px 40px;"><p style="font-size:26px;font-weight:800;color:#fff;margin:0;letter-spacing:-1px;">R<span style="color:#8a8a9e;">.</span></p><p style="font-size:13px;color:rgba(255,255,255,0.5);margin:6px 0 0;letter-spacing:3px;text-transform:uppercase;">New Portfolio Message</p></td></tr><tr><td style="padding:40px;"><p style="font-size:10px;color:#8a8a9e;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">From</p><p style="font-size:20px;font-weight:700;color:#1a1a2e;margin:0 0 24px;">${name}</p><p style="font-size:10px;color:#8a8a9e;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">Email</p><p style="font-size:15px;color:#1a1a2e;margin:0 0 24px;">${email}</p><p style="font-size:10px;color:#8a8a9e;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Message</p><div style="background:#f4f3ee;border-left:3px solid #1a1a2e;border-radius:8px;padding:16px 20px;"><p style="font-size:15px;color:#1a1a2e;line-height:1.8;margin:0;">${message}</p></div></td></tr><tr><td style="background:#f4f3ee;padding:20px 40px;border-top:1px solid #e8e6de;"><p style="font-size:12px;color:#8a8a9e;margin:0;">Sent from your portfolio contact form · Cebu, Philippines</p><p style="font-size:11px;color:#b8b4a8;margin:4px 0 0;">Reply directly to this email to respond to ${name}.</p></td></tr></table></td></tr></table></body></html>`;
}

app.post('/api/send-otp', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ success: false, message: 'All fields are required.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'Invalid email address.' });
  if (isRateLimited(email)) return res.status(429).json({ success: false, message: 'Too many requests. Please wait 1 hour before trying again.' });

  const otp = Math.floor(100000 + Math.random() * 900000);
  global.otpStore[email] = { otp, name, message, expiresAt: Date.now() + 10 * 60 * 1000 };

  try {
    await resend.emails.send({
      from: 'Rochell Portfolio <onboarding@resend.dev>',
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

app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required.' });

  const stored = global.otpStore[email];
  if (!stored) return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });
  if (Date.now() > stored.expiresAt) { delete global.otpStore[email]; return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' }); }
  if (parseInt(otp) !== stored.otp) return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });

  try {
    await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
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

// function callGroq removed in favor of streaming directly in the route handler

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

app.post('/api/rochbot', (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Messages array is required.' });
    
    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) return res.status(500).json({ error: 'API key not configured.' });

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const chatMessages = [
      { role: 'system', content: ROCH_BOT_SYSTEM }, 
      ...messages.filter(m => m.role === 'user' || m.role === 'assistant')
                 .slice(-20)
                 .map(m => ({ role: m.role, content: m.content }))
    ];
    
    const payload = JSON.stringify({ 
      model: 'llama-3.3-70b-versatile',
      messages: chatMessages,
      max_tokens: 1200,
      temperature: 0.7,
      stream: true
    });
    
    const options = { 
      hostname: 'api.groq.com', 
      path: '/openai/v1/chat/completions', 
      method: 'POST', 
      headers: { 
        'Authorization': `Bearer ${apiKey}`, 
        'Content-Type': 'application/json', 
        'Content-Length': Buffer.byteLength(payload) 
      } 
    };
    
    const groqReq = https.request(options, (groqRes) => {
      if (groqRes.statusCode !== 200) {
        let errData = '';
        groqRes.on('data', chunk => errData += chunk);
        groqRes.on('end', () => {
          console.error("Groq API error:", errData);
          res.write(`data: ${JSON.stringify({ error: "Roch-Bot is temporarily unavailable." })}\n\n`);
          res.end();
        });
        return;
      }
      
      // Successfully connected, pipe the SSE stream directly to the client
      groqRes.pipe(res);
    });
    
    groqReq.on('error', (e) => {
      console.error('❌ Groq connection error:', e.message);
      res.end();
    });
    
    req.on('close', () => {
      // Client disconnected, abort the request to Groq
      groqReq.destroy();
    });
    
    groqReq.write(payload);
    groqReq.end();
  } catch (error) {
    console.error('❌ Roch-Bot endpoint error:', error.message);
    res.end();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📧 Resend: ${process.env.RESEND_API_KEY ? '✅ Found' : '❌ MISSING'}`);
  console.log(`📬 Contact email: ${process.env.EMAIL_USER ? '✅ ' + process.env.EMAIL_USER : '❌ MISSING'}`);
  console.log(`🦙 Groq:  ${process.env.GROQ_API_KEY ? '✅ Found' : '❌ MISSING'}`);
});