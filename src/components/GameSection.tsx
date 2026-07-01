import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gamepad2, ArrowRight, Sparkles, Heart, Timer, Trophy, Zap, RefreshCw, 
  Volume2, VolumeX, Flame, ChevronRight, User, Eye, X, Play
} from "lucide-react";

interface Question {
  id: number;
  emojis: string;
  hint?: string;
  answer: string;
  options: string[];
}

interface GameData {
  emojiQuiz: Question[];
  characterQuiz: Question[];
  powerQuiz: Question[];
}

interface GameSectionProps {
  onNavigate: (section: string) => void;
}

// Map of high quality anime themed image URLs from Unsplash for visual payoff
const ANIME_IMAGES: Record<string, string> = {
  "One Piece": "https://m.media-amazon.com/images/M/MV5BMTNjNGU4NTUtYmVjMy00YjRiLTkxMWUtNzZkMDNiYjZhNmViXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg", 
  "Naruto": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
  "Demon Slayer": "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&auto=format&fit=crop&q=80",
  "Death Note": "https://images.unsplash.com/photo-1627556704353-016ec933758a?w=600&auto=format&fit=crop&q=80",
  "Attack on Titan": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
  "Fullmetal Alchemist": "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=600&auto=format&fit=crop&q=80",
  "Jujutsu Kaisen": "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?w=600&auto=format&fit=crop&q=80",
  "Dragon Ball": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
  "Hunter x Hunter": "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
  "My Hero Academia": "https://images.unsplash.com/photo-1501183007986-d0d080b147f9?w=600&auto=format&fit=crop&q=80",
  "Uzumaki Naruto": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
  "Monkey D. Luffy": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
  "Kamado Tanjiro": "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&auto=format&fit=crop&q=80",
  "Levi Ackerman": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
  "Gojo Satoru": "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?w=600&auto=format&fit=crop&q=80",
  "Saitama": "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=600&auto=format&fit=crop&q=80",
  "Roronoa Zoro": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
  "Light Yagami": "https://images.unsplash.com/photo-1627556704353-016ec933758a?w=600&auto=format&fit=crop&q=80",
  "Edward Elric": "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=600&auto=format&fit=crop&q=80",
  "Gon Freecss": "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
  "Rasengan": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
  "Gomu Gomu no Mi": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
  "Kamehameha": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
  "Chidori": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
  "Infinity (Limitless)": "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?w=600&auto=format&fit=crop&q=80",
  "Hinokami Kagura": "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&auto=format&fit=crop&q=80",
  "Circleless Transmutation": "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=600&auto=format&fit=crop&q=80",
  "Thunder Breathing: First Form": "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&auto=format&fit=crop&q=80",
  "Godspeed (Kanmuru)": "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
  "Founding Titan": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80"
};

// Help match answers to core anime names for sound playing
const getAnimeNameFromAnswer = (answer: string): string => {
  const ans = answer.toLowerCase();
  if (ans.includes("naruto")) return "Naruto";
  if (ans.includes("luffy") || ans.includes("zoro") || ans.includes("piece") || ans.includes("gomu")) return "One Piece";
  if (ans.includes("tanjiro") || ans.includes("zenitsu") || ans.includes("demon slayer") || ans.includes("breath") || ans.includes("kagura")) return "Demon Slayer";
  if (ans.includes("goku") || ans.includes("kamehameha") || ans.includes("dragon ball")) return "Dragon Ball";
  if (ans.includes("levi") || ans.includes("titan") || ans.includes("eren")) return "Attack on Titan";
  if (ans.includes("yagami") || ans.includes("death note") || ans.includes("kira")) return "Death Note";
  if (ans.includes("gojo") || ans.includes("jujutsu") || ans.includes("limitless") || ans.includes("infinity")) return "Jujutsu Kaisen";
  if (ans.includes("elric") || ans.includes("alchemist") || ans.includes("transmutation")) return "Fullmetal Alchemist";
  if (ans.includes("gon") || ans.includes("hunter") || ans.includes("godspeed") || ans.includes("killua")) return "Hunter x Hunter";
  if (ans.includes("academia") || ans.includes("deku")) return "My Hero Academia";
  return "General";
};

// Declare a global reference for the active anime theme sound context so we can stop it on demand
let activeThemeContext: AudioContext | null = null;

export const stopAnimeTheme = () => {
  if (activeThemeContext) {
    try {
      if (activeThemeContext.state !== "closed") {
        activeThemeContext.close();
      }
    } catch (e) {
      console.warn("Could not close activeThemeContext", e);
    }
    activeThemeContext = null;
  }
};

