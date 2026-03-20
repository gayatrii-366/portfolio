"use client";

import { useRef, useEffect } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { useTheme } from 'next-themes';

export default function CanvasScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, 120]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const render = () => {
      const currentFrame = frameIndex.get();
      const width = canvas.width;
      const height = canvas.height;
      const isDark = document.documentElement.classList.contains("dark");

      // Adaptive background
      ctx.fillStyle = isDark ? "#0a0a0a" : "#fdfdfd";
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const progress = currentFrame / 120;

      ctx.save();
      ctx.translate(centerX, centerY);

      const lines = 64;
      const radius = Math.min(width, height) * 0.32 + progress * Math.min(width, height) * 0.12;

      for (let i = 0; i < lines; i++) {
        const angle = (i / lines) * Math.PI * 2 + progress * Math.PI * 0.5;
        const noise = Math.sin(angle * 7 + progress * 12) * (25 + progress * 55);
        const rPos = radius + noise;
        const x = Math.cos(angle) * rPos;
        const y = Math.sin(angle) * rPos;

        // Spoke lines
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.strokeStyle = isDark
          ? `rgba(255,255,255,${0.06 - progress * 0.02})`
          : `rgba(0,0,0,${0.08 - progress * 0.03})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Nodes
        ctx.beginPath();
        const nodeSize = 1.5 + Math.sin(i + progress * 15) * 1.2;
        ctx.arc(x, y, nodeSize, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(255,255,255,${0.35 + progress * 0.4})`
          : `rgba(0,0,0,${0.3 + progress * 0.4})`;
        ctx.fill();

        // Connect adjacent nodes
        if (i > 0) {
          const pAngle = ((i - 1) / lines) * Math.PI * 2 + progress * Math.PI * 0.5;
          const pNoise = Math.sin(pAngle * 7 + progress * 12) * (25 + progress * 55);
          const px = Math.cos(pAngle) * (radius + pNoise);
          const py = Math.sin(pAngle) * (radius + pNoise);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(px, py);
          ctx.strokeStyle = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
          ctx.stroke();
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [frameIndex, resolvedTheme]);

  const headingOpacity = useTransform(scrollYProgress, [0, 0.35, 0.55], [1, 1, 0]);
  const headingY = useTransform(scrollYProgress, [0, 1], [0, -350]);

  return (
    <div ref={containerRef} className="h-[250vh] relative w-full" id="intro">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-8 text-center">
          <motion.div style={{ opacity: headingOpacity, y: headingY }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-sans font-bold tracking-tighter text-[var(--fg)] mb-6">
              Selected Work &amp; Experience
            </h1>
            <p className="text-[var(--muted)] font-mono text-sm tracking-[0.25em] uppercase">
              Scroll to explore
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
