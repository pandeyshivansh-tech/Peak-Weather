import { motion } from "framer-motion";
import { 
  Cloud, 
  CloudDrizzle, 
  CloudFog, 
  CloudLightning, 
  CloudRain, 
  CloudSnow, 
  Droplets, 
  Sun, 
  Thermometer, 
  Wind,
  SunDim
} from "lucide-react";

const getWeatherDetails = (code) => {
  if (code === 0) return { label: "Clear Sky", icon: Sun, color: "#fbbf24" };
  if (code >= 1 && code <= 3) return { label: "Partly Cloudy", icon: Cloud, color: "#94a3b8" };
  if (code >= 45 && code <= 48) return { label: "Foggy", icon: CloudFog, color: "#cbd5e1" };
  if (code >= 51 && code <= 55) return { label: "Drizzle", icon: CloudDrizzle, color: "#60a5fa" };
  if (code >= 61 && code <= 67) return { label: "Rainy", icon: CloudRain, color: "#3b82f6" };
  if (code >= 71 && code <= 77) return { label: "Snowy", icon: CloudSnow, color: "#e2e8f0" };
  if (code >= 95 && code <= 99) return { label: "Thunderstorm", icon: CloudLightning, color: "#818cf8" };
  return { label: "Unknown", icon: Sun, color: "#fbbf24" };
};

const getDayName = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

function WeatherCard({ weather }) {
  if (!weather || !weather.current) return null;

  const { current, daily, name } = weather;
  const { icon: MainIcon, label: mainLabel, color: mainColor } = getWeatherDetails(current.weather_code);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="weather-dashboard glass"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main Current Weather */}
      <motion.div className="main-card" variants={itemVariants}>
        <h2 className="city-name">{name}</h2>
        <div className="temp-container">
          <span className="temperature">{Math.round(current.temperature_2m)}</span>
          <span className="temp-unit">°C</span>
        </div>
        <div className="weather-desc">
          <MainIcon size={32} color={mainColor} />
          <span>{mainLabel}</span>
        </div>
      </motion.div>

      <div>
        {/* Details Grid */}
        <motion.div className="details-grid" variants={itemVariants}>
          <div className="detail-item glass">
            <div className="detail-icon-wrapper">
              <Thermometer size={24} color="#f87171" />
            </div>
            <div className="detail-info">
              <span className="detail-label">Feels Like</span>
              <span className="detail-value">{Math.round(current.apparent_temperature)}°</span>
            </div>
          </div>
          
          <div className="detail-item glass">
            <div className="detail-icon-wrapper">
              <Droplets size={24} color="#60a5fa" />
            </div>
            <div className="detail-info">
              <span className="detail-label">Humidity</span>
              <span className="detail-value">{current.relative_humidity_2m}%</span>
            </div>
          </div>

          <div className="detail-item glass">
            <div className="detail-icon-wrapper">
              <Wind size={24} color="#a78bfa" />
            </div>
            <div className="detail-info">
              <span className="detail-label">Wind</span>
              <span className="detail-value">{Math.round(current.wind_speed_10m)} km/h</span>
            </div>
          </div>

          <div className="detail-item glass">
            <div className="detail-icon-wrapper">
              <SunDim size={24} color="#fbbf24" />
            </div>
            <div className="detail-info">
              <span className="detail-label">Max UV Index</span>
              <span className="detail-value">{daily.uv_index_max[0]}</span>
            </div>
          </div>
        </motion.div>

        {/* 7-Day Forecast */}
        <motion.div className="forecast-section glass" variants={itemVariants}>
          <div className="forecast-title">
            <Cloud size={20} />
            <span>7-Day Forecast</span>
          </div>
          <div className="forecast-list">
            {daily.time.slice(1).map((date, index) => {
              const code = daily.weather_code[index + 1];
              const { icon: DayIcon, color: dayColor, label } = getWeatherDetails(code);
              return (
                <div key={date} className="forecast-item">
                  <span className="forecast-day">{getDayName(date)}</span>
                  <div className="forecast-condition">
                    <DayIcon size={20} color={dayColor} />
                    <span>{label}</span>
                  </div>
                  <div className="forecast-temps">
                    <span className="temp-min">{Math.round(daily.temperature_2m_min[index + 1])}°</span>
                    <span className="temp-max">{Math.round(daily.temperature_2m_max[index + 1])}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default WeatherCard;