// Play short synthesized version of iconic theme songs using Web Audio API
const playAnimeTheme = (answer: string, enabled: boolean) => {
  if (!enabled) return;
  try {
    stopAnimeTheme(); // Stop any currently playing theme before starting a new one!

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    activeThemeContext = ctx;

    const playNote = (freq: number, start: number, duration: number, type: OscillatorType = "sine") => {
      if (ctx.state === "closed") return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration - 0.02);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    const now = ctx.currentTime;
    const animeName = getAnimeNameFromAnswer(answer);

    if (animeName === "Naruto") {
      // Silhouette theme hook: A4 (440), C5 (523), D5 (587), E5 (659), D5 (587), C5 (523), A4 (440)
      const notes = [
        { f: 440, d: 0.22 },
        { f: 523, d: 0.22 },
        { f: 587, d: 0.22 },
        { f: 659, d: 0.45 },
        { f: 587, d: 0.22 },
        { f: 523, d: 0.22 },
        { f: 440, d: 0.5 },
      ];
      let time = now;
      notes.forEach((n) => {
        playNote(n.f, time, n.d, "triangle");
        time += n.d;
      });
    } else if (animeName === "One Piece") {
      // We Are! theme hook: G4 (392), G4 (392), A4 (440), B4 (494), B4 (494), C5 (523), D5 (587)
      const notes = [
        { f: 392, d: 0.18 },
        { f: 392, d: 0.18 },
        { f: 440, d: 0.18 },
        { f: 494, d: 0.28 },
        { f: 494, d: 0.18 },
        { f: 523, d: 0.18 },
        { f: 587, d: 0.45 },
      ];
      let time = now;
      notes.forEach((n) => {
        playNote(n.f, time, n.d, "sine");
        time += n.d;
      });
    } else if (animeName === "Demon Slayer") {
      // Gurenge theme: B4 (494), B4 (494), B4 (494), A4 (440), B4 (494), D5 (587), B4 (494), A4 (440), G4 (392)
      const notes = [
        { f: 494, d: 0.18 },
        { f: 494, d: 0.18 },
        { f: 494, d: 0.18 },
        { f: 440, d: 0.18 },
        { f: 494, d: 0.18 },
        { f: 587, d: 0.28 },
        { f: 494, d: 0.18 },
        { f: 440, d: 0.18 },
        { f: 392, d: 0.4 },
      ];
      let time = now;
      notes.forEach((n) => {
        playNote(n.f, time, n.d, "sawtooth");
        time += n.d;
      });
    } else if (animeName === "Dragon Ball") {
      // Cha-La Head-Cha-La hook: E4 (329), G#4 (415), B4 (494), E5 (659), D#5 (622), B4 (494)
      const notes = [
        { f: 329, d: 0.18 },
        { f: 415, d: 0.18 },
        { f: 494, d: 0.18 },
        { f: 659, d: 0.38 },
        { f: 622, d: 0.28 },
        { f: 494, d: 0.4 },
      ];
      let time = now;
      notes.forEach((n) => {
        playNote(n.f, time, n.d, "sine");
        time += n.d;
      });
    } else if (animeName === "Attack on Titan") {
      // Guren no Yumiya brass hook: E4 (329), G4 (392), A4 (440), B4 (494), C5 (523), B4 (494), A4 (440)
      const notes = [
        { f: 329, d: 0.22 },
        { f: 392, d: 0.22 },
        { f: 440, d: 0.45 },
        { f: 494, d: 0.22 },
        { f: 523, d: 0.22 },
        { f: 494, d: 0.22 },
        { f: 440, d: 0.45 },
      ];
      let time = now;
      notes.forEach((n) => {
        playNote(n.f, time, n.d, "triangle");
        time += n.d;
      });
    } else if (animeName === "Death Note") {
      // Dramatic gothic bells hook: A4 (440), D5 (587), F5 (698), E5 (659), C#5 (554), D5 (587)
      const notes = [
        { f: 440, d: 0.25 },
        { f: 587, d: 0.25 },
        { f: 698, d: 0.25 },
        { f: 659, d: 0.25 },
        { f: 554, d: 0.25 },
        { f: 587, d: 0.5 },
      ];
      let time = now;
      notes.forEach((n) => {
        playNote(n.f, time, n.d, "sawtooth");
        time += n.d;
      });
    } else if (animeName === "Jujutsu Kaisen") {
      // Kaikai Kitan hook: C#4 (277), E4 (329), F#4 (370), G#4 (415), B4 (494), C#5 (554)
      const notes = [
        { f: 277, d: 0.18 },
        { f: 329, d: 0.18 },
        { f: 370, d: 0.18 },
        { f: 415, d: 0.18 },
        { f: 494, d: 0.18 },
        { f: 554, d: 0.45 },
      ];
      let time = now;
      notes.forEach((n) => {
        playNote(n.f, time, n.d, "sine");
        time += n.d;
      });
    } else if (animeName === "Fullmetal Alchemist") {
      // Again (YUI) hook: F4 (349), G4 (392), G#4 (415), A#4 (466), C5 (523)
      const notes = [
        { f: 349, d: 0.18 },
        { f: 392, d: 0.18 },
        { f: 415, d: 0.18 },
        { f: 466, d: 0.18 },
        { f: 523, d: 0.5 },
      ];
      let time = now;
      notes.forEach((n) => {
        playNote(n.f, time, n.d, "triangle");
        time += n.d;
      });
    } else if (animeName === "Hunter x Hunter") {
      // Departure hook: C4 (261), E4 (329), G4 (392), C5 (523), B4 (494), G4 (392)
      const notes = [
        { f: 261, d: 0.22 },
        { f: 329, d: 0.22 },
        { f: 392, d: 0.22 },
        { f: 523, d: 0.45 },
        { f: 494, d: 0.22 },
        { f: 392, d: 0.45 },
      ];
      let time = now;
      notes.forEach((n) => {
        playNote(n.f, time, n.d, "sine");
        time += n.d;
      });
    } else if (animeName === "My Hero Academia") {
      // The Day hook: D4 (293), F4 (349), G4 (392), A4 (440), C5 (523)
      const notes = [
        { f: 293, d: 0.18 },
        { f: 349, d: 0.18 },
        { f: 392, d: 0.18 },
        { f: 440, d: 0.18 },
        { f: 523, d: 0.5 },
      ];
      let time = now;
      notes.forEach((n) => {
        playNote(n.f, time, n.d, "sawtooth");
        time += n.d;
      });
    } else {
      // Fallback melody
      const notes = [440, 494, 523, 587];
      notes.forEach((freq, idx) => {
        playNote(freq, now + idx * 0.1, 0.2, "sine");
      });
    }
  } catch (e) {
    console.warn("Web Audio blocked.", e);
  }
};

const playSound = (type: "ding" | "buzz" | "click" | "win" | "lose") => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === "ding") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "buzz") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === "win") {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
      });
    } else if (type === "lose") {
      const notes = [311.13, 293.66, 277.18, 220.00];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 0.45);
      });
    }
  } catch (e) {
    console.warn("Web Audio API issues.", e);
  }
};

