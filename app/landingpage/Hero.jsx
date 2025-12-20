"use client";

import RippleGrid from "@/components/RippleGrid";
import React from "react";

const Hero = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden pt-32">

      {/* 🔥 Ripple Background */}
      <div className="absolute inset-0 z-0">
        <RippleGrid
          gridColor="#580476"
           gridSize={15}
          rippleIntensity={0.01}
          glowIntensity={0.45}   // 🔥 boosted
          gridThickness={12}
          opacity={1}
        />
        {/* lighter overlay so color shows */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* 🔥 Hero Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">

        {/* Badge */}
        <div className="mx-auto mb-6 inline-block rounded-full
                        border border-white/20 bg-white/10
                        px-4 py-1 text-xs text-white/80 backdrop-blur">
          AI-Powered Interactive Learning Platform
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
          Learn Computer Science <br />
          <span className="text-white/70">the Smart Way</span>
        </h1>

        {/* Subtext */}
        <p className="mx-auto mt-6 max-w-2xl text-white/60 leading-relaxed">
          Learnify-AI helps you master DSA, SQL, and core CS concepts
          with AI-generated roadmaps, interactive visualizations,
          and smart practice tools.
        </p>

        {/* CTA */}
        <button className="mt-10 rounded-full bg-white px-8 py-3
                           text-sm font-semibold text-black
                           transition hover:bg-white/90 shadow-lg">
          Get Started
        </button>

      </div>
    </section>
  );
};

export default Hero;
