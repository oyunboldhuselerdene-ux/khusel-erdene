import { motion } from "motion/react";
import { Gamepad2, ArrowRight, Sparkles } from "lucide-react";

interface GameSectionProps {
  onNavigate: (section: string) => void;
}

export default function GameSection({ onNavigate }: GameSectionProps) {
  return (
    <div id="game-section" className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center py-12 px-4 md:px-8 lg:px-16">
      {/* Visual ambient glass background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.01),transparent_75%)] pointer-events-none" />

      <div className="w-full max-w-4xl flex flex-col space-y-8">
        
        {/* Section Header */}
        <div className="border-b border-white/10 pb-4 text-left">
          <h2 className="font-sans text-3xl font-extralight tracking-tight text-white flex items-center space-x-3">
            <Gamepad2 className="text-cyan-400" />
            <span>ИНТЕРAКТИВ ТОГЛООМ // <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">GAME</span></span>
          </h2>
          <p className="text-slate-500 font-mono text-[10px] tracking-widest mt-1">
            GAME_ENGINE: CURRENTLY_OFFLINE
          </p>
        </div>

        {/* Big Premium Frosted Glass Container representing the empty state */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-12 text-center relative overflow-hidden min-h-[350px] flex flex-col justify-center items-center space-y-6 shadow-cyber-glow"
        >
          {/* Decorative spinning ring */}
          <div className="absolute w-64 h-64 border border-dashed border-white/5 rounded-full animate-[spin_40s_linear_infinite] pointer-events-none" />
          
          <div className="relative p-6 bg-white/5 rounded-full border border-white/10 text-cyan-400 animate-pulse">
            <Gamepad2 size={40} />
          </div>

          <div className="space-y-3 max-w-lg">
            <h3 className="font-sans text-2xl font-bold text-white tracking-wider flex items-center justify-center space-x-2">
              <Sparkles size={18} className="text-cyan-400" />
              <span>ТОГЛООМ УДАХГҮЙ ОРНО</span>
            </h3>
            <p className="text-slate-400 font-sans text-sm leading-relaxed">
              Би өөрийн сонирхолтой тоглоомын санааг бүрэн зохиож дуусаад танд өгөх болно. Тэр болтол та дараагийн хэсэг рүү шилжинэ үү.
            </p>
          </div>

          <div className="text-[10px] font-mono text-slate-500">
            SYSTEM_STATUS: WAITING_FOR_USER_GAME_RULES
          </div>
        </motion.div>

        {/* Next Section Flow Button */}
        <div className="flex justify-center pt-4">
          <button 
            onClick={() => onNavigate("contact")}
            className="group relative px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 text-white rounded-2xl font-sans text-sm font-semibold tracking-wider transition-all duration-300 shadow-cyber-glow hover:shadow-cyber-glow-lg overflow-hidden cursor-pointer flex items-center space-x-3"
          >
            <span>ДАРААГИЙН ХЭСЭГ // ХОЛБОО БАРИХ</span>
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform text-cyan-400" />
          </button>
        </div>

      </div>
    </div>
  );
}
