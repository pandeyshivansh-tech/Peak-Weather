import { motion } from "framer-motion";
import { dayLabel, describe } from "../services/weather";

// Seven days, each with its low-to-high span placed on the week's own scale,
// so a cold day sits visibly left of a warm one.
export default function DailyForecast({ daily, current, convertTemp, variants }) {
  if (!daily?.time) return null;
  const days = daily.time.slice(0, 7).map((date, i) => ({
    date,
    code: daily.weather_code[i],
    min: daily.temperature_2m_min[i],
    max: daily.temperature_2m_max[i],
    rain: daily.precipitation_probability_max?.[i] ?? null,
  }));
  const weekMin = Math.min(...days.map((d) => d.min));
  const weekSpan = Math.max(Math.max(...days.map((d) => d.max)) - weekMin, 1);
  const at = (t) => ((t - weekMin) / weekSpan) * 100;

  return (
    <motion.section className="panel daily" aria-labelledby="daily-title" variants={variants}>
      <h2 id="daily-title" className="panel-title">Next 7 days</h2>
      <ol className="days">
        {days.map((d, i) => {
          const { Icon, label, sunny } = describe(d.code, true);
          const now = i === 0 ? at(current.temperature_2m) : null;
          return (
            <li key={d.date} className="day">
              <span className="day-name">{dayLabel(d.date, i)}</span>
              <span className="day-sky">
                <Icon size={22} className={sunny ? "icon-sun" : undefined} aria-label={label} />
                <span className="day-chance">{d.rain >= 20 ? `${d.rain}%` : ""}</span>
              </span>
              <span className="day-low" aria-label={`Low ${convertTemp(d.min)} degrees`}>{convertTemp(d.min)}°</span>
              <span className="day-bar" aria-hidden="true">
                <span className="day-span" style={{ left: `${at(d.min)}%`, right: `${100 - at(d.max)}%` }} />
                {now !== null && <span className="day-now" style={{ left: `${Math.min(Math.max(now, 0), 100)}%` }} />}
              </span>
              <span className="day-high" aria-label={`High ${convertTemp(d.max)} degrees`}>{convertTemp(d.max)}°</span>
            </li>
          );
        })}
      </ol>
    </motion.section>
  );
}
