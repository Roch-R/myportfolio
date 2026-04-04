import { useState, useEffect, useRef, useMemo } from "react";
import profileImage from "./assets/download-removebg-preview.png";
import OrbitImages from "./OrbitImages";
import ParticleBackground from "./praticalbackground";
import ElectricBorder from "./ElectricBorder";
import ScrambledText from "./ScrambledText";
import RochBot from "./rochbot";

// ── Backend API URL ──
const API = import.meta.env.VITE_API_URL;

const NAV_LINKS = ["Home", "About", "Skills", "Projects", "Contact"];

const SKILLS = [
  { name: "React", level: 90, category: "Frontend", icon: "⚛" },
  { name: "JavaScript", level: 88, category: "Language", icon: "◆" },
  { name: "HTML / CSS", level: 95, category: "Frontend", icon: "✦" },
  { name: "Node.js", level: 75, category: "Backend", icon: "▲" },
  { name: "Tailwind CSS", level: 85, category: "Frontend", icon: "◇" },
  { name: "Git & GitHub", level: 80, category: "Tools", icon: "⬡" },
];

const ORBIT_LOGOS = [
  { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" },
  { name: "HTML5",      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" },
  { name: "CSS3",       icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" },
  { name: "React",      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" },
  { name: "Node.js",    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" },
  { name: "Tailwind",   icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" },
  { name: "Git",        icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg" },
  { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" },
];

const PROJECTS = [
  {
    title: "E-Commerce Platform", num: "01", color: "#e8c4a0",
    tags: ["React", "Node.js", "MongoDB"],
    desc: "Full-stack online store with cart management, secure checkout flow, and integrated payment processing.",
    longDesc: "A complete e-commerce solution built from the ground up. Features a dynamic product catalogue, persistent shopping cart, user authentication, and a secure multi-step checkout with payment gateway integration. The backend REST API handles inventory, orders, and user management.",
    features: ["Product catalogue with search & filter", "Shopping cart with local persistence", "Secure checkout & payment processing", "User authentication & order history", "Admin dashboard for inventory", "Responsive mobile-first design"],
    year: "2025", github: "#", live: "#",
  },
  {
    title: "Task Manager App", num: "02", color: "#a0c4e8",
    tags: ["React", "Firebase", "Tailwind"],
    desc: "Productivity application featuring drag-and-drop task boards with real-time synchronization.",
    longDesc: "A Kanban-style productivity app inspired by Trello. Tasks can be created, assigned priorities, and dragged between columns in real-time. Firebase Firestore syncs changes instantly across all open sessions. Tailwind CSS ensures a clean, fast UI.",
    features: ["Drag-and-drop Kanban board", "Real-time sync via Firebase", "Task priorities & due dates", "Multi-user collaboration", "Progress tracking & analytics", "Dark mode support"],
    year: "2024", github: "#", live: "#",
  },
  {
    title: "Portfolio Website", num: "03", color: "#c4e8a0",
    tags: ["React", "CSS", "Vite"],
    desc: "Modern, responsive portfolio with performance-optimized animations and accessible design.",
    longDesc: "This very portfolio — designed and built from scratch with a focus on performance, accessibility, and visual refinement. Features scroll-driven animations, an AI-powered chatbot (Roch-Bot), OTP-verified contact form, and a 3D orbit hero section.",
    features: ["Scroll-driven reveal animations", "AI chatbot with voice (Roch-Bot)", "OTP-verified contact form", "3D orbit hero with tech logos", "Particle background system", "Fully responsive & accessible"],
    year: "2026", github: "#", live: "#",
  },
  {
    title: "Weather Dashboard", num: "04", color: "#e8a0c4",
    tags: ["JavaScript", "API", "Chart.js"],
    desc: "Real-time meteorological data visualization with interactive charts and 7-day forecasts.",
    longDesc: "A weather visualization app that fetches live data from a public meteorological API. Displays current conditions, hourly trends, and a 7-day forecast with interactive Chart.js graphs. Location search supports any city worldwide.",
    features: ["Real-time weather data via API", "7-day forecast display", "Interactive Chart.js graphs", "Hourly temperature trends", "City search & geolocation", "Wind, humidity & UV index"],
    year: "2024", github: "#", live: "#",
  },
];

const EXPERIENCE = [
  { year: "2026", title: "BS Computer Science", place: "University Graduate" },
  { year: "2025", title: "Frontend Developer Intern", place: "Tech Company" },
  { year: "2024", title: "Freelance Web Developer", place: "Self-Employed" },
];

/* ─── useInView ─── */
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, delay = 0, className = "", type = "fade-up" }) {
  const [ref, visible] = useInView(0.1);
  const base = { transition: `opacity 0.8s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.8s cubic-bezier(.16,1,.3,1) ${delay}s` };
  const styles = {
    "fade-up":    { opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(40px)" },
    "fade-left":  { opacity: visible ? 1 : 0, transform: visible ? "none" : "translateX(-40px)" },
    "fade-right": { opacity: visible ? 1 : 0, transform: visible ? "none" : "translateX(40px)" },
    zoom:         { opacity: visible ? 1 : 0, transform: visible ? "none" : "scale(0.85)" },
    blur:         { opacity: visible ? 1 : 0, filter: visible ? "none" : "blur(12px)", transform: visible ? "none" : "translateY(20px)" },
    flip:         { opacity: visible ? 1 : 0, transform: visible ? "none" : "perspective(800px) rotateX(30deg) translateY(40px)" },
  };
  return (
    <div ref={ref} className={className} style={{ ...base, ...(styles[type] || styles["fade-up"]) }}>
      {children}
    </div>
  );
}

function AnimatedNumber({ value, suffix = "" }) {
  const [ref, visible] = useInView(0.3);
  const [count, setCount] = useState(0);
  const numVal = parseInt(value) || 0;
  useEffect(() => {
    if (!visible) { setTimeout(() => setCount(0), 0); return; }
    const dur = 1200, t0 = Date.now(); let id;
    const tick = () => {
      const p = Math.min((Date.now() - t0) / dur, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * numVal));
      if (p < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [visible, numVal]);
  return <span ref={ref}>{count}{suffix}</span>;
}

function TypeWriter({ texts, speed = 80, pause = 2000 }) {
  const [ti, setTi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const cur = texts[ti];
    const id = setTimeout(() => {
      if (!del) {
        if (ci < cur.length) setCi(ci + 1);
        else setTimeout(() => setDel(true), pause);
      } else {
        if (ci > 0) setCi(ci - 1);
        else { setDel(false); setTi((ti + 1) % texts.length); }
      }
    }, del ? speed / 2 : speed);
    return () => clearTimeout(id);
  }, [ci, del, ti, texts, speed, pause]);
  return <span>{texts[ti].substring(0, ci)}<span className="tw-cursor">|</span></span>;
}

function SparkleParticles() {
  const [sparks] = useState(() => Array.from({ length: 18 }, (_, i) => ({
    id: i, left: Math.random() * 100, top: Math.random() * 100,
    size: 1.5 + Math.random() * 3, delay: Math.random() * 5, dur: 3 + Math.random() * 4,
  })));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {sparks.map(sp => (
        <div key={sp.id} className="sparkle" style={{ position: "absolute", left: `${sp.left}%`, top: `${sp.top}%`, width: sp.size, height: sp.size, borderRadius: "50%", background: "rgba(26,26,46,0.25)", animationDelay: `${sp.delay}s`, animationDuration: `${sp.dur}s` }} />
      ))}
    </div>
  );
}

function TiltCard({ children, maxTilt = 7 }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hov, setHov] = useState(false);
  const onMove = e => {
    const r = ref.current.getBoundingClientRect();
    setTilt({ x: -((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * maxTilt, y: ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * maxTilt });
  };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseEnter={() => setHov(true)} onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setHov(false); }}
      style={{ transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hov ? 1.03 : 1})`, transition: hov ? "transform 0.1s ease" : "transform 0.7s cubic-bezier(.16,1,.3,1)", display: "inline-block", cursor: "pointer" }}>
      {children}
    </div>
  );
}

function GrainOverlay() {
  return <div className="grain-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 9998, opacity: 0.3 }} />;
}

function FloatingShapes() {
  const shapes = useMemo(() => [
    { size: 120, left: 5, top: 20, type: "circle" }, { size: 80, left: 85, top: 15, type: "square" },
    { size: 60, left: 70, top: 70, type: "circle" }, { size: 100, left: 15, top: 75, type: "triangle" },
    { size: 40, left: 50, top: 40, type: "diamond" },
  ], []);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {shapes.map((shape, i) => (
        <div key={i} className="floating-shape" style={{ position: "absolute", width: shape.size, height: shape.size, left: `${shape.left}%`, top: `${shape.top}%`, border: shape.type === "circle" ? "1px solid rgba(26,26,46,0.06)" : "none", borderRadius: shape.type === "circle" ? "50%" : shape.type === "diamond" ? 0 : 4, background: shape.type === "square" ? "rgba(26,26,46,0.02)" : shape.type === "diamond" ? "rgba(26,26,46,0.03)" : "transparent", transform: shape.type === "diamond" ? "rotate(45deg)" : "none", animationDuration: `${18 + i * 4}s`, animationDelay: `${i * 1.5}s` }} />
      ))}
    </div>
  );
}

function SkillCard({ skill, index }) {
  const [ref, visible] = useInView(0.15);
  const [hov, setHov] = useState(false);
  return (
    <div ref={ref} className="skill-card" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: "28px 24px", background: hov ? "#1a1a2e" : "#fff", border: "1px solid #e8e6de", borderRadius: 12, cursor: "default", transition: "all 0.4s cubic-bezier(.16,1,.3,1)", transform: visible ? (hov ? "translateY(-8px) scale(1.02)" : "none") : "translateY(30px)", opacity: visible ? 1 : 0, transitionDelay: `${index * 0.06}s`, boxShadow: hov ? "0 20px 40px rgba(26,26,46,0.15)" : "0 2px 8px rgba(26,26,46,0.04)", position: "relative", overflow: "hidden" }}>
      <div className={!hov && visible ? "skill-bar-fill" : ""} style={{ position: "absolute", bottom: 0, left: 0, height: 3, width: visible ? `${skill.level}%` : "0%", background: hov ? "linear-gradient(90deg,#fafaf8,rgba(250,250,248,0.4))" : "linear-gradient(90deg,#1a1a2e 25%,#5a5a6e 50%,#1a1a2e 75%)", backgroundSize: "200% 100%", transition: "width 1.2s cubic-bezier(.16,1,.3,1),background 0.4s ease", transitionDelay: `${0.3 + index * 0.1}s`, borderRadius: "0 2px 0 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <span style={{ fontSize: 28, transition: "transform 0.4s ease", transform: hov ? "scale(1.2) rotate(10deg)" : "none", display: "inline-block" }}>{skill.icon}</span>
        <span style={{ fontSize: 28, fontFamily: "'Playfair Display',serif", fontWeight: 700, color: hov ? "#fafaf8" : "#1a1a2e", transition: "color 0.4s ease" }}>{skill.level}%</span>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: hov ? "#fafaf8" : "#1a1a2e", marginBottom: 4, transition: "color 0.4s ease", fontFamily: "'Syne',sans-serif" }}>{skill.name}</h3>
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: hov ? "rgba(250,250,248,0.5)" : "#8a8a9e", transition: "color 0.4s ease" }}>{skill.category}</span>
    </div>
  );
}

function ProjectCard({ project, index, onOpen }) {
  const [ref, visible] = useInView(0.1);
  const [hov, setHov] = useState(false);
  return (
    <div ref={ref} className="project-card"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => onOpen(project)}
      style={{ position: "relative", padding: "36px 32px", background: hov ? "#1a1a2e" : "#fff", border: "1px solid #e8e6de", borderRadius: 16, cursor: "pointer", transition: "all 0.5s cubic-bezier(.16,1,.3,1)", transform: visible ? (hov ? "translateY(-6px)" : "none") : "translateY(50px)", opacity: visible ? 1 : 0, transitionDelay: `${index * 0.1}s`, boxShadow: hov ? "0 24px 48px rgba(26,26,46,0.15)" : "0 2px 8px rgba(26,26,46,0.03)", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: hov ? 4 : 0, background: project.color, transition: "height 0.4s cubic-bezier(.16,1,.3,1)" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 42, fontWeight: 700, color: hov ? "rgba(250,250,248,0.1)" : "rgba(26,26,46,0.06)", lineHeight: 1, transition: "color 0.4s ease" }}>{project.num}</span>
        <span style={{ fontSize: 22, transform: hov ? "translate(4px,-4px)" : "none", opacity: hov ? 1 : 0.3, transition: "all 0.4s cubic-bezier(.16,1,.3,1)", color: hov ? "#fafaf8" : "#1a1a2e" }}>↗</span>
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 600, color: hov ? "#fafaf8" : "#1a1a2e", marginBottom: 10, fontFamily: "'Playfair Display',serif", transition: "color 0.4s ease" }}>{project.title}</h3>
      <p style={{ fontSize: 14, color: hov ? "rgba(250,250,248,0.6)" : "#8a8a9e", lineHeight: 1.7, marginBottom: 20, transition: "color 0.4s ease" }}>{project.desc}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {project.tags.map(t => <span key={t} style={{ padding: "5px 14px", background: hov ? "rgba(250,250,248,0.1)" : "#f4f3ee", borderRadius: 20, fontSize: 11, fontWeight: 500, color: hov ? "rgba(250,250,248,0.7)" : "#5a5a6e", letterSpacing: 0.5, transition: "all 0.4s ease" }}>{t}</span>)}
      </div>
      <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6, opacity: hov ? 1 : 0, transition: "opacity 0.3s ease" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(250,250,248,0.5)", fontFamily: "'Syne',sans-serif" }}>View Project</span>
        <span style={{ color: "rgba(250,250,248,0.5)", fontSize: 14 }}>→</span>
      </div>
    </div>
  );
}

function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  if (!project) return null;
  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(26,26,46,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "modal-backdrop 0.3s ease" }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "#fafaf8", borderRadius: 24, width: "100%", maxWidth: 680, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 40px 80px rgba(26,26,46,0.3)", animation: "modal-slide 0.35s cubic-bezier(.16,1,.3,1)", scrollbarWidth: "thin" }}>
        <div style={{ height: 6, background: project.color, borderRadius: "24px 24px 0 0" }} />
        <div style={{ padding: "36px 40px 40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 52, fontWeight: 700, color: "rgba(26,26,46,0.06)", lineHeight: 1, display: "block", marginBottom: -8 }}>{project.num}</span>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>{project.title}</h2>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#8a8a9e", fontFamily: "'Syne',sans-serif" }}>{project.year}</span>
            </div>
            <button onClick={onClose}
              style={{ width: 40, height: 40, borderRadius: "50%", border: "1.5px solid #e8e6de", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s ease" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1a1a2e"; e.currentTarget.style.borderColor = "#1a1a2e"; e.currentTarget.querySelector("svg").style.stroke = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e8e6de"; e.currentTarget.querySelector("svg").style.stroke = "currentColor"; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <p style={{ fontSize: 15, color: "#5a5a6e", lineHeight: 1.8, marginBottom: 28, fontFamily: "'Syne',sans-serif" }}>{project.longDesc}</p>
          <div style={{ marginBottom: 28 }}>
            <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#8a8a9e", fontFamily: "'Syne',sans-serif", marginBottom: 14 }}>Key Features</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
              {project.features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: project.color, flexShrink: 0, marginTop: 7, filter: "brightness(0.8)" }} />
                  <span style={{ fontSize: 13, color: "#1a1a2e", fontFamily: "'Syne',sans-serif", lineHeight: 1.6 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 32 }}>
            <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#8a8a9e", fontFamily: "'Syne',sans-serif", marginBottom: 12 }}>Tech Stack</h4>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {project.tags.map(t => (
                <span key={t} style={{ padding: "7px 18px", background: "#f4f3ee", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "#1a1a2e", letterSpacing: 0.5, fontFamily: "'Syne',sans-serif" }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href={project.github} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", background: "#1a1a2e", color: "#fafaf8", borderRadius: 12, fontSize: 13, fontWeight: 600, fontFamily: "'Syne',sans-serif", textDecoration: "none", transition: "all 0.3s ease", letterSpacing: 0.3 }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              View on GitHub
            </a>
            <a href={project.live} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", background: "#fff", color: "#1a1a2e", border: "1.5px solid #e8e6de", borderRadius: 12, fontSize: 13, fontWeight: 600, fontFamily: "'Syne',sans-serif", textDecoration: "none", transition: "all 0.3s ease", letterSpacing: 0.3 }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f4f3ee"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "none"; }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              Live Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function SplitText({ children, delay = 0, style = {}, className = "" }) {
  const [ref, visible] = useInView(0.15);
  const text = typeof children === "string" ? children : "";
  return (
    <span ref={ref} className={className} style={{ display: "inline-block", ...style }}>
      {text.split("").map((char, i) => (
        <span key={i} style={{ display: "inline-block", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: `opacity 0.5s cubic-bezier(.16,1,.3,1) ${delay + i * 0.03}s, transform 0.5s cubic-bezier(.16,1,.3,1) ${delay + i * 0.03}s` }}>{char === " " ? "\u00A0" : char}</span>
      ))}
    </span>
  );
}

function RippleButton({ children, className = "", style = {}, onClick, ...props }) {
  const ref = useRef(null);
  const handle = e => {
    const btn = ref.current; if (!btn) return;
    const r = btn.getBoundingClientRect(), sz = Math.max(r.width, r.height) * 2;
    const rpl = document.createElement("span");
    rpl.style.cssText = `position:absolute;width:${sz}px;height:${sz}px;left:${e.clientX - r.left - sz / 2}px;top:${e.clientY - r.top - sz / 2}px;border-radius:50%;background:rgba(255,255,255,0.3);transform:scale(0);animation:ripple-anim 0.6s linear;pointer-events:none;`;
    btn.appendChild(rpl);
    rpl.addEventListener("animationend", () => rpl.remove());
    onClick?.(e);
  };
  return <button ref={ref} className={className} style={{ position: "relative", overflow: "hidden", ...style }} onClick={handle} {...props}>{children}</button>;
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [sending, setSending] = useState(false);

  const [activeProject, setActiveProject] = useState(null);

  const orbitColRef = useRef(null);
  const [colW, setColW] = useState(460);

  useEffect(() => {
    const el = orbitColRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.floor(entry.contentRect.width);
      if (w > 0) setColW(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const oRx   = Math.round(colW * 0.36);
  const oRy   = Math.round(colW * 0.43);
  const oItem = Math.min(44, Math.max(22, Math.round(colW * 0.088)));
  const oCardW = Math.min(220, Math.max(110, Math.round(colW * 0.46)));
  const oCardH = Math.min(280, Math.max(140, Math.round(colW * 0.58)));

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 50);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? window.scrollY / total : 0);
    };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map(n => document.getElementById(n));
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }), { threshold: 0.3 });
    sections.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const goTo = id => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };

  // ── STEP 1: Send OTP via backend (FREE - no EmailJS) ──
  const handleSendOtp = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      setOtpError("Please fill all fields first.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setOtpError("Please enter a valid email address.");
      return;
    }

    setSending(true);
    setOtpError("");

    try {
      const res = await fetch(`${API}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.message || "Failed to send OTP. Please try again.");
      } else {
        setOtpSent(true);
        setOtpError("");
      }
    } catch {
      setOtpError("Network error. Make sure the backend is running.");
    }

    setSending(false);
  };

  // ── STEP 2: Verify OTP via backend (FREE - no EmailJS) ──
  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.length !== 6) {
      setOtpError("Please enter the 6-digit code.");
      return;
    }

    setSending(true);
    setOtpError("");

    try {
      const res = await fetch(`${API}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: otpInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.message || "Invalid OTP. Please try again.");
      } else {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setOtpSent(false);
          setOtpInput("");
          setOtpError("");
          setFormData({ name: "", email: "", message: "" });
        }, 3000);
      }
    } catch {
      setOtpError("Network error. Make sure the backend is running.");
    }

    setSending(false);
  };

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=Syne:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{margin:0;background:#fafaf8;color:#1a1a2e;overflow-x:hidden}
        a{color:inherit;text-decoration:none}
        ::selection{background:#1a1a2e;color:#fafaf8}
        .scroll-progress{position:fixed;top:0;left:0;height:2px;z-index:200;background:linear-gradient(90deg,#1a1a2e,#5a5a6e,#1a1a2e);transition:width .1s linear}
        .grain-overlay{background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E");background-repeat:repeat;background-size:128px 128px}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .tw-cursor{animation:blink .8s infinite;color:#1a1a2e;font-weight:300;margin-left:2px}
        .nav-item{position:relative}
        .nav-item::after{content:'';position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);width:0;height:2px;background:#1a1a2e;transition:width .3s cubic-bezier(.16,1,.3,1);border-radius:1px}
        .nav-item:hover::after,.nav-item.active::after{width:100%}
        @keyframes float-shape{0%,100%{transform:translateY(0) rotate(0deg)}33%{transform:translateY(-20px) rotate(5deg)}66%{transform:translateY(-10px) rotate(-3deg)}}
        .floating-shape{animation:float-shape 20s ease-in-out infinite}
        .btn-magnetic{position:relative;overflow:hidden;transition:all .4s cubic-bezier(.16,1,.3,1)}
        @keyframes ripple-anim{to{transform:scale(1);opacity:0}}
        .btn-magnetic:hover:not(:disabled){transform:translateY(-3px) scale(1.02);box-shadow:0 12px 32px rgba(26,26,46,.2)}
        .btn-magnetic::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.15),transparent);opacity:0;transition:opacity .4s ease}
        .btn-magnetic:hover::before{opacity:1}
        .btn-outline-cool{transition:all .4s cubic-bezier(.16,1,.3,1);position:relative}
        .btn-outline-cool::before{content:'';position:absolute;inset:0;background:#1a1a2e;transform:scaleX(0);transform-origin:right;transition:transform .4s cubic-bezier(.16,1,.3,1);border-radius:inherit;z-index:-1}
        .btn-outline-cool:hover::before{transform:scaleX(1);transform-origin:left}
        .btn-outline-cool:hover{color:#fafaf8 !important;border-color:#1a1a2e;transform:translateY(-3px)}
        .skill-card{position:relative}
        .timeline-item-row{transition:all .4s cubic-bezier(.16,1,.3,1)}
        .timeline-item-row:hover{padding-left:12px}
        .timeline-item-row:hover .tl-dot{transform:scale(2);background:#1a1a2e;box-shadow:0 0 0 4px rgba(26,26,46,.1)}
        .tl-dot{transition:all .4s cubic-bezier(.16,1,.3,1)}
        .contact-detail-card{transition:all .4s cubic-bezier(.16,1,.3,1)}
        .contact-detail-card:hover{transform:translateX(8px);border-left-color:#1a1a2e !important}
        .social-link{transition:all .4s cubic-bezier(.16,1,.3,1)}
        .social-link:hover{background:#1a1a2e !important;color:#fafaf8 !important;border-color:#1a1a2e !important;transform:translateY(-4px) scale(1.05);box-shadow:0 8px 20px rgba(26,26,46,.15)}
        input:focus,textarea:focus{outline:none;border-color:#1a1a2e !important;box-shadow:0 0 0 4px rgba(26,26,46,.06);transform:translateY(-1px)}
        .form-input{transition:all .3s cubic-bezier(.16,1,.3,1)}
        .footer-link{transition:all .3s ease}
        .footer-link:hover{color:#1a1a2e;transform:translateY(-2px);display:inline-block}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-25%)}}
        .marquee-track{animation:marquee 30s linear infinite;will-change:transform}
        .marquee-track:hover{animation-play-state:paused}
        @keyframes sparkle-float{0%,100%{transform:translateY(0) scale(1);opacity:.2}50%{transform:translateY(-28px) scale(1.8);opacity:.7}}
        .sparkle{animation:sparkle-float var(--dur,4s) ease-in-out infinite}
        @keyframes gradient-shift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        .gradient-heading{background:linear-gradient(135deg,#1a1a2e 0%,#5a5a6e 30%,#3a3a5e 60%,#1a1a2e 100%);background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gradient-shift 5s ease infinite}
        @keyframes shimmer-bar{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .skill-bar-fill{background:linear-gradient(90deg,#1a1a2e 25%,#5a5a6e 50%,#1a1a2e 75%) !important;background-size:200% 100% !important;animation:shimmer-bar 2.5s ease-in-out infinite}
        @keyframes badge-pulse{0%,100%{box-shadow:0 0 0 0 rgba(45,138,78,.5)}50%{box-shadow:0 0 0 7px rgba(45,138,78,0)}}
        .badge-dot-pulse{animation:badge-pulse 2s ease-in-out infinite}
        @keyframes num-glow{0%,100%{text-shadow:none;opacity:.4}50%{text-shadow:0 0 20px rgba(26,26,46,.15);opacity:.7}}
        .section-num-anim{animation:num-glow 3s ease-in-out infinite}
        .project-card::after{content:'';position:absolute;top:-50%;left:-60%;width:40%;height:200%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);transform:skewX(-20deg);transition:left .6s cubic-bezier(.16,1,.3,1);pointer-events:none}
        .project-card:hover::after{left:120%}
        @keyframes float-badge{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        .hero-badge-wrap{animation:float-badge 3s ease-in-out infinite}
        @keyframes profile-float{0%,100%{transform:translateY(0px) rotate(-1deg)}50%{transform:translateY(-12px) rotate(1deg)}}
        @keyframes profile-glow{0%,100%{box-shadow:0 20px 60px rgba(26,26,46,.18),0 0 40px rgba(79,110,247,.15)}50%{box-shadow:0 30px 80px rgba(26,26,46,.25),0 0 60px rgba(79,110,247,.3)}}
        .profile-card{animation:profile-float 5s ease-in-out infinite,profile-glow 5s ease-in-out infinite;cursor:pointer}
        .profile-card:hover{animation:profile-glow 2s ease-in-out infinite;transform:scale(1.04) !important}
        @keyframes line-draw{from{width:0}to{width:60px}}
        .about-accent-line{animation:line-draw 1.2s cubic-bezier(.16,1,.3,1) .4s both}
        .otp-input{letter-spacing:8px;font-size:22px;text-align:center;font-weight:700;}
        .hero-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:60px;align-items:center;overflow:visible}
        .orbit-col{overflow:visible;display:flex;justify-content:center;align-items:center}
        .orbit-col > *,.orbit-col > * > *,.orbit-col > * > * > *,.orbit-col > * > * > * > *{overflow:visible !important}
        @media(max-width:1100px){.hero-grid{grid-template-columns:1fr 1fr !important;gap:32px !important}}
        @media(max-width:768px){
          .desktop-nav{display:none !important}.hamburger{display:flex !important}
          .hero-grid{grid-template-columns:1fr 1fr !important;gap:12px !important}
          .hero-section-mobile{padding:80px 12px 40px !important}
          .hero-eyebrow{font-size:9px !important;letter-spacing:1px !important;margin-bottom:10px !important}
          .hero-title{font-size:clamp(18px,4.8vw,30px) !important;margin-bottom:12px !important}
          .hero-sub{font-size:11px !important;line-height:1.6 !important;margin-bottom:18px !important;max-width:100% !important}
          .hero-badge{padding:5px 10px !important;margin-bottom:12px !important}
          .hero-badge span:last-child{font-size:8px !important}
          .hero-btns-wrap{gap:6px !important;flex-wrap:wrap !important}
          .btn-hero{padding:9px 14px !important;font-size:10px !important}
          .hero-metrics{gap:10px !important;margin-top:16px !important;padding-top:12px !important;flex-wrap:wrap !important}
          .metric-val{font-size:20px !important}.metric-label{font-size:7px !important;margin-top:3px !important}
          .about-grid{grid-template-columns:1fr !important;gap:36px !important}
          .contact-grid{grid-template-columns:1fr !important;gap:36px !important}
          .skills-grid{grid-template-columns:1fr 1fr !important}
          .projects-grid{grid-template-columns:1fr !important}
          .form-row{grid-template-columns:1fr !important}
          .about-details-grid{grid-template-columns:1fr 1fr !important}
          .social-links-row{flex-wrap:wrap !important}
          .section-about-pt{padding-top:80px !important}
        }
        @media(max-width:480px){
          .skills-grid{grid-template-columns:1fr !important}
          .about-details-grid{grid-template-columns:1fr !important}
          .projects-grid{grid-template-columns:1fr !important}
          .hero-grid{grid-template-columns:1fr 1fr !important;gap:8px !important}
          .hero-section-mobile{padding:70px 10px 30px !important}
        }
      `}</style>

      <ParticleBackground />
      <GrainOverlay />
      <div className="scroll-progress" style={{ width: `${scrollProgress * 100}%` }} />

      {/* ═══ NAV ═══ */}
      <nav style={{ ...s.nav, background: scrolled ? "rgba(250,250,248,.85)" : "transparent", backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none", borderBottom: scrolled ? "1px solid rgba(26,26,46,.06)" : "1px solid transparent" }}>
        <div style={s.navInner}>
          <div onClick={() => goTo("Home")} style={s.logo}><span style={s.logoMain}>R</span><span style={s.logoDot}>.</span></div>
          <div className="desktop-nav" style={s.navLinks}>
            {NAV_LINKS.map(link => (
              <span key={link} className={`nav-item ${activeSection === link ? "active" : ""}`} onClick={() => goTo(link)} style={{ ...s.navLink, color: activeSection === link ? "#1a1a2e" : "#8a8a9e" }}>{link}</span>
            ))}
            <button className="btn-magnetic" style={s.resumeBtn} onClick={() => goTo("Contact")}>Let's Talk</button>
          </div>
          <div className="hamburger" style={s.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
            <div style={{ ...s.hamLine, transform: menuOpen ? "rotate(45deg) translate(4px,4px)" : "none" }} />
            <div style={{ ...s.hamLine, opacity: menuOpen ? 0 : 1, width: menuOpen ? 22 : 16 }} />
            <div style={{ ...s.hamLine, transform: menuOpen ? "rotate(-45deg) translate(4px,-4px)" : "none" }} />
          </div>
        </div>
        {menuOpen && (
          <div style={s.mobileMenu}>
            {NAV_LINKS.map(link => <span key={link} onClick={() => goTo(link)} style={s.mobileLink}>{link}</span>)}
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section id="Home" className="hero-section-mobile" style={s.hero}>
        <FloatingShapes />
        <SparkleParticles />
        <div style={s.heroContainer}>
          <div className="hero-grid">
            <div style={{ minWidth: 0 }}>
              <Reveal type="blur">
                <div className="hero-badge-wrap" style={{ display: "inline-block" }}>
                  <div className="hero-badge" style={s.heroBadge}>
                    <span className="badge-dot-pulse" style={s.badgeDot} />
                    <span style={{ letterSpacing: 2, textTransform: "uppercase", fontSize: 10, fontWeight: 700 }}>Available for opportunities</span>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.1} type="fade-up">
                <p className="hero-eyebrow" style={s.heroEyebrow}>Frontend Developer — Cebu, PH</p>
              </Reveal>
              <Reveal delay={0.2} type="fade-up">
                <h1 className="hero-title" style={s.heroTitle}>
                  I build digital{" "}
                  <span style={s.heroTitleAccent}><TypeWriter texts={["experiences", "interfaces", "solutions", "products"]} speed={90} pause={2500} /></span>
                  {" "}that drive real results.
                </h1>
              </Reveal>
              <Reveal delay={0.35} type="blur">
                <p className="hero-sub" style={s.heroSub}>
                  Specializing in React & modern JavaScript — I craft performant, accessible,
                  and visually refined web applications that users love.
                </p>
              </Reveal>
              <Reveal delay={0.45} type="fade-up">
                <div className="hero-btns-wrap" style={s.heroBtns}>
                  <RippleButton className="btn-magnetic btn-hero" style={s.btnDark} onClick={() => goTo("Projects")}>
                    <span>View My Work</span><span style={{ marginLeft: 6 }}>→</span>
                  </RippleButton>
                  <RippleButton className="btn-outline-cool btn-hero" style={s.btnLight} onClick={() => goTo("Contact")}>Get In Touch</RippleButton>
                </div>
              </Reveal>
              <Reveal delay={0.55} type="fade-up">
                <div className="hero-metrics" style={s.heroMetrics}>
                  {[[4,"+","Projects"],[6,"+","Skills"],[2026,"","Grad Year"]].map(([val,suf,lbl]) => (
                    <div key={lbl} style={s.metric}>
                      <span className="metric-val" style={s.metricVal}><AnimatedNumber value={val} suffix={suf} /></span>
                      <span className="metric-label" style={s.metricLabel}>{lbl}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
            <div className="orbit-col" ref={orbitColRef}>
              {colW > 0 && (
                <TiltCard maxTilt={6}>
                  <OrbitImages
                    images={ORBIT_LOGOS.map(l => l.icon)}
                    shape="ellipse" radiusX={oRx} radiusY={oRy}
                    baseWidth={colW} itemSize={oItem} duration={28}
                    fill={true} responsive={true} rotation={0}
                    centerContent={
                      <div style={{ display: "inline-block" }}>
                        <ElectricBorder color="#7df9ff" speed={0.6} chaos={0.03} borderRadius={20} style={{ display: "inline-block" }}>
                          <div className="profile-card"
                            style={{ position: "relative", width: oCardW, height: oCardH, borderRadius: 20, overflow: "hidden", background: "linear-gradient(160deg,#1a1a2e 0%,#2d2d4e 50%,#1a1a2e 100%)" }}>
                            <img src={profileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }} />
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(255,255,255,.10) 0%,transparent 50%)", pointerEvents: "none" }} />
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(to top,rgba(26,26,46,.7),transparent)", pointerEvents: "none" }} />
                            <div style={{ position: "absolute", bottom: 10, left: 12, right: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div>
                                <p style={{ color: "#fff", fontSize: Math.max(9, oCardW * 0.055), fontWeight: 700, fontFamily: "'Syne',sans-serif", margin: 0 }}>Rochell Reponte</p>
                                <p style={{ color: "rgba(255,255,255,.55)", fontSize: Math.max(8, oCardW * 0.044), margin: "2px 0 0" }}>Cebu, PH</p>
                              </div>
                              <div style={{ width: Math.max(20, oCardW * 0.13), height: Math.max(20, oCardW * 0.13), borderRadius: "50%", background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.max(9, oCardW * 0.055) }}>✦</div>
                            </div>
                          </div>
                        </ElectricBorder>
                      </div>
                    }
                  />
                </TiltCard>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      {(() => {
        const TECH = [
          { name: "React",      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" },
          { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" },
          { name: "HTML5",      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" },
          { name: "CSS3",       icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" },
          { name: "Node.js",    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" },
          { name: "Tailwind",   icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" },
          { name: "Vite",       icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg" },
          { name: "Firebase",   icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg" },
          { name: "Git",        icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg" },
          { name: "GitHub",     icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg" },
        ];
        return (
          <div style={s.marqueeWrap}>
            <div className="marquee-track" style={s.marqueeTrack}>
              {[...Array(4)].map((_, ri) => (
                <span key={ri} style={{ display: "inline-flex", alignItems: "center" }}>
                  {TECH.map((tech, i) => (
                    <span key={`${ri}-${i}`} style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "0 28px", cursor: "default" }}>
                      <img src={tech.icon} alt={tech.name} style={{ width: 36, height: 36, objectFit: "contain", transition: "transform .3s ease,filter .3s ease", filter: "grayscale(20%)" }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.25)"; e.currentTarget.style.filter = "grayscale(0%) drop-shadow(0 4px 8px rgba(0,0,0,.15))"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.filter = "grayscale(20%)"; }}
                      />
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#b8b4a8", fontFamily: "'Syne',sans-serif" }}>{tech.name}</span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ═══ ABOUT ═══ */}
      <section id="About" className="section-about-pt" style={{ ...s.section, paddingTop: 120 }}>
        <div style={s.container}>
          <Reveal type="fade-left"><div style={s.sectionHeader}><span className="section-num-anim" style={s.sectionNum}>01</span><span style={s.sectionDash} /><span style={s.sectionLabel}>About Me</span></div></Reveal>
          <div className="about-grid" style={s.aboutGrid}>
            <Reveal delay={0.1} type="fade-left">
              <div>
                <h2 style={s.aboutTitle}>Committed to crafting<br /><span style={s.italic}>exceptional</span> digital<br />solutions</h2>
                <div className="about-accent-line" style={s.aboutAccentLine} />
              </div>
            </Reveal>
            <Reveal delay={0.2} type="fade-right">
              <div>
                <ScrambledText radius={120} duration={1.2} speed={0.5} scrambleChars=".:" style={s.aboutP}>
                  I am a dedicated frontend developer and recent Computer Science graduate based in the Philippines. My approach combines technical precision with a keen eye for design, ensuring every project meets the highest standards of quality and user experience.
                </ScrambledText>
                <ScrambledText radius={120} duration={1.2} speed={0.5} scrambleChars=".:" style={{ ...s.aboutP, marginTop: 20 }}>
                  I bring strong problem-solving skills, attention to detail, and a collaborative mindset to every team I work with.
                </ScrambledText>
                <div className="about-details-grid" style={s.aboutDetails}>
                  {[["Location","Cebu, Philippines"],["Education","BS Computer Science"],["Focus","Frontend Development"],["Status","Immediate Availability"]].map(([k,v],i) => (
                    <Reveal key={k} delay={0.3 + i * 0.06} type="fade-up">
                      <div style={s.aboutDetail}><span style={s.detailKey}>{k}</span><span style={s.detailVal}>{v}</span></div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.1} type="fade-up">
            <div style={s.timeline}>
              <h3 style={s.timelineTitle}>Background</h3>
              <div style={s.timelineLine}>
                {EXPERIENCE.map((item, i) => (
                  <Reveal key={i} delay={i * 0.12} type="fade-left">
                    <div className="timeline-item-row" style={s.timelineItem}>
                      <span style={s.timelineYear}>{item.year}</span>
                      <div className="tl-dot" style={s.timelineDot} />
                      <div><span style={s.timelineRole}>{item.title}</span><span style={s.timelinePlace}>{item.place}</span></div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ SKILLS ═══ */}
      <section id="Skills" style={{ ...s.section, background: "#f4f3ee" }}>
        <div style={s.container}>
          <Reveal type="fade-left"><div style={s.sectionHeader}><span className="section-num-anim" style={s.sectionNum}>02</span><span style={s.sectionDash} /><span style={s.sectionLabel}>Technical Proficiency</span></div></Reveal>
          <Reveal delay={0.1} type="blur"><h2 className="gradient-heading" style={s.skillsTitle}><SplitText delay={0.1}>Core Competencies</SplitText></h2></Reveal>
          <div className="skills-grid" style={s.skillsGrid}>
            {SKILLS.map((skill, i) => <SkillCard key={skill.name} skill={skill} index={i} />)}
          </div>
        </div>
      </section>

      {/* ═══ PROJECTS ═══ */}
      <section id="Projects" style={s.section}>
        <div style={s.container}>
          <Reveal type="fade-left"><div style={s.sectionHeader}><span className="section-num-anim" style={s.sectionNum}>03</span><span style={s.sectionDash} /><span style={s.sectionLabel}>Selected Work</span></div></Reveal>
          <Reveal delay={0.1} type="blur"><h2 className="gradient-heading" style={s.projectsHeading}><SplitText delay={0.1}>Featured Projects</SplitText></h2></Reveal>
          <div className="projects-grid" style={s.projectsGrid}>
            {PROJECTS.map((p, i) => <ProjectCard key={p.title} project={p} index={i} onOpen={setActiveProject} />)}
          </div>
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section id="Contact" style={{ ...s.section, background: "#f4f3ee", paddingBottom: 80 }}>
        <div style={s.container}>
          <Reveal type="fade-left"><div style={s.sectionHeader}><span className="section-num-anim" style={s.sectionNum}>04</span><span style={s.sectionDash} /><span style={s.sectionLabel}>Contact</span></div></Reveal>
          <Reveal delay={0.1} type="blur"><h2 style={s.contactHeading}>Let's discuss how I can<br /><span style={s.italic}>contribute</span> to your team</h2></Reveal>
          <div className="contact-grid" style={s.contactGrid}>
            <Reveal delay={0.15} type="fade-left">
              <div>
                <p style={s.contactIntro}>I'm actively seeking opportunities where I can apply my skills and grow as a developer. I'd love to hear from you.</p>
                <div style={{ marginTop: 36 }}>
                  {[["Email","your.email@example.com"],["Location","Cebu, Philippines"],["Phone","+63 XXX XXX XXXX"]].map(([lbl,val],i) => (
                    <Reveal key={lbl} delay={0.2 + i * 0.08} type="fade-up">
                      <div className="contact-detail-card" style={s.contactCard}><span style={s.contactCardLabel}>{lbl}</span><span style={s.contactCardVal}>{val}</span></div>
                    </Reveal>
                  ))}
                </div>
                <div className="social-links-row" style={s.socialLinks}>
                  {["GitHub","LinkedIn","Twitter"].map((name,i) => (
                    <Reveal key={name} delay={0.35 + i * 0.08} type="zoom"><a href="#" className="social-link" style={s.socialBtn}>{name}</a></Reveal>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.25} type="fade-right">
              <div style={s.formCard}>
                <h3 style={s.formTitle}>Send a Message</h3>
                <p style={s.formSubtitle}>I typically respond within 24 hours.</p>

                {submitted ? (
                  <div style={s.successMsg}>
                    <div style={s.successIcon}>✓</div>
                    <p style={{ marginTop: 16, color: "#1a1a2e", fontWeight: 600, fontSize: 16 }}>Message sent!</p>
                    <p style={{ marginTop: 4, color: "#8a8a9e", fontSize: 13 }}>I'll get back to you soon.</p>
                  </div>
                ) : (
                  <div>
                    <div className="form-row" style={s.formRow}>
                      <div style={s.inputGroup}>
                        <label style={s.label}>Full Name</label>
                        <input className="form-input" type="text" value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          style={{ ...s.input, opacity: otpSent ? 0.6 : 1 }}
                          placeholder="John Doe" disabled={otpSent} />
                      </div>
                      <div style={s.inputGroup}>
                        <label style={s.label}>Email Address</label>
                        <input className="form-input" type="email" value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          style={{ ...s.input, opacity: otpSent ? 0.6 : 1 }}
                          placeholder="john@company.com" disabled={otpSent} />
                      </div>
                    </div>
                    <div style={{ ...s.inputGroup, marginTop: 4 }}>
                      <label style={s.label}>Message</label>
                      <textarea className="form-input" rows={4} value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                        style={{ ...s.input, resize: "vertical", fontFamily: "'Syne',sans-serif", opacity: otpSent ? 0.6 : 1 }}
                        placeholder="Tell me about the opportunity..." disabled={otpSent} />
                    </div>

                    {otpSent && (
                      <div style={{ ...s.inputGroup, marginTop: 8 }}>
                        <label style={s.label}>
                          Enter the 6-digit code sent to <strong>{formData.email}</strong>
                        </label>
                        <input className="form-input otp-input" type="text" inputMode="numeric"
                          maxLength={6} value={otpInput}
                          onChange={e => setOtpInput(e.target.value.replace(/\D/g, ""))}
                          style={{ ...s.input, letterSpacing: 12, fontSize: 22, textAlign: "center", fontWeight: 700 }}
                          placeholder="· · · · · ·" autoFocus />
                        <button onClick={() => { setOtpSent(false); setOtpInput(""); setOtpError(""); }}
                          style={{ background: "none", border: "none", color: "#8a8a9e", fontSize: 12, cursor: "pointer", marginTop: 6, textDecoration: "underline", fontFamily: "'Syne',sans-serif" }}>
                          ← Change details
                        </button>
                      </div>
                    )}

                    {otpError && (
                      <p style={{ color: "#e74c3c", fontSize: 13, marginBottom: 8, marginTop: 4 }}>{otpError}</p>
                    )}

                    {!otpSent ? (
                      <button className="btn-magnetic"
                        style={{ ...s.btnDark, width: "100%", marginTop: 12, padding: "16px 32px", opacity: sending ? 0.6 : 1 }}
                        onClick={handleSendOtp} disabled={sending}>
                        {sending ? "Sending code..." : "Send Verification Code →"}
                      </button>
                    ) : (
                      <button className="btn-magnetic"
                        style={{ ...s.btnDark, width: "100%", marginTop: 12, padding: "16px 32px", opacity: sending ? 0.6 : 1 }}
                        onClick={handleVerifyOtp} disabled={sending}>
                        {sending ? "Verifying..." : "Verify & Send Message →"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={s.footerLogo}>R<span style={{ color: "#8a8a9e" }}>.</span></span>
          <p style={s.footerCopy}>© 2026 · Crafted with precision & caffeine</p>
          <div style={{ display: "flex", gap: 20 }}>
            {["GitHub","LinkedIn","Twitter"].map(name => <a key={name} href="#" className="footer-link" style={s.footerA}>{name}</a>)}
          </div>
        </div>
      </footer>

      <RochBot />

      {activeProject && <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />}

      <style>{`
        @keyframes modal-backdrop { from{opacity:0} to{opacity:1} }
        @keyframes modal-slide { from{opacity:0;transform:translateY(30px) scale(0.97)} to{opacity:1;transform:none} }
        @media(max-width:600px){ .modal-features-grid{grid-template-columns:1fr !important} }
      `}</style>
    </div>
  );
}

/* ═══════════ STYLES ═══════════ */
const s = {
  root: { minHeight: "100vh", background: "#fafaf8", color: "#1a1a2e", fontFamily: "'Syne',sans-serif" },
  nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, transition: "all .5s cubic-bezier(.16,1,.3,1)", padding: "0 clamp(16px,4vw,48px)" },
  navInner: { maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 76 },
  logo: { cursor: "pointer", display: "flex", alignItems: "baseline" },
  logoMain: { fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 800, color: "#1a1a2e", letterSpacing: -1 },
  logoDot: { fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 800, color: "#c8c4b8", marginLeft: 1 },
  navLinks: { display: "flex", alignItems: "center", gap: 36 },
  navLink: { cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", transition: "color .3s ease" },
  resumeBtn: { marginLeft: 20, padding: "12px 28px", background: "#1a1a2e", color: "#fafaf8", border: "none", borderRadius: 100, fontSize: 12, fontWeight: 600, letterSpacing: 0.5, cursor: "pointer", fontFamily: "'Syne',sans-serif" },
  hamburger: { display: "none", flexDirection: "column", gap: 5, cursor: "pointer" },
  hamLine: { height: 1.5, background: "#1a1a2e", transition: "all .3s ease", width: 22 },
  mobileMenu: { padding: "16px clamp(16px,4vw,48px) 32px", display: "flex", flexDirection: "column", gap: 16, background: "rgba(250,250,248,.98)", backdropFilter: "blur(20px)" },
  mobileLink: { fontSize: 14, color: "#5a5a6e", cursor: "pointer", padding: "8px 0", fontWeight: 500 },
  hero: { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "120px clamp(16px,4vw,48px) 80px", position: "relative" },
  heroContainer: { maxWidth: 1280, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 20px", background: "rgba(26,26,46,.04)", borderRadius: 100, marginBottom: 28, border: "1px solid rgba(26,26,46,.06)" },
  badgeDot: { width: 8, height: 8, borderRadius: "50%", background: "#2d8a4e", boxShadow: "0 0 0 3px rgba(45,138,78,.2)", flexShrink: 0 },
  heroEyebrow: { fontSize: 13, fontWeight: 600, color: "#8a8a9e", letterSpacing: 3, textTransform: "uppercase", marginBottom: 20 },
  heroTitle: { fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4.5vw,56px)", fontWeight: 700, lineHeight: 1.2, color: "#1a1a2e", letterSpacing: -1, marginBottom: 28 },
  heroTitleAccent: { fontStyle: "italic", fontWeight: 400, color: "#5a5a6e" },
  heroSub: { fontSize: 16, lineHeight: 1.9, color: "#6a6a7e", maxWidth: 500, marginBottom: 40, fontWeight: 400 },
  heroBtns: { display: "flex", gap: 16, flexWrap: "wrap" },
  btnDark: { padding: "15px 36px", background: "#1a1a2e", color: "#fafaf8", border: "none", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: 0.5, fontFamily: "'Syne',sans-serif", display: "inline-flex", alignItems: "center" },
  btnLight: { padding: "15px 36px", background: "transparent", color: "#1a1a2e", border: "1.5px solid #d0cdc4", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: 0.5, fontFamily: "'Syne',sans-serif", position: "relative", zIndex: 0, overflow: "hidden" },
  heroMetrics: { display: "flex", gap: 48, marginTop: 56, paddingTop: 36, borderTop: "1px solid #e0ddd4" },
  metric: { display: "flex", flexDirection: "column" },
  metricVal: { fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 700, color: "#1a1a2e" },
  metricLabel: { fontSize: 10, color: "#8a8a9e", letterSpacing: 2, textTransform: "uppercase", marginTop: 6, fontWeight: 600 },
  marqueeWrap: { overflow: "hidden", padding: "20px 0", borderTop: "1px solid #e8e6de", borderBottom: "1px solid #e8e6de", background: "#fafaf8" },
  marqueeTrack: { display: "inline-flex", whiteSpace: "nowrap" },
  section: { padding: "100px clamp(16px,4vw,48px)", position: "relative" },
  container: { maxWidth: 1280, margin: "0 auto" },
  sectionHeader: { display: "flex", alignItems: "center", gap: 16, marginBottom: 48 },
  sectionNum: { fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 700, color: "#c8c4b8" },
  sectionDash: { width: 48, height: 1, background: "linear-gradient(90deg,#d0cdc4,transparent)" },
  sectionLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#8a8a9e" },
  aboutGrid: { display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 72, marginBottom: 72 },
  aboutTitle: { fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 700, lineHeight: 1.2, color: "#1a1a2e", letterSpacing: -0.5 },
  italic: { fontStyle: "italic", fontWeight: 400 },
  aboutAccentLine: { width: 48, height: 3, background: "#1a1a2e", borderRadius: 2, marginTop: 24 },
  aboutP: { fontSize: 15, lineHeight: 1.9, color: "#6a6a7e" },
  aboutDetails: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 36, paddingTop: 28, borderTop: "1px solid #e0ddd4" },
  aboutDetail: { display: "flex", flexDirection: "column", gap: 6 },
  detailKey: { fontSize: 10, color: "#8a8a9e", letterSpacing: 2.5, textTransform: "uppercase", fontWeight: 700 },
  detailVal: { fontSize: 14, color: "#1a1a2e", fontWeight: 600 },
  timeline: { paddingTop: 32 },
  timelineTitle: { fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 32, color: "#1a1a2e" },
  timelineLine: { borderLeft: "2px solid #e8e6de", paddingLeft: 0, marginLeft: 24 },
  timelineItem: { display: "flex", alignItems: "center", gap: 20, padding: "18px 0 18px 24px", borderBottom: "1px solid #f0efe9", cursor: "default", marginLeft: -2 },
  timelineYear: { fontSize: 13, fontWeight: 700, color: "#c8c4b8", minWidth: 50, letterSpacing: 1, fontFamily: "'Playfair Display',serif" },
  timelineDot: { width: 10, height: 10, borderRadius: "50%", background: "#d8d4c8", flexShrink: 0, border: "2px solid #fafaf8" },
  timelineRole: { fontSize: 15, fontWeight: 600, color: "#1a1a2e", display: "block" },
  timelinePlace: { fontSize: 13, color: "#8a8a9e", display: "block", marginTop: 3 },
  skillsTitle: { fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 700, color: "#1a1a2e", marginBottom: 44, letterSpacing: -0.5 },
  skillsGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 },
  projectsHeading: { fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 700, color: "#1a1a2e", marginBottom: 44, letterSpacing: -0.5 },
  projectsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  contactHeading: { fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 700, color: "#1a1a2e", marginBottom: 48, letterSpacing: -0.5 },
  contactGrid: { display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 72 },
  contactIntro: { fontSize: 15, lineHeight: 1.9, color: "#6a6a7e" },
  contactCard: { padding: "18px 0 18px 16px", borderLeft: "2px solid #e0ddd4", display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 },
  contactCardLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "#8a8a9e" },
  contactCardVal: { fontSize: 15, color: "#1a1a2e", fontWeight: 600 },
  socialLinks: { display: "flex", gap: 12, marginTop: 36 },
  socialBtn: { padding: "10px 20px", border: "1.5px solid #d8d4c8", borderRadius: 100, fontSize: 12, fontWeight: 600, color: "#5a5a6e", display: "inline-block" },
  formCard: { background: "#fff", border: "1px solid #e8e6de", borderRadius: 20, padding: 40, boxShadow: "0 4px 24px rgba(26,26,46,.04)" },
  formTitle: { fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 },
  formSubtitle: { fontSize: 13, color: "#8a8a9e", marginBottom: 28 },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  inputGroup: { marginBottom: 20 },
  label: { display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#8a8a9e", marginBottom: 8 },
  input: { width: "100%", padding: "14px 16px", background: "#fafaf8", border: "1.5px solid #e8e6de", borderRadius: 10, color: "#1a1a2e", fontSize: 14, fontFamily: "'Syne',sans-serif" },
  successMsg: { textAlign: "center", padding: "48px 16px" },
  successIcon: { width: 56, height: 56, borderRadius: "50%", background: "#1a1a2e", color: "#fafaf8", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700 },
  footer: { borderTop: "1px solid #e0ddd4", padding: "36px clamp(16px,4vw,48px)", background: "#fafaf8" },
  footerInner: { maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 },
  footerLogo: { fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 800, color: "#1a1a2e" },
  footerCopy: { fontSize: 12, color: "#8a8a9e" },
  footerA: { fontSize: 12, color: "#8a8a9e", display: "inline-block" },
};