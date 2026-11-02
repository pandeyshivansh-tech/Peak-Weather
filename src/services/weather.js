import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
} from "lucide-react";

const inRange = (n, a, b) => n >= a && n <= b;

export const isWet = (code) => inRange(code, 51, 67) || inRange(code, 80, 82) || inRange(code, 95, 99);
export const isSnowy = (code) => inRange(code, 71, 77) || inRange(code, 85, 86);

// One name and one icon per WMO weather code family, used everywhere.
export function describe(code, isDay = true) {
  if (code === 0) return { label: isDay ? "Sunny" : "Clear", Icon: isDay ? Sun : Moon, sunny: isDay };
  if (code === 1) return { label: "Mostly clear", Icon: isDay ? CloudSun : CloudMoon, sunny: isDay };
  if (code === 2) return { label: "Partly cloudy", Icon: isDay ? CloudSun : CloudMoon };
  if (code === 3) return { label: "Overcast", Icon: Cloud };
  if (inRange(code, 45, 48)) return { label: "Fog", Icon: CloudFog };
  if (inRange(code, 51, 57)) return { label: "Drizzle", Icon: CloudDrizzle };
  if (inRange(code, 61, 67)) return { label: code >= 65 ? "Heavy rain" : "Rain", Icon: CloudRain };
  if (inRange(code, 71, 77)) return { label: code >= 75 ? "Heavy snow" : "Snow", Icon: CloudSnow };
  if (inRange(code, 80, 82)) return { label: "Showers", Icon: CloudRain };
  if (inRange(code, 85, 86)) return { label: "Snow showers", Icon: CloudSnow };
  if (inRange(code, 95, 99)) return { label: "Thunderstorm", Icon: CloudLightning };
  return { label: "Clear", Icon: isDay ? Sun : Moon };
}

export const hourLabel = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric" }).replace(/\s/g, "").toLowerCase();

export const clockLabel = (iso) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "--";

export function dayLabel(iso, index) {
  if (index === 0) return "Today";
  return new Date(`${iso}T12:00`).toLocaleDateString([], { weekday: "long" });
}

// The next hours from the current one. Times from the API are the city's own
// wall clock with no offset, so they are compared as strings against the
// city's current time, never against this browser's clock.
export function nextHours(hourly, nowIso, count = 24) {
  if (!hourly?.time) return [];
  const hourStart = nowIso ? `${nowIso.slice(0, 13)}:00` : "";
  let start = hourly.time.findIndex((t) => t >= hourStart);
  if (start < 0) start = 0;
  return hourly.time.slice(start, start + count).map((time, i) => ({
    time,
    temp: hourly.temperature_2m[start + i],
    code: hourly.weather_code[start + i],
    rainChance: hourly.precipitation_probability?.[start + i] ?? null,
    isDay: hourly.is_day ? hourly.is_day[start + i] !== 0 : null,
  }));
}

// One plain sentence about the day ahead, the way a person would say it.
export function daySummary(weather) {
  const hours = nextHours(weather.hourly, weather.current.time, 12);
  const now = weather.current;
  if (!hours.length) return "";
  const wetNow = isWet(now.weather_code) || isSnowy(now.weather_code);
  const firstWet = hours.findIndex((h) => isWet(h.code) || isSnowy(h.code) || (h.rainChance ?? 0) >= 60);
  const kind = (h) => (isSnowy(h.code) ? "Snow" : inRange(h.code, 95, 99) ? "Storms" : "Rain");

  if (wetNow) {
    const dryAt = hours.findIndex((h) => !isWet(h.code) && !isSnowy(h.code) && (h.rainChance ?? 0) < 40);
    if (dryAt > 0) return `${describe(now.weather_code).label} easing off around ${clockLabel(hours[dryAt].time)}.`;
    return `${describe(now.weather_code).label} for the next 12 hours. Keep an umbrella close.`;
  }
  if (firstWet > 0) return `${kind(hours[firstWet])} likely from around ${clockLabel(hours[firstWet].time)}.`;
  const max = Math.max(...hours.map((h) => h.temp));
  const min = Math.min(...hours.map((h) => h.temp));
  if (max - min >= 8) return `Dry, with a big swing in temperature over the next 12 hours.`;
  if (now.is_day && now.weather_code <= 1) return "Clear skies for the next 12 hours.";
  return "Dry for the next 12 hours.";
}

export function feelsNote(actual, feels) {
  const d = feels - actual;
  if (d <= -2) return "Wind makes it feel colder.";
  if (d >= 2) return "Humidity makes it feel warmer.";
  return "Close to the actual temperature.";
}

export function humidityNote(h) {
  if (h < 30) return "Dry air.";
  if (h < 60) return "Comfortable.";
  if (h < 80) return "A little sticky.";
  return "Very humid.";
}

export function windNote(kmh) {
  if (kmh < 2) return "Calm.";
  if (kmh < 12) return "Light breeze.";
  if (kmh < 29) return "Breezy.";
  if (kmh < 50) return "Strong wind.";
  return "Gale. Take care outside.";
}

export function compass(deg) {
  if (deg === null || deg === undefined) return "";
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(deg / 45) % 8];
}

export function uvNote(uv) {
  if (uv < 3) return "Low";
  if (uv < 6) return "Moderate";
  if (uv < 8) return "High";
  if (uv < 11) return "Very high";
  return "Extreme";
}

export function pressureNote(hpa) {
  if (hpa < 1000) return "Low. Unsettled weather.";
  if (hpa > 1022) return "High. Settled weather.";
  return "Normal.";
}

export function visibilityNote(km) {
  if (km >= 10) return "Clear view.";
  if (km >= 4) return "Slightly hazy.";
  if (km >= 1) return "Hazy.";
  return "Very poor.";
}

// Share of daylight gone, or null at night.
export function daylight(sunrise, sunset, nowIso) {
  if (!sunrise || !sunset || !nowIso) return null;
  const now = new Date(nowIso).getTime();
  const a = new Date(sunrise).getTime();
  const b = new Date(sunset).getTime();
  if (now < a || now > b) return null;
  return (now - a) / (b - a);
}
