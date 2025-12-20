import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import MagicBento from "@/components/MagicBento";
import Hero from "./landingpage/hero";
import Featurecard from "./landingpage/featurecard";
import Featuredetail from "./landingpage/Featuredetail";
import Footer from "./landingpage/footer";

export default function Home() {
  return (
    <div className="bg-black min-h-screen text-white">
      {/* 🔥 Sticky Glassmorphism Navbar */}
<nav className="sticky top-4 z-50 mx-auto w-[95%] max-w-6xl rounded-full 
                backdrop-blur-xl bg-white/10 border border-white/20
                shadow-lg px-6 py-3 flex items-center justify-between">

  {/* Left */}
  <div className="text-white font-bold text-lg tracking-wide">
    LEARNIFY-AI
  </div>

  {/* Center */}
  <ul className="flex items-center gap-3 text-sm">
    {["Home", "Features", "Courses"].map((item) => (
      <li
        key={item}
        className="relative px-4 py-2 rounded-full cursor-pointer
                   text-white/80
                   transition-all duration-300 ease-out
                   hover:text-white
                   hover:bg-white/15
                   hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
      >
        {item}
      </li>
    ))}
  </ul>

  {/* Right */}
  <UserButton />
</nav>


      {/* Page Sections */}
      <Hero />
      <Featurecard />
      <Featuredetail />
      <Footer />
    </div>
  );
}
