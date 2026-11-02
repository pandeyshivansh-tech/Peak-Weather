import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LocateFixed, Loader2 } from "lucide-react";
import { describe } from "../services/weather";

const PLACES = [
  { name: "Tokyo", lat: 35.6895, lon: 139.6917 },
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "New York", lat: 40.7128, lon: -74.006 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
];

const rise = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = { hidden: {}, shown: { transition: { staggerChildren: 0.07 } } };

// The city's own wall clock, from the forecast's UTC offset.
function localTime(offsetSeconds) {
  const d = new Date(Date.now() + offsetSeconds * 1000);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
}

export default function PopularCities({ onCityClick, onLocateMe, isLocating, unit, convertTemp }) {
  const [places, setPlaces] = useState(PLACES.map((p) => ({ ...p, loaded: false })));

  useEffect(() => {
    let alive = true;
    Promise.all(
      PLACES.map(async (p) => {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto`
          );
          if (!res.ok) throw new Error(res.statusText);
          const data = await res.json();
          return {
            ...p,
            loaded: true,
            temp: data.current.temperature_2m,
            code: data.current.weather_code,
            isDay: data.current.is_day !== 0,
            hi: data.daily?.temperature_2m_max?.[0],
            lo: data.daily?.temperature_2m_min?.[0],
            offset: data.utc_offset_seconds ?? 0,
          };
        } catch {
          return { ...p, loaded: false, failed: true };
        }
      })
    ).then((rows) => alive && setPlaces(rows));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <motion.div className="home" initial="hidden" animate="shown" variants={stagger}>
      <section className="home-hero" aria-labelledby="home-title">
        <motion.h1 id="home-title" className="home-title" variants={rise}>
          Check the weather anywhere
        </motion.h1>
        <motion.p className="home-lede" variants={rise}>
          Search a city for current conditions, the next 24 hours and the week ahead.
          Or start with where you are.
        </motion.p>
        <motion.div className="home-actions" variants={rise}>
          <button type="button" className="button-primary" onClick={onLocateMe} disabled={isLocating}>
            {isLocating ? <Loader2 size={18} className="spin" aria-hidden="true" /> : <LocateFixed size={18} aria-hidden="true" />}
            {isLocating ? "Finding you" : "Use my location"}
          </button>
          <p className="home-hint">Drag across the window to wipe the fog off the glass.</p>
        </motion.div>
      </section>

      <motion.section className="panel places" aria-labelledby="places-title" variants={rise}>
        <h2 id="places-title" className="panel-title">Right now in</h2>
        <ul className="places-list">
          {places.map((p) => {
            const sky = p.loaded ? describe(p.code, p.isDay) : null;
            return (
              <li key={p.name}>
                <button type="button" className="place-row" onClick={() => onCityClick(p.name)}>
                  <span className="place-row-name">{p.name}</span>
                  <span className="place-row-meta">
                    {p.loaded ? `${localTime(p.offset)} · ${sky.label}` : p.failed ? "Tap to load" : "Loading"}
                  </span>
                  <span className="place-row-sky">
                    {sky && <sky.Icon size={26} className={sky.sunny ? "icon-sun" : undefined} aria-hidden="true" />}
                  </span>
                  <span className="place-row-temp">
                    {p.loaded ? `${convertTemp(p.temp)}°` : "--"}
                    <span className="visually-hidden">{unit === "F" ? " Fahrenheit" : " Celsius"}</span>
                  </span>
                  <span className="place-row-range">
                    {p.loaded && p.hi !== undefined ? `${convertTemp(p.hi)}° / ${convertTemp(p.lo)}°` : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </motion.section>
    </motion.div>
  );
}
