import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Bot, User, Trash2, Key, Sparkles, Music, Terminal, ChevronDown, ChevronUp } from "lucide-react";

interface Message {
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

interface IdolCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IdolCoachModal({ isOpen, onClose }: IdolCoachModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Yo, юу байна? Би бол Rokit Bay (AI хувилбар). Хүсэл-эрдэнийн шүтээн, бас энд түүний 'Idol Coach' нь байна. Зорилгодоо үнэнч байж, тууштай хөдөлмөрлөх талаар эсвэл Хүсэл-эрдэнийн авьяас чадвар, амжилтын талаар асуух зүйл байна уу? Чөлөөтэй ярилцъя, залуу минь.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [userApiKey, setUserApiKey] = useState(() => {
    return localStorage.getItem("USER_GEMINI_API_KEY") || "";
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    localStorage.setItem("USER_GEMINI_API_KEY", key);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputValue.trim();
    if (!messageText) return;

    if (!textToSend) {
      setInputValue("");
    }

    const newUserMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const chatHistoryForBackend = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          history: chatHistoryForBackend,
          role: "idol",
          userApiKey: userApiKey || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gemini API-тай холбогдоход алдаа гарлаа.");
      }

      const newAiMessage: Message = {
        role: "model",
        content: data.text || "Алдаа гарлаа.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newAiMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: `❌ Алдаа гарлаа: ${err.message || "Сүлжээ эсвэл систем ачаалж чадсангүй."}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Чатны түүхийг устгах уу?")) {
      setMessages([
        {
          role: "model",
          content: "За, залуу минь. Түүхийг шинэчиллээ. Яриагаа цэвэр хуудаснаас эхэлцгээе. Юу асуумаар байна?",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const suggestionPrompts = [
    "Хүсэл-эрдэнийн авьяас, олимпиадын амжилтуудаас хэлээд өгөөч?",
    "Амьдралд хэрхэн тууштай хөдөлмөрлөж, урагшлах вэ? Урам өгөөч!",
    "Хүсэл-эрдэнэ ирээдүйд ямар инженер болох вэ?",
    "Миний portfolio-г хэрхэн хөгжүүлбэл дээр вэ, Баяраа ахаа?",
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
        {/* Animated Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ duration: 0.4, cubicBezier: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl h-[85vh] md:h-[80vh] bg-slate-900/40 border border-indigo-500/20 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl"
        >
          {/* Aesthetic top glowing line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500" />

          {/* Header */}
          <div className="px-6 py-4 border-b border-white/5 bg-slate-950/30 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                  <Music size={18} className="text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </div>
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className="font-sans font-bold text-white text-sm tracking-wide">IDOL COACH // ROKIT BAY AI</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">COACH</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">STATUS: INTERACTIVE_MENTOR</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                title="API Key тохиргоо"
                className={`p-2 rounded-xl transition-all ${
                  showApiKeyInput ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-white/5 text-slate-400 hover:text-white border border-transparent"
                } cursor-pointer`}
              >
                <Key size={15} />
              </button>
              <button
                onClick={handleClearChat}
                title="Чатыг цэвэрлэх"
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-transparent hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-all cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* API Key Configuration Dropdown */}
          <AnimatePresence>
            {showApiKeyInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-slate-950/80 border-b border-white/5 overflow-hidden"
              >
                <div className="p-4 space-y-2 text-left">
                  <label className="block text-xs font-mono text-cyan-400 tracking-wider">GEMINI API KEY (Сонголттой):</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="AI Studio-с авсан API түлхүүр тавих..."
                      value={userApiKey}
                      onChange={(e) => handleSaveApiKey(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 transition"
                    />
                    {userApiKey && (
                      <button
                        onClick={() => handleSaveApiKey("")}
                        className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 rounded-xl text-xs font-mono border border-rose-500/20 transition cursor-pointer"
                      >
                        Устгах
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                    💡 Вэбсайт нь үндсэн Gemini түлхүүр ашиглаж байгаа. Хэрэв та өөрийн хувийн түлхүүрээ тавибал таны түлхүүрээр хүсэлт явах бөгөөд зөвхөн таны хөтөч дээр хадгалагдана.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar bg-slate-950/20">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-start gap-2`}
              >
                {msg.role === "model" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                    <Music size={14} className="text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm text-left leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/10"
                      : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none backdrop-blur-md"
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                  <span className="block text-[8px] font-mono text-slate-500 text-right mt-1.5">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <User size={14} className="text-cyan-400" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading / Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                  <Music size={14} className="text-white" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex space-x-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions chips */}
          <div className="px-6 py-2.5 bg-slate-950/30 border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth">
            {suggestionPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                disabled={isLoading}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/30 text-xs text-slate-300 px-3.5 py-2 rounded-full transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Sparkles size={11} className="inline mr-1 text-indigo-400" />
                {p}
              </button>
            ))}
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 border-t border-white/5 bg-slate-950/40 flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Шүтээн дасгалжуулагчтайгаа ярилц..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/20 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/35 transition duration-300 flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50 disabled:bg-white/5 disabled:text-slate-500 disabled:shadow-none"
            >
              <Send size={16} />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
