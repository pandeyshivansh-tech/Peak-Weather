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
  Share2,
  Compass,
  Moon
} from "lucide-react";
import HourlyForecast from "./HourlyForecast";
import TiltCard from "./TiltCard";
import AnimatedCounter from "./AnimatedCounter";

const getWeatherDetails = (code) => {
  if (code === 0) return { label: "Clear Sky", icon: Sun, color: "#fbbf24" };
  if (code >= 1 && code <= 3) return { label: "Partly Cloudy", icon: Cloud, color: "#94a3b8" };
  if (code >= 45 && code <= 48) return { label: "Foggy", icon: CloudFog, color: "#cbd5e1" };
  if (code >= 51 && code <= 55) return { label: "Drizzle", icon: CloudDrizzle, color: "#60a5fa" };
  if (code >= 61 && code <= 67) return { label: "Rainy", icon: CloudRain, color: "#3b82f6" };
  if (code >= 71 && code <= 77) return { label: "Snowy", icon: CloudSnow, color: "#e2e8f0" };
  if (code >= 95 && code <= 99) return { label: "Thunderstorm", icon: CloudLightning, color: "#818cf8" };
  return { label: "Clear Sky", icon: Sun, color: "#fbbf24" };
};

const getDayName = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

const formatTime = (isoString) => {
  if (!isoString) return "--:--";
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Calculate daylight trajectory percentage (0% = sunrise, 100% = sunset)
function calculateSunProgress(sunriseIso, sunsetIso) {
  if (!sunriseIso || !sunsetIso) return { progress: 0.5, isDay: true };
  const now = new Date().getTime();
  const sunrise = new Date(sunriseIso).getTime();
  const sunset = new Date(sunsetIso).getTime();

  if (now >= sunrise && now <= sunset) {
    const progress = (now - sunrise) / (sunset - sunrise);
    return { progress: Math.min(Math.max(progress, 0), 1), isDay: true };
  } else {
    // Night time
    return { progress: 0.5, isDay: false };
  }
}

export default function WeatherCard({ weather, unit, convertTemp }) {
  if (!weather || !weather.current) return null;

  const { current, daily, hourly, name } = weather;
  const { icon: MainIcon, label: mainLabel, color: mainColor } = getWeatherDetails(current.weather_code);

  const rawTemp = current.temperature_2m;
  const rawFeelsLike = current.apparent_temperature;
  const tempVal = convertTemp(rawTemp);
  const feelsLikeVal = convertTemp(rawFeelsLike);

  const handleShare = async () => {
    const text = `Current weather in ${name}: ${tempVal}°${unit}, ${mainLabel}! Checked via Peak Weather.`;
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
      transition: { duration: 0.5, staggerChildren: 0.06 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const sunriseIso = daily?.sunrise?.[0];
  const sunsetIso = daily?.sunset?.[0];
  const sunriseTime = sunriseIso ? formatTime(sunriseIso) : null;
  const sunsetTime = sunsetIso ? formatTime(sunsetIso) : null;
  const { progress: sunProgress, isDay } = calculateSunProgress(sunriseIso, sunsetIso);

  const pressure = current?.surface_pressure ? Math.round(current.surface_pressure) : null;
  const visibility = current?.visibility ? (current.visibility / 1000).toFixed(1) : null;
  const uvIndex = daily?.uv_index_max?.[0] ?? null;

  // Sun Arc Coordinates (arc angle 0 to PI)
  const arcAngle = Math.PI * (1 - sunProgress);
  const arcRadiusX = 110;
  const arcRadiusY = 48;
  const sunX = 125 + Math.cos(arcAngle) * arcRadiusX;
  const sunY = 65 - Math.sin(arcAngle) * arcRadiusY;

  return (
    <motion.div 
      className="weather-dashboard glass"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 3D Tilt Hero Weather Card */}
      <TiltCard className="main-card-tilt" maxTilt={10}>
        <div className="main-card glass">
          <div className="main-card-top">
            <div className="city-box">
              <h2 className="city-name">{name}</h2>
              <span className="live-weather-badge">
                <span className="live-dot"></span> LIVE
              </span>
            </div>
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
            <span className="temperature">
              <AnimatedCounter value={tempVal} />
            </span>
            <span className="temp-unit">°{unit}</span>
          </div>

          <div className="weather-desc">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <MainIcon size={36} color={mainColor} />
            </motion.div>
            <span>{mainLabel}</span>
          </div>

          {/* Dynamic Celestial Sun/Moon Arc */}
          {sunriseTime && sunsetTime && (
            <div className="sun-arc-widget glass">
              <div className="sun-arc-header">
                <span>{isDay ? "Sun Trajectory" : "Night Cycle"}</span>
                <span className="sun-arc-status">{isDay ? "Daylight" : "Night"}</span>
              </div>
              <div className="sun-arc-svg-wrapper">
                <svg viewBox="0 0 250 80" className="sun-arc-svg">
                  <defs>
                    <linearGradient id="sunArcGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                  {/* Dashed Horizon Arc */}
                  <path
                    d="M 15 65 A 110 48 0 0 1 235 65"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeDasharray="4 4"
                    strokeWidth="2"
                  />
                  {/* Progress Arc */}
                  <path
                    d="M 15 65 A 110 48 0 0 1 235 65"
                    fill="none"
                    stroke="url(#sunArcGrad)"
                    strokeWidth="2.5"
                    strokeDasharray="240"
                    strokeDashoffset={240 * (1 - sunProgress)}
                  />
                  {/* Base Horizon line */}
                  <line x1="5" y1="65" x2="245" y2="65" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
                  
                  {/* Sun / Moon Orb */}
                  <g transform={`translate(${sunX}, ${sunY})`}>
                    <circle r="12" fill={isDay ? "rgba(251, 191, 36, 0.25)" : "rgba(167, 139, 250, 0.25)"} />
                    <circle r="6" fill={isDay ? "#fbbf24" : "#c4b5fd"} />
                  </g>
                </svg>
              </div>
              <div className="sun-arc-footer">
                <div className="sun-time">
                  <Sunrise size={14} color="#f59e0b" />
                  <span>{sunriseTime}</span>
                </div>
                <div className="sun-time">
                  <Sunset size={14} color="#ec4899" />
                  <span>{sunsetTime}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </TiltCard>

      <div className="dashboard-right">
        {/* Metric Details Grid with 3D Tilt Sheen */}
        <motion.div className="details-grid" variants={itemVariants}>
          <TiltCard className="detail-item-tilt" maxTilt={6}>
            <div className="detail-item glass">
              <div className="detail-icon-wrapper">
                <Thermometer size={24} color="#f87171" />
              </div>
              <div className="detail-info">
                <span className="detail-label">Feels Like</span>
                <span className="detail-value">
                  <AnimatedCounter value={feelsLikeVal} suffix={`°${unit}`} />
                </span>
              </div>
            </div>
          </TiltCard>
          
          <TiltCard className="detail-item-tilt" maxTilt={6}>
            <div className="detail-item glass">
              <div className="detail-icon-wrapper">
                <Droplets size={24} color="#60a5fa" />
              </div>
              <div className="detail-info">
                <span className="detail-label">Humidity</span>
                <span className="detail-value">
                  <AnimatedCounter value={current.relative_humidity_2m} suffix="%" />
                </span>
              </div>
            </div>
          </TiltCard>

          <TiltCard className="detail-item-tilt" maxTilt={6}>
            <div className="detail-item glass">
              <div className="detail-icon-wrapper">
                <Wind size={24} color="#a78bfa" />
              </div>
              <div className="detail-info">
                <span className="detail-label">Wind</span>
                <span className="detail-value">
                  <AnimatedCounter value={Math.round(current.wind_speed_10m)} suffix=" km/h" />
                </span>
              </div>
            </div>
          </TiltCard>

          <TiltCard className="detail-item-tilt" maxTilt={6}>
            <div className="detail-item glass">
              <div className="detail-icon-wrapper">
                <SunDim size={24} color="#fbbf24" />
              </div>
              <div className="detail-info">
                <span className="detail-label">Max UV Index</span>
                <span className="detail-value">
                  {uvIndex !== null ? <AnimatedCounter value={uvIndex} decimals={1} /> : "--"}
                </span>
              </div>
            </div>
          </TiltCard>

          {pressure && (
            <TiltCard className="detail-item-tilt" maxTilt={6}>
              <div className="detail-item glass">
                <div className="detail-icon-wrapper">
                  <Gauge size={24} color="#34d399" />
                </div>
                <div className="detail-info">
                  <span className="detail-label">Pressure</span>
                  <span className="detail-value">
                    <AnimatedCounter value={pressure} suffix=" hPa" />
                  </span>
                </div>
              </div>
            </TiltCard>
          )}

          {visibility && (
            <TiltCard className="detail-item-tilt" maxTilt={6}>
              <div className="detail-item glass">
                <div className="detail-icon-wrapper">
                  <Eye size={24} color="#38bdf8" />
                </div>
                <div className="detail-info">
                  <span className="detail-label">Visibility</span>
                  <span className="detail-value">
                    <AnimatedCounter value={parseFloat(visibility)} decimals={1} suffix=" km" />
                  </span>
                </div>
              </div>
            </TiltCard>
          )}
        </motion.div>

        {/* 24-Hour Hourly Forecast Spline & Slider */}
        <HourlyForecast hourly={hourly} unit={unit} convertTemp={convertTemp} />

        {/* 7-Day Forecast */}
        <motion.div className="forecast-section glass" variants={itemVariants}>
          <div className="forecast-title">
            <Cloud size={20} />
            <span>7-Day Extended Forecast</span>
          </div>
          <div className="forecast-list">
            {daily?.time?.slice(1).map((date, index) => {
              const code = daily.weather_code[index + 1];
              const { icon: DayIcon, color: dayColor, label } = getWeatherDetails(code);
              return (
                <motion.div
                  key={date}
                  className="forecast-item"
                  whileHover={{ x: 6, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="forecast-day">{getDayName(date)}</span>
                  <div className="forecast-condition">
                    <DayIcon size={20} color={dayColor} />
                    <span>{label}</span>
                  </div>
                  <div className="forecast-temps">
                    <span className="temp-min">{convertTemp(daily.temperature_2m_min[index + 1])}°</span>
                    <div className="temp-bar-bg">
                      <div className="temp-bar-fill" />
                    </div>
                    <span className="temp-max">{convertTemp(daily.temperature_2m_max[index + 1])}°</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}