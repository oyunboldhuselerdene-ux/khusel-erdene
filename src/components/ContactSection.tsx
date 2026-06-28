import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Phone, MapPin, Send, MessageSquare, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";

interface ContactSectionProps {
  onNavigate: (section: string) => void;
}

export default function ContactSection({ onNavigate }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Simple synthesiser beep for sending message
  const playBeep = (freq = 700, duration = 0.1) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignored
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      playBeep(200, 0.3); // Low alarm tone
      setErrorMsg("Шаардлагатай талбаруудыг бүрэн бөглөнө үү!");
      return;
    }

    setErrorMsg("");
    setSending(true);
    playBeep(900, 0.15);

    // Simulate sending packet
    setTimeout(() => {
      setSending(false);
      setSent(true);
      playBeep(1200, 0.4); // Success high chime

      // reset
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      // hide success notification after a while
      setTimeout(() => setSent(false), 5000);
    }, 2000);
  };

  const contactInfo = [
    { label: "И-МЭЙЛ ХАЯГ", value: "oyunboldhuselerdene@gmail.com", icon: Mail, color: "text-cyan-400" },
    { label: "УТАСНЫ ДУГААР", value: "одоогоор хоосон байна", icon: Phone, color: "text-cyan-300" },
    { label: "БАЙРШИЛ", value: "одоогоор хоосон байна", icon: MapPin, color: "text-indigo-400" },
  ];

  return (
    <div id="contact-section" className="relative min-h-[calc(100vh-80px)] py-12 px-4 md:px-8 lg:px-16 flex flex-col justify-center items-center">
      {/* Laser line background element */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-indigo-400/5 to-transparent pointer-events-none" />

      <div className="w-full max-w-4xl flex flex-col space-y-8">
        
        {/* Section Header */}
        <div className="border-b border-white/10 pb-4 text-left">
          <h2 className="font-sans text-3xl font-extralight tracking-tight text-white flex items-center space-x-3">
            <MessageSquare className="text-cyan-400" />
            <span>ХОЛБОО БАРИХ // <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">CONTACT</span></span>
          </h2>
          <p className="text-slate-500 font-mono text-[10px] tracking-widest mt-1">
            SECURE_PORT: OPEN_INBOUND_ENCRYPTED_LINE_COMMS
          </p>
        </div>

        {/* Form and Contact Detail Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Information Placeholders */}
          <div className="md:col-span-5 flex flex-col space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-left space-y-4">
              <h3 className="font-sans text-sm font-bold text-white tracking-widest uppercase">
                ШУУД ХОЛБОО БАРИХ
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Та доорх холбоо барих мэдээллийн загварууд дээр өөрийн бодит утас, и-мэйл хаягийг дараа нь орлуулан байршуулаарай.
              </p>

              <div className="space-y-4 pt-2">
                {contactInfo.map((info, idx) => (
                  <div key={idx} className="flex items-start space-x-3 group border border-dashed border-white/10 hover:border-white/20 p-3 rounded-2xl bg-white/[0.01] transition">
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl group-hover:border-cyan-400/30 transition">
                      <info.icon size={16} className={info.color} />
                    </div>
                    <div>
                      <p className="font-mono text-[8px] text-slate-500 tracking-wider uppercase">{info.label}</p>
                      <p className="font-mono text-xs text-slate-300 font-bold mt-0.5">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Encrypted Network Status Widget */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-left flex items-center space-x-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                SSL_ENCRYPTED_MESSAGE_TRANSMISSION: ACTIVE // PORT_443
              </span>
            </div>
          </div>

          {/* Right Column: High-tech interactive contact form */}
          <div className="md:col-span-7 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-left relative shadow-cyber-glow">
            <div className="absolute top-3 right-4 font-mono text-[8px] text-indigo-400 tracking-wider uppercase">SECURE_MAIL_GATE</div>
            
            <h3 className="font-sans text-sm font-bold text-white tracking-widest uppercase mb-5">
              ШУУД ЗУРВАС ИЛГЭЭХ ХЭСЭГ
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-mono flex items-center space-x-2">
                <ShieldAlert size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] text-slate-400 uppercase tracking-wider">Таны нэр <span className="text-cyan-400">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 rounded-xl p-2.5 font-sans text-xs text-white transition outline-none"
                    placeholder="Нэрээ оруулна уу"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] text-slate-400 uppercase tracking-wider">И-мэйл хаяг <span className="text-cyan-400">*</span></label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 rounded-xl p-2.5 font-sans text-xs text-white transition outline-none"
                    placeholder="Жишээ: developer@it.mn"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] text-slate-400 uppercase tracking-wider">Гарчиг</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 rounded-xl p-2.5 font-sans text-xs text-white transition outline-none"
                  placeholder="Зурвасын зорилго"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] text-slate-400 uppercase tracking-wider">Зурвас <span className="text-cyan-400">*</span></label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 rounded-xl p-2.5 font-sans text-xs text-white transition outline-none resize-none"
                  placeholder="Бичих зүйлээ энд оруулаарай"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 relative">
                <AnimatePresence mode="wait">
                  {sent ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-emerald-400 font-mono text-xs flex items-center space-x-2.5 justify-center"
                    >
                      <CheckCircle2 size={16} />
                      <span>СИСТЕМД АМЖИЛТТАЙ ДАМЖУУЛЛАА! ТАНД БАЯРЛАЛАА.</span>
                    </motion.div>
                  ) : (
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-sans font-bold text-xs tracking-wider rounded-xl transition-all duration-300 shadow-cyber-glow flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      {sending ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          <span>ДАМЖУУЛЖ БАЙНА... / TX_PACKET</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>ЗУРВАС ИЛГЭЭХ // SEND_COMMS</span>
                        </>
                      )}
                    </button>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>

        </div>

        {/* Next Section Flow Button (Cycles back to home) */}
        <div className="flex justify-center pt-8 border-t border-white/5">
          <button 
            onClick={() => onNavigate("home")}
            className="group relative px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 text-white rounded-2xl font-sans text-sm font-semibold tracking-wider transition-all duration-300 shadow-cyber-glow hover:shadow-cyber-glow-lg overflow-hidden cursor-pointer flex items-center space-x-3"
          >
            <span>ЭХЛЭЛ ХЭСЭГ РҮҮ БУЦАХ // HOME</span>
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform text-cyan-400" />
          </button>
        </div>

      </div>
    </div>
  );
}
