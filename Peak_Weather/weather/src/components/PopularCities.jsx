import { motion } from "framer-motion";
import { Cloud, Sun, CloudRain, Wind } from "lucide-react";

const cities = [
  { name: "Tokyo", icon: Sun, temp: "22°", condition: "Sunny" },
  { name: "New York", icon: Cloud, temp: "15°", condition: "Cloudy" },
  { name: "London", icon: CloudRain, temp: "10°", condition: "Rainy" },
  { name: "Paris", icon: Wind, temp: "18°", condition: "Breezy" },
];

function PopularCities({ onCityClick }) {
  return (
    <motion.div 
      className="popular-cities-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <h3 className="popular-cities-title">Popular Destinations</h3>
      <div className="cities-grid">
        {cities.map((city, index) => (
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
              <city.icon size={24} className="city-icon" />
            </div>
            <div className="city-card-body">
              <span className="city-temp">{city.temp}</span>
              <span className="city-cond">{city.condition}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default PopularCities;
