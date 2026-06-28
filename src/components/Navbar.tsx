import { motion } from "motion/react";
import { Home, Gamepad2, User2, Mail, Terminal } from "lucide-react";

interface NavbarProps {
  currentSection: string;
  onNavigate: (section: string) => void;
}

export default function Navbar({ currentSection, onNavigate }: NavbarProps) {
  const navItems = [
    { id: "home", label: "Нүүр хэсэг", icon: Home },
    { id: "game", label: "Тоглоомын хэсэг", icon: Gamepad2 },
    { id: "about", label: "Миний тухай", icon: User2 },
    { id: "contact", label: "Холбоо барих", icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/[0.02] backdrop-blur-xl border-b border-white/10 px-4 md:px-12 py-3.5 flex justify-center items-center">
      {/* Outer frame thin glass accents */}
      <div className="absolute bottom-0 left-0 w-20 h-px bg-gradient-to-r from-cyan-400 to-transparent" />
      <div className="absolute bottom-0 right-0 w-20 h-px bg-gradient-to-l from-indigo-400 to-transparent" />

      {/* Navigation Buttons Container - Centered, absolutely NO LOGO on left */}
      <nav className="flex items-center space-x-1.5 md:space-x-3 bg-white/5 border border-white/10 rounded-full px-2 py-1.5 shadow-lg backdrop-blur-md">
        {navItems.map((item) => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative px-3.5 py-2 rounded-full font-display text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center space-x-1.5 cursor-pointer ${
                isActive 
                  ? "text-cyan-400 font-black" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {/* Highlight active capsule using Frosted Glass */}
              {isActive && (
                <motion.div
                  layoutId="activeNavTab"
                  className="absolute inset-0 bg-white/10 border border-white/20 rounded-full shadow-inner"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              
              {/* Animated Icon */}
              <item.icon size={13} className={`transition-transform duration-300 ${isActive ? "scale-110 text-cyan-400" : "text-slate-400 group-hover:text-white"}`} />
              
              <span className="relative z-10 hidden sm:inline">{item.label}</span>
              <span className="relative z-10 sm:hidden">
                {item.id === "home" ? "Нүүр" : item.id === "game" ? "Тоглоом" : item.id === "about" ? "Тухай" : "Холбоо"}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Cyber terminal uptime flag on the far right (purely decorative, no branding) */}
      <div className="absolute right-6 hidden lg:flex items-center space-x-2 font-mono text-[9px] text-slate-500 tracking-wider">
        <Terminal size={10} className="text-cyan-400 animate-pulse" />
        <span>SYSTEM_STATUS: OK</span>
      </div>
    </header>
  );
}
