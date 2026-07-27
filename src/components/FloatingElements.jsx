import { motion } from "framer-motion";
import { Sun, Cloud, CloudLightning, Snowflake } from "lucide-react";

function FloatingElements() {
  return (
    <div className="floating-elements-container">
      <motion.div
        className="floating-icon floating-sun"
        animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sun size={120} />
      </motion.div>
      <motion.div
        className="floating-icon floating-cloud-1"
        animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <Cloud size={100} />
      </motion.div>
      <motion.div
        className="floating-icon floating-cloud-2"
        animate={{ y: [0, -10, 0], x: [0, 15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <CloudLightning size={80} />
      </motion.div>
      <motion.div
        className="floating-icon floating-snow"
        animate={{ y: [0, 20, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        <Snowflake size={60} />
      </motion.div>
    </div>
  );
}

export default FloatingElements;
