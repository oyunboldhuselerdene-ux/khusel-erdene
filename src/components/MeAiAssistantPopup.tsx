import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Bot, User, Trash2, Key, Sparkles, Terminal, Shield, Award, Calendar } from "lucide-react";

interface Message {
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

export default function MeAiAssistantPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Сайн байна уу? Намайг Хүсэл-эрдэнэ гэдэг. За байз... Би өөрийнхөө AI хувилбарыг бүтээсэн нь энэ байна. Би волейбол тоглох, дугуй унах дуртай, бас Rokit Bay-ийн дуунуудыг байнга сонсдог. Сурлага, спорт, сонирхол болон энэхүү вэбсайттай маань холбоотой юуг ч асуусан хариулъя, бодож үзье...",
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
  }, [messages, isLoading, isOpen]);

  // Sync API Key between components if updated
  useEffect(() => {
    const handleStorageChange = () => {
      setUserApiKey(localStorage.getItem("USER_GEMINI_API_KEY") || "");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    localStorage.setItem("USER_GEMINI_API_KEY", key);
    // Dispatch storage event to keep other components in sync
    window.dispatchEvent(new Event("storage"));
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
          role: "me",
          userApiKey: userApiKey || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Холбогдоход алдаа гарлаа.");
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
          content: `❌ За байз... Алдаа гарчихлаа: ${err.message || "Интернэт эсвэл системтэй холбогдож чадсангүй."}`,
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
          content: "За байз... Чатны түүхийг цэвэрлэлээ. Яриагаа эхнээс нь эхэлье.",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const suggestionPrompts = [
    "Чи олимпиадын ямар амжилттай вэ?",
    "Спортын ямар амжилттай вэ?",
    "Зорилго болон мөрөөдөл чинь юу вэ?",
    "Энэ portfolio сайтад чинь юу байгаа вэ?",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 50, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 50, x: 20 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-[92vw] sm:w-[400px] h-[580px] bg-slate-900/40 border border-cyan-500/20 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl mb-4 text-left"
          >
            {/* Aesthetic top glowing line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-indigo-500" />

            {/* Header */}
            <div className="px-5 py-3.5 border-b border-white/5 bg-slate-950/30 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
                    <Bot size={18} className="text-slate-950" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-slate-900" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-sans font-bold text-white text-xs tracking-wide">ME-AI ТУСЛАХ</span>
                    <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">PORTFOLIO</span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">STATUS: ONLINE_AGENT</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                  title="API Key тохиргоо"
                  className={`p-1.5 rounded-lg transition-all ${
                    showApiKeyInput ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-white/5 text-slate-400 hover:text-white"
                  } cursor-pointer`}
                >
                  <Key size={13} />
                </button>
                <button
                  onClick={handleClearChat}
                  title="Чатыг цэвэрлэх"
                  className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* API Key Input */}
            <AnimatePresence>
              {showApiKeyInput && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-950/70 border-b border-white/5 overflow-hidden text-left"
                >
                  <div className="p-3.5 space-y-2">
                    <label className="block text-[10px] font-mono text-cyan-400 tracking-wider">GEMINI API KEY:</label>
                    <div className="flex gap-1.5">
                      <input
                        type="password"
                        placeholder="API түлхүүр тавих..."
                        value={userApiKey}
                        onChange={(e) => handleSaveApiKey(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-white focus:outline-none focus:border-cyan-400 transition"
                      />
                      {userApiKey && (
                        <button
                          onClick={() => handleSaveApiKey("")}
                          className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 rounded-lg text-[10px] font-mono border border-rose-500/20 transition cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar bg-slate-950/10">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-start gap-1.5`}
                >
                  {msg.role === "model" && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center shrink-0 shadow-md">
                      <Bot size={13} className="text-slate-950" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs text-left leading-relaxed ${
                      msg.role === "user"
                        ? "bg-cyan-500 text-slate-950 rounded-tr-none shadow-lg shadow-cyan-500/10 font-medium"
                        : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none backdrop-blur-md"
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                    <span className={`block text-[8px] font-mono text-right mt-1 ${msg.role === "user" ? "text-slate-700" : "text-slate-500"}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                      <User size={13} className="text-cyan-400" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start items-center gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center shrink-0">
                    <Bot size={13} className="text-slate-950" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-3.5 py-2.5 flex space-x-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-4 py-2 bg-slate-950/20 border-t border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap">
              {suggestionPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  disabled={isLoading}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 px-2.5 py-1.5 rounded-full transition cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Sparkles size={9} className="inline mr-1 text-cyan-400" />
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
              className="p-3 border-t border-white/5 bg-slate-950/30 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Надаас юм асуугаарай..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/10 transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 border border-cyan-400/20 text-slate-950 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/35 transition duration-300 flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50 disabled:bg-white/5 disabled:text-slate-500 disabled:shadow-none"
              >
                <Send size={13} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Bubble */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/25 cursor-pointer relative group border border-cyan-400/20"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={22} className="text-slate-950" />
            </motion.div>
          ) : (
            <motion.div
              key="chat-icon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare size={22} className="text-slate-950" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border border-slate-950 flex items-center justify-center">
                <span className="text-[7px] font-bold text-white leading-none">AI</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Ring Hover Accent */}
        <div className="absolute inset-0 rounded-full bg-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md pointer-events-none" />
      </motion.button>
    </div>
  );
}
