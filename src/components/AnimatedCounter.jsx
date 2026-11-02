import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export default function AnimatedCounter({ value, decimals = 0, suffix = "", prefix = "" }) {
  const numericValue = typeof value === "number" ? value : parseFloat(value) || 0;

  const spring = useSpring(numericValue, {
    // Critically damped: it settles on the number without overshooting it.
    mass: 1,
    stiffness: 110,
    damping: 21,
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
