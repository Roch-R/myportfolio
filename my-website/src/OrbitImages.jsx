import { useEffect, useRef, useState } from "react";

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
  const [angle, setAngle] = useState((rotation * Math.PI) / 180);
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  /* ── animation loop ── */
  useEffect(() => {
    const speed = (2 * Math.PI) / (duration * 60); // radians per frame @60fps
    const tick = (ts) => {
      if (lastRef.current !== null) {
        const dt = Math.min(ts - lastRef.current, 50); // cap big gaps
        setAngle((a) => a + speed * (dt / (1000 / 60)));
      }
      lastRef.current = ts;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration]);

  const count = images.length;
  const hw = itemSize / 2; // half-width of each icon chip
  /* The wrapper needs to be tall enough so orbit tops/bottoms aren't clipped.
     We give it exactly (2*radiusY + itemSize + 16) height and (2*radiusX + itemSize + 16) width.
     Center-card sits in the middle of that box. */
  const boxW = radiusX * 2 + itemSize + 16;
  const boxH = radiusY * 2 + itemSize + 16;
  const cx = boxW / 2;
  const cy = boxH / 2;

  return (
    <div
      style={{
        position: "relative",
        width: boxW,
        height: boxH,
        /* IMPORTANT: no overflow:hidden — orbit items go outside the card */
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

      {/* ── orbiting icon chips ── */}
      {images.map((src, i) => {
        const theta = angle + (i / count) * 2 * Math.PI;
        const x = cx + radiusX * Math.cos(theta) - hw;
        const y = cy + radiusY * Math.sin(theta) - hw;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: itemSize,
              height: itemSize,
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
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(26,26,46,0.22)";
              e.currentTarget.style.transform = "scale(1.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(26,26,46,0.14)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <img
              src={src}
              alt=""
              style={{
                width: itemSize * 0.58,
                height: itemSize * 0.58,
                objectFit: "contain",
                display: "block",
              }}
              draggable={false}
            />
          </div>
        );
      })}
    </div>
  );
}