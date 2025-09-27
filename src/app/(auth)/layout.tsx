"use client";

import { ReactNode, useEffect, useRef } from "react";
import Link from "next/link";
import { Home } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particles: { x: number; y: number; alpha: number }[] = [];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let animationFrame: number;
    let mouseX = 0;
    let mouseY = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Push a new particle
      particles.push({
        x: mouseX,
        y: mouseY,
        alpha: 1,
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      particles.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(11, 135, 79, ${p.alpha})`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#0B874F";
        ctx.fill();
        ctx.closePath();

        // Fade and move particle slightly upward
        p.alpha -= 0.02;
        p.y -= 0.5;

        // Remove invisible particles
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      });

      animationFrame = requestAnimationFrame(draw);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div
      className="relative flex items-center justify-center min-h-screen px-4 py-8 md:py-4 overflow-hidden"
      style={{
        backgroundColor: "#000",
        fontFamily: "monospace",
      }}
    >
      {/* Global navbar is present; removed page-specific home button */}
      {/* Glowy Cursor Trail Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 5 }}
      />

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#001F1D] to-black animate-pulse opacity-40 z-0"></div>
      
      {/* Animated Grid Scan Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_0%,rgba(11,135,79,0.1)_50%,transparent_100%)] bg-[size:100%_4px] animate-pulse opacity-20 z-0"></div>

      {/* Enhanced Hacker Grid System */}
      {/* Primary Grid - Large squares */}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(11,135,79,0.12)_25%,rgba(11,135,79,0.12)_26%,transparent_27%,transparent_74%,rgba(11,135,79,0.12)_75%,rgba(11,135,79,0.12)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(11,135,79,0.12)_25%,rgba(11,135,79,0.12)_26%,transparent_27%,transparent_74%,rgba(11,135,79,0.12)_75%,rgba(11,135,79,0.12)_76%,transparent_77%,transparent)] bg-[size:120px_120px] opacity-50 z-0"></div>
      
      {/* Secondary Grid - Medium squares */}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(11,135,79,0.08)_25%,rgba(11,135,79,0.08)_26%,transparent_27%,transparent_74%,rgba(11,135,79,0.08)_75%,rgba(11,135,79,0.08)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(11,135,79,0.08)_25%,rgba(11,135,79,0.08)_26%,transparent_27%,transparent_74%,rgba(11,135,79,0.08)_75%,rgba(11,135,79,0.08)_76%,transparent_77%,transparent)] bg-[size:80px_80px] opacity-45 z-0"></div>
      
      {/* Tertiary Grid - Small squares */}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(11,135,79,0.06)_25%,rgba(11,135,79,0.06)_26%,transparent_27%,transparent_74%,rgba(11,135,79,0.06)_75%,rgba(11,135,79,0.06)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(11,135,79,0.06)_25%,rgba(11,135,79,0.06)_26%,transparent_27%,transparent_74%,rgba(11,135,79,0.06)_75%,rgba(11,135,79,0.06)_76%,transparent_77%,transparent)] bg-[size:40px_40px] opacity-40 z-0"></div>
      
      {/* Diagonal Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_40%,rgba(11,135,79,0.04)_41%,rgba(11,135,79,0.04)_42%,transparent_43%,transparent_57%,rgba(11,135,79,0.04)_58%,rgba(11,135,79,0.04)_59%,transparent_60%),linear-gradient(-45deg,transparent_40%,rgba(11,135,79,0.04)_41%,rgba(11,135,79,0.04)_42%,transparent_43%,transparent_57%,rgba(11,135,79,0.04)_58%,rgba(11,135,79,0.04)_59%,transparent_60%)] bg-[size:100px_100px] opacity-35 z-0"></div>
      
      {/* Radial Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(11,135,79,0.05)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30 z-0"></div>

      {/* Form Container */}
      <div
        className="relative w-full max-w-[420px] mx-4 p-4 md:p-8 rounded-lg shadow-xl border transform transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_25px_#0B874F] z-10 mt-16 md:mt-0"
        style={{
          backgroundColor: "#050505",
          borderColor: "#0B874F",
          boxShadow: "12px 12px 0px #0B874F",
        }}
      >
        {children}

        {/* Hacker Glow */}
        <div
          className="absolute inset-0 rounded-lg pointer-events-none blur-3xl opacity-20"
          style={{ backgroundColor: "#0B874F" }}
        ></div>
      </div>
    </div>
  );
}
