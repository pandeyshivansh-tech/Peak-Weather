import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export default function AnimatedCounter({ value, decimals = 0, suffix = "", prefix = "" }) {
  const numericValue = typeof value === "number" ? value : parseFloat(value) || 0;

  const spring = useSpring(numericValue, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });

  const display = useTransform(spring, (current) => {
    if (decimals > 0) {
      return current.toFixed(decimals);
    }
    return Math.round(current).toString();
  });

  useEffect(() => {
    spring.set(numericValue);
  }, [numericValue, spring]);

  return (
    <span className="animated-counter">
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}
