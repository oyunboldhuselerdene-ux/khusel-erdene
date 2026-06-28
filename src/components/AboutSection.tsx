import { motion } from "motion/react";
import { User, Heart, Sparkles, Music, Film, Utensils, ArrowRight } from "lucide-react";

interface AboutSectionProps {
  onNavigate: (section: string) => void;
}

export default function AboutSection({ onNavigate }: AboutSectionProps) {
  const profileDetails = [
    { label: "Нэр // Name", value: "Хүсэл-эрдэнэ", icon: User, color: "text-cyan-400" },
    { label: "Нас // Age", value: "14", icon: Sparkles, color: "text-amber-400" },
    { label: "Дуртай хоол // Favorite Food", value: "Монгол хоол", icon: Utensils, color: "text-emerald-400" },
    { label: "Дуртай анимэ // Favorite Anime", value: "Haikyuu", icon: Film, color: "text-rose-400" },
    { label: "Дуртай дуучин // Favorite Singer", value: "Rokitbay", icon: Music, color: "text-indigo-400" },
  ];

  return (
    <div id="about-section" className="relative min-h-[calc(100vh-80px)] py-12 px-4 md:px-8 lg:px-16 flex flex-col justify-center items-center">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-10 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-4xl flex flex-col space-y-10">
        
        {/* Section Header */}
        <div className="border-b border-white/10 pb-4 text-left">
          <h2 className="font-sans text-3xl font-extralight tracking-tight text-white flex items-center space-x-3">
            <User className="text-cyan-400" />
            <span>МИНИЙ ТУХАЙ // <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">ABOUT ME</span></span>
          </h2>
          <p className="text-slate-500 font-mono text-[10px] tracking-widest mt-1">
            MEMBER_PROFILE_ID: KHUSEL_ERDENE_INTRO
          </p>
        </div>

        {/* Profile Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main welcome statement cards */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-left relative flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-3 right-4 font-mono text-[8px] text-cyan-400 tracking-wider uppercase">PROFILE_DATA</div>
            <div className="space-y-4">
              <h3 className="font-sans text-base font-bold text-white tracking-wider flex items-center space-x-2">
                <span className="w-1.5 h-3 bg-cyan-400 rounded-full" />
                <span>ЕРӨНХИЙ ТАНИЛЦУУЛГА</span>
              </h3>
              
              <p className="text-slate-300 font-sans text-sm leading-relaxed">
                Сайн байна уу? Намайг <span className="font-bold text-white text-cyan-300">Хүсэл-эрдэнэ</span> гэдэг. Би одоогоор 14 настай бөгөөд технологи, тоглоом болон анимэ сонирхдог. Миний тухай илүү их сонирхолтой баримтуудтай баруун талын картуудаас танилцаарай!
              </p>
            </div>

            <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mt-4 border-t border-white/5 pt-2">
              <span>STATUS: SYSTEM_READY</span>
              <span>INDEX_01</span>
            </div>
          </div>

          {/* Details list as bento cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profileDetails.map((detail, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 text-left flex flex-col justify-between relative min-h-[110px] hover:border-white/20 transition-all group cursor-pointer"
              >
                <detail.icon className={`${detail.color} group-hover:scale-110 transition-transform`} size={22} />
                <div>
                  <p className="font-mono text-[8px] text-slate-500 uppercase tracking-wider">{detail.label}</p>
                  <p className="font-sans font-bold text-white text-sm mt-1">{detail.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick section tag tracker */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 text-left relative">
          <div className="absolute top-3 right-4 font-mono text-[8px] text-slate-500">TAGS_MATRIX</div>
          <h4 className="font-sans text-xs font-bold text-white uppercase tracking-wider mb-3">Миний сонирхдог зүйлс // Tags</h4>
          
          <div className="flex flex-wrap gap-2">
            {["Technology", "Anime", "Haikyuu", "Rokitbay Songs", "Mongolian Food", "Gaming"].map((tag, idx) => (
              <span key={idx} className="bg-white/5 border border-white/5 text-slate-300 text-xs font-mono px-3 py-1.5 rounded-xl select-none hover:border-white/20 hover:text-white transition cursor-default">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Next Section Flow Button */}
        <div className="flex justify-center pt-4">
          <button 
            onClick={() => onNavigate("game")}
            className="group relative px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 text-white rounded-2xl font-sans text-sm font-semibold tracking-wider transition-all duration-300 shadow-cyber-glow hover:shadow-cyber-glow-lg overflow-hidden cursor-pointer flex items-center space-x-3"
          >
            <span>ДАРААГИЙН ХЭСЭГ // ТОГЛООМ</span>
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform text-cyan-400" />
          </button>
        </div>

      </div>
    </div>
  );
}

