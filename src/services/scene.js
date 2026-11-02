// Paints the view behind the rain-glass: a mountain valley under the current
// sky. The glass shader blurs it and adds the drops, so the painting only
// needs honest colour and clear shapes: sky, sun or moon, cloud, the peaks,
// a lake and the near meadow.

const inRange = (n, a, b) => n >= a && n <= b;

// What the weather does to the window. Each mood says whether water lands on
// the glass (drops), how fogged it is (fogAmount), what drifts in front of the
// view (effect) and whether lightning flashes (thunder).
const ARID = new Set(["SA", "AE", "QA", "KW", "OM", "BH", "IQ", "EG", "LY", "DZ", "SD", "NE", "ML", "TD", "MR", "EH", "SO", "DJ", "YE", "JO", "IR", "PK", "AF", "TM", "UZ", "NA", "BW"]);
const BLOSSOM = new Set(["JP", "KR"]);

// Dev preview: `?effect=snow|sand|petals|fog|rain|storm` forces a mood.
const FORCED = {
  snow: () => mood("snow", { drops: false, fogAmount: 0.5, effect: "snow" }),
  sand: () => mood("sand", { drops: false, fogAmount: 0.55, effect: "sand" }),
  petals: () => mood("sakura", { drops: false, fogAmount: 0.1, effect: "petals" }),
  fog: () => mood("fog", { drops: false, fogAmount: 0.9, effect: "fog" }),
  rain: () => mood("rain", { rain: 0.8, drops: true, fogAmount: 0.6, effect: "none" }),
  storm: () => mood("storm", { rain: 1, drops: true, fogAmount: 0.55, effect: "none", thunder: true }),
};

export function getMood(weather, forced) {
  if (forced && FORCED[forced]) return FORCED[forced]();
  const hour = new Date().getHours();
  const c = weather?.current;
  // Home: the signature rainy window, matched to the time of day.
  if (!c) {
    const name = hour >= 20 || hour < 5 ? "night" : hour >= 17 ? "dusk" : hour < 8 ? "dawn" : "clear";
    return mood(name, { rain: 0.5, drops: true, fogAmount: 0.6, effect: "none" });
  }
  const code = c.weather_code;
  const day = c.is_day !== 0;
  const cc = weather.countryCode;
  const wet = inRange(code, 51, 67) || inRange(code, 80, 82);
  const snowy = inRange(code, 71, 77) || inRange(code, 85, 86) || (c.temperature_2m ?? 10) <= -2;
  const dry = !wet && !snowy && !inRange(code, 95, 99);
  const windy = (c.wind_speed_10m ?? 0) >= 30 || (c.visibility ?? 99999) < 5000;

  if (inRange(code, 95, 99)) return mood("storm", { rain: 1, drops: true, fogAmount: 0.55, effect: "none", thunder: true });
  if (snowy) return mood(day ? "snow" : "snownight", { drops: false, fogAmount: 0.5, effect: "snow" });
  if (wet) return mood(day ? "rain" : "rainnight", { rain: code >= 63 || code >= 81 ? 0.95 : 0.55, drops: true, fogAmount: 0.6, effect: "none" });
  if (inRange(code, 45, 48)) return mood(day ? "fog" : "fognight", { drops: false, fogAmount: 0.9, effect: "fog" });
  // Dust and sand: only where the land makes it likely, and only when the air is
  // moving or the view has closed in. Open-Meteo has no dust code of its own.
  if (dry && ARID.has(cc) && windy) return mood(day ? "sand" : "sandnight", { drops: false, fogAmount: 0.55, effect: "sand" });
  if (dry && BLOSSOM.has(cc)) {
    return mood(day ? "sakura" : "night", { drops: false, fogAmount: 0.1, effect: "petals" });
  }
  if (code === 0) return mood(day ? "clear" : "night", { drops: false, fogAmount: 0.1, effect: "none" });
  return mood(day ? "cloudy" : "cloudnight", { drops: false, fogAmount: 0.22, effect: "none" });
}

