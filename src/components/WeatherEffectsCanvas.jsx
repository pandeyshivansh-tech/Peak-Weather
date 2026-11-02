import { useEffect, useRef, useState } from "react";

// What drifts through the air in front of the view. Rain is the glass shader's
// job; this draws the rest: snow, fog banks, blown sand, cherry blossom and
// the flash of lightning. `effect` is one of snow | fog | sand | petals | none.

const PETAL_TONES = ["#ffc2d4", "#ffd6e3", "#ffe7ef", "#f7a9c2"];

function make(effect, w, h) {
  const scale = Math.min(1, w / 1200) * 0.5 + 0.5;
  const count = Math.round({ snow: 90, fog: 22, sand: 150, petals: 46 }[effect] * scale);
  return Array.from({ length: count }, () => {
    const base = { x: Math.random() * w, y: Math.random() * h, phase: Math.random() * Math.PI * 2 };
    if (effect === "snow") {
      const r = Math.random() * 3 + 1;
      return { ...base, r, vy: 0.5 + r * 0.45, a: 0.35 + Math.random() * 0.6 };
    }
    if (effect === "fog") {
      return { ...base, r: 120 + Math.random() * 180, vx: (Math.random() - 0.3) * 0.25, a: 0.06 + Math.random() * 0.09 };
    }
    if (effect === "sand") {
      return { ...base, len: 24 + Math.random() * 70, vx: 11 + Math.random() * 16, vy: 0.4 + Math.random() * 1.2, a: 0.18 + Math.random() * 0.4, lw: 1 + Math.random() * 1.6 };
    }
    return {
      ...base,
      r: 7 + Math.random() * 7,
      vy: 0.7 + Math.random() * 1.1,
      vx: 0.5 + Math.random() * 0.9,
      spin: (Math.random() - 0.5) * 0.05,
      tone: PETAL_TONES[Math.floor(Math.random() * PETAL_TONES.length)],
      a: 0.7 + Math.random() * 0.3,
    };
  });
}

export default function WeatherEffectsCanvas({ effect = "none", thunder = false }) {
  const ref = useRef(null);
  const active = effect !== "none" || thunder;
  // When the weather clears the air fades out instead of vanishing, so the
  // last effect is kept mounted for the length of the fade.
  const [held, setHeld] = useState({ effect, thunder });
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (active) {
      setHeld({ effect, thunder });
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const id = setTimeout(() => setHeld({ effect: "none", thunder: false }), 1000);
    return () => clearTimeout(id);
  }, [active, effect, thunder]);

  const kind = active ? effect : held.effect;
  const storm = active ? thunder : held.thunder;
  const live = kind !== "none" || storm;

  useEffect(() => {
    if (!live) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let raf = 0;
    let wind = 0; // the pointer pushes the air a little
    let lastX = w / 2;
    let flash = 0;
    let t = 0;
    let prev = 0;
    let parts = make(kind, w, h);

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      parts = make(kind, w, h);
    };
    const onMove = (e) => {
      wind = (e.clientX - lastX) * 0.12;
      lastX = e.clientX;
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove, { passive: true });

    const frame = (now) => {
      // Motion is tuned per 60Hz frame; k rescales it so a 120Hz screen
      // moves at the same speed instead of twice as fast.
      const k = Math.min((now - (prev || now - 16.67)) / 16.67, 3);
      prev = now;
      t += k;
      ctx.clearRect(0, 0, w, h);

      if (storm) {
        if (Math.random() < 0.007 * k && flash <= 0) flash = 0.2 + Math.random() * 0.3;
        if (flash > 0) {
          ctx.fillStyle = `rgba(224, 231, 255, ${flash})`;
          ctx.fillRect(0, 0, w, h);
          flash -= 0.03 * k;
        }
      }

      // Sand arrives in gusts: a haze that swells and thins.
      if (kind === "sand") {
        const gust = 0.5 + 0.5 * Math.sin(t / 140);
        ctx.fillStyle = `rgba(206, 150, 82, ${0.1 + gust * 0.14})`;
        ctx.fillRect(0, 0, w, h);
        ctx.lineCap = "round";
      }

      for (const p of parts) {
        p.phase += 0.02 * k;
        if (kind === "snow") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, 7);
          ctx.fillStyle = `rgba(255,255,255,${p.a})`;
          ctx.fill();
          p.y += p.vy * k;
          p.x += (Math.sin(p.phase) * 0.9 + wind * 0.05) * k;
          if (p.y > h + 4) {
            p.y = -4;
            p.x = Math.random() * w;
          }
        } else if (kind === "fog") {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          g.addColorStop(0, `rgba(241,245,249,${p.a})`);
          g.addColorStop(1, "rgba(241,245,249,0)");
          ctx.fillStyle = g;
          ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
          p.x += p.vx * k;
          if (p.x > w + p.r) p.x = -p.r;
          if (p.x < -p.r) p.x = w + p.r;
        } else if (kind === "sand") {
          const gust = 0.6 + 0.8 * (0.5 + 0.5 * Math.sin(t / 140 + p.phase * 0.2));
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.len * gust, p.y - p.len * 0.05);
          ctx.strokeStyle = `rgba(232, 190, 128, ${p.a})`;
          ctx.lineWidth = p.lw;
          ctx.stroke();
          p.x += (p.vx + wind * 0.3) * gust * k;
          p.y += (p.vy + Math.sin(p.phase) * 0.4) * k;
          if (p.x > w + p.len) {
            p.x = -p.len;
            p.y = Math.random() * h;
          }
        } else if (kind === "petals") {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.phase * 1.3);
          ctx.scale(1, 0.62 + 0.38 * Math.sin(p.phase * 1.7));
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, 7);
          ctx.fillStyle = p.tone;
          ctx.globalAlpha = p.a;
          ctx.fill();
          ctx.restore();
          p.y += p.vy * k;
          p.x += (p.vx + Math.sin(p.phase * 0.7) * 0.7 + wind * 0.06) * k;
          if (p.y > h + 12 || p.x > w + 12) {
            p.x = Math.random() * w * 0.9 - w * 0.1;
            p.y = -12;
          }
        }
      }
      ctx.globalAlpha = 1;
      wind *= Math.pow(0.92, k);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [kind, storm, live]);

  if (!live) return null;
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: active && shown ? 1 : 0,
        transition: "opacity 1s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    />
  );
}
