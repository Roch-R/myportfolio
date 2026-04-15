import { useEffect, useRef } from "react";

/**
 * OrbitImages
 * Props:
 *  images      – array of icon URLs
 *  shape       – "ellipse" | "circle"
 *  radiusX     – horizontal orbit radius (px)
 *  radiusY     – vertical orbit radius (px)
 *  baseWidth   – width of the container the orbit sits inside (px)
 *  itemSize    – icon size (px)
 *  duration    – full-rotation duration (s)
 *  fill        – unused, kept for API compat
 *  responsive  – unused, kept for API compat
 *  rotation    – initial angle offset (deg)
 *  centerContent – React node rendered in the centre
 */
export default function OrbitImages({
  images = [],
  // eslint-disable-next-line no-unused-vars
  shape,
  radiusX = 160,
  radiusY = 190,
  // eslint-disable-next-line no-unused-vars
  baseWidth,
  itemSize = 40,
  duration = 28,
  rotation = 0,
  // eslint-disable-next-line no-unused-vars
  fill,
  // eslint-disable-next-line no-unused-vars
  responsive,
  centerContent = null,
}) {
  const angleRef = useRef((rotation * Math.PI) / 180);
  const rafRef = useRef(null);
  const lastRef = useRef(null);
  const itemRefs = useRef([]);

  const count = images.length;
  const hw = itemSize / 2;
  const boxW = radiusX * 2 + itemSize + 16;
  const boxH = radiusY * 2 + itemSize + 16;
  const cx = boxW / 2;
  const cy = boxH / 2;

  /* ── animation loop — no React state, direct DOM updates ── */
  useEffect(() => {
    const speed = (2 * Math.PI) / (duration * 60); // radians per frame @60fps

    const tick = (ts) => {
      if (lastRef.current !== null) {
        const dt = Math.min(ts - lastRef.current, 50);
        angleRef.current += speed * (dt / (1000 / 60));
      }
      lastRef.current = ts;

      const angle = angleRef.current;
      const n = itemRefs.current.length;
      for (let i = 0; i < n; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        const theta = angle + (i / count) * 2 * Math.PI;
        el.style.left = (cx + radiusX * Math.cos(theta) - hw) + "px";
        el.style.top  = (cy + radiusY * Math.sin(theta) - hw) + "px";
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration, count, cx, cy, radiusX, radiusY, hw]);

  return (
    <div
      style={{
        position: "relative",
        width: boxW,
        height: boxH,
        overflow: "visible",
      }}
    >
      {/* ── orbit track (purely decorative dashed ellipse) ── */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          overflow: "visible",
          zIndex: 0,
        }}
        viewBox={`0 0 ${boxW} ${boxH}`}
      >
        <ellipse
          cx={cx}
          cy={cy}
          rx={radiusX}
          ry={radiusY}
          fill="none"
          stroke="rgba(26,26,46,0.08)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
      </svg>

      {/* ── center content ── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2,
          overflow: "visible",
        }}
      >
        {centerContent}
      </div>

      {/* ── orbiting icon chips — initial positions set by first RAF tick ── */}
      {images.map((src, i) => (
        <div
          key={i}
          ref={el => { itemRefs.current[i] = el; }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: itemSize,
            height: itemSize,
            willChange: "left, top",
            zIndex: 3,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 4px 16px rgba(26,26,46,0.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid rgba(26,26,46,0.06)",
            transition: "box-shadow 0.2s ease",
            cursor: "default",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,26,46,0.22)";
            e.currentTarget.style.transform = "scale(1.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,26,46,0.14)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <img
            src={src}
            alt=""
            loading="lazy"
            style={{
              width: itemSize * 0.58,
              height: itemSize * 0.58,
              objectFit: "contain",
              display: "block",
            }}
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}
