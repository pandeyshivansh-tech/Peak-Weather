import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Sun, Cloud, CloudDrizzle, CloudRain, CloudSnow, CloudLightning, CloudFog, Activity, LayoutGrid } from "lucide-react";

const getWeatherDetails = (code) => {
  if (code === 0) return { icon: Sun, color: "#fbbf24", label: "Clear" };
  if (code >= 1 && code <= 3) return { icon: Cloud, color: "#94a3b8", label: "Cloudy" };
  if (code >= 45 && code <= 48) return { icon: CloudFog, color: "#cbd5e1", label: "Fog" };
  if (code >= 51 && code <= 55) return { icon: CloudDrizzle, color: "#60a5fa", label: "Drizzle" };
  if (code >= 61 && code <= 67) return { icon: CloudRain, color: "#3b82f6", label: "Rain" };
  if (code >= 71 && code <= 77) return { icon: CloudSnow, color: "#e2e8f0", label: "Snow" };
  if (code >= 95 && code <= 99) return { icon: CloudLightning, color: "#818cf8", label: "Storm" };
  return { icon: Sun, color: "#fbbf24", label: "Clear" };
};

const formatHour = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Helper for generating smooth SVG bezier curves
function generateSmoothPath(points) {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function HourlyForecast({ hourly, unit, convertTemp }) {
  const [viewMode, setViewMode] = useState("chart"); // 'chart' | 'cards'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!hourly || !hourly.time) return null;

  // Take the next 24 hours
  const now = new Date();
  const currentIndex = hourly.time.findIndex((t) => new Date(t) >= now);
  const startIdx = currentIndex !== -1 ? currentIndex : 0;
  const hoursData = hourly.time.slice(startIdx, startIdx + 24).map((time, idx) => ({
    time,
    rawTemp: hourly.temperature_2m[startIdx + idx],
    temp: convertTemp(hourly.temperature_2m[startIdx + idx]),
    code: hourly.weather_code[startIdx + idx],
  }));

  // Wave Chart Calculation
  const temps = hoursData.map((d) => d.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = Math.max(maxTemp - minTemp, 1);

  const chartWidth = 680;
  const chartHeight = 130;
  const paddingX = 20;
  const paddingY = 25;

  const points = hoursData.map((d, i) => {
    const x = paddingX + (i / (hoursData.length - 1)) * (chartWidth - paddingX * 2);
    const normalizedY = (d.temp - minTemp) / tempRange;
    const y = chartHeight - paddingY - normalizedY * (chartHeight - paddingY * 2);
    return { x, y, ...d };
  });

  const curvePath = generateSmoothPath(points);
  const areaPath = `${curvePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  const activeHoverPoint = hoveredIndex !== null ? points[hoveredIndex] : points[0];
  const { icon: HoverIcon, color: hoverColor, label: hoverLabel } = activeHoverPoint ? getWeatherDetails(activeHoverPoint.code) : {};

  return (
    <motion.div
      className="hourly-forecast-section glass"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="forecast-header-row">
        <div className="forecast-title">
          <Clock size={20} />
          <span>24-Hour Forecast Dynamic Wave</span>
        </div>
        <div className="view-mode-toggle glass">
          <button
            type="button"
            className={viewMode === "chart" ? "active" : ""}
            onClick={() => setViewMode("chart")}
            title="Interactive Wave Chart"
          >
            <Activity size={14} />
            <span>Wave</span>
          </button>
          <button
            type="button"
            className={viewMode === "cards" ? "active" : ""}
            onClick={() => setViewMode("cards")}
            title="Card Slider View"
          >
            <LayoutGrid size={14} />
            <span>Cards</span>
          </button>
        </div>
      </div>

      {viewMode === "chart" ? (
        <div className="hourly-chart-container">
          {/* Active Hover Detail Pill */}
          <div className="chart-active-pill glass">
            {HoverIcon && <HoverIcon size={18} color={hoverColor} />}
            <span className="pill-hour">{hoveredIndex === null ? "Now" : formatHour(activeHoverPoint.time)}</span>
            <span className="pill-temp">{activeHoverPoint.temp}°{unit}</span>
            <span className="pill-label">{hoverLabel}</span>
          </div>

          <div
            className="svg-wave-wrapper"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
              className="hourly-wave-svg"
            >
              <defs>
                <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(56, 189, 248, 0.45)" />
                  <stop offset="60%" stopColor="rgba(129, 140, 248, 0.15)" />
                  <stop offset="100%" stopColor="rgba(129, 140, 248, 0)" />
                </linearGradient>
                <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>

              {/* Area Fill */}
              <motion.path
                d={areaPath}
                fill="url(#waveGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              />

              {/* Glowing Stroke Curve */}
              <motion.path
                d={curvePath}
                fill="none"
                stroke="url(#strokeGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
              />

              {/* Data points & Interactive Hover Hotspots */}
              {points.map((p, i) => (
                <g key={p.time}>
                  {/* Subtle static dot every 3 hours */}
                  {i % 3 === 0 && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="3.5"
                      fill="#ffffff"
                      stroke="#818cf8"
                      strokeWidth="2"
                    />
                  )}

                  {/* Scrubber Hotspot */}
                  <rect
                    x={p.x - 14}
                    y="0"
                    width="28"
                    height={chartHeight}
                    fill="transparent"
                    onMouseEnter={() => setHoveredIndex(i)}
                    style={{ cursor: "pointer" }}
                  />
                </g>
              ))}

              {/* Active Scrubber Indicator */}
              {hoveredIndex !== null && (
                <g>
                  <line
                    x1={activeHoverPoint.x}
                    y1="0"
                    x2={activeHoverPoint.x}
                    y2={chartHeight}
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeDasharray="4 4"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={activeHoverPoint.x}
                    cy={activeHoverPoint.y}
                    r="6"
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="active-scrubber-dot"
                  />
                </g>
              )}
            </svg>

            {/* Time labels below wave */}
            <div className="wave-time-labels">
              {points.filter((_, i) => i % 3 === 0).map((p) => (
                <span key={p.time} style={{ left: `${(p.x / chartWidth) * 100}%` }}>
                  {formatHour(p.time)}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="hourly-slider">
          {hoursData.map((item, index) => {
            const { icon: HourIcon, color } = getWeatherDetails(item.code);
            const isNow = index === 0;

            return (
              <motion.div
                key={item.time}
                className={`hourly-card ${isNow ? "now-card" : ""}`}
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <span className="hourly-time">{isNow ? "Now" : formatHour(item.time)}</span>
                <HourIcon size={24} color={color} className="hourly-icon" />
                <span className="hourly-temp">{item.temp}°{unit}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
