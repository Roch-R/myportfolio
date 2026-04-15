const https = require('https');

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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array required' });
  }

  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const chatMessages = [
    { role: 'system', content: ROCH_BOT_SYSTEM },
    ...messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content })),
  ];

  const payload = JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: chatMessages,
    max_tokens: 1200,
    temperature: 0.7,
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const groqReq = https.request(options, (groqRes) => {
      let data = '';
      groqRes.on('data', (chunk) => { data += chunk; });
      groqRes.on('end', () => {
        if (groqRes.statusCode !== 200) {
          console.error('Groq API error:', data);
          res.status(500).json({ error: 'AI temporarily unavailable. Please try again.' });
          return resolve();
        }
        try {
          const json = JSON.parse(data);
          const reply = json.choices?.[0]?.message?.content || '';
          res.json({ reply });
        } catch (e) {
          console.error('Parse error:', e);
          res.status(500).json({ error: 'Invalid response from AI' });
        }
        resolve();
      });
    });

    groqReq.on('error', (err) => {
      console.error('Groq connection error:', err.message);
      res.status(500).json({ error: 'Connection error. Please try again.' });
      resolve();
    });

    groqReq.write(payload);
    groqReq.end();
  });
};
