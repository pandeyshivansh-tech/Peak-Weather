import { useEffect, useRef } from "react";

export default function WeatherEffectsCanvas({ weatherCode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Respect reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let mouseSpeedX = 0;
    let mouseSpeedY = 0;
    let lastMouseX = mouseX;
    let lastMouseY = mouseY;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouseSpeedX = (e.clientX - lastMouseX) * 0.15;
      mouseSpeedY = (e.clientY - lastMouseY) * 0.15;
      mouseX = e.clientX;
      mouseY = e.clientY;
      lastMouseX = mouseX;
      lastMouseY = mouseY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    // Weather type detection
    const isThunder = weatherCode >= 95 && weatherCode <= 99;
    const isRain = (weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82) || isThunder;
    const isSnow = (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86);
    const isFog = weatherCode >= 45 && weatherCode <= 48;
    const isSun = weatherCode === 0;

    const particles = [];
    const particleCount = isThunder ? 90 : isRain ? 75 : isSnow ? 55 : isFog ? 25 : isSun ? 20 : 30;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: isSnow ? Math.random() * 3 + 1.2 : isFog ? Math.random() * 70 + 40 : Math.random() * 22 + 8,
        length: isRain ? Math.random() * 25 + 12 : 0,
        speedY: isRain ? Math.random() * 14 + 9 : isSnow ? Math.random() * 1.8 + 0.6 : isFog ? Math.random() * 0.2 + 0.05 : Math.random() * 0.4 + 0.1,
        speedX: isRain ? Math.random() * 1.2 - 0.6 : isSnow ? Math.random() * 1.2 - 0.6 : isFog ? Math.random() * 0.3 - 0.15 : Math.random() * 0.5 - 0.25,
        opacity: isRain ? Math.random() * 0.45 + 0.2 : isSnow ? Math.random() * 0.7 + 0.3 : isFog ? Math.random() * 0.15 + 0.05 : Math.random() * 0.2 + 0.05,
        swayPhase: Math.random() * Math.PI * 2,
      });
    }

    let lightningFlash = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Random lightning flash during thunderstorms
      if (isThunder) {
        if (Math.random() < 0.008 && lightningFlash <= 0) {
          lightningFlash = Math.random() * 0.35 + 0.15;
        }
        if (lightningFlash > 0) {
          ctx.fillStyle = `rgba(224, 231, 255, ${lightningFlash})`;
          ctx.fillRect(0, 0, width, height);
          lightningFlash -= 0.03;
        }
      }

      particles.forEach((p) => {
        p.swayPhase += 0.02;

        if (isRain) {
          ctx.beginPath();
          const slant = p.speedX + mouseSpeedX * 0.2;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + slant * 2, p.y + p.length);
          ctx.strokeStyle = isThunder ? `rgba(199, 210, 254, ${p.opacity})` : `rgba(186, 230, 253, ${p.opacity})`;
          ctx.lineWidth = isThunder ? 2 : 1.5;
          ctx.stroke();

          p.y += p.speedY;
          p.x += p.speedX + mouseSpeedX * 0.05;

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
          p.x += Math.sin(p.swayPhase) * 1.2 + mouseSpeedX * 0.05;

          if (p.y > height) {
            p.y = -p.radius;
            p.x = Math.random() * width;
          }
        } else if (isFog) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          grad.addColorStop(0, `rgba(241, 245, 249, ${p.opacity})`);
          grad.addColorStop(1, "rgba(241, 245, 249, 0)");
          ctx.fillStyle = grad;
          ctx.fill();

          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x > width + p.radius) p.x = -p.radius;
          if (p.x < -p.radius) p.x = width + p.radius;
        } else {
          // Sunny / Ambient dust sparkles
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          grad.addColorStop(0, isSun ? `rgba(254, 240, 138, ${p.opacity})` : `rgba(186, 230, 253, ${p.opacity})`);
          grad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = grad;
          ctx.fill();

          p.x += p.speedX + Math.sin(p.swayPhase) * 0.3;
          p.y += p.speedY;

          if (p.y < -p.radius) p.y = height + p.radius;
          if (p.x > width + p.radius) p.x = -p.radius;
          if (p.x < -p.radius) p.x = width + p.radius;
        }
      });

      // Dampen mouse inertia
      mouseSpeedX *= 0.92;
      mouseSpeedY *= 0.92;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
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
        zIndex: 0,
      }}
    />
  );
}