// sky: top, middle, horizon. far/mid/near: the three ridges. tint: the panel
// colour as "r g b", taken from the sky so the panels sit in the weather.
const PALETTES = {
  clear:      { sky: ["#2f7fd0", "#6fb2ea", "#cfe6f5"], far: "#7d9cc0", mid: "#4f7a74", near: "#5d8f4e", water: "#5f9ed6", body: "sun",  clouds: 0.25, snowcaps: true,  tint: "22 64 120" },
  dawn:       { sky: ["#3c4f86", "#c48aa0", "#f6c79a"], far: "#8b7ea3", mid: "#4e5a73", near: "#3f5a4a", water: "#c99aa8", body: "sun",  clouds: 0.3,  snowcaps: true,  tint: "52 48 92" },
  dusk:       { sky: ["#23285a", "#9a4f78", "#f39a67"], far: "#6b4d76", mid: "#3a3556", near: "#2a3a3a", water: "#b8687a", body: "sun",  clouds: 0.35, snowcaps: true,  tint: "48 32 78" },
  cloudy:     { sky: ["#5b7290", "#8ea3b8", "#c3ced8"], far: "#7c8a99", mid: "#56686b", near: "#5a7550", water: "#8098ad", body: null,   clouds: 0.8,  snowcaps: true,  tint: "44 60 82" },
  rain:       { sky: ["#36475a", "#55687b", "#7d8e9c"], far: "#5d6b78", mid: "#3e4e52", near: "#3d5640", water: "#5a6d7e", body: null,   clouds: 1,    snowcaps: false, tint: "30 42 58" },
  fog:        { sky: ["#8693a0", "#a7b1ba", "#c9d0d6"], far: "#a3adb6", mid: "#8b979c", near: "#7d8f80", water: "#a4afb8", body: null,   clouds: 0.6,  snowcaps: false, tint: "62 72 84" },
  snow:       { sky: ["#7f9cbc", "#b4c8da", "#e6eef4"], far: "#c9d6e3", mid: "#9fb3c6", near: "#e8eef3", water: "#a9bfd3", body: null,   clouds: 0.7,  snowcaps: true,  tint: "52 76 108" },
  night:      { sky: ["#060b1f", "#13224a", "#2b4677"], far: "#22335a", mid: "#16223d", near: "#0f1a2a", water: "#1f3561", body: "moon", clouds: 0.15, snowcaps: true,  tint: "14 24 52" },
  cloudnight: { sky: ["#0b1222", "#1c2a45", "#33476a"], far: "#26354f", mid: "#19243a", near: "#111b29", water: "#25375a", body: "moon", clouds: 0.75, snowcaps: true,  tint: "18 28 48" },
  rainnight:  { sky: ["#070b14", "#121c2c", "#24344a"], far: "#1f2b3c", mid: "#141e2c", near: "#0d151f", water: "#1b2a40", body: null,   clouds: 1,    snowcaps: false, tint: "14 22 36" },
  fognight:   { sky: ["#141a22", "#28323d", "#46525e"], far: "#3a4652", mid: "#2b3540", near: "#1e262e", water: "#36424e", body: null,   clouds: 0.6,  snowcaps: false, tint: "28 36 46" },
  snownight:  { sky: ["#0c1631", "#23385f", "#4d6a94"], far: "#5d7598", mid: "#3c5274", near: "#a9bad0", water: "#2e4670", body: "moon", clouds: 0.6,  snowcaps: true,  tint: "20 34 64" },
  sand:       { sky: ["#a5622b", "#d49a58", "#f1cf93"], far: "#b98653", mid: "#9d6b3d", near: "#c99c61", water: "#dcb277", body: "sun", clouds: 0.3, snowcaps: false, tint: "88 54 24", fog: "#c8935a" },
  sandnight:  { sky: ["#1d1410", "#3b2a1d", "#5f4630"], far: "#4a3524", mid: "#33261b", near: "#2a2018", water: "#3f2f20", body: null, clouds: 0.4, snowcaps: false, tint: "46 32 22", fog: "#6a4c30" },
  sakura:     { sky: ["#4f9ce0", "#a6c6ee", "#f8d3e0"], far: "#9aa8c6", mid: "#6f8f7e", near: "#86b370", water: "#a0c2e2", body: "sun", clouds: 0.3, snowcaps: true, tint: "46 60 112" },
  storm:      { sky: ["#0c0a18", "#26203f", "#4a4366"], far: "#3a3654", mid: "#24213a", near: "#1a2228", water: "#2e2a48", body: null,   clouds: 1,    snowcaps: false, tint: "30 26 52" },
};

function mood(name, { rain = 0.3, drops = false, fogAmount = 0.3, effect = "none", thunder = false }) {
  const p = PALETTES[name];
  const night = name.includes("night") || name === "storm";
  const fog = p.fog ?? mix(p.sky[1], night ? "#0a1020" : "#dfe7ee", night ? 0.35 : 0.45);
  return { name, rain, drops, fogAmount, effect, thunder, night, ...p, fog };
}

function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (v, s) => (v >> s) & 255;
  const out = [16, 8, 0].map((s) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * t));
  return `rgb(${out.join(", ")})`;
}

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A ridge line as a list of points, rough at the top for the far peaks and
// gentle for the meadow.
function ridge(rand, W, base, height, peaks, jag) {
  const pts = [];
  const step = 8;
  const phases = Array.from({ length: peaks }, () => [rand() * Math.PI * 2, 0.6 + rand() * 0.8]);
  for (let x = -step; x <= W + step; x += step) {
    let y = 0;
    phases.forEach(([ph, amp], i) => {
      y += Math.sin((x / W) * Math.PI * (i + 1) * 1.3 + ph) * amp;
    });
    y = (y / peaks) * height + (rand() - 0.5) * jag;
    pts.push([x, base - Math.abs(y) - height * 0.15]);
  }
  return pts;
}

