import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function CursorAura() {
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useSpring(-200, { stiffness: 500, damping: 40 });
  const cursorY = useSpring(-200, { stiffness: 500, damping: 40 });

  useEffect(() => {
    // Only enable on desktop pointer devices with fine cursors
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="cursor-aura-boundary">
      <motion.div
        className="cursor-aura"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </div>
  );
}
