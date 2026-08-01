import { motion } from "framer-motion";
import { Clock, Sun, Cloud, CloudDrizzle, CloudRain, CloudSnow, CloudLightning, CloudFog } from "lucide-react";

const getWeatherDetails = (code) => {
  if (code === 0) return { icon: Sun, color: "#fbbf24" };
  if (code >= 1 && code <= 3) return { icon: Cloud, color: "#94a3b8" };
  if (code >= 45 && code <= 48) return { icon: CloudFog, color: "#cbd5e1" };
  if (code >= 51 && code <= 55) return { icon: CloudDrizzle, color: "#60a5fa" };
  if (code >= 61 && code <= 67) return { icon: CloudRain, color: "#3b82f6" };
  if (code >= 71 && code <= 77) return { icon: CloudSnow, color: "#e2e8f0" };
  if (code >= 95 && code <= 99) return { icon: CloudLightning, color: "#818cf8" };
  return { icon: Sun, color: "#fbbf24" };
};

const formatHour = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function HourlyForecast({ hourly, unit, convertTemp }) {
  if (!hourly || !hourly.time) return null;

  // Take the next 24 hours
  const now = new Date();
  const currentIndex = hourly.time.findIndex((t) => new Date(t) >= now);
  const startIdx = currentIndex !== -1 ? currentIndex : 0;
  const hoursData = hourly.time.slice(startIdx, startIdx + 24).map((time, idx) => ({
    time,
    temp: hourly.temperature_2m[startIdx + idx],
    code: hourly.weather_code[startIdx + idx],
  }));

  return (
    <motion.div
      className="hourly-forecast-section glass"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="forecast-title">
        <Clock size={20} />
        <span>Hourly Forecast (Next 24h)</span>
      </div>

      <div className="hourly-slider">
        {hoursData.map((item, index) => {
          const { icon: HourIcon, color } = getWeatherDetails(item.code);
          const isNow = index === 0;

          return (
            <motion.div
              key={item.time}
              className={`hourly-card ${isNow ? 'now-card' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="hourly-time">{isNow ? "Now" : formatHour(item.time)}</span>
              <HourIcon size={24} color={color} className="hourly-icon" />
              <span className="hourly-temp">{convertTemp(item.temp)}°{unit}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