const FALLBACK_GAME_DATA: GameData = {
  emojiQuiz: [
    { id: 1, emojis: "🏴‍☠️🍖👒", hint: "Далайн дээрэмчид болон One Piece эрдэнэсийг хайх адал явдал.", answer: "One Piece", options: ["One Piece", "Naruto", "Bleach", "Dragon Ball"] },
    { id: 2, emojis: "🦊🍥🧡", hint: "Наруто хүү болон Навчит тосгоны нинжа нарын түүх.", answer: "Naruto", options: ["Naruto", "Boruto", "Hunter x Hunter", "My Hero Academia"] },
    { id: 3, emojis: "👹⚔️🌊", hint: "Чөтгөрүүдтэй тэмцэх Танжиро хүү болон түүний дүүгийн түүх.", answer: "Demon Slayer", options: ["Demon Slayer", "Jujutsu Kaisen", "Bleach", "Gintama"] },
    { id: 4, emojis: "📓🍎☠️", hint: "Нэр бичсэн хүнээ үхүүлдэг нууцлаг дэвтрийн түүх.", answer: "Death Note", options: ["Death Note", "Tokyo Ghoul", "Code Geass", "Psycho-Pass"] },
    { id: 5, emojis: "🛡️🦒🕊️", hint: "Хүнийг иддэг аварга биетүүд болон хананы цаана амьдрах хүн төрөлхтөн.", answer: "Attack on Titan", options: ["Attack on Titan", "Vinland Saga", "Fullmetal Alchemist", "Evangelion"] },
    { id: 6, emojis: "🦾⚡❤️", hint: "Алхимийн тусламжтайгаар ээжийгээ босгохыг оролдсон ах дүүс.", answer: "Fullmetal Alchemist", options: ["Fullmetal Alchemist", "Hunter x Hunter", "Soul Eater", "Fairy Tail"] },
    { id: 7, emojis: "👁️🤞🏫", hint: "Хараагдсан зүйлс болон Итадори хүүгийн шидтэний сургуулийн түүх.", answer: "Jujutsu Kaisen", options: ["Jujutsu Kaisen", "Chainsaw Man", "Mob Psycho 100", "Demon Slayer"] },
    { id: 8, emojis: "🐉🌟☄️", hint: "7 ширхэг луугийн бөмбөлөг хайх Гоку болон түүний нөхдийн түүх.", answer: "Dragon Ball", options: ["Dragon Ball", "One Punch Man", "Naruto", "Bleach"] },
    { id: 9, emojis: "⚡🧣🕸️", hint: "Ангуучийн шалгалт болон Гөн хүүгийн адал явдал.", answer: "Hunter x Hunter", options: ["Hunter x Hunter", "Yu Yu Hakusho", "Black Clover", "Fairy Tail"] },
    { id: 10, emojis: "🥦🦸‍♂️💥", hint: "Баатруудын сургууль болон ямар ч чадваргүй төрсөн Дэкүгийн түүх.", answer: "My Hero Academia", options: ["My Hero Academia", "One Punch Man", "Mob Psycho 100", "Black Clover"] }
  ],
  characterQuiz: [
    { id: 1, emojis: "🍥🍜🦊", hint: "Малгайтай шар үстэй, ирээдүйн Хокагэ болохыг хүсдэг, дотроо Есөн сүүлт үнэгтэй хүү хэн бэ?", answer: "Uzumaki Naruto", options: ["Uzumaki Naruto", "Uchiha Sasuke", "Hatake Kakashi", "Gaara"] },
    { id: 2, emojis: "👒🍖⚔️", hint: "Дэлхийн хамгийн агуу далайн дээрэмчин болж, One Piece эрдэнэсийг олохыг хүсдэг сүрлэн малгайт хүү хэн бэ?", answer: "Monkey D. Luffy", options: ["Monkey D. Luffy", "Roronoa Zoro", "Portgas D. Ace", "Shanks"] },
    { id: 3, emojis: "⚔️🌊👹", hint: "Дүү охиноо чөтгөр болохоос аварч, эргүүлэн хүн болгохын тулд чөтгөрийн ангууч болсон хүү хэн бэ?", answer: "Kamado Tanjiro", options: ["Kamado Tanjiro", "Agatsuma Zenitsu", "Hashibira Inosuke", "Tomioka Giyu"] },
    { id: 4, emojis: "🧹☕🧣", hint: "Хүн төрөлхтний хамгийн хүчирхэг цэрэг гэгддэг, цэвэрч байдлыг туйлын эрхэмлэдэг, Судалгааны ангийн ахмад хэн бэ?", answer: "Levi Ackerman", options: ["Levi Ackerman", "Eren Jaeger", "Erwin Smith", "Armin Arlert"] },
    { id: 5, emojis: "🕶️🤞🔴", hint: "Сэтгэлээсээ бусдыг хамгаалдаг, хязгааргүй нүдний чадвартай (Six Eyes), хамгийн хүчирхэг хараалын шидтэн хэн бэ?", answer: "Gojo Satoru", options: ["Gojo Satoru", "Itadori Yuji", "Fushiguro Megumi", "Ryomen Sukuna"] },
    { id: 6, emojis: "🥚🦸‍♂️✊", hint: "Сайтама гэдэг нэртэй, ганцхан цохилтоор ямар ч дайсныг ялдаг хүчирхэг баатар хэн бэ?", answer: "Saitama", options: ["Saitama", "Genos", "Mumen Rider", "Garou"] },
    { id: 7, emojis: "⚔️🟢🥃", hint: "Нүдний боолт зүүсэн, 3 сэлэм зэрэг ашиглаж тулалддаг 'Сүрлэн Малгайт' багийн дэд ахмад хэн бэ?", answer: "Roronoa Zoro", options: ["Roronoa Zoro", "Sanji", "Vinsmoke Judge", "Dracule Mihawk"] },
    { id: 8, emojis: "📓🍫🍎", hint: "Буруу хүмүүсийг устгахын тулд 'Үхлийн дэвтэр'-ийг ашигладаг, Кира нэрээр алдаршсан ухаалаг сурагч хэн бэ?", answer: "Light Yagami", options: ["Light Yagami", "L Lawliet", "Ryuk", "Near"] },
    { id: 9, emojis: "🦾⚡🤖", hint: "Элрик ах дүүсийн ах, төмөр гартай, дугуй зурахгүйгээр алхими ашигладаг 'Улсын Алхимич' хэн бэ?", answer: "Edward Elric", options: ["Edward Elric", "Alphonse Elric", "Roy Mustang", "Scar"] },
    { id: 10, emojis: "🎣⚡🎒", hint: "Аавыгаа олохын тулд Ангууч (Hunter) болсон, усан болон цахилгаан эрчим ашигладаг Жигүүрт арлын хүү хэн бэ?", answer: "Gon Freecss", options: ["Gon Freecss", "Killua Zoldyck", "Kurapika", "Leorio"] }
  ],
  powerQuiz: [
    { id: 1, emojis: "🌀🌀💥", hint: "Uzumaki Naruto-ийн хамгийн алдартай, гар дээрээ эргэлддэг чакра цуглуулж хийдэг довтолгооны техник юу вэ?", answer: "Rasengan", options: ["Rasengan", "Chidori", "Amaterasu", "Shinra Tensei"] },
    { id: 2, emojis: "🥊🩰🧬", hint: "Monkey D. Luffy-ийн биеэ сунгаж, резин шиг болгодог чөтгөрийн жимсний нэр юу вэ?", answer: "Gomu Gomu no Mi", options: ["Gomu Gomu no Mi", "Mera Mera no Mi", "Goro Goro no Mi", "Hito Hito no Mi"] },
    { id: 3, emojis: "👐🔵💥", hint: "Goku-ийн ашигладаг хамгийн алдартай, хоёр гараасаа цацруулдаг цэнхэр гэрлэн туяан довтолгоо юу вэ?", answer: "Kamehameha", options: ["Kamehameha", "Spirit Bomb", "Galick Gun", "Final Flash"] },
    { id: 4, emojis: "⚡🐦💥", hint: "Uchiha Sasuke-ийн ашигладаг, цахилгаан гүйдэл шиг чимээ гардаг, Какашигаас сурсан техник юу вэ?", answer: "Chidori", options: ["Chidori", "Rasengan", "Kirin", "Amaterasu"] },
    { id: 5, emojis: "🌌🤞🛡️", hint: "Gojo Satoru-ийн өөрийнх нь эргэн тойронд хязгааргүй орон зай үүсгэж, ямар ч довтолгоог хүргэдэггүй чадвар юу вэ?", answer: "Infinity (Limitless)", options: ["Infinity (Limitless)", "Hollow Purple", "Domain Expansion", "Blue"] },
    { id: 6, emojis: "🔥☀️🗡️", hint: "Kamado Tanjiro-ийн Усны амьсгалаас гадна ааваасаа өвлөн авсан галын хүчит амьсгалын техник юу вэ?", answer: "Hinokami Kagura", options: ["Hinokami Kagura", "Thunder Breathing", "Beast Breathing", "Flame Breathing"] },
    { id: 7, emojis: "👏🪨✨", hint: "Edward Elric-ийн алхимийн тойрог зурахгүйгээр зөвхөн гараа хавсран ашиглаж чаддаг чадвар юу вэ?", answer: "Circleless Transmutation", options: ["Circleless Transmutation", "Flame Alchemy", "Soul Binding", "Human Transmutation"] },
    { id: 8, emojis: "⚡⚡💀", hint: "Zenitsu-ийн ашиглаж чаддаг цорын ганц боловч хамгийн хурдан, хүчтэй аянгын амьсгалын хэлбэр юу вэ?", answer: "Thunder Breathing: First Form", options: ["Thunder Breathing: First Form", "Thunder Breathing: Seventh Form", "Water Breathing: First Form", "Beast Breathing: Fang"] },
    { id: 9, emojis: "⚡🏃‍♂️👟", hint: "Killua Zoldyck-ийн өөрийн аураг цахилгаан болгон хувиргаж, асар хурдан хөдлөх чадвар юу вэ?", answer: "Godspeed (Kanmuru)", options: ["Godspeed (Kanmuru)", "Jajanken", "Emperor Time", "Bungee Gum"] },
    { id: 10, emojis: "👑🦾🦖", hint: "Eren Jaeger-ийн аварга биетүүдийн удирдагч болж, хананы аварга биетүүдийг сэрээх чадвартай аварга биетийн нэр юу вэ?", answer: "Founding Titan", options: ["Founding Titan", "Attack Titan", "Colossal Titan", "Armored Titan"] }
  ]
};

