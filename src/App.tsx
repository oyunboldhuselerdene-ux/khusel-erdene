import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar";
import HomeSection from "./components/HomeSection";
import GameSection from "./components/GameSection";
import AboutSection from "./components/AboutSection";
import ContactSection from "./components/ContactSection";
import IdolCoachModal from "./components/IdolCoachModal";
import MeAiAssistantPopup from "./components/MeAiAssistantPopup";

export default function App() {
  const [activeSection, setActiveSection] = useState<string>("home");
  const [isIdolCoachOpen, setIsIdolCoachOpen] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return <HomeSection onNavigate={setActiveSection} />;
      case "game":
        return <GameSection onNavigate={setActiveSection} />;
      case "about":
        return <AboutSection onNavigate={setActiveSection} />;
      case "contact":
        return <ContactSection onNavigate={setActiveSection} />;
      default:
        return <HomeSection onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans flex flex-col relative select-none overflow-hidden">
      {/* Frosted Glass Theme Background Animated Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-500/8 rounded-full blur-[150px] rotate-45 pointer-events-none z-0" />
      
      {/* Top thin line accent */}
      <div className="fixed top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent z-40" />
      
      {/* Navigation Header (NO LOGO) */}
      <Navbar 
        currentSection={activeSection} 
        onNavigate={setActiveSection} 
        onOpenIdolCoach={() => setIsIdolCoachOpen(true)}
      />

      {/* Main Content Area with Route Transitions */}
      <main className="flex-1 w-full flex flex-col justify-between overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full h-full flex-1"
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Cybernetic Footer (HUMBLE & CLEAN - frosted design) */}
      <footer className="w-full border-t border-white/5 py-4 bg-white/[0.02] backdrop-blur-md text-center relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 font-mono text-[10px] text-gray-500">
          <span>SECURE GATEWAY STATUS: VERIFIED</span>
          <span>© 2026 IT ENGINEER PORTFOLIO // FROSTED GLASS THEME</span>
        </div>
      </footer>

      {/* AI Assistants & Overlays */}
      <IdolCoachModal isOpen={isIdolCoachOpen} onClose={() => setIsIdolCoachOpen(false)} />
      <MeAiAssistantPopup />
    </div>
  );
}
