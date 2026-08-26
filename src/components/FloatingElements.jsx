import { motion } from "framer-motion";
import { Sun, Cloud, CloudLightning, Snowflake, Moon } from "lucide-react";

function FloatingElements({ weatherCode = null, isDay = 1, temperature = null, snowfall = 0 }) {
  // If no weather loaded (Home state): Show ambient mix of sun, clouds, snow
  if (weatherCode === null || weatherCode === undefined) {
    return (
      <div className="floating-elements-container">
        <motion.div
          className="floating-icon floating-sun"
          animate={{ y: [0, -20, 0], rotate: [0, 15, -15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sun size={120} />
        </motion.div>
        <motion.div
          className="floating-icon floating-cloud-1"
          animate={{ y: [0, 15, 0], x: [0, -15, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <Cloud size={110} />
        </motion.div>
        <motion.div
          className="floating-icon floating-cloud-2"
          animate={{ y: [0, -12, 0], x: [0, 18, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <CloudLightning size={85} />
        </motion.div>
        <motion.div
          className="floating-icon floating-snow"
          animate={{ y: [0, 20, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
        >
          <Snowflake size={65} />
        </motion.div>
      </div>
    );
  }

  // Active City Weather
  const isExplicitSnow = (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86) || (snowfall && snowfall > 0);
  const isFreezingSnow = temperature !== undefined && temperature !== null && (temperature <= -2 || (temperature <= 0 && weatherCode >= 1));
  const isSnow = isExplicitSnow || isFreezingSnow;
  const isThunder = weatherCode >= 95 && weatherCode <= 99;
  const isFog = weatherCode >= 45 && weatherCode <= 48;
  const isSunny = weatherCode === 0 && !isSnow;
  const isPartlyCloudy = weatherCode >= 1 && weatherCode <= 3 && !isSnow;

  return (
    <div className="floating-elements-container">
      {/* Sunny / Clear Day: Glowing floating Sun */}
      {isSunny && isDay !== 0 && (
        <motion.div
          className="floating-icon floating-sun-active"
          animate={{ rotate: 360, scale: [1, 1.05, 1] }}
          transition={{
            rotate: { duration: 40, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <Sun size={140} />
        </motion.div>
      )}

      {/* Clear Night: Glowing Moon */}
      {isSunny && isDay === 0 && (
        <motion.div
          className="floating-icon floating-moon-active"
          animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Moon size={110} />
        </motion.div>
      )}

      {/* Partly Cloudy / Overcast / Fog: Drifting background clouds */}
      {(isPartlyCloudy || isFog) && (
        <>
          <motion.div
            className="floating-icon floating-cloud-main"
            animate={{ x: [-35, 35, -35], y: [0, -12, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          >
            <Cloud size={135} />
          </motion.div>
          <motion.div
            className="floating-icon floating-cloud-sub"
            animate={{ x: [30, -30, 30], y: [0, 14, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          >
            <Cloud size={95} />
          </motion.div>
        </>
      )}

      {/* Thunderstorm: Storm cloud with lightning */}
      {isThunder && (
        <motion.div
          className="floating-icon floating-thunder"
          animate={{ y: [0, 12, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <CloudLightning size={130} />
        </motion.div>
      )}

      {/* Snow & Sub-zero Freezing Polar (Antarctica): Floating gentle snowflakes */}
      {isSnow && (
        <>
          <motion.div
            className="floating-icon floating-snow-1"
            animate={{ y: [0, 25, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            <Snowflake size={75} />
          </motion.div>
          <motion.div
            className="floating-icon floating-snow-2"
            animate={{ y: [0, -20, 0], rotate: [360, 180, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 1 }}
          >
            <Snowflake size={55} />
          </motion.div>
        </>
      )}
    </div>
  );
}

export default FloatingElements;
