import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";

interface HomeSectionProps {
  onNavigate: (section: string) => void;
}

export default function HomeSection({ onNavigate }: HomeSectionProps) {
  return (
    <div id="home-section" className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center py-20 px-4">
      {/* Background soft ambient grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02),transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-4xl flex flex-col items-center text-center z-10 space-y-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs font-mono text-cyan-400 tracking-wider backdrop-blur-md"
        >
          <Sparkles size={14} className="text-cyan-400 animate-pulse" />
          <span>ХУВИЙН ТАНИЛЦУУЛГА ВЭБ САЙТ</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
          className="font-sans text-5xl md:text-7xl lg:text-8xl font-extralight leading-none tracking-tighter text-white"
        >
          Хүсэл-эрдэнэ ба <br />
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 italic text-shadow-cyber">
            түүний танилцуулга
          </span>
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 120 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500"
        />

        {/* Next Section Flow Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-6"
        >
          <button 
            onClick={() => onNavigate("about")}
            className="group relative px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 text-white rounded-2xl font-sans text-sm font-semibold tracking-wider transition-all duration-300 shadow-cyber-glow hover:shadow-cyber-glow-lg overflow-hidden cursor-pointer flex items-center space-x-3"
          >
            <span>ДАРААГИЙН ХЭСЭГ // МИНИЙ ТУХАЙ</span>
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform text-cyan-400" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
