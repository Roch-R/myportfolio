import { useEffect, useRef } from "react";

const COLORS = [
  "#1e1b4b", "#312e81", "#4338ca", "#6366f1",
  "#0f172a", "#334155", "#0ea5e9", "#14b8a6",
  "#7c3aed", "#a855f7", "#ec4899", "#f43f5e",
];

class Particle {
  constructor(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.baseX = this.x;
    this.baseY = this.y;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = Math.random() * 3.5 + 1;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = Math.random() * 0.35 + 0.1;
    this.shape = Math.floor(Math.random() * 5);
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.025;
    this.depth = Math.random() * 0.6 + 0.4;
    this.pulse = Math.random() * Math.PI * 2;
  }

  update(w, h, mx, my) {
    this.pulse += 0.012;
    this.rotation += this.rotSpeed;

    const dx = mx - this.x;
    const dy = my - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 200) {
      const force = (200 - dist) / 200;
      const angle = Math.atan2(dy, dx);
      this.vx -= Math.cos(angle) * force * 1.5;
      this.vy -= Math.sin(angle) * force * 1.5;
    }

    this.vx *= 0.965;
    this.vy *= 0.965;
    this.x += this.vx + Math.sin(this.pulse) * 0.2 * this.depth;
    this.y += this.vy + Math.cos(this.pulse * 0.7) * 0.2 * this.depth;
    this.vx += (this.baseX - this.x) * 0.002;
    this.vy += (this.baseY - this.y) * 0.002;

    if (this.x < -30) this.x = w + 30;
    if (this.x > w + 30) this.x = -30;
    if (this.y < -30) this.y = h + 30;
    if (this.y > h + 30) this.y = -30;
  }

  draw(ctx) {
    const s = this.size * (1 + Math.sin(this.pulse) * 0.25);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 0.8;

    switch (this.shape) {
      case 0:
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 1:
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
          if (i === 0) ctx.moveTo(Math.cos(a) * s * 1.6, Math.sin(a) * s * 1.6);
          else ctx.lineTo(Math.cos(a) * s * 1.6, Math.sin(a) * s * 1.6);
        }
        ctx.closePath();
        ctx.fill();
        break;
      case 2:
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.5);
        ctx.lineTo(s * 1.3, 0);
        ctx.lineTo(0, s * 1.5);
        ctx.lineTo(-s * 1.3, 0);
        ctx.closePath();
        ctx.stroke();
        break;
      case 3:
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          if (i === 0) ctx.moveTo(Math.cos(a) * s * 1.4, Math.sin(a) * s * 1.4);
          else ctx.lineTo(Math.cos(a) * s * 1.4, Math.sin(a) * s * 1.4);
        }
        ctx.closePath();
        ctx.stroke();
        break;
      case 4:
        ctx.strokeRect(-s, -s, s * 2, s * 2);
        break;
      default:
        break;
    }
    ctx.restore();
  }
}

export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  // Cache dimensions to avoid reading window on every frame
  const dimsRef = useRef({ w: 0, h: 0 });
  // Throttle mouse updates to ~30fps
  const lastMouseUpdateRef = useRef(0);
  // Skip connection drawing every other frame
  const frameCountRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      dimsRef.current = { w, h };
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      resize();
      const { w, h } = dimsRef.current;
      // Reduced max from 140 → 70 particles
      const count = Math.min(70, Math.floor((w * h) / 7000));
      particlesRef.current = [];
      for (let i = 0; i < count; i++) {
        particlesRef.current.push(new Particle(w, h));
      }
    }

    function drawConnections(particles, mx, my, w, h) {
      // Reduced connection distance from 130 → 100 to cut pair checks
      const maxDist = 100;
      const maxDistSq = maxDist * maxDist;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / maxDist) * 0.08;
            ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        if (mx > -999) {
          const dxM = mx - particles[i].x;
          const dyM = my - particles[i].y;
          const distMSq = dxM * dxM + dyM * dyM;
          if (distMSq < 220 * 220) {
            const distM = Math.sqrt(distMSq);
            const alpha = (1 - distM / 220) * 0.25;
            ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mx, my);
            ctx.stroke();
          }
        }
      }
      // suppress unused param warnings (w, h kept for signature clarity)
      void w; void h;
    }

    function animate() {
      const { w, h } = dimsRef.current;
      const t = Date.now() * 0.0003;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      frameCountRef.current++;

      ctx.clearRect(0, 0, w, h);

      // Ambient gradient blobs — only redraw every 2 frames
      if (frameCountRef.current % 2 === 0) {
        const g1 = ctx.createRadialGradient(
          w * 0.25 + Math.sin(t) * 100, h * 0.35 + Math.cos(t * 0.7) * 80,
          0, w * 0.25, h * 0.35, w * 0.45
        );
        g1.addColorStop(0, "rgba(99,102,241,0.045)");
        g1.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g1;
        ctx.fillRect(0, 0, w, h);

        const g2 = ctx.createRadialGradient(
          w * 0.75 + Math.cos(t * 0.5) * 70, h * 0.65 + Math.sin(t * 0.9) * 60,
          0, w * 0.75, h * 0.65, w * 0.4
        );
        g2.addColorStop(0, "rgba(236,72,153,0.03)");
        g2.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, w, h);

        const g3 = ctx.createRadialGradient(
          w * 0.5 + Math.sin(t * 0.3) * 90, h * 0.2 + Math.cos(t * 0.6) * 50,
          0, w * 0.5, h * 0.2, w * 0.35
        );
        g3.addColorStop(0, "rgba(14,165,233,0.03)");
        g3.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g3;
        ctx.fillRect(0, 0, w, h);
      }

      // Cursor glow
      if (mx > -999) {
        const gm = ctx.createRadialGradient(mx, my, 0, mx, my, 220);
        gm.addColorStop(0, "rgba(99,102,241,0.07)");
        gm.addColorStop(0.4, "rgba(168,85,247,0.035)");
        gm.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = gm;
        ctx.fillRect(0, 0, w, h);
      }

      // Draw connections every other frame to halve the O(n²) cost
      if (frameCountRef.current % 2 === 0) {
        drawConnections(particlesRef.current, mx, my, w, h);
      }

      particlesRef.current.forEach((p) => {
        p.update(w, h, mx, my);
        p.draw(ctx);
      });

      rafRef.current = requestAnimationFrame(animate);
    }

    function handleMouseMove(e) {
      const now = performance.now();
      // Throttle to ~30fps (33ms) to reduce update overhead
      if (now - lastMouseUpdateRef.current < 33) return;
      lastMouseUpdateRef.current = now;
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    function handleMouseLeave() {
      mouseRef.current = { x: -9999, y: -9999 };
    }

    function handleResize() {
      cancelAnimationFrame(rafRef.current);
      init();
      animate();
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize, { passive: true });

    init();
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
