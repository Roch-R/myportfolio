import { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// WEBSITE DNA — every fact from every section of this portfolio
// ─────────────────────────────────────────────────────────────────────────────
const SITE = {
  owner: {
    name: "Rochell Reponte",
    role: "Frontend Developer",
    location: "Cebu, Philippines",
    grad: "BS Computer Science, 2026",
    status: "Immediately available for opportunities",
    tagline: "I build digital experiences that drive real results.",
    focus: "React & modern JavaScript — performant, accessible, visually refined web apps",
    traits: ["technical precision", "keen eye for design", "strong problem-solving", "attention to detail", "collaborative mindset"],
  },
  skills: [
    { name: "HTML / CSS",    level: 95, cat: "Frontend" },
    { name: "React",         level: 90, cat: "Frontend" },
    { name: "JavaScript",    level: 88, cat: "Language" },
    { name: "Tailwind CSS",  level: 85, cat: "Frontend" },
    { name: "Git & GitHub",  level: 80, cat: "Tools" },
    { name: "Node.js",       level: 75, cat: "Backend" },
  ],
  projects: [
    { title: "E-Commerce Platform",  num: "01", tags: ["React","Node.js","MongoDB"],   desc: "Full-stack online store with cart management, secure checkout flow, and integrated payment processing." },
    { title: "Task Manager App",      num: "02", tags: ["React","Firebase","Tailwind"], desc: "Productivity application featuring drag-and-drop task boards with real-time synchronization." },
    { title: "Portfolio Website",     num: "03", tags: ["React","CSS","Vite"],          desc: "Modern, responsive portfolio with performance-optimized animations and accessible design." },
    { title: "Weather Dashboard",     num: "04", tags: ["JavaScript","API","Chart.js"], desc: "Real-time meteorological data visualization with interactive charts and 7-day forecasts." },
  ],
  experience: [
    { year: "2026", title: "BS Computer Science", place: "University Graduate" },
    { year: "2025", title: "Frontend Developer Intern", place: "Tech Company" },
    { year: "2024", title: "Freelance Web Developer", place: "Self-Employed" },
  ],
  contact: {
    response: "within 24 hours",
    availability: "actively seeking opportunities",
    socials: ["GitHub", "LinkedIn", "Twitter"],
    form: "Contact section at the bottom of this page",
  },
  sections: ["Home","About","Skills","Projects","Contact"],
};

// ─────────────────────────────────────────────────────────────────────────────
// SUGGESTIONS & INTRO
// ─────────────────────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "Summarize Rochell for me",
  "What projects has she built?",
  "How do I center a div in CSS?",
  "Solve: (150 / 3) + 25 * 2",
];

