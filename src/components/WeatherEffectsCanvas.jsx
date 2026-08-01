import { useEffect, useRef } from "react";

export default function WeatherEffectsCanvas({ weatherCode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Disable if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Weather particles logic
    const isRain = (weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82) || (weatherCode >= 95 && weatherCode <= 99);
    const isSnow = (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86);
    const isFog = weatherCode >= 45 && weatherCode <= 48;
    const isSun = weatherCode === 0;

    const particles = [];
    const particleCount = isRain ? 60 : isSnow ? 40 : isFog ? 25 : isSun ? 15 : 0;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: isSnow ? Math.random() * 3 + 1 : isFog ? Math.random() * 60 + 30 : Math.random() * 20 + 10,
        length: isRain ? Math.random() * 20 + 10 : 0,
        speedY: isRain ? Math.random() * 12 + 8 : isSnow ? Math.random() * 1.5 + 0.5 : isFog ? Math.random() * 0.2 + 0.05 : Math.random() * 0.3 + 0.1,
        speedX: isRain ? Math.random() * 1 - 0.5 : isSnow ? Math.random() * 1 - 0.5 : isFog ? Math.random() * 0.3 - 0.15 : Math.random() * 0.4 - 0.2,
        opacity: isRain ? Math.random() * 0.4 + 0.2 : isSnow ? Math.random() * 0.6 + 0.3 : isFog ? Math.random() * 0.15 + 0.05 : Math.random() * 0.15 + 0.05
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        if (isRain) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + p.length);
          ctx.strokeStyle = `rgba(180, 220, 255, ${p.opacity})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y > height) {
            p.y = -p.length;
            p.x = Math.random() * width;
          }
        } else if (isSnow) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.fill();

          p.y += p.speedY;
          p.x += Math.sin(p.y * 0.02) * 0.5;

          if (p.y > height) {
            p.y = -p.radius;
            p.x = Math.random() * width;
          }
        } else if (isFog) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          grad.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
          grad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = grad;
          ctx.fill();

          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x > width + p.radius) p.x = -p.radius;
          if (p.x < -p.radius) p.x = width + p.radius;
        } else if (isSun) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          grad.addColorStop(0, `rgba(255, 235, 170, ${p.opacity})`);
          grad.addColorStop(1, "rgba(255, 235, 170, 0)");
          ctx.fillStyle = grad;
          ctx.fill();

          p.x += p.speedX;
          p.y += p.speedY;

          if (p.y < -p.radius) p.y = height + p.radius;
          if (p.x > width + p.radius) p.x = -p.radius;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [weatherCode]);

  return (
    <canvas
      ref={canvasRef}
      className="weather-canvas"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0
      }}
    />
  );
}
