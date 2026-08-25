import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cloud, Sun, CloudRain, Wind, CloudFog, CloudLightning, CloudDrizzle, Snowflake } from "lucide-react";

const POPULAR_CONFIG = [
  { name: "Tokyo", lat: 35.6895, lon: 139.6917, defaultTemp: 22, defaultCondition: "Sunny", defaultIcon: Sun },
  { name: "New York", lat: 40.7128, lon: -74.006, defaultTemp: 16, defaultCondition: "Cloudy", defaultIcon: Cloud },
  { name: "London", lat: 51.5074, lon: -0.1278, defaultTemp: 12, defaultCondition: "Rainy", defaultIcon: CloudRain },
  { name: "Paris", lat: 48.8566, lon: 2.3522, defaultTemp: 18, defaultCondition: "Breezy", defaultIcon: Wind },
];

const getWeatherDetails = (code) => {
  if (code === 0) return { condition: "Clear", icon: Sun };
  if (code >= 1 && code <= 3) return { condition: "Partly Cloudy", icon: Cloud };
  if (code >= 45 && code <= 48) return { condition: "Foggy", icon: CloudFog };
  if (code >= 51 && code <= 55) return { condition: "Drizzle", icon: CloudDrizzle };
  if (code >= 61 && code <= 67) return { condition: "Rainy", icon: CloudRain };
  if (code >= 71 && code <= 77) return { condition: "Snowy", icon: Snowflake };
  if (code >= 95 && code <= 99) return { condition: "Stormy", icon: CloudLightning };
  return { condition: "Clear", icon: Sun };
};

export default function PopularCities({ onCityClick, unit = "C", convertTemp = (t) => t }) {
  const [cityData, setCityData] = useState(
    POPULAR_CONFIG.map((c) => ({
      name: c.name,
      temp: c.defaultTemp,
      condition: c.defaultCondition,
      icon: c.defaultIcon,
    }))
  );

  useEffect(() => {
    // Fetch live weather data for popular cities in background
    let isMounted = true;
    const fetchCityWeather = async () => {
      try {
        const promises = POPULAR_CONFIG.map(async (c) => {
          try {
            const res = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,weather_code`
            );
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            const { condition, icon } = getWeatherDetails(data.current?.weather_code ?? 0);
            return {
              name: c.name,
              temp: data.current?.temperature_2m ?? c.defaultTemp,
              condition,
              icon,
            };
          } catch {
            return {
              name: c.name,
              temp: c.defaultTemp,
              condition: c.defaultCondition,
              icon: c.defaultIcon,
            };
          }
        });

        const results = await Promise.all(promises);
        if (isMounted) setCityData(results);
      } catch (err) {
        console.warn("Could not fetch popular cities weather:", err);
      }
    };

    fetchCityWeather();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <motion.div 
      className="popular-cities-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <h3 className="popular-cities-title">Popular Destinations</h3>
      <div className="cities-grid">
        {cityData.map((city, index) => {
          const Icon = city.icon;
          const displayTemp = convertTemp(city.temp);

          return (
            <motion.div
              key={city.name}
              className="city-card glass"
              whileHover={{ scale: 1.05, y: -5, transition: { duration: 0.2, delay: 0 } }}
              whileTap={{ scale: 0.95, transition: { duration: 0.1, delay: 0 } }}
              onClick={() => onCityClick(city.name)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
            >
              <div className="city-card-header">
                <h4>{city.name}</h4>
                <Icon size={24} className="city-icon" />
              </div>
              <div className="city-card-body">
                <span className="city-temp">{displayTemp}°{unit}</span>
                <span className="city-cond">{city.condition}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
