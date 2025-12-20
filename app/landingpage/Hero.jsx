"use client"
import React, { useEffect, useRef } from 'react';

const RippleGrid = ({ 
  gridColor = "#580476", 
  rippleIntensity = 0.05, 
  glowIntensity = 0.45, 
  gridThickness = 12, 
  opacity = 1 
}) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;
    
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const gridSize = 50;
      time += 0.02;
      
      // Draw vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.globalAlpha = opacity * 0.3;
        
        for (let y = 0; y < canvas.height; y += 5) {
          const wave = Math.sin(time + x * 0.01 + y * 0.01) * rippleIntensity * 20;
          const glow = Math.abs(Math.sin(time + x * 0.02)) * glowIntensity;
          
          if (y === 0) {
            ctx.moveTo(x + wave, y);
          } else {
            ctx.lineTo(x + wave, y);
          }
          
          ctx.globalAlpha = opacity * (0.3 + glow);
        }
        
        ctx.stroke();
      }
      
      // Draw horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.globalAlpha = opacity * 0.3;
        
        for (let x = 0; x < canvas.width; x += 5) {
          const wave = Math.sin(time + x * 0.01 + y * 0.01) * rippleIntensity * 20;
          const glow = Math.abs(Math.sin(time + y * 0.02)) * glowIntensity;
          
          if (x === 0) {
            ctx.moveTo(x, y + wave);
          } else {
            ctx.lineTo(x, y + wave);
          }
          
          ctx.globalAlpha = opacity * (0.3 + glow);
        }
        
        ctx.stroke();
      }
      
      animationFrameId = requestAnimationFrame(drawGrid);
    };
    
    drawGrid();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gridColor, rippleIntensity, glowIntensity, gridThickness, opacity]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
};

const Hero = () => {
  return (
    <div className="min-h-screen w-full bg-black">
      {/* Header */}
      {/* <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="text-xl font-bold text-white">LEARNIFY-AI</div>
          <nav className="hidden md:flex gap-8">
            <a href="#" className="text-white/80 hover:text-white transition">Home</a>
            <a href="#" className="text-white/80 hover:text-white transition">Features</a>
            <a href="#" className="text-white/80 hover:text-white transition">Courses</a>
          </nav>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
        </div>
      </header> */}

      {/* Hero Section */}
      <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Ripple Background */}
        <div className="absolute inset-0 z-0">
          <RippleGrid
            gridColor="#8b5cf6"
            rippleIntensity={0.08}
            glowIntensity={0.6}
            gridThickness={12}
            opacity={1}
          />
          {/* Dark overlay to make text readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center py-20">
          {/* Badge */}
          <div className="mx-auto mb-8 inline-flex items-center rounded-full
                          border border-purple-500/30 bg-purple-500/10
                          px-4 py-2 text-sm text-purple-300 backdrop-blur-sm
                          shadow-lg shadow-purple-500/20">
            ✨ AI-Powered Interactive Learning Platform
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
            Learn Computer Science<br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              the Smart Way
            </span>
          </h1>

          {/* Subtext */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70 leading-relaxed">
            Learnify-AI helps you master DSA, SQL, and core CS concepts
            with AI-generated roadmaps, interactive visualizations,
            and smart practice tools.
          </p>

          {/* CTA Button */}
          <button className="mt-12 rounded-full bg-white px-10 py-4
                           text-base font-semibold text-black
                           transition-all duration-300 hover:bg-white/90 hover:scale-105 
                           shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50">
            Get Started
          </button>

          {/* Optional: Add some feature highlights */}
          <div className="mt-20 flex flex-wrap justify-center gap-8 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span>AI-Powered Roadmaps</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span>Interactive Visualizations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span>Smart Practice Tools</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;