export default function GameSection({ onNavigate }: GameSectionProps) {
  // Navigation Screens: "launcher" | "anime-modes" | "playing" | "gameover" | "victory"
  const [activeScreen, setActiveScreen] = useState<"launcher" | "anime-modes" | "playing" | "gameover" | "victory">("launcher");

  // Core sound toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active game variables
  const [selectedCategory, setSelectedCategory] = useState<keyof GameData | null>(null);
  const [allGameData, setAllGameData] = useState<GameData>(FALLBACK_GAME_DATA);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(5);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  
  // Selected answer state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [showPayoutOverlay, setShowPayoutOverlay] = useState<boolean>(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound helper wrapper
  const triggerSound = (type: "ding" | "buzz" | "click" | "win" | "lose") => {
    if (soundEnabled) playSound(type);
  };

  // Fetch data
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch("/data.json");
        if (response.ok) {
          const json = await response.json();
          if (json.emojiQuiz && json.characterQuiz && json.powerQuiz) {
            setAllGameData(json);
          }
        }
      } catch (err) {
        console.warn("Could not load /data.json, falling back to static local data", err);
      }
    };
    fetchGameData();
  }, []);

  // Timer logic for Anime Guess
  useEffect(() => {
    if (activeScreen === "playing" && selectedAnswer === null && !showPayoutOverlay) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeScreen, currentQuestionIndex, selectedAnswer, showPayoutOverlay]);

  // Stop active anime theme song whenever the active screen or question changes (e.g. transitioning to next question or screen)
  useEffect(() => {
    stopAnimeTheme();
    return () => {
      stopAnimeTheme();
    };
  }, [activeScreen, currentQuestionIndex]);

  const handleTimeUp = () => {
    triggerSound("buzz");
    setIsShaking(true);
    setIsAnswerCorrect(false);
    setSelectedAnswer("TIME_EXPIRED");
    const nextLives = lives - 1;
    setLives(nextLives);

    // Play the specific anime's iconic synthesized theme song when time runs out!
    const currentQ = currentQuestions[currentQuestionIndex];
    if (currentQ) {
      playAnimeTheme(currentQ.answer, soundEnabled);
    }

    // Show correct answer visual payout
    setShowPayoutOverlay(true);
  };

  const startQuiz = (category: keyof GameData) => {
    triggerSound("click");
    setSelectedCategory(category);
    
    // Shuffle options to make it replayable
    const questions = allGameData[category].map((q) => {
      const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
      return { ...q, options: shuffledOptions };
    });

    setCurrentQuestions(questions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setLives(5);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setShowPayoutOverlay(false);
    setActiveScreen("playing");
  };

  const handleAnswerSelect = (option: string) => {
    if (selectedAnswer !== null || showPayoutOverlay) return;
    const currentQ = currentQuestions[currentQuestionIndex];
    const isCorrect = option === currentQ.answer;
    
    setSelectedAnswer(option);
    setIsAnswerCorrect(isCorrect);

    // Play the specific anime's iconic synthesized theme song for both correct and incorrect guesses!
    playAnimeTheme(currentQ.answer, soundEnabled);

    if (isCorrect) {
      setScore((p) => p + 1);
    } else {
      triggerSound("buzz");
      setIsShaking(true);
      setLives((p) => p - 1);
    }

    if (timerRef.current) clearInterval(timerRef.current);

    // Turn on the beautiful popup containing the theme's image and full-blown theme melody
    setShowPayoutOverlay(true);
  };

  const handleNextClick = () => {
    setIsShaking(false);
    setShowPayoutOverlay(false);
    
    if (lives <= 0) {
      setActiveScreen("gameover");
      triggerSound("lose");
    } else {
      advanceQuestion();
    }
  };

  const advanceQuestion = () => {
    stopAnimeTheme(); // Stop the sound immediately on advancing
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setTimeLeft(30);
    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx < currentQuestions.length) {
      setCurrentQuestionIndex(nextIdx);
    } else {
      setActiveScreen("victory");
      triggerSound("win");
    }
  };

  // Category Mongolian helper labels
  const categoryTitles = {
    emojiQuiz: "Аниме Эможи Таавар",
    characterQuiz: "Аниме Дүр Таах",
    powerQuiz: "Хүч & Чадвар Таах"
  };

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const totalQuestionsCount = currentQuestions.length;

  // Screen 1: Original high-fidelity launcher matching user screenshot exactly!
  const renderLauncher = () => (
    <div className="w-full max-w-6xl flex flex-col space-y-8 px-4 py-8">
      {/* Top Header Row matching actual screenshot design */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <h1 className="font-sans text-3xl font-extrabold tracking-wider text-white">
          ТОГЛООМУУД
        </h1>
        
        {/* Close Button "X" to return to home */}
        <button 
          onClick={() => {
            triggerSound("click");
            onNavigate("home");
          }}
          className="p-3 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/20 rounded-xl transition-all duration-300 text-slate-400 hover:text-rose-400 cursor-pointer"
          title="Хаах"
        >
          <X size={22} />
        </button>
      </div>

      {/* Launcher Grid centered, displaying the single gorgeous card representing ANIME GUESS */}
      <div className="flex justify-center items-center w-full pt-12 pb-16">
        <motion.div 
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative rounded-3xl w-full max-w-sm h-[400px] border-2 border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.4)] bg-gradient-to-b from-[#12072b] to-[#04010a] p-8 text-left flex flex-col justify-between overflow-hidden group cursor-pointer"
          onClick={() => {
            triggerSound("click");
            setActiveScreen("anime-modes");
          }}
        >
          {/* Aesthetic Anime Background Image inside card representing the Tracer cosplay in screenshot */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-700 ease-out" 
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80')`
            }}
          />
          
          {/* Ambient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#04010a] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.25),transparent_70%)] pointer-events-none" />
          <div className="absolute bottom-[-10px] left-[-10px] w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/15 transition-colors duration-300" />
          
          {/* Floating anime icons inside card decoration */}
          <div className="absolute right-6 top-1/3 text-4xl opacity-20 rotate-12 select-none font-sans group-hover:rotate-6 transition-transform duration-300">
            🍥 👒 ⚔️
          </div>

          <div className="space-y-1 z-10">
            <span className="text-cyan-400 font-mono text-[10px] font-bold tracking-widest uppercase">
              TRIVIA QUIZ
            </span>
            <h3 className="font-sans text-3xl font-extrabold text-white tracking-tight leading-none mt-1">
              ANIME<br/>GUESS
            </h3>
          </div>

          {/* Bottom active Play button */}
          <div className="flex justify-between items-end z-10">
            <span className="text-[10px] font-mono text-purple-400">3 АНГИЛАЛ // 100% ОФЛАЙН</span>
            <div className="w-12 h-12 bg-purple-600 group-hover:bg-purple-500 text-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all duration-300 transform group-hover:scale-110">
              <Play size={20} className="fill-white translate-x-[1px]" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Screen 2: Select category inside Anime Guess
  const renderAnimeModes = () => (
    <div className="w-full max-w-5xl flex flex-col space-y-8 px-4 py-8">
      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="font-sans text-3xl font-extrabold tracking-wider text-white flex items-center space-x-3">
            <Gamepad2 className="text-purple-400" />
            <span>АНГИЛАЛ СОНГОХ // <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">ANIME GUESS</span></span>
          </h1>
          <p className="text-slate-500 font-mono text-[10px] tracking-widest mt-1">
            САНАЛ БОЛГОХ 3 СЕГМЕНТ // ОФЛАЙН ТОГЛОХ БОЛОМЖТОЙ
          </p>
        </div>

        {/* Sound toggle & Close Button */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              triggerSound("click");
            }}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 text-slate-400 hover:text-white cursor-pointer"
            title={soundEnabled ? "Дуу хаах" : "Дуу нээх"}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          
          <button 
            onClick={() => {
              triggerSound("click");
              setActiveScreen("launcher");
            }}
            className="p-3 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/20 rounded-xl transition-all duration-300 text-slate-400 hover:text-rose-400 cursor-pointer"
            title="Буцах"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Rules Info banner */}
      <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent border border-purple-500/10 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="p-3 bg-purple-400/10 border border-purple-400/20 rounded-2xl text-purple-400 animate-pulse">
          <Flame size={28} />
        </div>
        <div className="text-left space-y-1">
          <h4 className="font-sans text-sm font-semibold text-white tracking-wide">ТОГЛООМЫН ДҮРЭМ // RULES</h4>
          <p className="text-slate-400 font-sans text-xs leading-relaxed">
            ⏱️ ХУГАЦАА: Асуулт бүрт <strong>30 секунд</strong> байна. ❤️ АМЬ: Та <strong>5 амьтай</strong> эхлэх ба буруу хариулбал 1 амь хасагдана. ⭐ ОНОО: Зөв хариулт тутамд <strong>1 оноо</strong>. 🔥 BONUS: Хэрэв бүх 10 асуултанд алдалгүй зөв хариулбал <strong>+10 бонус оноо</strong> авна!
          </p>
        </div>
      </div>

      {/* Grid containing the 3 segments exactly as requested */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-4">
        
        {/* Card 1: EMOJI QUIZ */}
        <motion.div 
          whileHover={{ y: -6 }}
          className="relative rounded-3xl h-[380px] border border-white/10 hover:border-purple-500/30 bg-gradient-to-b from-[#13062c] to-[#04010a] p-6 text-left flex flex-col justify-between overflow-hidden group cursor-pointer"
          onClick={() => startQuiz("emojiQuiz")}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_70%)] pointer-events-none" />
          <div className="space-y-4 z-10">
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
              <Sparkles size={22} />
            </div>
            <div>
              <span className="text-purple-400 font-mono text-[9px] font-bold tracking-widest uppercase">SECTION 01</span>
              <h3 className="font-sans text-2xl font-extrabold text-white tracking-tight mt-1">
                Эможи<br/>Таавар
              </h3>
              <p className="text-slate-400 font-sans text-xs mt-3 leading-relaxed">
                Алдартай анимены нэрсийг сонирхолтой хөгжилтэй эможинуудаар илэрхийлсэн байгааг тааж тоглоорой!
              </p>
            </div>
          </div>

          <div className="flex justify-between items-end z-10">
            <span className="text-[10px] font-mono text-slate-500">10 АСУУЛТ // EMOJI QUIZ</span>
            <div className="w-10 h-10 border border-white/10 hover:border-purple-400 hover:text-purple-400 text-slate-400 rounded-full flex items-center justify-center transition-all duration-300">
              <Play size={14} className="translate-x-[1px] fill-current" />
            </div>
          </div>
        </motion.div>

        {/* Card 2: CHARACTER QUIZ */}
        <motion.div 
          whileHover={{ y: -6 }}
          className="relative rounded-3xl h-[380px] border border-white/10 hover:border-indigo-500/30 bg-gradient-to-b from-[#060c2c] to-[#01020a] p-6 text-left flex flex-col justify-between overflow-hidden group cursor-pointer"
          onClick={() => startQuiz("characterQuiz")}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_70%)] pointer-events-none" />
          <div className="space-y-4 z-10">
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
              <User size={22} />
            </div>
            <div>
              <span className="text-indigo-400 font-mono text-[9px] font-bold tracking-widest uppercase">SECTION 02</span>
              <h3 className="font-sans text-2xl font-extrabold text-white tracking-tight mt-1">
                Дүр<br/>Таах хэсэг
              </h3>
              <p className="text-slate-400 font-sans text-xs mt-3 leading-relaxed">
                Анимены алдартай дүрүүдийг тэдгээрийн онцлог шинж чанар, хэрэглэдэг зэвсэг бүхий эможи тайлбараар таагаарай.
              </p>
            </div>
          </div>

          <div className="flex justify-between items-end z-10">
            <span className="text-[10px] font-mono text-slate-500">10 АСУУЛТ // CHARACTER QUIZ</span>
            <div className="w-10 h-10 border border-white/10 hover:border-indigo-400 hover:text-indigo-400 text-slate-400 rounded-full flex items-center justify-center transition-all duration-300">
              <Play size={14} className="translate-x-[1px] fill-current" />
            </div>
          </div>
        </motion.div>

        {/* Card 3: POWER QUIZ */}
        <motion.div 
          whileHover={{ y: -6 }}
          className="relative rounded-3xl h-[380px] border border-white/10 hover:border-pink-500/30 bg-gradient-to-b from-[#240618] to-[#0a0105] p-6 text-left flex flex-col justify-between overflow-hidden group cursor-pointer"
          onClick={() => startQuiz("powerQuiz")}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.15),transparent_70%)] pointer-events-none" />
          <div className="space-y-4 z-10">
            <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/20 rounded-2xl flex items-center justify-center text-pink-400">
              <Eye size={22} />
            </div>
            <div>
              <span className="text-pink-400 font-mono text-[9px] font-bold tracking-widest uppercase">SECTION 03</span>
              <h3 className="font-sans text-2xl font-extrabold text-white tracking-tight mt-1">
                Хүч & Чадвар<br/>Таах хэсэг
              </h3>
              <p className="text-slate-400 font-sans text-xs mt-3 leading-relaxed">
                Дүрүүдийн ашигладаг тусгай техникийн нэршил, тэсрэлттэй онцгой хүчнүүдийг тайлбараар дамжуулан тааж шалгаарай.
              </p>
            </div>
          </div>

          <div className="flex justify-between items-end z-10">
            <span className="text-[10px] font-mono text-slate-500">10 АСУУЛТ // POWER QUIZ</span>
            <div className="w-10 h-10 border border-white/10 hover:border-pink-400 hover:text-pink-400 text-slate-400 rounded-full flex items-center justify-center transition-all duration-300">
              <Play size={14} className="translate-x-[1px] fill-current" />
            </div>
          </div>
        </motion.div>

      </div>

      {/* Redirect bottom flow button */}
      <div className="flex justify-center pt-8">
        <button 
          onClick={() => onNavigate("contact")}
          className="group relative px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-2xl font-sans text-xs font-semibold tracking-wider transition-all duration-300 flex items-center space-x-3 cursor-pointer"
        >
          <span>ДАРААГИЙН ХЭСЭГ // ХОЛБОО БАРИХ</span>
          <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform text-purple-400" />
        </button>
      </div>
    </div>
  );

  // Active playing view
  const renderPlaying = () => {
    if (!currentQuestion) return null;

    const timerProgress = (timeLeft / 30) * 100;
    const timerColor = timeLeft > 15 ? "bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]" : timeLeft > 7 ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" : "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse";

    const animeNameKey = currentQuestion.answer;
    const fallbackImage = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80";
    const resolvedImage = ANIME_IMAGES[animeNameKey] || ANIME_IMAGES[getAnimeNameFromAnswer(animeNameKey)] || fallbackImage;

    return (
      <div className="w-full max-w-3xl flex flex-col space-y-6 relative">
        
        {/* Game stats panel */}
        <div className="grid grid-cols-3 gap-3 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
          <div className="flex flex-col items-start justify-center">
            <span className="text-slate-500 font-mono text-[9px] tracking-wider">АНГИЛАЛ</span>
            <span className="text-purple-300 font-sans text-[11px] font-bold truncate max-w-full">
              {selectedCategory ? categoryTitles[selectedCategory] : ""}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center border-x border-white/10">
            <span className="text-slate-500 font-mono text-[9px] tracking-wider">ОНОО</span>
            <div className="flex items-center space-x-1 text-amber-400">
              <Trophy size={14} />
              <span className="font-mono text-base font-bold">{score} / {totalQuestionsCount}</span>
            </div>
          </div>

          <div className="flex flex-col items-end justify-center">
            <span className="text-slate-500 font-mono text-[9px] tracking-wider">АМЬ (LIVES)</span>
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Heart 
                  key={i} 
                  size={14} 
                  className={`${i < lives ? "text-rose-500 fill-rose-500" : "text-white/20"} transition-all duration-300`} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Custom Progress countdown line */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${timerColor}`}
            initial={{ width: "100%" }}
            animate={{ width: `${timerProgress}%` }}
            transition={{ duration: 0.2, ease: "linear" }}
          />
        </div>

        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400">АСУУЛТ {currentQuestionIndex + 1} / {totalQuestionsCount}</span>
          <span className={`flex items-center space-x-1 ${timeLeft < 10 ? "text-rose-400 font-bold" : "text-slate-400"}`}>
            <Timer size={14} className={timeLeft < 10 ? "animate-spin" : ""} />
            <span>{timeLeft} СЕКУНД</span>
          </span>
        </div>

        {/* Transitioned Question Box wrapper */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`bg-white/5 backdrop-blur-2xl border ${isAnswerCorrect === false ? "border-rose-500/30" : isAnswerCorrect === true ? "border-emerald-500/30" : "border-white/10"} rounded-[32px] p-8 md:p-10 text-center relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.02),transparent_60%)] pointer-events-none" />

            <motion.div
              animate={isShaking ? { x: [-12, 12, -12, 12, -6, 6, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Emojis Block */}
              <div className="flex justify-center">
                <div className="relative p-6 bg-white/5 rounded-[24px] border border-white/10 text-6xl md:text-7xl select-none tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                  {currentQuestion.emojis}
                </div>
              </div>

              {/* Hint Context description */}
              {currentQuestion.hint && (
                <div className="bg-white/[0.02] border border-white/5 px-6 py-3 rounded-xl max-w-xl mx-auto">
                  <p className="text-slate-300 font-sans text-sm md:text-base leading-relaxed font-light">
                    {currentQuestion.hint}
                  </p>
                </div>
              )}

              {/* Choice options grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isThisCorrect = option === currentQuestion.answer;
                  
                  let btnStyle = "bg-white/5 hover:bg-white/10 border-white/10 hover:border-purple-400/20 text-slate-200 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]";
                  
                  if (selectedAnswer !== null) {
                    if (isThisCorrect) {
                      btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] font-bold";
                    } else if (isSelected && !isThisCorrect) {
                      btnStyle = "bg-rose-500/20 border-rose-500 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.3)] font-bold";
                    } else {
                      btnStyle = "bg-white/[0.01] border-white/5 text-slate-500 pointer-events-none scale-[0.98]";
                    }
                  }

                  return (
                    <motion.button
                      id={`option-${idx}`}
                      key={idx}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={selectedAnswer !== null || showPayoutOverlay}
                      className={`py-4 px-6 rounded-2xl border font-sans text-sm tracking-wide text-left flex items-center justify-between transition-all duration-300 cursor-pointer ${btnStyle}`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs text-slate-500 bg-white/5 w-6 h-6 rounded-full flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span>{option}</span>
                      </div>
                      
                      {selectedAnswer !== null && isThisCorrect && (
                        <span className="w-5 h-5 bg-emerald-500/20 border border-emerald-400 rounded-full flex items-center justify-center text-emerald-400 text-[10px] animate-bounce">
                          ✓
                        </span>
                      )}
                      {selectedAnswer !== null && isSelected && !isThisCorrect && (
                        <span className="w-5 h-5 bg-rose-500/20 border border-rose-400 rounded-full flex items-center justify-center text-rose-400 text-[10px]">
                          ✗
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Dynamic visual payout card overlay on correct/incorrect answer that plays character visual and music! */}
        <AnimatePresence>
          {showPayoutOverlay && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/98 backdrop-blur-2xl rounded-[32px] flex flex-col items-center justify-center p-6 md:p-8 z-30 space-y-6"
            >
              {/* Dynamic feedback header */}
              <motion.div 
                initial={{ scale: 0.9, y: -10, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
                className="text-center"
              >
                <h2 className={`font-sans text-3xl md:text-4xl font-extrabold tracking-widest uppercase ${
                  isAnswerCorrect 
                    ? "text-[#00E676] drop-shadow-[0_0_15px_rgba(0,230,118,0.6)]" 
                    : selectedAnswer === "TIME_EXPIRED"
                    ? "text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                    : "text-rose-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]"
                }`}>
                  {isAnswerCorrect ? "ЗӨВ БАЙНА!" : selectedAnswer === "TIME_EXPIRED" ? "ХУГАЦАА ДУУССАН!" : "БУРУУ БАЙНА!"}
                </h2>
              </motion.div>

              {/* Beautiful visual layout containing the anime's representation */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className={`relative w-72 h-72 md:w-80 md:h-80 rounded-[24px] overflow-hidden group border-2 ${
                  isAnswerCorrect 
                    ? "border-[#00E676] shadow-[0_0_30px_rgba(0,230,118,0.3)]" 
                    : selectedAnswer === "TIME_EXPIRED"
                    ? "border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                    : "border-rose-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                }`}
              >
                <img 
                  src={resolvedImage} 
                  alt={currentQuestion.answer}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-[4000ms] ease-out"
                />
                
                {/* Overlay with equalizer */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[9px] font-mono text-purple-300">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" />
                    <span>АЯ ТОГЛОЖ БАЙНА</span>
                  </div>
                  
                  {/* Equalizer lines */}
                  <div className="flex items-end space-x-0.5 h-3">
                    <div className="w-0.5 bg-purple-400 h-2 animate-[pulse_0.6s_infinite]" />
                    <div className="w-0.5 bg-pink-400 h-3 animate-[pulse_0.4s_infinite_0.1s]" />
                    <div className="w-0.5 bg-amber-400 h-1.5 animate-[pulse_0.8s_infinite_0.2s]" />
                    <div className="w-0.5 bg-cyan-400 h-3.5 animate-[pulse_0.5s_infinite_0.15s]" />
                  </div>
                </div>
              </motion.div>

              {/* Pill showing the anime name directly below the image */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="px-8 py-3 bg-[#242424] text-white font-bold text-base md:text-lg rounded-2xl border border-white/5 shadow-md max-w-[90%] truncate text-center"
              >
                {currentQuestion.answer}
              </motion.div>

              {/* Solid action button to advance */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  onClick={handleNextClick}
                  className="bg-[#00A86B] hover:bg-[#00C47C] text-white py-3.5 px-10 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-[0_4px_15px_rgba(0,168,107,0.35)] hover:scale-[1.02]"
                >
                  <span>
                    {lives <= 0 || currentQuestionIndex + 1 >= currentQuestions.length 
                      ? "ҮР ДҮН ХАРАХ ➔" 
                      : "ДАРААГИЙН АСУУЛТ ➔"}
                  </span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back navigation out of play */}
        <div className="flex justify-start">
          <button 
            onClick={() => {
              triggerSound("click");
              setActiveScreen("anime-modes");
            }}
            className="text-slate-500 hover:text-slate-300 font-mono text-[10px] tracking-widest flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <span>← ТОГЛООМЫГ ЦУЦЛАХ // EXIT</span>
          </button>
        </div>
      </div>
    );
  };

  // GameOver display screen
  const renderGameOver = () => (
    <div className="w-full max-w-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 backdrop-blur-2xl border border-rose-500/20 rounded-[32px] p-10 text-center space-y-6"
      >
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Heart size={32} className="fill-rose-500/10" />
        </div>

        <div className="space-y-3">
          <span className="text-rose-400 font-mono text-xs tracking-widest">АМЬ ДУУССАН // GAME OVER</span>
          <h2 className="font-sans text-2xl font-bold text-white tracking-wider">
            ХАРАМСАЛТАЙ НЬ АМЬ ДУУСЛАА!
          </h2>
          <p className="text-slate-400 font-sans text-sm leading-relaxed max-w-md mx-auto">
            Та {totalQuestionsCount} асуултаас <strong>{score}</strong>-т нь амжилттай зөв хариулсан байна. Дараагийн удаа илүү сайн бэлдээд дахин оролдоорой!
          </p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl max-w-xs mx-auto">
          <span className="text-slate-500 font-mono text-[10px]">ЦУГЛУУЛСАН ОНОО</span>
          <div className="text-3xl font-mono font-bold text-amber-400 mt-1">{score}</div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button 
            onClick={() => selectedCategory && startQuiz(selectedCategory)}
            className="px-6 py-3 bg-rose-500/20 hover:bg-rose-500 text-white hover:text-black font-semibold rounded-xl text-xs tracking-wider transition-all duration-300 border border-rose-500/20 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>ДАХИН ТОГЛОХ</span>
          </button>
          <button 
            onClick={() => {
              triggerSound("click");
              setActiveScreen("anime-modes");
            }}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold rounded-xl text-xs tracking-wider transition-all duration-300 border border-white/10 flex items-center justify-center cursor-pointer"
          >
            <span>МЕНЮ РҮҮ БУЦАХ</span>
          </button>
        </div>
      </motion.div>
    </div>
  );

  // Victory congratulations screen
  const renderVictory = () => {
    const hasPerfectScore = score === 10;
    const finalScore = hasPerfectScore ? score + 10 : score;

    return (
      <div className="w-full max-w-xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-2xl border border-purple-400/20 rounded-[32px] p-10 text-center space-y-6"
        >
          <div className="relative">
            <div className="w-16 h-16 bg-purple-400/10 border border-purple-400/20 text-purple-400 rounded-full flex items-center justify-center mx-auto">
              <Trophy size={32} />
            </div>
            {hasPerfectScore && (
              <div className="absolute top-0 right-[35%] bg-amber-400 text-black text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5 animate-bounce">
                <Flame size={8} />
                <span>+10 BONUS!</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <span className="text-purple-400 font-mono text-xs tracking-widest">АМЖИЛТТАЙ ДУУСЛАА // COMPLETED</span>
            <h2 className="font-sans text-2xl font-bold text-white tracking-wider">
              БАЯР ХҮРГЭЕ!
            </h2>
            <p className="text-slate-400 font-sans text-sm leading-relaxed max-w-md mx-auto">
              Та сонгосон аниме тааварт тоглоомыг амжилттай дуусгалаа. 
              {hasPerfectScore ? (
                <span className="text-amber-300 block mt-2 font-semibold">
                  УРРА! Та бүх 10 асуултанд 100% зөв хариулсан тул 🔥 +10 бонус оноо нэмэгдлээ!
                </span>
              ) : (
                " Сүүлчийн асуулт хүртэл амьд үлдэж, өөрийн мэдлэгээ баталж чадлаа."
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
              <span className="text-slate-500 font-mono text-[9px]">ЗӨВ ХАРИУЛТ</span>
              <div className="text-xl font-mono font-bold text-white mt-0.5">{score} / 10</div>
            </div>
            <div className="bg-white/[0.02] border border-purple-400/10 p-3 rounded-xl shadow-cyber-glow">
              <span className="text-slate-500 font-mono text-[9px]">НИЙТ ОНОО</span>
              <div className="text-xl font-mono font-bold text-purple-400 mt-0.5">{finalScore}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button 
              onClick={() => selectedCategory && startQuiz(selectedCategory)}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-400 text-black font-bold rounded-xl text-xs tracking-wider transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              <RefreshCw size={14} />
              <span>ДАХИН ТОГЛОХ</span>
            </button>
            <button 
              onClick={() => {
                triggerSound("click");
                setActiveScreen("anime-modes");
              }}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold rounded-xl text-xs tracking-wider transition-all duration-300 border border-white/10 flex items-center justify-center cursor-pointer"
            >
              <span>ӨӨР АНГИЛАЛ СОНГОХ</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div id="game-section" className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center py-12 px-4 md:px-8 lg:px-16">
      {/* Ambient background visual */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.02),transparent_75%)] pointer-events-none" />

      {/* Screen Router Container with transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeScreen}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="w-full flex justify-center items-center"
        >
          {activeScreen === "launcher" && renderLauncher()}
          {activeScreen === "anime-modes" && renderAnimeModes()}
          {activeScreen === "playing" && renderPlaying()}
          {activeScreen === "gameover" && renderGameOver()}
          {activeScreen === "victory" && renderVictory()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