function fillRidge(ctx, pts, H, color) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], H);
  pts.forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.lineTo(pts[pts.length - 1][0], H);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export function paintScene(m) {
  const W = 1600;
  const H = 1000;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const rand = rng(m.name.length * 977 + 13);
  const horizon = H * 0.66;

  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, m.sky[0]);
  sky.addColorStop(0.6, m.sky[1]);
  sky.addColorStop(1, m.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Stars on a clear night.
  if (m.night && m.clouds < 0.5) {
    for (let i = 0; i < 160; i++) {
      ctx.globalAlpha = 0.3 + rand() * 0.7;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(rand() * W, rand() * horizon * 0.8, 0.6 + rand() * 1.4, 0, 7);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Sun or moon, with the light it throws into the sky.
  if (m.body) {
    const bx = W * 0.7;
    const by = m.name === "dusk" || m.name === "dawn" ? horizon * 0.78 : H * 0.2;
    const r = m.body === "sun" ? 54 : 38;
    const halo = ctx.createRadialGradient(bx, by, r * 0.5, bx, by, r * 7);
    halo.addColorStop(0, m.body === "sun" ? "rgba(255,236,190,0.75)" : "rgba(210,225,255,0.35)");
    halo.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = m.body === "sun" ? "#fff5d6" : "#eef3ff";
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, 7);
    ctx.fill();
  }

  // Clouds: soft heaps, more and lower as the weather closes in.
  const heaps = Math.round(4 + m.clouds * 18);
  for (let i = 0; i < heaps; i++) {
    const cx = rand() * W;
    const cy = horizon * (0.08 + rand() * (0.35 + m.clouds * 0.4));
    const w = 160 + rand() * 300;
    const tone = m.night ? "rgba(140,160,190," : "rgba(255,255,255,";
    const a = m.clouds > 0.7 ? 0.22 : 0.4;
    for (let k = 0; k < 6; k++) {
      const px = cx + (rand() - 0.5) * w;
      const py = cy + (rand() - 0.5) * w * 0.18;
      const pr = w * (0.18 + rand() * 0.22);
      const g = ctx.createRadialGradient(px, py, 0, px, py, pr);
      g.addColorStop(0, tone + a + ")");
      g.addColorStop(1, tone + "0)");
      ctx.fillStyle = g;
      ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);
    }
  }
  // Overcast weather lays a flat ceiling over everything.
  if (m.clouds >= 0.8) {
    ctx.fillStyle = m.night ? "rgba(20,28,44,0.35)" : "rgba(120,135,150,0.25)";
    ctx.fillRect(0, 0, W, horizon * 0.55);
  }

  // The peaks.
  const far = ridge(rand, W, horizon, 300, 5, 26);
  fillRidge(ctx, far, H, m.far);
  if (m.snowcaps) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(far[0][0], H);
    far.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.lineTo(far[far.length - 1][0], H);
    ctx.closePath();
    ctx.clip();
    const capLine = horizon - 230;
    ctx.fillStyle = m.night ? "rgba(200,215,240,0.55)" : "rgba(255,255,255,0.85)";
    ctx.fillRect(0, 0, W, capLine);
    ctx.restore();
  }
  // Air between the ridges.
  ctx.fillStyle = hexA(m.sky[2], 0.35);
  ctx.fillRect(0, horizon - 320, W, 340);

  const mid = ridge(rand, W, horizon + 40, 150, 3, 10);
  fillRidge(ctx, mid, H, m.mid);

  // The lake, catching the sky.
  const lakeTop = horizon + 60;
  const lake = ctx.createLinearGradient(0, lakeTop, 0, H);
  lake.addColorStop(0, m.water);
  lake.addColorStop(1, m.sky[0]);
  ctx.fillStyle = lake;
  ctx.fillRect(0, lakeTop, W, H - lakeTop);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  for (let i = 0; i < 26; i++) {
    ctx.fillRect(rand() * W, lakeTop + 8 + rand() * 110, 40 + rand() * 160, 2);
  }

  // The near meadow.
  const near = ridge(rand, W, H * 0.98, 120, 2, 4);
  fillRidge(ctx, near, H, m.near);

  // Cabin lights along the shore at night.
  if (m.night) {
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 18; i++) {
      const lx = rand() * W;
      const ly = lakeTop - 6 + rand() * 20;
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 22);
      g.addColorStop(0, "rgba(255,200,120,0.9)");
      g.addColorStop(1, "rgba(255,200,120,0)");
      ctx.fillStyle = g;
      ctx.fillRect(lx - 22, ly - 22, 44, 44);
    }
    ctx.globalCompositeOperation = "source-over";
  }

  // Fog sits in the valley.
  if (m.name.startsWith("fog")) {
    const haze = ctx.createLinearGradient(0, horizon - 260, 0, H);
    haze.addColorStop(0, hexA(m.sky[2], 0));
    haze.addColorStop(0.5, hexA(m.sky[2], 0.8));
    haze.addColorStop(1, hexA(m.sky[2], 0.5));
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, W, H);
  }

  return canvas.toDataURL("image/jpeg", 0.9);
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