const BOT_INTRO = {
  role: "assistant",
  content: `Hi! 👋 I'm **Roch-Bot** — Rochell's smart AI assistant.\n\nI can help you with:\n• 🙋 **About Rochell** — profile, skills, projects, contact\n• 💻 **Coding help** — HTML, CSS, JS, React, Python, Git, SQL…\n• 🧮 **Math** — any calculation\n• 📝 **Summarize** — type \`summarize:\` + any text\n• 💡 **Any question** — ask me anything!\n\nWhat would you like to know?`,
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. CONTEXT RESOLVER — understand pronouns like "him/her/him/the site"
// ─────────────────────────────────────────────────────────────────────────────
function resolveContext(input) {
  const l = input.toLowerCase();

  // "give all information / everything / full details / complete info / all info / overview"
  if (/(give (all|me all|me the|full|complete|every|the)|show (all|me|everything|full)|all (information|info|details|about|data)|everything (about|you know|i need)|full (information|info|details|overview|profile|summary)|complete (information|info|profile|overview)|overview of (her|him|rochell|this|the)|tell me everything|what do you know|give me an overview|introduce (her|him|rochell|yourself))/.test(l)) {
    return "FULL_INFO";
  }
  // "summarize her/him/rochell/the portfolio/this site/her background"
  if (/(summarize|summary of|summarise)\s*(her|him|rochell|reponte|this|the|her background|his background|portfolio|website|site|page)/.test(l)) {
    return "SUMMARIZE_ROCHELL";
  }
  // "tell me about her/him" or "who is she/he"
  if (/(tell me about (her|him|rochell)|who (is she|is he|is rochell)|describe (her|him|rochell)|info about (her|him|rochell))/.test(l)) {
    return "ABOUT_ROCHELL";
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. BUILT-IN SUMMARIES
// ─────────────────────────────────────────────────────────────────────────────
function summarizeRochell() {
  const skillList = SITE.skills.map(s => `${s.name} (${s.level}%)`).join(", ");
  const projList  = SITE.projects.map(p => `${p.title} [${p.tags.join(", ")}]`).join("\n  • ");
  return `📋 **Rochell Reponte — Full Summary**\n\n**Who she is:**\nFrontend Developer based in **Cebu, Philippines** 🇵🇭. BS Computer Science graduate (2026). She specializes in React & modern JavaScript, building performant, accessible, and visually refined web applications.\n\n**Skills:**\n${skillList}\n\n**Projects:**\n  • ${projList}\n\n**Experience:**\n• 2026 — BS Computer Science Graduate\n• 2025 — Frontend Developer Intern\n• 2024 — Freelance Web Developer\n\n**Status:** 🟢 Immediately available for opportunities.\n\n**Contact:** Use the Contact section on this page — she responds within 24 hours!`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. MATH ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function tryMath(raw) {
  const clean = raw
    .replace(/what\s+is|calculate|compute|solve|evaluate|equals?|=\?/gi, "")
    .replace(/\bx\b/gi, "*").replace(/×/g, "*").replace(/÷/g, "/").replace(/\^/g, "**")
    .replace(/[^0-9+\-*/.()%\s]/g, "").trim();

  if (!clean || !/[0-9]/.test(clean)) return null;
  if (!/[+\-*/%^()]/.test(clean) && !clean.includes("**")) return null;

  try {
    const result = Function(`"use strict"; return (${clean})`)();
    if (typeof result === "number" && isFinite(result)) {
      const r = Math.round(result * 1e10) / 1e10;
      return `🧮 **${clean.trim()} = ${r}**\n\nCalculation complete! Ask me anything else.`;
    }
  } catch { /* not math */ }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. TEXT SUMMARIZER
// ─────────────────────────────────────────────────────────────────────────────
const STOP = new Set(["the","a","an","is","are","was","were","be","been","being","have","has","had","do","does","did","will","would","could","should","may","might","can","to","of","in","on","at","by","for","with","about","and","but","or","not","no","this","that","these","those","i","me","my","we","our","you","your","it","its","they","them","their","what","all","some","any","just","very","also","then","than","when","where","why","how","if","so","yet","from","up","into","over","after","before","more","most"]);

function trySummarize(input) {
  const match = input.match(/^(?:summarize|summary|tldr|sum up|tl;dr|brief)[:\s]+(.+)/is);
  if (!match) return null;

  const text = match[1].trim();
  if (text.length < 20) return "Please provide more text to summarize. Try: `summarize: [paste your text here]`";

  const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 10);
  if (sentences.length <= 2) return `📝 **Summary:**\n• ${sentences.join("\n• ")}\n\n**Key point:** ${sentences[0]}`;

  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
  const freq = {};
  words.forEach(w => { if (!STOP.has(w) && w.length > 2) freq[w] = (freq[w] || 0) + 1; });

  const scored = sentences.map(s => {
    const sw = s.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
    return { s, score: sw.reduce((a, w) => a + (freq[w] || 0), 0) / (sw.length || 1) };
  });

  const topN = Math.min(3, Math.ceil(sentences.length * 0.4) + 1);
  const top = [...scored].sort((a, b) => b.score - a.score).slice(0, topN);
  top.sort((a, b) => sentences.indexOf(a.s) - sentences.indexOf(b.s));

  const keyWords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([w]) => w);
  const wordCount = text.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  return `📝 **Summary** (${wordCount} words → ${readTime} min read)\n\n${top.map(t => "• " + t.s).join("\n")}\n\n🔑 **Key topics:** ${keyWords.join(", ")}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. KNOWLEDGE BASE
// ─────────────────────────────────────────────────────────────────────────────

// ── Rochell / Website Knowledge ──────────────────────────────────────────────
const ROCHELL_KB = [
  {
    keys: ["skill", "stack", "technolog", "proficien", "competenc", "good at", "know how"],
    reply: () => {
      const list = SITE.skills.map(s => `• **${s.name}** — ${s.level}% (${s.cat})`).join("\n");
      return `Rochell's technical skills:\n\n${list}\n\nHer strongest area is **HTML/CSS** (95%), with **React** as her main framework. She also has backend experience with **Node.js**.`;
    },
  },
  {
    keys: ["project", "built", "work", "portfolio", "ecommerce", "task manager", "weather", "dashboard"],
    reply: () => {
      const list = SITE.projects.map(p => `**${p.num}. ${p.title}**\n   ${p.desc}\n   Tags: ${p.tags.join(", ")}`).join("\n\n");
      return `Rochell's featured projects:\n\n${list}\n\nWant details on any specific project?`;
    },
  },
  {
    keys: ["hire", "available", "opportunit", "job", "freelance", "recruit", "open to work", "looking for"],
    reply: `Rochell is **immediately available** 🟢\n\nShe's open to:\n• Full-time frontend developer roles\n• Freelance & contract projects\n• Remote or Cebu-based positions\n• Collaborative team environments\n\nHead to the **Contact section** — she responds within 24 hours!`,
  },
  {
    keys: ["contact", "reach", "email", "message", "get in touch", "connect", "talk", "phone"],
    reply: `Reach Rochell via the **Contact section** at the bottom of this page. 📬\n\n• **Response time:** within 24 hours\n• **Form:** fill in your name, email, and message\n• **Socials:** GitHub, LinkedIn, Twitter\n\nShe's actively seeking opportunities and loves hearing from new people!`,
  },
  {
    keys: ["about", "who is", "background", "herself", "rochell", "reponte", "bio", "profile", "person", "introduce", "overview", "all info", "all information", "full info", "complete info", "everything about", "give me", "tell me"],
    reply: `**Rochell Reponte** — Frontend Developer 👩‍💻\n\n📍 Cebu, Philippines\n🎓 BS Computer Science (2026)\n💼 Status: Immediately available\n\nShe combines **technical precision** with a **keen eye for design**, ensuring every project meets the highest standards of quality and user experience. She brings strong problem-solving skills, attention to detail, and a collaborative mindset to every team.`,
  },
  {
    keys: ["education", "degree", "university", "graduate", "cs degree", "computer science", "study", "school"],
    reply: `Rochell holds a **BS in Computer Science**, graduating in **2026**.\n\nHer studies gave her a strong foundation in:\n• Software engineering principles\n• Algorithms & data structures\n• Modern web development practices\n• Problem-solving methodology`,
  },
  {
    keys: ["experience", "intern", "internship", "career", "history", "worked", "past job"],
    reply: () => {
      const list = SITE.experience.map(e => `• **${e.year}** — ${e.title} @ ${e.place}`).join("\n");
      return `Rochell's career journey:\n\n${list}\n\nShe's been building real-world projects throughout her studies and is ready to bring that experience to your team!`;
    },
  },
  {
    keys: ["location", "cebu", "philippines", "where", "based", "from", "city"],
    reply: `Rochell is based in **Cebu, Philippines** 🇵🇭.\n\nShe's open to:\n• **Remote work** (any timezone)\n• **On-site** roles in Cebu\n• **Hybrid** arrangements`,
  },
  {
    keys: ["section", "page", "website", "navigate", "site", "this page", "portfolio"],
    reply: `This portfolio has **5 sections**:\n\n1. 🏠 **Home** — hero intro with animated visuals\n2. 👤 **About** — background, story, and timeline\n3. ⚙️ **Skills** — technical proficiency breakdown\n4. 🗂️ **Projects** — 4 featured builds\n5. 📬 **Contact** — get in touch form\n\nUse the navigation bar at the top to jump to any section!`,
  },
  {
    keys: ["rate", "price", "cost", "salary", "pay", "budget", "charge", "how much"],
    reply: `For rates and compensation details, it's best to reach out directly through the **Contact section**. Rochell is flexible and open to discussion based on the scope and type of work.\n\nShe responds within 24 hours!`,
  },
  {
    keys: ["react experience", "how long react", "years of experience", "how long coding", "years coding"],
    reply: `Rochell has been building with **React** since her studies and freelance work (2024+). Her portfolio website itself is built with **React + Vite**, demonstrating her hands-on proficiency. React is currently her **#2 skill at 90%**.`,
  },
];

// ── CSS Help ──────────────────────────────────────────────────────────────────
const CSS_KB = [
  {
    keys: ["center div", "center a div", "center element", "center in css", "how to center", "horizontally center", "vertically center", "center box"],
    reply: `**3 ways to center a div in CSS:**\n\n**1. Flexbox (recommended):**\n\`\`\`\n.parent {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\`\`\`\n\n**2. CSS Grid (cleanest):**\n\`\`\`\n.parent {\n  display: grid;\n  place-items: center;\n}\n\`\`\`\n\n**3. Absolute + Transform:**\n\`\`\`\n.child {\n  position: absolute;\n  top: 50%; left: 50%;\n  transform: translate(-50%, -50%);\n}\n\`\`\``,
  },
  {
    keys: ["flexbox", "flex layout", "flex container", "justify-content", "align-items", "flex-direction"],
    reply: `**CSS Flexbox — complete guide:**\n\n\`\`\`\n.container {\n  display: flex;\n  flex-direction: row | column;\n  justify-content: flex-start | center | space-between | space-around | space-evenly;\n  align-items: stretch | center | flex-start | flex-end;\n  flex-wrap: wrap | nowrap;\n  gap: 16px;\n}\n\n.item {\n  flex: 1;           /* grow & shrink equally */\n  flex-grow: 2;      /* take 2x more space */\n  flex-shrink: 0;    /* don't shrink */\n  align-self: center;\n  order: 2;          /* reorder items */\n}\n\`\`\``,
  },
  {
    keys: ["css grid", "grid layout", "grid-template", "grid column", "grid row", "place-items"],
    reply: `**CSS Grid — complete guide:**\n\n\`\`\`\n.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-template-rows: auto;\n  gap: 16px;\n  /* or: grid-template: 'header header' auto / 1fr 1fr */\n}\n\n.item {\n  grid-column: span 2;   /* span 2 cols */\n  grid-row: 1 / 3;       /* rows 1 to 3 */\n}\n\`\`\``,
  },
  {
    keys: ["responsive", "media query", "mobile first", "breakpoint", "@media"],
    reply: `**Responsive design with media queries:**\n\n\`\`\`\n/* Mobile first (start small, scale up) */\n.container { width: 100%; padding: 16px; }\n\n@media (min-width: 480px) { /* small phones */ }\n@media (min-width: 768px) { /* tablets */ }\n@media (min-width: 1024px) { /* laptops */ }\n@media (min-width: 1280px) { /* desktops */ }\n\`\`\`\n\nThis site uses **mobile-first** responsive design with similar breakpoints!`,
  },
  {
    keys: ["css variable", "custom propert", "var(", "--color", ":root"],
    reply: `**CSS Custom Properties (Variables):**\n\n\`\`\`\n:root {\n  --color-primary: #1a1a2e;\n  --color-accent: #5a5a9e;\n  --font-base: 16px;\n  --spacing-md: 1rem;\n}\n\n.button {\n  background: var(--color-primary);\n  font-size: var(--font-base);\n}\n\n/* Override in a scope */\n.dark-card { --color-primary: #fafaf8; }\n\`\`\`\n\nThis portfolio uses CSS variables extensively for theming!`,
  },
  {
    keys: ["animation", "keyframe", "@keyframes", "transition", "css animate", "ease"],
    reply: `**CSS Animations & Transitions:**\n\n\`\`\`\n/* Transition (for hover) */\n.btn {\n  transition: all 0.3s ease;\n}\n.btn:hover { transform: translateY(-3px) scale(1.02); }\n\n/* Keyframe animation */\n@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(10px); }\n  to   { opacity: 1; transform: translateY(0); }\n}\n.element {\n  animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;\n}\n\`\`\`\n\nThis portfolio uses \`cubic-bezier(.16,1,.3,1)\` — a snappy spring feel!`,
  },
  {
    keys: ["position", "absolute", "relative", "fixed", "sticky", "z-index", "stacking"],
    reply: `**CSS Positioning:**\n\n• **static** — default, in normal flow\n• **relative** — offset from its normal spot\n• **absolute** — removed from flow, relative to nearest positioned ancestor\n• **fixed** — relative to viewport (stays on scroll)\n• **sticky** — sticks at a threshold while scrolling\n\n\`\`\`\n.parent { position: relative; }\n.badge {\n  position: absolute;\n  top: -8px; right: -8px;\n}\n\n.navbar {\n  position: sticky;\n  top: 0; z-index: 100;\n}\n\`\`\``,
  },
  {
    keys: ["box model", "padding margin", "border box", "box-sizing", "width height"],
    reply: `**CSS Box Model:**\n\n\`\`\`\n/* Always set this — makes width/height include padding & border */\n*, *::before, *::after { box-sizing: border-box; }\n\n.box {\n  width: 300px;     /* content width (with border-box: total width) */\n  padding: 20px;    /* inner space */\n  border: 1px solid;\n  margin: 16px;     /* outer space */\n}\n\`\`\`\n\n**Order:** content → padding → border → margin`,
  },
  {
    keys: ["tailwind", "utility class", "tailwind css", "tw class"],
    reply: `**Tailwind CSS basics:**\n\n\`\`\`html\n<!-- Flexbox center -->\n<div class="flex items-center justify-center">\n\n<!-- Responsive grid -->\n<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">\n\n<!-- Hover + transition -->\n<button class="bg-blue-500 hover:bg-blue-600 transition-colors duration-200 rounded-lg px-4 py-2">\n\n<!-- Dark mode -->\n<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">\n\`\`\`\n\nThis portfolio uses **Tailwind CSS** (85% proficiency)!`,
  },
];

// ── JavaScript Help ───────────────────────────────────────────────────────────
const JS_KB = [
  {
    keys: ["arrow function", "arrow func", "fat arrow", "es6 function", "=>"],
    reply: `**Arrow Functions:**\n\n\`\`\`\n// Regular function\nfunction add(a, b) { return a + b; }\n\n// Arrow — implicit return for one expression\nconst add = (a, b) => a + b;\n\n// Multi-line\nconst greet = (name) => {\n  return \`Hello, \${name}!\`;\n};\n\n// Single param — parens optional\nconst double = n => n * 2;\n\`\`\`\n\n⚠️ Arrow functions don't have their own \`this\` — use regular functions for class/object methods.`,
  },
  {
    keys: ["promise", "async", "await", "async/await", ".then(", "fetch data"],
    reply: `**Async / Await:**\n\n\`\`\`\nasync function getData(url) {\n  try {\n    const res = await fetch(url);\n    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);\n    const data = await res.json();\n    return data;\n  } catch (err) {\n    console.error('Fetch error:', err);\n  }\n}\n\n// Call it\nconst users = await getData('/api/users');\n\`\`\`\n\n\`async\` functions always return a **Promise**. Use \`await\` only inside \`async\` functions.`,
  },
  {
    keys: ["array method", "map(", "filter(", "reduce(", "forEach", "find(", "some(", "every(", "flat("],
    reply: `**Essential Array Methods:**\n\n\`\`\`\nconst nums = [1, 2, 3, 4, 5];\n\nnums.map(n => n * 2)          // [2,4,6,8,10] — transform\nnums.filter(n => n > 2)        // [3,4,5] — keep matching\nnums.reduce((acc,n) => acc+n, 0) // 15 — collapse to value\nnums.find(n => n > 3)          // 4 — first match\nnums.findIndex(n => n > 3)     // 3 — index of first match\nnums.some(n => n > 4)          // true\nnums.every(n => n > 0)         // true\nnums.includes(3)               // true\n[1,[2,[3]]].flat(Infinity)     // [1,2,3] — flatten\n\`\`\``,
  },
  {
    keys: ["destructur", "spread operator", "rest param", "...args", "object spread"],
    reply: `**Destructuring & Spread:**\n\n\`\`\`\n// Array destructuring\nconst [a, b, ...rest] = [1, 2, 3, 4]; // a=1, b=2, rest=[3,4]\n\n// Object destructuring\nconst { name, age = 25, ...others } = person;\nconst { name: fullName } = person; // rename\n\n// Spread — copy / merge\nconst arr2 = [...arr1, 6, 7];\nconst merged = { ...obj1, ...obj2 };\n\n// Function rest params\nfunction sum(...nums) {\n  return nums.reduce((a, b) => a + b, 0);\n}\n\`\`\``,
  },
  {
    keys: ["localstorage", "sessionstorage", "local storage", "store browser", "cookie"],
    reply: `**localStorage vs sessionStorage:**\n\n\`\`\`\n// localStorage — persists after browser close\nlocalStorage.setItem('user', JSON.stringify({ name: 'R' }));\nconst user = JSON.parse(localStorage.getItem('user'));\nlocalStorage.removeItem('user');\nlocalStorage.clear();\n\n// sessionStorage — cleared when tab closes\nsessionStorage.setItem('token', 'abc123');\n\`\`\`\n\n| | localStorage | sessionStorage |\n|---|---|---|\n| Persists | ✅ | ❌ (tab only) |\n| Capacity | ~5MB | ~5MB |`,
  },
  {
    keys: ["var let const", "var vs let", "let vs const", "hoisting", "scope js", "closure"],
    reply: `**var vs let vs const:**\n\n| | \`var\` | \`let\` | \`const\` |\n|---|---|---|---|\n| Scope | function | block | block |\n| Hoisted | ✅ (undefined) | ❌ | ❌ |\n| Reassign | ✅ | ✅ | ❌ |\n| Redeclare | ✅ | ❌ | ❌ |\n\n💡 **Rule of thumb:** always use \`const\` → use \`let\` only when you need to reassign → never use \`var\`.`,
  },
  {
    keys: ["event listener", "addeventlistener", "onclick", "dom event", "click event", "keyboard event"],
    reply: `**DOM Event Listeners:**\n\n\`\`\`\nconst btn = document.querySelector('#btn');\n\nbtn.addEventListener('click', (e) => {\n  e.preventDefault();     // stop default action\n  e.stopPropagation();   // stop bubbling\n  console.log(e.target);\n});\n\n// Event delegation (efficient for lists)\ndocument.querySelector('ul').addEventListener('click', (e) => {\n  if (e.target.matches('li')) console.log(e.target.textContent);\n});\n\`\`\`\n\nCommon events: \`click\`, \`input\`, \`change\`, \`keydown\`, \`submit\`, \`scroll\`, \`resize\``,
  },
  {
    keys: ["object method", "this keyword", "prototype", "class js", "class javascript", "es6 class"],
    reply: `**JavaScript Classes (ES6):**\n\n\`\`\`\nclass Animal {\n  #name; // private field\n  constructor(name) { this.#name = name; }\n  speak() { return \`\${this.#name} makes a sound.\`; }\n  get name() { return this.#name; }\n}\n\nclass Dog extends Animal {\n  constructor(name) { super(name); }\n  speak() { return \`\${this.name} barks!\`; }\n}\n\nconst d = new Dog('Rex');\nconsole.log(d.speak()); // Rex barks!\n\`\`\``,
  },
];

// ── React Help ────────────────────────────────────────────────────────────────
const REACT_KB = [
  {
    keys: ["usestate", "react state", "state hook", "set state", "update state"],
    reply: `**useState Hook:**\n\n\`\`\`\nimport { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  const [user, setUser] = useState({ name: '', age: 0 });\n\n  // Functional update (safe for derived state)\n  setCount(prev => prev + 1);\n\n  // Spread to update object\n  setUser(prev => ({ ...prev, name: 'Rochell' }));\n\n  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;\n}\n\`\`\`\n\n⚠️ Never mutate state directly — always use the setter.`,
  },
  {
    keys: ["useeffect", "side effect", "lifecycle", "on mount", "on unmount", "dependency array"],
    reply: `**useEffect Hook:**\n\n\`\`\`\nimport { useEffect } from 'react';\n\nuseEffect(() => { /* runs every render */ });\nuseEffect(() => { /* runs once on mount */ }, []);\nuseEffect(() => { fetchData(id); }, [id]); // runs when id changes\n\n// Cleanup (componentWillUnmount equivalent)\nuseEffect(() => {\n  const timer = setInterval(tick, 1000);\n  return () => clearInterval(timer); // cleanup fn\n}, []);\n\`\`\``,
  },
  {
    keys: ["useref", "ref hook", "focus input", "dom ref", "mutable ref"],
    reply: `**useRef Hook:**\n\n\`\`\`\nimport { useRef } from 'react';\n\nfunction Form() {\n  const inputRef = useRef(null);\n  const renderCount = useRef(0);\n\n  useEffect(() => { renderCount.current++; }); // no re-render\n\n  return (\n    <>\n      <input ref={inputRef} />\n      <button onClick={() => inputRef.current.focus()}>Focus</button>\n    </>\n  );\n}\n\`\`\`\n\n💡 Use \`useRef\` for DOM access or to store values that shouldn't trigger re-renders.`,
  },
  {
    keys: ["usecontext", "context api", "global state", "prop drilling", "createcontext"],
    reply: `**React Context API:**\n\n\`\`\`\nimport { createContext, useContext, useState } from 'react';\n\nconst ThemeCtx = createContext(null);\n\nexport function ThemeProvider({ children }) {\n  const [dark, setDark] = useState(false);\n  return (\n    <ThemeCtx.Provider value={{ dark, setDark }}>\n      {children}\n    </ThemeCtx.Provider>\n  );\n}\n\nfunction Button() {\n  const { dark, setDark } = useContext(ThemeCtx);\n  return <button onClick={() => setDark(d => !d)}>Toggle</button>;\n}\n\`\`\``,
  },
  {
    keys: ["usememo", "usecallback", "performance react", "memoiz", "react.memo", "re-render"],
    reply: `**React Performance Hooks:**\n\n\`\`\`\nimport { useMemo, useCallback, memo } from 'react';\n\n// useMemo — cache expensive computation\nconst sorted = useMemo(() => items.sort(...), [items]);\n\n// useCallback — stable function reference\nconst handleClick = useCallback((id) => {\n  setItems(prev => prev.filter(i => i.id !== id));\n}, []);\n\n// React.memo — skip re-render if props unchanged\nconst Card = memo(function Card({ title }) {\n  return <div>{title}</div>;\n});\n\`\`\`\n\n💡 Don't over-optimize — profile first, then memoize.`,
  },
  {
    keys: ["react router", "routing react", "link react", "usenavigat", "useparams", "page route"],
    reply: `**React Router v6:**\n\n\`\`\`\nimport { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';\n\nfunction App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route path="/" element={<Home />} />\n        <Route path="/about" element={<About />} />\n        <Route path="/user/:id" element={<User />} />\n        <Route path="*" element={<NotFound />} />\n      </Routes>\n    </BrowserRouter>\n  );\n}\n\nfunction User() {\n  const { id } = useParams();\n  const navigate = useNavigate();\n  return <button onClick={() => navigate('/')}>Back</button>;\n}\n\`\`\``,
  },
  {
    keys: ["react prop", "props react", "pass data react", "children prop", "spread props"],
    reply: `**React Props:**\n\n\`\`\`\n// Pass props\n<Card title="Hello" count={42} active onClose={() => {}} />\n\n// Receive with defaults\nfunction Card({ title, count = 0, active = false, onClose }) {\n  return <div>{title} — {count}</div>;\n}\n\n// children prop\nfunction Modal({ children, title }) {\n  return <div><h2>{title}</h2>{children}</div>;\n}\n\n// Spread props\nconst inputProps = { type: 'email', required: true };\n<input {...inputProps} />\n\`\`\``,
  },
];

// ── Python Help ───────────────────────────────────────────────────────────────
const PYTHON_KB = [
  {
    keys: ["python list", "list python", "list comprehension", "append python", "python array"],
    reply: `**Python Lists:**\n\n\`\`\`python\nnums = [1, 2, 3, 4, 5]\n\nnums.append(6)         # add to end\nnums.insert(0, 0)      # insert at index\nnums.remove(3)         # remove by value\nnums.pop()             # remove last, returns it\nlen(nums)              # length\nnums.sort()            # in-place sort\nsorted(nums)           # returns new sorted list\nnums[::-1]             # reversed\n\n# List comprehension\nsquares = [x**2 for x in range(10)]\nevens   = [x for x in nums if x % 2 == 0]\n\`\`\``,
  },
  {
    keys: ["python dict", "dictionary python", "dict python", "key value python"],
    reply: `**Python Dictionaries:**\n\n\`\`\`python\nperson = {'name': 'Rochell', 'age': 22}\n\nperson['name']           # access\nperson.get('email', '')  # safe access with default\nperson['city'] = 'Cebu' # add/update\ndel person['age']        # delete key\n\nfor key, val in person.items():\n    print(f'{key}: {val}')\n\nkeys   = person.keys()\nvalues = person.values()\n\n# Dict comprehension\nsquares = {x: x**2 for x in range(5)}\n\`\`\``,
  },
  {
    keys: ["python function", "def python", "lambda python", "python args", "kwargs"],
    reply: `**Python Functions:**\n\n\`\`\`python\ndef greet(name, greeting='Hello'):\n    return f'{greeting}, {name}!'\n\ndef sum_all(*args):   # variable positional\n    return sum(args)\n\ndef display(**kwargs): # variable keyword\n    for k, v in kwargs.items(): print(f'{k}: {v}')\n\n# Lambda (one-liner)\ndouble = lambda x: x * 2\n\n# Type hints (good practice)\ndef add(a: int, b: int) -> int:\n    return a + b\n\`\`\``,
  },
  {
    keys: ["python class", "oop python", "__init__", "self python", "inherit python"],
    reply: `**Python Classes & OOP:**\n\n\`\`\`python\nclass Person:\n    count = 0  # class variable\n\n    def __init__(self, name, age):\n        self.name = name\n        self.age  = age\n        Person.count += 1\n\n    def greet(self): return f'Hi, I am {self.name}'\n    def __repr__(self): return f'Person({self.name})'\n\nclass Developer(Person):\n    def __init__(self, name, age, lang):\n        super().__init__(name, age)\n        self.lang = lang\n\n    def greet(self): return f'{super().greet()} I code {self.lang}!'\n\`\`\``,
  },
  {
    keys: ["python loop", "for loop python", "while python", "enumerate python", "zip python"],
    reply: `**Python Loops:**\n\n\`\`\`python\nfor i in range(5): print(i)  # 0-4\n\nfor item in ['a','b','c']: print(item)\n\n# enumerate — index + value\nfor i, val in enumerate(items):\n    print(i, val)\n\n# zip — loop two together\nfor name, score in zip(names, scores):\n    print(name, score)\n\n# while\ncount = 0\nwhile count < 5:\n    count += 1\n\n# List comprehension (Pythonic loop)\nsquares = [x**2 for x in range(10)]\n\`\`\``,
  },
];

// ── HTML Help ────────────────────────────────────────────────────────────────
const HTML_KB = [
  {
    keys: ["html form", "input form", "form element", "form tag", "html input"],
    reply: `**HTML Form:**\n\n\`\`\`html\n<form action="/submit" method="POST">\n  <label for="name">Name</label>\n  <input id="name" name="name" type="text" required />\n\n  <label for="email">Email</label>\n  <input id="email" name="email" type="email" required />\n\n  <textarea name="msg" rows="4"></textarea>\n\n  <select name="role">\n    <option value="">-- Choose --</option>\n    <option value="dev">Developer</option>\n  </select>\n\n  <button type="submit">Send</button>\n</form>\n\`\`\``,
  },
  {
    keys: ["semantic html", "semantic element", "html5 tag", "article section", "main header footer"],
    reply: `**Semantic HTML5 Elements:**\n\n\`\`\`html\n<header>    site header & nav branding\n<nav>       navigation links\n<main>      primary content (one per page)\n<article>   self-contained content piece\n<section>   thematic group with heading\n<aside>     sidebar / related content\n<footer>    page footer\n<figure>    image + caption container\n<figcaption> caption for figure\n\`\`\`\n\n**Why it matters:** SEO, accessibility (screen readers), cleaner code.`,
  },
  {
    keys: ["meta tag", "og tag", "open graph", "seo html", "viewport", "head tag"],
    reply: `**HTML Head / Meta Tags:**\n\n\`\`\`html\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <meta name="description" content="SEO description here" />\n  <title>Page Title</title>\n\n  <!-- Open Graph (social sharing preview) -->\n  <meta property="og:title" content="My Site" />\n  <meta property="og:description" content="Description" />\n  <meta property="og:image" content="/preview.jpg" />\n  <meta property="og:url" content="https://mysite.com" />\n</head>\n\`\`\``,
  },
];

// ── General Problem Solving ───────────────────────────────────────────────────
const GENERAL_KB = [
  {
    keys: ["debug", "debugging", "find bug", "not working", "console error", "fix error", "error message"],
    reply: `**Debugging checklist:**\n\n1. **Read the error** carefully — it shows file & line number\n2. **Console.log** the suspect variable: \`console.log({ myVar })\`\n3. **DevTools** → Console + Network tabs are your best friends\n4. **Isolate** — comment out code until it works, then re-add\n5. **Check spelling** — typos in names are the #1 cause\n6. **Type check** — \`typeof x\`, \`Array.isArray(arr)\`\n7. **Async timing** — are you awaiting promises?\n8. **Google the exact error** — someone else had it!\n\nPaste your error message and I'll help diagnose it! 🔍`,
  },
  {
    keys: ["git command", "git help", "git push", "git pull", "git commit", "git merge", "git branch", "git clone", "git status", "git log"],
    reply: `**Essential Git commands:**\n\n\`\`\`bash\ngit status               # see what changed\ngit add .                # stage everything\ngit add <file>           # stage specific file\ngit commit -m "msg"      # save snapshot\ngit push origin main     # push to remote\ngit pull                 # fetch + merge latest\n\ngit branch feature/x     # create branch\ngit checkout -b feature/x # create + switch\ngit merge feature/x      # merge into current\ngit log --oneline        # compact history\n\ngit restore <file>       # discard changes\ngit reset HEAD~1         # undo last commit (keep changes)\ngit stash                # save dirty state temporarily\n\`\`\``,
  },
  {
    keys: ["npm", "package.json", "node module", "npx", "yarn", "install package"],
    reply: `**npm commands:**\n\n\`\`\`bash\nnpm init -y              # create package.json\nnpm install              # install all deps\nnpm install react        # add dependency\nnpm install -D vite      # add dev dependency\nnpm uninstall lodash     # remove\nnpm run dev              # run dev script\nnpm run build            # build for production\nnpm outdated             # check for updates\n\`\`\`\n\n**package.json** — project manifest\n**node_modules/** — don't commit to git (add to .gitignore)`,
  },
  {
    keys: ["rest api", "what is api", "http method", "get post put delete", "endpoint"],
    reply: `**REST API basics:**\n\n| Method | Action |\n|---|---|\n| GET | Read data |\n| POST | Create new |\n| PUT/PATCH | Update existing |\n| DELETE | Remove |\n\n\`\`\`\nGET    /api/users        → list all users\nGET    /api/users/1      → get user with id=1\nPOST   /api/users        → create user\nPUT    /api/users/1      → update user 1\nDELETE /api/users/1      → delete user 1\n\`\`\`\n\nData format: **JSON**. Status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error.`,
  },
  {
    keys: ["typescript", "ts type", "interface ts", "ts vs js", "tsx", "type annotation"],
    reply: `**TypeScript basics:**\n\n\`\`\`ts\nlet name: string = 'Rochell';\nlet age: number = 22;\nlet active: boolean = true;\nlet tags: string[] = ['react', 'css'];\n\ninterface User {\n  id: number;\n  name: string;\n  email?: string; // optional\n}\n\nfunction greet(user: User): string {\n  return \`Hello, \${user.name}\`;\n}\n\ntype Status = 'active' | 'inactive'; // union\n\nfunction first<T>(arr: T[]): T { return arr[0]; } // generic\n\`\`\``,
  },
  {
    keys: ["big o", "time complexity", "space complexity", "algorithm complexity", "o(n)", "o(1)"],
    reply: `**Big O Notation:**\n\n| Notation | Name | Example |\n|---|---|---|\n| O(1) | Constant | Array access |\n| O(log n) | Logarithmic | Binary search |\n| O(n) | Linear | Single loop |\n| O(n log n) | Linearithmic | Merge sort |\n| O(n²) | Quadratic | Nested loops |\n| O(2ⁿ) | Exponential | Naive fibonacci |\n\n**Rule:** for n=1M → O(log n) ≈ 20 ops ✅, O(n²) ≈ 1 trillion ops ❌`,
  },
  {
    keys: ["sql", "database query", "select query", "join sql", "where clause", "group by"],
    reply: `**SQL basics:**\n\n\`\`\`sql\nSELECT * FROM users;\nSELECT name, email FROM users WHERE age > 18;\nSELECT * FROM products ORDER BY price DESC LIMIT 10;\n\nINSERT INTO users (name, email) VALUES ('Rochell', 'r@x.com');\nUPDATE users SET age = 23 WHERE id = 1;\nDELETE FROM users WHERE id = 5;\n\n-- JOIN\nSELECT u.name, o.total\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id;\n\n-- Aggregate\nSELECT department, COUNT(*), AVG(salary)\nFROM employees GROUP BY department;\n\`\`\``,
  },
  {
    keys: ["learn programming", "how to code", "beginner coding", "study tips", "roadmap developer", "learn web dev"],
    reply: `**How to learn programming effectively:**\n\n1. **Build projects** — hands-on beats tutorials\n2. **Type code yourself** — never just copy-paste\n3. **Read errors carefully** — they guide you\n4. **Use official docs** — MDN, React docs are gold\n5. **Break problems down** — solve small parts first\n6. **Be consistent** — 30 min/day beats 5-hour weekends\n7. **Share your work** — GitHub, communities\n\n**Frontend roadmap:** HTML → CSS → JavaScript → Git → React → TypeScript → Testing → Deployment\n\n💡 Rochell followed a similar path — CS degree + freelancing = real-world skills!`,
  },
  {
    keys: ["security", "xss", "sql injection", "csrf", "owasp", "authentication", "jwt", "bcrypt"],
    reply: `**Web Security Basics:**\n\n• **XSS** — never inject raw HTML; sanitize user input\n• **SQL Injection** — use parameterized queries / ORM\n• **CSRF** — use CSRF tokens for state-changing requests\n• **Authentication** — never store plain-text passwords; use **bcrypt/argon2**\n• **JWT** — header.payload.signature — keep secret key safe\n• **HTTPS** — always use TLS in production\n• **Input validation** — validate on BOTH client and server\n\n\`\`\`js\n// bcrypt (Node.js)\nconst hash = await bcrypt.hash(password, 12);\nconst ok   = await bcrypt.compare(input, hash);\n\`\`\``,
  },
  {
    keys: ["vite", "webpack", "bundler", "build tool", "vite config"],
    reply: `**Vite — modern build tool:**\n\n\`\`\`bash\nnpm create vite@latest my-app -- --template react\nnpm install && npm run dev\n\`\`\`\n\nThis portfolio uses **Vite** (Project #3 — Portfolio Website).\n\n**Why Vite over Webpack?**\n• Near-instant dev server startup (ES modules)\n• Hot Module Replacement (HMR) is very fast\n• Simpler config\n• Optimized production builds via Rollup`,
  },
];

// ── Social / Greetings ────────────────────────────────────────────────────────
const SOCIAL_KB = [
  {
    keys: ["hello", "hi there", "hey", "howdy", "good morning", "good afternoon", "good evening", "hiya", "what's up", "sup"],
    reply: `Hello! 👋 I'm **Roch-Bot** — here to help!\n\nAsk me about:\n• 🙋 **Rochell** — her skills, projects, availability\n• 💻 **Code** — HTML, CSS, JS, React, Python, Git\n• 🧮 **Math** — any calculation\n• 📝 **Summarize** — type \`summarize:\` + your text\n\nWhat can I help you with?`,
  },
  {
    keys: ["thank", "thanks", "appreciate", "helpful", "awesome", "great", "perfect", "nice", "good job", "well done"],
    reply: `You're welcome! 😊 Happy to help. Feel free to ask anything else — coding, math, about Rochell, or anything you need!`,
  },
  {
    keys: ["bye", "goodbye", "see you", "later", "ciao", "farewell", "take care", "good night"],
    reply: `Goodbye! 👋 Great chatting with you. Come back anytime you need help. Have a wonderful day!`,
  },
  {
    keys: ["who are you", "what are you", "what can you do", "your capabilities", "what do you know"],
    reply: `I'm **Roch-Bot** 🤖 — Rochell's smart built-in assistant!\n\n**What I can do:**\n📋 Answer anything about Rochell (skills, projects, background, contact)\n🧮 Solve math: \`150 / 3 + 25\`\n📝 Summarize text: \`summarize: [paste text]\`\n💻 Code help: CSS, HTML, JS, React, Python, Git, SQL, TypeScript\n🐛 Debugging tips & problem solving\n🌐 Web concepts: APIs, security, algorithms, build tools\n\nJust ask naturally — I understand context!`,
  },
  {
    keys: ["joke", "funny", "make me laugh", "humor", "fun"],
    reply: `Why do programmers prefer dark mode? 😄\n\n**Because light attracts bugs!** 🐛\n\n---\n\nA SQL query walks into a bar, walks up to two tables and asks...\n\n**"Can I JOIN you?"** 😂`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. MASTER BRAIN
// ─────────────────────────────────────────────────────────────────────────────
const ALL_KB = [...SOCIAL_KB, ...ROCHELL_KB, ...CSS_KB, ...JS_KB, ...REACT_KB, ...PYTHON_KB, ...HTML_KB, ...GENERAL_KB];

const FALLBACKS = [
  "I'm not sure about that — but I can help with **coding** (CSS, JS, React, Python), **math**, **text summarization**, or anything about **Rochell**. Try one of those!",
  "That's outside my knowledge base. Ask me about **HTML, CSS, JavaScript, React, Python, Git**, or info about **Rochell** — I've got you covered!",
  "Hmm, I don't have an answer for that yet. Try asking about **code concepts**, **math calculations**, **summarizing text**, or **Rochell's portfolio**!",
];
let fallbackIdx = 0;

function getReply(input, history) {
  const lower = input.toLowerCase().trim();

  // 1. Pronoun/context resolution (e.g. "give all information", "summarize her")
  const ctx = resolveContext(lower);
  if (ctx === "FULL_INFO")         return summarizeRochell();
  if (ctx === "SUMMARIZE_ROCHELL") return summarizeRochell();
  if (ctx === "ABOUT_ROCHELL") {
    return `**Rochell Reponte** — Frontend Developer 👩‍💻\n\n📍 Cebu, Philippines\n🎓 BS Computer Science (2026)\n💼 Immediately available\n\nShe combines technical precision with a keen eye for design, building **performant, accessible, and visually refined web applications**. Strong problem-solver with a collaborative mindset.\n\nAsk me about her **skills**, **projects**, or how to **contact** her!`;
  }

  // 2. Explicit summarize command
  const sumResult = trySummarize(input);
  if (sumResult) return sumResult;

  // 3. Math
  const mathResult = tryMath(lower);
  if (mathResult) return mathResult;

  // 4. KB scoring — count matching keywords per entry
  let best = null;
  let bestScore = 0;
  for (const entry of ALL_KB) {
    const score = entry.keys.reduce((acc, k) => acc + (lower.includes(k) ? 1 + k.split(" ").length * 0.5 : 0), 0);
    if (score > bestScore) { bestScore = score; best = entry; }
  }

  if (best && bestScore > 0) {
    return typeof best.reply === "function" ? best.reply() : best.reply;
  }

  // 5. Context-aware follow-ups
  if (history && history.length >= 2) {
    const lastBot = [...history].reverse().find(m => m.role === "assistant");
    if (lastBot) {
      const lb = lastBot.content.toLowerCase();
      const isMore = /more|example|deeper|explain|detail|elaborate/.test(lower);
      if (isMore && lb.includes("react")) return `Which React topic would you like to go deeper on?\n• **Hooks** — useState, useEffect, useRef, useContext\n• **Performance** — useMemo, useCallback, React.memo\n• **Routing** — React Router v6\n• **State management** — Context, Zustand, Redux`;
      if (isMore && lb.includes("css")) return `Which CSS topic would you like more on?\n• **Flexbox** layouts\n• **Grid** system\n• **Animations** & transitions\n• **Responsive** design\n• **Variables** & theming`;
      if (isMore && lb.includes("python")) return `Which Python topic would you like more on?\n• **Lists, dicts, sets**\n• **Functions & lambdas**\n• **Classes & OOP**\n• **File I/O**\n• **Error handling**`;
    }
  }

  // 6. Smart fallback — guess intent before giving up
  // If the message seems to be asking about Rochell generically, return full info
  if (/(info|information|detail|data|tell|show|give|about|all|everything|overview|who|what|profile)/.test(lower) && lower.length < 60) {
    return summarizeRochell();
  }

  // Rotating generic fallback
  const reply = FALLBACKS[fallbackIdx % FALLBACKS.length];
  fallbackIdx++;
  return reply;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. MESSAGE FORMATTER — bold, inline code, code blocks
// ─────────────────────────────────────────────────────────────────────────────
function formatMessage(text) {
  // Split on code blocks first
  const codeBlockRe = /```[\s\S]*?```/g;
  const parts = [];
  let last = 0;
  let match;
  while ((match = codeBlockRe.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: "text", content: text.slice(last, match.index) });
    parts.push({ type: "code", content: match[0].replace(/^```[a-z]*\n?/, "").replace(/```$/, "") });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", content: text.slice(last) });

  return parts.map((part, pi) => {
    if (part.type === "code") {
      return (
        <pre key={pi} style={{ background: "#1a1a2e", color: "#e8e6de", borderRadius: 10, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, overflowX: "auto", margin: "8px 0", fontFamily: "'Courier New', monospace", whiteSpace: "pre" }}>
          {part.content}
        </pre>
      );
    }
    // Inline: **bold** and `code`
    return part.content.split("\n").map((line, li, arr) => (
      <span key={`${pi}-${li}`}>
        {line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((seg, si) => {
          if (seg.startsWith("**") && seg.endsWith("**"))
            return <strong key={si}>{seg.slice(2, -2)}</strong>;
          if (seg.startsWith("`") && seg.endsWith("`"))
            return <code key={si} style={{ background: "#f0f0f0", color: "#d63384", borderRadius: 4, padding: "1px 5px", fontSize: 12, fontFamily: "monospace" }}>{seg.slice(1, -1)}</code>;
          return <span key={si}>{seg}</span>;
        })}
        {li < arr.length - 1 && <br />}
      </span>
    ));
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. VOICE HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

// Strip markdown for clean TTS speech
function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, "code block")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/\|[^\n]+\|/g, "")   // tables
    .replace(/[-•]\s/g, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function RochBot() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([BOT_INTRO]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [slowLoad, setSlowLoad] = useState(false);
  const [showDot, setShowDot]   = useState(true);
  // Voice state
  const [listening, setListening]     = useState(false);
  const [speaking, setSpeaking]       = useState(false);
  const [voiceOn, setVoiceOn]         = useState(true);  // auto-speak toggle
  const [speakingIdx, setSpeakingIdx] = useState(null);  // which message is playing
  const [transcript, setTranscript]   = useState("");    // live mic text
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const recognRef  = useRef(null);

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) setTimeout(() => { setShowDot(false); inputRef.current?.focus(); }, 50);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Stop speech when chat closes ────────────────────────────────────────────
  useEffect(() => {
    if (!open) window.speechSynthesis?.cancel();
  }, [open]);

  // ── TTS: speak text ─────────────────────────────────────────────────────────
  const speak = (text, idx = null) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(stripMarkdown(text));
    // Pick a natural voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      /Samantha|Google US English|Microsoft Aria|Zira|Karen|Moira/i.test(v.name)
    ) || voices.find(v => v.lang.startsWith("en")) || voices[0];
    if (preferred) utter.voice = preferred;
    utter.rate   = 1.0;
    utter.pitch  = 1.05;
    utter.volume = 1;
    utter.onstart = () => { setSpeaking(true);  setSpeakingIdx(idx); };
    utter.onend   = () => { setSpeaking(false); setSpeakingIdx(null); };
    utter.onerror = () => { setSpeaking(false); setSpeakingIdx(null); };
    window.speechSynthesis.speak(utter);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setSpeakingIdx(null);
  };

  // ── STT: mic button ──────────────────────────────────────────────────────────
  const toggleMic = () => {
    if (listening) {
      recognRef.current?.stop();
      setListening(false);
      setTranscript("");
      return;
    }
    if (!SpeechRecognitionAPI) {
      alert("Your browser doesn't support voice input. Try Chrome or Edge.");
      return;
    }
    const recog = new SpeechRecognitionAPI();
    recog.lang = "en-US";
    recog.continuous = false;
    recog.interimResults = true;

    recog.onstart = () => setListening(true);

    recog.onresult = (e) => {
      const interim = Array.from(e.results)
        .map(r => r[0].transcript)
        .join("");
      setTranscript(interim);
      if (e.results[e.results.length - 1].isFinal) {
        setInput(interim);
        setTranscript("");
      }
    };

    recog.onend = () => {
      setListening(false);
      setTranscript("");
      // Auto-send if something was captured
      setTimeout(() => {
        setInput(prev => { if (prev.trim()) send(prev.trim()); return ""; });
      }, 200);
    };

    recog.onerror = () => { setListening(false); setTranscript(""); };
    recognRef.current = recog;
    recog.start();
  };

  // ── Send message ─────────────────────────────────────────────────────────────
  const send = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    stopSpeaking();
    setInput("");
    const withUser = [...messages, { role: "user", content: userMsg }];
    setMessages(withUser);
    setLoading(true);

    let reply = null;

    const slowTimer = setTimeout(() => setSlowLoad(true), 5000);
    try {
      const groqKey = import.meta.env.VITE_GROQ_API_KEY;
      if (groqKey) {
        const systemPrompt = `You are Roch-Bot, the smart AI assistant built into Rochell Reponte's portfolio website. Rochell is a Frontend Developer based in Cebu, Philippines, graduating BS Computer Science in 2026. She specializes in React & modern JavaScript. Her skills: HTML/CSS 95%, React 90%, JavaScript 88%, Tailwind 85%, Git 80%, Node.js 75%. Projects: E-Commerce Platform (React/Node/MongoDB), Task Manager App (React/Firebase/Tailwind), Portfolio Website (React/Vite), Weather Dashboard (JS/Chart.js). She is immediately available for opportunities. You can help with: questions about Rochell, coding (HTML, CSS, JS, React, Python, Git, SQL), math, text summarization, and web development. Be friendly and helpful. Use bold for key terms. Provide code examples when relevant.`;
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              ...withUser.filter(m => m.role === "user" || m.role === "assistant").slice(-20).map(m => ({ role: m.role, content: m.content })),
            ],
            max_tokens: 700,
            temperature: 0.7,
          }),
          signal: AbortSignal.timeout(30000),
        });
        const data = await res.json();
        if (data.choices?.[0]?.message?.content) reply = data.choices[0].message.content;
      }
    } catch { /* fall through */ }
    clearTimeout(slowTimer);
    setSlowLoad(false);

    if (!reply) reply = getReply(userMsg, withUser);

    const nextMessages = [...withUser, { role: "assistant", content: reply }];
    setMessages(nextMessages);
    setLoading(false);

    // Auto-speak if voice is on
    if (voiceOn) speak(reply, nextMessages.length - 1);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  // ── Styles ───────────────────────────────────────────────────────────────────
  const S = {
    btn:       { position:"fixed", bottom:28, right:28, zIndex:9999, width:60, height:60, borderRadius:"50%", boxShadow:"0 8px 32px rgba(26,26,46,0.25)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.4s cubic-bezier(.16,1,.3,1)" },
    window:    { position:"fixed", bottom:100, right:28, zIndex:9998, width:420, maxWidth:"calc(100vw - 40px)", height:610, maxHeight:"calc(100vh - 140px)", background:"#fafaf8", borderRadius:24, boxShadow:"0 24px 64px rgba(26,26,46,0.18), 0 0 0 1px rgba(26,26,46,0.06)", display:"flex", flexDirection:"column", overflow:"hidden", transition:"all 0.4s cubic-bezier(.16,1,.3,1)", transformOrigin:"bottom right" },
    header:    { background:"linear-gradient(135deg,#1a1a2e 0%,#2d2d4e 100%)", padding:"16px 20px", display:"flex", alignItems:"center", gap:14, flexShrink:0 },
    avatar:    { width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#3a3a6e,#5a5a9e)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, color:"#fafaf8", fontFamily:"'Playfair Display',serif", boxShadow:"0 0 0 2px rgba(250,250,248,0.15)", flexShrink:0 },
    messages:  { flex:1, overflowY:"auto", padding:"16px 16px 8px", display:"flex", flexDirection:"column", gap:12, scrollbarWidth:"thin", scrollbarColor:"#e0ddd4 transparent" },
    inputWrap: { padding:"10px 14px 14px", borderTop:"1px solid #f0efe9", display:"flex", gap:8, alignItems:"flex-end", background:"#fafaf8", flexShrink:0 },
  };

  return (
    <>
      {/* ── Floating toggle button ── */}
      <button onClick={() => setOpen(o => !o)}
        style={{ ...S.btn, background: open ? "#fafaf8" : "linear-gradient(135deg,#1a1a2e 0%,#3a3a5e 100%)", border: open ? "2px solid #1a1a2e" : "none", transform: open ? "scale(0.9)" : "scale(1)" }}
        title={open ? "Close Roch-Bot" : "Chat with Roch-Bot"}>
        {showDot && !open && <span style={{ position:"absolute", top:4, right:4, width:12, height:12, borderRadius:"50%", background:"#2d8a4e", border:"2px solid #fafaf8", animation:"rochbot-pulse 2s ease-in-out infinite" }} />}
        {open
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fafaf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
      </button>

      {/* ── Chat window ── */}
      <div style={{ ...S.window, opacity: open ? 1 : 0, pointerEvents: open ? "all" : "none", transform: open ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)" }}>

        {/* Header */}
        <div style={S.header}>
          <div style={S.avatar}>R</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ color:"#fafaf8", fontWeight:700, fontSize:15, fontFamily:"'Syne',sans-serif", letterSpacing:0.3 }}>Roch-Bot</div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2 }}>
              {speaking
                ? <span style={{ display:"flex", gap:2, alignItems:"center" }}>
                    {[0,1,2,3].map(i => <span key={i} style={{ width:3, height:8+i*3, borderRadius:2, background:"#2d8a4e", display:"inline-block", animation:`rochbot-wave 0.8s ease-in-out ${i*0.12}s infinite` }} />)}
                  </span>
                : <span style={{ width:7, height:7, borderRadius:"50%", background:"#2d8a4e", display:"inline-block", animation:"rochbot-pulse 2s ease-in-out infinite" }} />
              }
              <span style={{ color:"rgba(250,250,248,0.55)", fontSize:11, fontFamily:"'Syne',sans-serif" }}>
                {listening ? "🎤 Listening…" : speaking ? "🔊 Speaking…" : "Smart Assistant · Voice · Code · AI"}
              </span>
            </div>
          </div>

          {/* Voice toggle */}
          <button onClick={() => { setVoiceOn(v => !v); if (speaking) stopSpeaking(); }}
            title={voiceOn ? "Mute bot voice" : "Unmute bot voice"}
            style={{ background:"rgba(250,250,248,0.08)", border:"none", borderRadius:8, padding:"6px 8px", cursor:"pointer", color: voiceOn ? "#2d8a4e" : "rgba(250,250,248,0.4)", fontSize:16, transition:"all 0.2s", marginRight:2 }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(250,250,248,0.15)"}
            onMouseLeave={e => e.currentTarget.style.background="rgba(250,250,248,0.08)"}>
            {voiceOn ? "🔊" : "🔇"}
          </button>

          {/* Clear */}
          <button onClick={() => { setMessages([BOT_INTRO]); stopSpeaking(); }}
            style={{ background:"rgba(250,250,248,0.08)", border:"none", borderRadius:8, padding:"6px 8px", cursor:"pointer", color:"rgba(250,250,248,0.5)", fontSize:11, fontFamily:"'Syne',sans-serif", letterSpacing:0.5, transition:"all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(250,250,248,0.15)"}
            onMouseLeave={e => e.currentTarget.style.background="rgba(250,250,248,0.08)"}>
            Clear
          </button>
        </div>

        {/* Live mic transcript bar */}
        {listening && (
          <div style={{ background:"#fff3e0", borderBottom:"1px solid #ffe0b2", padding:"8px 16px", display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
            <span style={{ animation:"rochbot-pulse 1s ease-in-out infinite", width:8, height:8, borderRadius:"50%", background:"#e53935", display:"inline-block", flexShrink:0 }} />
            <span style={{ fontSize:12, color:"#bf360c", fontFamily:"'Syne',sans-serif", flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {transcript || "Listening… speak now"}
            </span>
          </div>
        )}

        {/* Messages */}
        <div style={S.messages}>
          {messages.map((msg, i) => {
            const isBot = msg.role === "assistant";
            const isThisSpeaking = speakingIdx === i;
            return (
              <div key={i} style={{ display:"flex", justifyContent: isBot ? "flex-start" : "flex-end", gap:8, alignItems:"flex-end", animation:"rochbot-fadein 0.3s ease" }}>
                {isBot && (
                  <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#1a1a2e,#3a3a5e)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fafaf8", fontFamily:"'Playfair Display',serif", flexShrink:0, marginBottom:2 }}>R</div>
                )}
                <div style={{ maxWidth:"78%", display:"flex", flexDirection:"column", gap:4, alignItems: isBot ? "flex-start" : "flex-end" }}>
                  <div style={{ padding:"11px 15px", borderRadius: isBot ? "18px 18px 18px 4px" : "18px 18px 4px 18px", background: isBot ? "#fff" : "#1a1a2e", color: isBot ? "#1a1a2e" : "#fafaf8", fontSize:13.5, lineHeight:1.7, fontFamily:"'Syne',sans-serif", boxShadow: isBot ? "0 2px 8px rgba(26,26,46,0.07)" : "0 2px 8px rgba(26,26,46,0.2)", border: isBot ? "1px solid #f0efe9" : "none", wordBreak:"break-word", whiteSpace:"pre-wrap" }}>
                    {formatMessage(msg.content)}
                  </div>
                  {/* Per-message speak/stop button for bot messages */}
                  {isBot && (
                    <button
                      onClick={() => isThisSpeaking ? stopSpeaking() : speak(msg.content, i)}
                      title={isThisSpeaking ? "Stop speaking" : "Read aloud"}
                      style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, opacity: isThisSpeaking ? 1 : 0.35, transition:"opacity 0.2s", padding:"0 2px" }}
                      onMouseEnter={e => e.currentTarget.style.opacity="1"}
                      onMouseLeave={e => e.currentTarget.style.opacity = isThisSpeaking ? "1" : "0.35"}>
                      {isThisSpeaking ? "⏹️" : "🔊"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display:"flex", alignItems:"flex-end", gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#1a1a2e,#3a3a5e)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fafaf8", fontFamily:"'Playfair Display',serif", flexShrink:0 }}>R</div>
              <div style={{ padding:"12px 16px", background:"#fff", borderRadius:"18px 18px 18px 4px", border:"1px solid #f0efe9", boxShadow:"0 2px 8px rgba(26,26,46,0.07)", display:"flex", flexDirection:"column", gap:6 }}>
                <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                  {[0,1,2].map(d => <span key={d} style={{ width:7, height:7, borderRadius:"50%", background:"#c8c4b8", display:"inline-block", animation:`rochbot-typing 1.2s ease-in-out ${d*0.2}s infinite` }} />)}
                </div>
                {slowLoad && <span style={{ fontSize:11, color:"#8a8a9e", fontFamily:"'Syne',sans-serif" }}>⏳ Waking up server, please wait…</span>}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div style={{ padding:"0 16px 8px", display:"flex", flexWrap:"wrap", gap:6 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)}
                style={{ background:"#f4f3ee", border:"1px solid #e8e6de", borderRadius:20, padding:"6px 14px", fontSize:11, fontWeight:600, color:"#5a5a6e", cursor:"pointer", fontFamily:"'Syne',sans-serif", letterSpacing:0.3, transition:"all 0.2s ease", whiteSpace:"nowrap" }}
                onMouseEnter={e => { e.currentTarget.style.background="#1a1a2e"; e.currentTarget.style.color="#fafaf8"; e.currentTarget.style.borderColor="#1a1a2e"; }}
                onMouseLeave={e => { e.currentTarget.style.background="#f4f3ee"; e.currentTarget.style.color="#5a5a6e"; e.currentTarget.style.borderColor="#e8e6de"; }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div style={S.inputWrap}>
          {/* Mic button */}
          <button onClick={toggleMic} title={listening ? "Stop listening" : "Speak your question"}
            style={{ width:42, height:42, borderRadius:"50%", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.3s cubic-bezier(.16,1,.3,1)", background: listening ? "linear-gradient(135deg,#e53935,#c62828)" : "#f4f3ee", boxShadow: listening ? "0 0 0 6px rgba(229,57,53,0.2)" : "none", animation: listening ? "rochbot-mic-ring 1.2s ease-in-out infinite" : "none" }}>
            {listening
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#fafaf8"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a5a6e" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            }
          </button>

          {/* Text input */}
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} rows={1}
            placeholder={listening ? "Listening… or type here" : "Ask anything or press 🎤 to speak…"}
            style={{ flex:1, padding:"11px 14px", background:"#fff", border:"1.5px solid #e8e6de", borderRadius:14, color:"#1a1a2e", fontSize:13, fontFamily:"'Syne',sans-serif", resize:"none", outline:"none", lineHeight:1.5, maxHeight:100, overflowY:"auto", transition:"border-color 0.2s ease, box-shadow 0.2s ease", scrollbarWidth:"none" }}
            onFocus={e => { e.target.style.borderColor="#1a1a2e"; e.target.style.boxShadow="0 0 0 3px rgba(26,26,46,0.06)"; }}
            onBlur={e => { e.target.style.borderColor="#e8e6de"; e.target.style.boxShadow="none"; }}
          />

          {/* Send button */}
          <button onClick={() => send()} disabled={!input.trim() || loading}
            style={{ width:42, height:42, borderRadius:"50%", background: input.trim() && !loading ? "linear-gradient(135deg,#1a1a2e,#3a3a5e)" : "#e8e6de", border:"none", cursor: input.trim() && !loading ? "pointer" : "default", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.3s cubic-bezier(.16,1,.3,1)", transform: input.trim() && !loading ? "scale(1)" : "scale(0.9)", boxShadow: input.trim() && !loading ? "0 4px 12px rgba(26,26,46,0.2)" : "none" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !loading ? "#fafaf8" : "#b8b4a8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes rochbot-pulse    { 0%,100%{box-shadow:0 0 0 0 rgba(45,138,78,0.5)} 50%{box-shadow:0 0 0 6px rgba(45,138,78,0)} }
        @keyframes rochbot-typing   { 0%,100%{transform:translateY(0);opacity:0.4}     50%{transform:translateY(-5px);opacity:1} }
        @keyframes rochbot-fadein   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rochbot-wave     { 0%,100%{transform:scaleY(0.4)} 50%{transform:scaleY(1.4)} }
        @keyframes rochbot-mic-ring { 0%,100%{box-shadow:0 0 0 4px rgba(229,57,53,0.25)} 50%{box-shadow:0 0 0 10px rgba(229,57,53,0.08)} }
      `}</style>
    </>
  );
}
