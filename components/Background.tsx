import React, { useEffect, useRef } from 'react';

interface BackgroundProps {
  isDarkMode?: boolean;
}

export const Background: React.FC<BackgroundProps> = ({ isDarkMode = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      type: string;
      opacity: number;
      fadeSpeed: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 20 + 10;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;

        // Tùy mode mà cho độ mờ khác nhau:
        if (isDarkMode) {
          // Dark: emoji sáng hơn nền nhưng không chói
          this.opacity = Math.random() * 0.35 + 0.2;    // 0.2 – 0.55
          this.fadeSpeed = Math.random() * 0.004 + 0.002;
        } else {
          // Light: emoji mờ hơn, không cạnh tranh với chữ đen
          this.opacity = Math.random() * 0.2 + 0.08;    // 0.08 – 0.28
          this.fadeSpeed = Math.random() * 0.003 + 0.0015;
        }

        const lightShapes = ["☁️", "❤️", "✨", "🌸"];
        const darkShapes = ["🌙", "⭐", "🪐", "✨"];
        const shapes = isDarkMode ? darkShapes : lightShapes;
        this.type = shapes[Math.floor(Math.random() * shapes.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around
        if (this.x > canvas!.width) this.x = 0;
        if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        if (this.y < 0) this.y = canvas!.height;

        // Twinkle effect
        this.opacity += this.fadeSpeed;

        const minOpacity = isDarkMode ? 0.15 : 0.06;
        const maxOpacity = isDarkMode ? 0.6 : 0.3;

        if (this.opacity > maxOpacity || this.opacity < minOpacity) {
          this.fadeSpeed = -this.fadeSpeed;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.font = `${this.size}px serif`;
        ctx.globalAlpha = this.opacity;
        ctx.fillText(this.type, this.x, this.y);
        ctx.globalAlpha = 1.0;
      }
    }

    const initParticles = () => {
      particles = [];
      const baseDivider = isDarkMode ? 23000 : 28000;
      const numberOfParticles = Math.floor((canvas.width * canvas.height) / baseDivider);
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  return (
    <div className="fixed inset-0 -z-50 transition-colors duration-1000 ease-in-out bg-rose-50 dark:bg-slate-900 overflow-hidden">
      {/* Soft Gradient Overlay - Warm light mode to reduce glare */}
      <div 
        className={`
          absolute inset-0 bg-gradient-to-br transition-opacity duration-1000 -z-10
          ${isDarkMode 
            ? 'from-slate-900 via-indigo-950 to-slate-900 opacity-100' 
            : 'from-orange-50 via-pink-50 to-blue-50 opacity-90'}
        `} 
      />
      <canvas ref={canvasRef} className="absolute inset-0 block" />
    </div>
  );
};