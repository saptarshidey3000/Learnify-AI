import React from 'react';
import Link from "next/link";
import Particles from '@/components/Particles';

// Mock ScrollStack components - replace with your actual imports
const ScrollStack = ({ children }) => {
  return (
    <div className="relative">
      {children}
    </div>
  );
};

const ScrollStackItem = ({ children }) => {
  return (
    <div className="sticky top-20 mb-8">
      {children}
    </div>
  );
};

const features = [
  {
    id: 1,
    category: "Core Learning",
    title: "AI Course Generator",
    description: "Automatically generate structured CS courses tailored to your learning goals and pace.",
    longDescription: "Our AI Course Generator uses advanced machine learning algorithms to create personalized learning paths. It analyzes your current skill level, learning preferences, and career goals to build a comprehensive curriculum that adapts as you progress.",
    benefits: [
      "Personalized learning paths based on your goals",
      "Adaptive curriculum that evolves with you",
      "Real-time progress tracking and adjustments",
      "Integration with industry-standard tools"
    ],
    icon: "🎓",
    href: "/workspace"
  },
  {
    id: 2,
    category: "DSA",
    title: "Algorithm Visualizer",
    description: "Understand DSA through step-by-step animated visualizations and interactive examples.",
    longDescription: "Visualize complex algorithms in real-time with our interactive algorithm visualizer. Watch sorting algorithms, graph traversals, and dynamic programming solutions come to life through beautiful animations.",
    benefits: [
      "Step-by-step algorithm visualization",
      "Interactive code execution control",
      "Multiple algorithm complexity analysis",
      "Side-by-side comparison mode"
    ],
    icon: "📊"
  },
  {
    id: 3,
    category: "Databases",
    title: "SQL Visualizer",
    description: "Visualize SQL queries, joins, and execution flow interactively with real-time feedback.",
    longDescription: "Transform complex SQL queries into visual diagrams. Understand JOIN operations, subqueries, and query optimization with our intuitive visual interface that breaks down every step of query execution.",
    benefits: [
      "Visual query execution plans",
      "Interactive JOIN demonstrations",
      "Query performance optimization tips",
      "Real-time syntax validation"
    ],
    icon: "🗄️"
  },
  {
    id: 4,
    category: "Interview Prep",
    title: "AI Interview Agent",
    description: "Practice coding interviews with AI-powered feedback, hints, and personalized coaching.",
    longDescription: "Prepare for technical interviews with our AI-powered interview coach. Get real-time feedback, hints when you're stuck, and detailed performance analysis after each session.",
    benefits: [
      "Real-time coding interview simulation",
      "Intelligent hints and guidance",
      "Detailed performance analytics",
      "Company-specific interview prep"
    ],
    icon: "💼"
  },
  {
    id: 5,
    category: "Smart Content",
    title: "Interactive AI PDFs",
    description: "Chat with your study materials, get instant explanations, and extract key concepts effortlessly.",
    longDescription: "Turn static PDF documents into interactive learning experiences. Ask questions, get explanations, and extract key concepts from any technical document or textbook.",
    benefits: [
      "Natural language Q&A with documents",
      "Automatic key concept extraction",
      "Smart highlighting and annotations",
      "Multi-document knowledge synthesis"
    ],
    icon: "📚"
  },
  {
    id: 6,
    category: "Career",
    title: "AI Career Coach",
    description: "Get personalized career guidance, roadmap planning, and job preparation strategies.",
    longDescription: "Navigate your tech career with confidence using our AI career coach. Get personalized advice on skill development, job applications, and career transitions based on current market trends.",
    benefits: [
      "Personalized career roadmaps",
      "Industry trend analysis",
      "Resume and portfolio optimization",
      "Interview preparation strategies"
    ],
    icon: "🚀"
  }
];

const FeatureDetailCard = ({ feature, index }) => {
  return (
    <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/20 to-black/40 backdrop-blur-xl overflow-hidden">
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10"></div>
      
      <div className="relative z-10 p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          {/* Icon and Category */}
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl">{feature.icon}</div>
            <span className="inline-block rounded-full bg-purple-500/20 px-4 py-1.5 
                           text-sm font-medium text-purple-300 border border-purple-500/30">
              {feature.category}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {feature.title}
          </h2>

          {/* Short Description */}
          <p className="text-xl text-white/70 mb-6">
            {feature.description}
          </p>

          {/* Long Description */}
          <p className="text-lg text-white/60 leading-relaxed mb-8">
            {feature.longDescription}
          </p>

          {/* Benefits List */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white mb-4">Key Benefits:</h3>
            {feature.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0"></div>
                <p className="text-white/70">{benefit}</p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
{feature.href ? (
  <Link
    href={feature.href}
    className="inline-block mt-8 rounded-full 
               bg-gradient-to-r from-purple-500 to-pink-500
               px-8 py-3 text-base font-semibold text-white
               transition-all duration-300 
               hover:scale-105 hover:shadow-xl 
               hover:shadow-purple-500/50"
  >
    Try {feature.title}
  </Link>
) : (
  <button
    disabled
    className="mt-8 rounded-full bg-white/10 px-8 py-3 
               text-base font-semibold text-white/50 
               cursor-not-allowed"
  >
    Coming Soon
  </button>
)}
        </div>
      </div>
    </div>
  );
};

const Featuredetail = () => {
  return (
    <section className="relative min-h-screen py-24 bg-black overflow-hidden">
      {/* Background gradient */}
      {/* 🔥 Particles Background */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={["#580476", "#a855f7"]}
          particleCount={160}
          particleSpread={10}
          speed={0.08}
          particleBaseSize={80}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
        />
      </div>
      
      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Powerful Features in Detail
          </h2>
          <p className="text-lg text-white/70">
            Explore how each feature helps you master computer science concepts
            and accelerate your learning journey.
          </p>
        </div>

        {/* ScrollStack with Feature Cards */}
        <div className="max-w-5xl mx-auto">
          <ScrollStack>
            {features.map((feature, index) => (
              <ScrollStackItem key={feature.id}>
                <FeatureDetailCard feature={feature} index={index} />
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>
      </div>
    </section>
  );
};

export default Featuredetail;
