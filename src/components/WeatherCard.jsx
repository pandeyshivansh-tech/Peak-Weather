import { motion } from "framer-motion";
import { Droplets, Eye, Gauge, MapPin, Sun, Sunrise, Thermometer, Wind } from "lucide-react";
import HourlyForecast from "./HourlyForecast";
import DailyForecast from "./DailyForecast";
import AnimatedCounter from "./AnimatedCounter";
import { rise, stagger as makeStagger } from "../services/motion";
import {
  clockLabel,
  compass,
  daylight,
  daySummary,
  describe,
  feelsNote,
  humidityNote,
  pressureNote,
  uvNote,
  visibilityNote,
  windNote,
} from "../services/weather";

const stagger = makeStagger(0.08);

function Tile({ icon, label, value, note, wide, children }) {
  const Icon = icon;
  return (
    <motion.div className={`tile panel${wide ? " tile-wide" : ""}`} variants={rise}>
      <h3 className="tile-label">
        <Icon size={16} aria-hidden="true" />
        {label}
      </h3>
      <p className="tile-value">{value}</p>
      {children}
      {note && <p className="tile-note">{note}</p>}
    </motion.div>
  );
}

function SunTile({ sunrise, sunset, nowIso }) {
  const share = daylight(sunrise, sunset, nowIso);
  // Arc from sunrise (left) to sunset (right); the sun sits on it by daylight gone.
  const angle = Math.PI * (1 - (share ?? 0));
  const x = 100 + Math.cos(angle) * 84;
  const y = 92 - Math.sin(angle) * 72;
  return (
    <Tile
      icon={Sunrise}
      label="Sunrise and sunset"
      value={
        <>
          <span>{clockLabel(sunrise)}</span>
          <span className="tile-value-sep" aria-hidden="true">→</span>
          <span>{clockLabel(sunset)}</span>
        </>
      }
      note={share === null ? "The sun is down." : `${Math.round(share * 100)}% of today's daylight has gone.`}
      wide
    >
      <svg className="sun-arc" viewBox="0 0 200 100" aria-hidden="true">
        <path d="M 16 92 A 84 72 0 0 1 184 92" className="sun-arc-track" />
        {share !== null && (
          <path
            d="M 16 92 A 84 72 0 0 1 184 92"
            className="sun-arc-done"
            pathLength="1"
            strokeDasharray={`${share} 1`}
          />
        )}
        {share !== null && <circle cx={x} cy={y} r="7" className="sun-arc-sun" />}
      </svg>
    </Tile>
  );
}

export default function WeatherCard({ weather, unit, convertTemp }) {
  if (!weather?.current) return null;
  const { current, daily, hourly, name, region } = weather;
  const { label } = describe(current.weather_code, current.is_day !== 0);
  const temp = convertTemp(current.temperature_2m);
  const feels = convertTemp(current.apparent_temperature);
  const hi = convertTemp(daily?.temperature_2m_max?.[0]);
  const lo = convertTemp(daily?.temperature_2m_min?.[0]);
  const uv = daily?.uv_index_max?.[0];
  const visibility = current.visibility ? current.visibility / 1000 : null;
  const wind = Math.round(current.wind_speed_10m);

  return (
    <div className="forecast">
      <motion.section className="now" aria-labelledby="place" initial="hidden" animate="shown" variants={stagger}>
        <motion.h1 id="place" className="place" variants={rise}>
          <MapPin size={22} aria-hidden="true" />
          <span>{name}</span>
          {region && <span className="place-region">{region}</span>}
        </motion.h1>
        <motion.p className="numeral" variants={rise} aria-label={`${temp} degrees`}>
          <AnimatedCounter value={temp} />
          <span className="numeral-degree" aria-hidden="true">°</span>
        </motion.p>
        <motion.p className="condition" variants={rise}>{label}</motion.p>
        <motion.p className="range" variants={rise}>
          <span>High {hi}°</span>
          <span>Low {lo}°</span>
          <span>Feels like {feels}°</span>
        </motion.p>
        <motion.p className="summary" variants={rise}>{daySummary(weather)}</motion.p>
      </motion.section>

      <motion.div className="column" initial="hidden" animate="shown" variants={stagger}>
        <HourlyForecast hourly={hourly} nowIso={current.time} isDay={current.is_day !== 0} convertTemp={convertTemp} variants={rise} />
        <DailyForecast daily={daily} current={current} convertTemp={convertTemp} variants={rise} />

        <motion.section className="tiles" aria-labelledby="details-title" variants={stagger}>
          <h2 id="details-title" className="visually-hidden">Details</h2>
          <Tile icon={Thermometer} label="Feels like" value={`${feels}°${unit}`} note={feelsNote(current.temperature_2m, current.apparent_temperature)} />
          <Tile icon={Droplets} label="Humidity" value={`${current.relative_humidity_2m}%`} note={humidityNote(current.relative_humidity_2m)} />
          <Tile icon={Wind} label="Wind" value={<>{wind}<small> km/h {compass(current.wind_direction_10m)}</small></>} note={windNote(wind)} />
          {uv !== undefined && uv !== null && (
            <Tile icon={Sun} label="UV index" value={<>{Math.round(uv)}<small> {uvNote(uv)}</small></>}>
              <div className="uv-scale" aria-hidden="true">
                <span style={{ left: `${Math.min(uv / 11, 1) * 100}%` }} />
              </div>
            </Tile>
          )}
          {current.surface_pressure && (
            <Tile icon={Gauge} label="Pressure" value={<>{Math.round(current.surface_pressure)}<small> hPa</small></>} note={pressureNote(current.surface_pressure)} />
          )}
          {visibility !== null && (
            <Tile icon={Eye} label="Visibility" value={<>{visibility >= 10 ? Math.round(visibility) : visibility.toFixed(1)}<small> km</small></>} note={visibilityNote(visibility)} />
          )}
          {daily?.sunrise?.[0] && <SunTile sunrise={daily.sunrise[0]} sunset={daily.sunset[0]} nowIso={current.time} />}
        </motion.section>
      </motion.div>
    </div>
  );
}
