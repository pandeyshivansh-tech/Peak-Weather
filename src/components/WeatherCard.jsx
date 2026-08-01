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
  SunDim,
  Sunrise,
  Sunset,
  Gauge,
  Eye,
  Share2
} from "lucide-react";
import HourlyForecast from "./HourlyForecast";

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

const formatTime = (isoString) => {
  if (!isoString) return "--:--";
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function WeatherCard({ weather, unit, convertTemp }) {
  if (!weather || !weather.current) return null;

  const { current, daily, hourly, name } = weather;
  const { icon: MainIcon, label: mainLabel, color: mainColor } = getWeatherDetails(current.weather_code);

  const handleShare = async () => {
    const temp = convertTemp(current.temperature_2m);
    const text = `Current weather in ${name}: ${temp}°${unit}, ${mainLabel}! Checked via Peak Weather.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Peak Weather - ${name}`,
          text,
          url: window.location.href,
        });
      } catch (err) {
        console.warn("Share cancelled:", err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert("Weather details copied to clipboard!");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const sunriseTime = daily?.sunrise?.[0] ? formatTime(daily.sunrise[0]) : null;
  const sunsetTime = daily?.sunset?.[0] ? formatTime(daily.sunset[0]) : null;
  const pressure = current?.surface_pressure ? `${Math.round(current.surface_pressure)} hPa` : null;
  const visibility = current?.visibility ? `${(current.visibility / 1000).toFixed(1)} km` : null;

  return (
    <motion.div 
      className="weather-dashboard glass"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main Current Weather */}
      <motion.div className="main-card" variants={itemVariants}>
        <div className="main-card-top">
          <h2 className="city-name">{name}</h2>
          <button 
            type="button" 
            className="share-btn glass" 
            onClick={handleShare} 
            title="Share Weather"
            aria-label="Share Weather"
          >
            <Share2 size={18} />
          </button>
        </div>

        <div className="temp-container">
          <span className="temperature">{convertTemp(current.temperature_2m)}</span>
          <span className="temp-unit">°{unit}</span>
        </div>

        <div className="weather-desc">
          <MainIcon size={32} color={mainColor} />
          <span>{mainLabel}</span>
        </div>
      </motion.div>

      <div className="dashboard-right">
        {/* Details Grid */}
        <motion.div className="details-grid" variants={itemVariants}>
          <div className="detail-item glass">
            <div className="detail-icon-wrapper">
              <Thermometer size={24} color="#f87171" />
            </div>
            <div className="detail-info">
              <span className="detail-label">Feels Like</span>
              <span className="detail-value">{convertTemp(current.apparent_temperature)}°{unit}</span>
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
              <span className="detail-value">{daily?.uv_index_max?.[0] ?? '--'}</span>
            </div>
          </div>

          {sunriseTime && (
            <div className="detail-item glass">
              <div className="detail-icon-wrapper">
                <Sunrise size={24} color="#f59e0b" />
              </div>
              <div className="detail-info">
                <span className="detail-label">Sunrise</span>
                <span className="detail-value">{sunriseTime}</span>
              </div>
            </div>
          )}

          {sunsetTime && (
            <div className="detail-item glass">
              <div className="detail-icon-wrapper">
                <Sunset size={24} color="#ec4899" />
              </div>
              <div className="detail-info">
                <span className="detail-label">Sunset</span>
                <span className="detail-value">{sunsetTime}</span>
              </div>
            </div>
          )}

          {pressure && (
            <div className="detail-item glass">
              <div className="detail-icon-wrapper">
                <Gauge size={24} color="#34d399" />
              </div>
              <div className="detail-info">
                <span className="detail-label">Pressure</span>
                <span className="detail-value">{pressure}</span>
              </div>
            </div>
          )}

          {visibility && (
            <div className="detail-item glass">
              <div className="detail-icon-wrapper">
                <Eye size={24} color="#38bdf8" />
              </div>
              <div className="detail-info">
                <span className="detail-label">Visibility</span>
                <span className="detail-value">{visibility}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* 24-Hour Hourly Forecast Slider */}
        <HourlyForecast hourly={hourly} unit={unit} convertTemp={convertTemp} />

        {/* 7-Day Forecast */}
        <motion.div className="forecast-section glass" variants={itemVariants}>
          <div className="forecast-title">
            <Cloud size={20} />
            <span>7-Day Forecast</span>
          </div>
          <div className="forecast-list">
            {daily?.time?.slice(1).map((date, index) => {
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
                    <span className="temp-min">{convertTemp(daily.temperature_2m_min[index + 1])}°</span>
                    <span className="temp-max">{convertTemp(daily.temperature_2m_max[index + 1])}°</span>
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