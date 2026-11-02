import { motion } from "framer-motion";
import { describe, hourLabel, nextHours } from "../services/weather";

const COL = 64;
const CURVE_H = 64;
const PAD = 22;

// Smooth line through the points (Catmull-Rom as cubic Béziers).
function smoothPath(points) {
  if (!points.length) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    d += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6}, ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function HourlyForecast({ hourly, nowIso, isDay, convertTemp, variants }) {
  const hours = nextHours(hourly, nowIso, 24).map((h) => ({ ...h, shown: convertTemp(h.temp) }));
  if (!hours.length) return null;

  const temps = hours.map((h) => h.temp);
  const min = Math.min(...temps);
  const span = Math.max(Math.max(...temps) - min, 1);
  const width = hours.length * COL;
  const points = hours.map((h, i) => ({
    x: i * COL + COL / 2,
    y: CURVE_H - 10 - ((h.temp - min) / span) * (CURVE_H - PAD - 10) ,
  }));

  return (
    <motion.section className="panel hourly" aria-labelledby="hourly-title" variants={variants}>
      <h2 id="hourly-title" className="panel-title">Next 24 hours</h2>
      <div className="hourly-scroll" tabIndex={0} aria-label="Hourly forecast, scroll sideways for more hours">
        <ol className="hourly-track" style={{ width }}>
          {hours.map((h, i) => {
            // Older responses lack hourly is_day; fall back to the hour itself.
            const hourNum = Number(h.time.slice(11, 13));
            const day = h.isDay ?? (i === 0 ? isDay : hourNum >= 6 && hourNum < 19);
            const { Icon, label, sunny } = describe(h.code, day);
            return (
              <li key={h.time} className={`hour${i === 0 ? " hour-now" : ""}`} style={{ width: COL }}>
                <span className="hour-time">{i === 0 ? "Now" : hourLabel(h.time)}</span>
                <Icon size={24} className={sunny ? "icon-sun" : undefined} aria-label={label} />
                <span className="hour-chance">{h.rainChance >= 20 ? `${h.rainChance}%` : ""}</span>
                <span className="visually-hidden">{h.shown}°</span>
              </li>
            );
          })}
        </ol>
        <svg className="hourly-curve" width={width} height={CURVE_H} viewBox={`0 0 ${width} ${CURVE_H}`} aria-hidden="true">
          <motion.path
            d={smoothPath(points)}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          />
          {points.map((p, i) => (
            <g key={hours[i].time}>
              <circle cx={p.x} cy={p.y} r={i === 0 ? 4.5 : 3} />
              <text x={p.x} y={p.y - 11}>{hours[i].shown}°</text>
            </g>
          ))}
        </svg>
      </div>
    </motion.section>
  );
}
