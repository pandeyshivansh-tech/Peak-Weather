import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function TiltCard({ children, className = "", maxTilt = 8, ...props }) {
  const cardRef = useRef(null);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const mouseXSpring = useSpring(x, { stiffness: 280, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 280, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseXSpring, [0, 1], [-maxTilt, maxTilt]);

  const sheenX = useTransform(mouseXSpring, [0, 1], ["0%", "100%"]);
  const sheenY = useTransform(mouseYSpring, [0, 1], ["0%", "100%"]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`tilt-card-wrapper ${className}`}
      {...props}
    >
      {children}
      <motion.div
        className="tilt-specular-sheen"
        style={{
          background: useTransform(
            [sheenX, sheenY],
            ([sx, sy]) =>
              `radial-gradient(circle 320px at ${sx} ${sy}, rgba(255, 255, 255, 0.15), transparent 70%)`
          ),
        }}
      />
    </motion.div>
  );
}
