import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gamepad2, ArrowRight, Sparkles, Heart, Timer, Trophy, Zap, RefreshCw, 
  Volume2, VolumeX, Flame, ChevronRight, User, Eye, X, Play, Trash2,
  Music, Pause
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

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  category: keyof GameData;
  timestamp: string;
}

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [];

// Map of high quality anime themed image URLs from Unsplash for visual payoff
const ANIME_IMAGES: Record<string, string> = {
  "One Piece": "https://m.media-amazon.com/images/M/MV5BMTNjNGU4NTUtYmVjMy00YjRiLTkxMWUtNzZkMDNiYjZhNmViXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg", 
  "Naruto": "https://m.media-amazon.com/images/M/MV5BNTk3MDA1ZjAtNTRhYS00YzNiLTgwOGEtYWRmYTQ3NjA0NTAwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
  "Demon Slayer": "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&auto=format&fit=crop&q=80",
  "Death Note": "https://m.media-amazon.com/images/M/MV5BYTgyZDhmMTEtZDFhNi00MTc4LTg3NjUtYWJlNGE5Mzk2NzMxXkEyXkFqcGc@._V1_QL75_UX190_CR0,2,190,281_.jpg",
  "Attack on Titan": "https://m.media-amazon.com/images/M/MV5BZjliODY5MzQtMmViZC00MTZmLWFhMWMtMjMwM2I3OGY1MTRiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
  "Fullmetal Alchemist": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCc85uII7t27diIuZbp0VQrWeHrea3SPlrsu7ik_AWkwsNqQfTLKxR9zXW&s=10",
  "Jujutsu Kaisen": "https://m.media-amazon.com/images/M/MV5BMjBlNTExMDAtMWZjZi00MDc5LWFkMjgtZDU0ZWQ5ODk3YWY5XkEyXkFqcGc@._V1_.jpg",
  "Dragon Ball": "https://m.media-amazon.com/images/M/MV5BNmFiM2FkYTYtY2FiOS00ZWJkLTkyOTgtNmFmODI4NjcwNDgzXkEyXkFqcGc@._V1_.jpg",
  "Hunter x Hunter": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPsSFwg5KHyr44lDoCQoUMTfG9Y1WhOezmB1H_3DHgF731bLgNe-dyloE&s=10",
  "My Hero Academia": "https://m.media-amazon.com/images/M/MV5BY2QzODA5OTQtYWJlNi00ZjIzLThhNTItMDMwODhlYzYzMjA2XkEyXkFqcGc@._V1_.jpg",
  "Uzumaki Naruto": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5uZ0mo-J-P7fhspfZZnKBdjip-LAKo9VGI9nxD936Ow&s=10",
  "Monkey D. Luffy": "https://static.beebom.com/wp-content/uploads/2025/01/Luffys-Hito-Hito-no-Mi-Model-Nika.jpg?w=1024",
  "Kamado Tanjiro": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRA5rvgWnV-3cxSf10IAtjqrm3_VJDkZL7sZ9fjZ2A1-A&s",
  "Levi Ackerman": "https://paintwaint.in/cdn/shop/files/Background-2025-06-21T151246.166.png?v=1750660060&width=1584",
  "Gojo Satoru": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0ydnSlVc4kz7X_q161uPpJOEM6q5IYuVobFnaYMFp67HC0y56jsEbuJk&s=10",
  "Saitama": "https://static.wikia.nocookie.net/great-characters/images/2/27/Saitama.png/revision/latest?cb=20210824165554",
  "Roronoa Zoro": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-ZOYnPUj-HRvlPu8iGSQW9cQFlPG76oKXSSPSRuqBWA&s=10",
  "Light Yagami": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtuZ3jjpbGd-Vulf73ZMHmV8hLm2u4xLINWSEDx-mrBw&s=10",
  "Edward Elric": "https://static.wikitide.net/greatcharacterswiki/thumb/0/05/Ed_prof.png/869px-Ed_prof.png",
  "Gon Freecss": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVdM8dDmL1rq_uYWB-2Eck_o4p9ZzzP9q1HgXp9lz6sPrHJHgwrDEFgRk&s=10",
  "Rasengan": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3-p9K91d9cK0AFAeoM39cHZsLNvNUqQi7n1uiI3phLvYgIWfh2nQmXdxi&s=10",
  "Gomu Gomu no Mi": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH22byKsdoPqsMyUffvsD70JCUphVn926SnAtt2GFJ8w&s=10",
  "Kamehameha": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOCXBpJXDQNQ-T_UpcC7vyuyMj-v6yidHsyV_ns5s9HH3pXxtkP0uPEGA&s=10",
  "Chidori": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuXMc7mbaEZnsfJVYJgmn9U0CX4sqkObEWNGDSO-eQr2C6CfHusoCh-9Rx&s=10",
  "Infinity (Limitless)": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWolhB8UV2zqXp1iaAjtfTKpsxw8ZCiah4Cs06HsAZWhyBBIHcQV19DpQ&s=10",
  "Hinokami Kagura": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLCvOSoAc9mc8RL5KpheiaMlepnwe7xthr-ZbUdTExzy-OZUxanwW1mLF3&s=10",
  "Circleless Transmutation": "https://i.sstatic.net/dmAaD.jpg",
  "Thunder Breathing: First Form": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCbr3GR38o4OZPwgLVPSrRyXZybu_Y6KOgRiHYW16-LR3CGM6mwxU-Kfu8&s=10",
  "Godspeed (Kanmuru)": "https://i.pinimg.com/736x/6d/89/d8/6d89d8c0f1dbf2e17bc9ee8e578e20fa.jpg",
  "Founding Titan": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFFRA0yd-R0D3vzzx2gim5jY2hwLk9kmZP5_e-nUQA7g&s"
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
let activeAudioElement: HTMLAudioElement | null = null;

// Curated collection of high quality, stable, and public original anime theme MP3 files from Archive.org
const ANIME_MP3_URLS: Record<string, string> = {
  "Naruto": "https://archive.org/download/naruto-shippuden-opening-3-blue-bird-mp-3-160-k/Naruto%20Shippuden%20Opening%203%20_%20Blue%20Bird%28MP3_160K%29.mp3",
  "One Piece": "https://archive.org/download/tvtunes_20333/One%20Piece%20-%20We%20Are%20-%20Full.mp3",
  "Demon Slayer": "https://archive.org/download/gurenge/gurenge.mp3",
  "Dragon Ball": "https://archive.org/download/dbz-hsc-01-ongatesen-flac/01.%20CHA-LA%20HEAD-CHA-LA.mp3",
  "Attack on Titan": "https://archive.org/download/guren-no-yumiya/Guren%20no%20Yumiya.mp3",
  "Death Note": "https://archive.org/download/nightmare-the-world/Nightmare%20-%20the%20WORLD.mp3",
  "Jujutsu Kaisen": "https://archive.org/download/jujutsu-kaisen-op-1-eve-kaikai-kitan/Jujutsu%20Kaisen%20OP%201%20-%E3%80%8EEve%20-%20Kaikai%20Kitan%E3%80%8F.mp3",
  "Fullmetal Alchemist": "https://archive.org/download/tvtunes_17740/Fullmetal%20Alchemist%20-%20Brotherhood%20-%20Again.mp3",
  "Hunter x Hunter": "https://archive.org/download/tvtunes_29284/Hunter%20X%20Hunter%20-%202011%20-%20Opening%20-%20Full.mp3",
  "My Hero Academia": "https://archive.org/download/musica_202602/01%20-%20THE%20DAY%20%5BBoku%20no%20Hero%20Academia%20Opening%5D.mp3"
};

// Callback to sync audio player with React component state
let onThemeSongStateChange: ((state: { playing: boolean; loading: boolean }) => void) | null = null;

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
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.src = "";
      activeAudioElement.load();
    } catch (e) {
      console.warn("Could not stop activeAudioElement", e);
    }
    activeAudioElement = null;
  }
  onThemeSongStateChange?.({ playing: false, loading: false });
};

// Play a soft, beautiful, and pleasant chime as a modern fallback instead of annoying repetitive beep-beeps
const playSyntheticTheme = (animeName: string) => {
  try {
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
      
      gain.gain.setValueAtTime(0.04, start); // Soft volume
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration - 0.02);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    const now = ctx.currentTime;
    // Beautiful, gentle major triad arpeggio (C5 - E5 - G5)
    playNote(523.25, now, 0.3, "sine");
    playNote(659.25, now + 0.1, 0.3, "sine");
    playNote(783.99, now + 0.2, 0.4, "sine");
  } catch (e) {
    console.warn("Web Audio blocked.", e);
  }
};

// Play either the authentic full MP3 song or fall back seamlessly to a soft chime
const playAnimeTheme = (answer: string, enabled: boolean) => {
  if (!enabled) return;
  try {
    stopAnimeTheme(); // Stop any currently active music first!

    const animeName = getAnimeNameFromAnswer(answer);
    const mp3Url = ANIME_MP3_URLS[animeName];

    if (mp3Url) {
      onThemeSongStateChange?.({ playing: false, loading: true });
      const audio = new Audio();
      audio.src = mp3Url;
      audio.volume = 0.35; // Set beautiful background volume
      activeAudioElement = audio;

      audio.onplaying = () => {
        onThemeSongStateChange?.({ playing: true, loading: false });
      };

      audio.onpause = () => {
        onThemeSongStateChange?.({ playing: false, loading: false });
      };

      audio.onended = () => {
        onThemeSongStateChange?.({ playing: false, loading: false });
      };

      audio.onerror = (e) => {
        console.warn(`Original MP3 load error for ${animeName}. Falling back to soft chime.`, e);
        onThemeSongStateChange?.({ playing: false, loading: false });
        playSyntheticTheme(animeName);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`Now playing authentic background theme song for ${animeName}`);
          })
          .catch((err) => {
            console.warn(`Autoplay blocked for original MP3 of ${animeName}. Falling back to soft chime.`, err);
            onThemeSongStateChange?.({ playing: false, loading: false });
            playSyntheticTheme(animeName);
          });
      }
    } else {
      playSyntheticTheme(animeName);
    }
  } catch (err) {
    console.warn("Could not play anime theme", err);
    onThemeSongStateChange?.({ playing: false, loading: false });
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

  // Theme song states
  const [themeSongPlaying, setThemeSongPlaying] = useState<boolean>(false);
  const [themeSongLoading, setThemeSongLoading] = useState<boolean>(false);

  // Sync state changes with the global audio handlers
  useEffect(() => {
    onThemeSongStateChange = (state) => {
      setThemeSongPlaying(state.playing);
      setThemeSongLoading(state.loading);
    };
    return () => {
      onThemeSongStateChange = null;
    };
  }, []);

  const toggleThemeSong = () => {
    if (activeAudioElement) {
      if (activeAudioElement.paused) {
        activeAudioElement.play().catch((err) => {
          console.warn("Manual play blocked", err);
        });
      } else {
        activeAudioElement.pause();
      }
    } else {
      const currentQ = currentQuestions[currentQuestionIndex];
      if (currentQ) {
        playAnimeTheme(currentQ.answer, true); // force enable for manual click
      }
    }
  };

  // Persistent user scores and statistics (saved to localStorage)
  const [highScores, setHighScores] = useState<Record<string, number>>({
    emojiQuiz: 0,
    characterQuiz: 0,
    powerQuiz: 0
  });
  const [lastScores, setLastScores] = useState<Record<string, number>>({
    emojiQuiz: 0,
    characterQuiz: 0,
    powerQuiz: 0
  });
  const [totalAccumulatedPoints, setTotalAccumulatedPoints] = useState<number>(0);

  // Player details and leaderboard states
  const [playerName, setPlayerName] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showNamePrompt, setShowNamePrompt] = useState<boolean>(false);
  const [pendingCategory, setPendingCategory] = useState<keyof GameData | null>(null);

  const fetchSharedLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard");
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
        localStorage.setItem("anime_guess_leaderboard", JSON.stringify(data));
      }
    } catch (e) {
      console.error("Could not fetch shared leaderboard", e);
    }
  };

  // Fetch shared leaderboard on active screen changes (e.g. entering home/launcher screen)
  useEffect(() => {
    fetchSharedLeaderboard();
  }, [activeScreen]);

  // Load stats from localStorage on mount
  useEffect(() => {
    const storedHighScores = localStorage.getItem("anime_guess_high_scores");
    if (storedHighScores) {
      try {
        setHighScores(JSON.parse(storedHighScores));
      } catch (e) {
        console.error("Could not parse high scores", e);
      }
    }
    const storedLastScores = localStorage.getItem("anime_guess_last_scores");
    if (storedLastScores) {
      try {
        setLastScores(JSON.parse(storedLastScores));
      } catch (e) {
        console.error("Could not parse last scores", e);
      }
    }
    const storedTotal = localStorage.getItem("anime_guess_total_points");
    if (storedTotal) {
      setTotalAccumulatedPoints(parseInt(storedTotal, 10) || 0);
    }

    const storedName = localStorage.getItem("anime_guess_player_name");
    if (storedName) {
      setPlayerName(storedName);
    } else {
      setPlayerName("Шинэ Тоглогч");
    }

    const storedLeaderboard = localStorage.getItem("anime_guess_leaderboard");
    if (storedLeaderboard) {
      try {
        const parsed = JSON.parse(storedLeaderboard);
        const filtered = Array.isArray(parsed) ? parsed.filter((entry: any) => entry && entry.id && !entry.id.startsWith("def-")) : [];
        setLeaderboard(filtered);
        localStorage.setItem("anime_guess_leaderboard", JSON.stringify(filtered));
      } catch (e) {
        console.error("Could not parse leaderboard", e);
        setLeaderboard(DEFAULT_LEADERBOARD);
      }
    } else {
      setLeaderboard(DEFAULT_LEADERBOARD);
      localStorage.setItem("anime_guess_leaderboard", JSON.stringify(DEFAULT_LEADERBOARD));
    }
  }, []);

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

  const handleCategoryClick = (category: keyof GameData) => {
    triggerSound("click");
    setPendingCategory(category);
    setShowNamePrompt(true);
  };

  const saveResult = (finalRawScore: number, isVictory: boolean) => {
    if (!selectedCategory) return;
    
    // Calculate final score with perfect score +10 bonus
    const isPerfect = finalRawScore === 10;
    const computedScore = (isVictory && isPerfect) ? finalRawScore + 10 : finalRawScore;

    // 1. Update high scores
    setHighScores((prev) => {
      const currentHigh = prev[selectedCategory] || 0;
      if (computedScore > currentHigh) {
        const updated = { ...prev, [selectedCategory]: computedScore };
        localStorage.setItem("anime_guess_high_scores", JSON.stringify(updated));
        return updated;
      }
      return prev;
    });

    // 2. Update last scores
    setLastScores((prev) => {
      const updated = { ...prev, [selectedCategory]: computedScore };
      localStorage.setItem("anime_guess_last_scores", JSON.stringify(updated));
      return updated;
    });

    // 3. Update total accumulated points
    setTotalAccumulatedPoints((prev) => {
      const updated = prev + computedScore;
      localStorage.setItem("anime_guess_total_points", updated.toString());
      return updated;
    });

    // 4. Update leaderboard
    const activeName = playerName.trim() || "Шинэ Тоглогч";
    const newEntry: LeaderboardEntry = {
      id: Math.random().toString(36).substring(2, 11),
      name: activeName,
      score: computedScore,
      category: selectedCategory,
      timestamp: new Date().toLocaleDateString("mn-MN") + " " + new Date().toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" })
    };

    fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: activeName,
        score: computedScore,
        category: selectedCategory,
        timestamp: newEntry.timestamp
      })
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Server response not ok");
      })
      .then((data) => {
        setLeaderboard(data);
        localStorage.setItem("anime_guess_leaderboard", JSON.stringify(data));
      })
      .catch((err) => {
        console.error("Failed to sync leaderboard score with server:", err);
        setLeaderboard((prev) => {
          const combined = [...prev, newEntry];
          const sorted = combined.sort((a, b) => b.score - a.score);
          const updated = sorted.slice(0, 15); // Keep top 15
          localStorage.setItem("anime_guess_leaderboard", JSON.stringify(updated));
          return updated;
        });
      });
  };

  const resetStats = () => {
    const defaultScores = { emojiQuiz: 0, characterQuiz: 0, powerQuiz: 0 };
    setHighScores(defaultScores);
    setLastScores(defaultScores);
    setTotalAccumulatedPoints(0);
    setLeaderboard(DEFAULT_LEADERBOARD);
    localStorage.removeItem("anime_guess_high_scores");
    localStorage.removeItem("anime_guess_last_scores");
    localStorage.removeItem("anime_guess_total_points");
    localStorage.setItem("anime_guess_leaderboard", JSON.stringify(DEFAULT_LEADERBOARD));

    fetch("/api/leaderboard/reset", { method: "POST" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to reset leaderboard on server");
      })
      .then((data) => {
        setLeaderboard(data);
      })
      .catch((err) => {
        console.error("Failed to reset server leaderboard:", err);
      });
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
      saveResult(score, false);
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
      saveResult(score, true);
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

  const getPlayerRank = (points: number) => {
    if (points === 0) return { title: "Шинэ Тоглогч", emoji: "🆕", color: "text-slate-400 border-slate-500/20 bg-slate-500/5" };
    if (points <= 20) return { title: "Сургуулиа Төгсөгч (Genin)", emoji: "🍥", color: "text-blue-400 border-blue-500/20 bg-blue-500/5" };
    if (points <= 55) return { title: "Хашир Дайчин (Chunin)", emoji: "⚔️", color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5" };
    if (points <= 100) return { title: "Домогт Баатар (Jonin)", emoji: "🔥", color: "text-purple-400 border-purple-500/20 bg-purple-500/5" };
    return { title: "Аниме Сүнс (Hokage)", emoji: "👑", color: "text-amber-400 border-amber-500/20 bg-amber-500/5" };
  };

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

      {/* Centered layout for single Game Selection Card */}
      <div className="flex justify-center items-center w-full pt-8 pb-16 mx-auto">
        {/* Interactive launcher card */}
        <div className="flex justify-center items-center w-full max-w-sm">
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative rounded-3xl w-full h-[400px] border-2 border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.4)] bg-gradient-to-b from-[#12072b] to-[#04010a] p-8 text-left flex flex-col justify-between overflow-hidden group cursor-pointer"
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
    </div>
  );

  // Screen 2: Select category inside Anime Guess
  const renderAnimeModes = () => (
    <div className="w-full max-w-7xl flex flex-col space-y-8 px-4 py-8">
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

      {/* Main Grid: Game Selection on the left, Stats & Leaderboard on the right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        {/* Left column: Game Selection & Rules (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Rules Info banner */}
          <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent border border-purple-500/10 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center">
            <div className="p-3 bg-purple-400/10 border border-purple-400/20 rounded-2xl text-purple-400 animate-pulse">
              <Flame size={24} />
            </div>
            <div className="text-left space-y-1">
              <h4 className="font-sans text-xs font-semibold text-white tracking-wide">ТОГЛООМЫН ДҮРЭМ // RULES</h4>
              <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                ⏱️ ХУГАЦАА: Асуулт бүрт <strong>30 секунд</strong> байна. ❤️ АМЬ: Та <strong>5 амьтай</strong> эхлэх ба буруу хариулбал 1 амь хасагдана. ⭐ BONUS: Хэрэв бүх 10 асуултанд алдалгүй зөв хариулбал <strong>+10 бонус оноо</strong> авна!
              </p>
            </div>
          </div>

          {/* Grid containing the 3 segments */}
          <div className="grid grid-cols-1 gap-4 w-full">
            
            {/* Card 1: EMOJI QUIZ */}
            <motion.div 
              whileHover={{ y: -4, scale: 1.01 }}
              className="relative rounded-2xl border border-white/10 hover:border-purple-500/30 bg-gradient-to-r from-[#13062c] to-[#04010a] p-5 text-left flex flex-col sm:flex-row items-center sm:items-stretch justify-between gap-4 overflow-hidden group cursor-pointer"
              onClick={() => handleCategoryClick("emojiQuiz")}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.1),transparent_70%)] pointer-events-none" />
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 z-10 w-full min-w-0">
                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 flex-shrink-0">
                  <Sparkles size={20} />
                </div>
                <div className="text-center sm:text-left min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                    <span className="text-purple-400 font-mono text-[9px] font-bold tracking-widest uppercase block">SECTION 01</span>
                    {highScores.emojiQuiz > 0 && (
                      <span className="inline-flex self-center px-1.5 py-0.5 bg-purple-500/15 border border-purple-500/20 text-purple-300 font-mono text-[8px] rounded-full items-center space-x-1 mt-1 sm:mt-0">
                        <Trophy size={8} />
                        <span>РЕКОРД: {highScores.emojiQuiz}</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-sans text-lg font-extrabold text-white tracking-tight mt-1">
                    Эможи Таавар
                  </h3>
                  <p className="text-slate-400 font-sans text-[11px] mt-1 leading-relaxed max-w-md">
                    Алдартай анимены нэрсийг сонирхолтой хөгжилтэй эможинуудаар илэрхийлснийг тааж тоглоорой!
                  </p>
                </div>
              </div>

              <div className="flex items-center sm:justify-end justify-center z-10 w-full sm:w-auto">
                <div className="w-10 h-10 border border-white/10 group-hover:border-purple-400 group-hover:text-purple-400 text-slate-400 rounded-full flex items-center justify-center transition-all duration-300">
                  <Play size={12} className="translate-x-[1px] fill-current" />
                </div>
              </div>
            </motion.div>

            {/* Card 2: CHARACTER QUIZ */}
            <motion.div 
              whileHover={{ y: -4, scale: 1.01 }}
              className="relative rounded-2xl border border-white/10 hover:border-indigo-500/30 bg-gradient-to-r from-[#060c2c] to-[#01020a] p-5 text-left flex flex-col sm:flex-row items-center sm:items-stretch justify-between gap-4 overflow-hidden group cursor-pointer"
              onClick={() => handleCategoryClick("characterQuiz")}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none" />
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 z-10 w-full min-w-0">
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 flex-shrink-0">
                  <User size={20} />
                </div>
                <div className="text-center sm:text-left min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                    <span className="text-indigo-400 font-mono text-[9px] font-bold tracking-widest uppercase block">SECTION 02</span>
                    {highScores.characterQuiz > 0 && (
                      <span className="inline-flex self-center px-1.5 py-0.5 bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 font-mono text-[8px] rounded-full items-center space-x-1 mt-1 sm:mt-0">
                        <Trophy size={8} />
                        <span>РЕКОРД: {highScores.characterQuiz}</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-sans text-lg font-extrabold text-white tracking-tight mt-1">
                    Дүр Таах Хэсэг
                  </h3>
                  <p className="text-slate-400 font-sans text-[11px] mt-1 leading-relaxed max-w-md">
                    Анимены алдартай дүрүүдийг тэдгээрийн онцлог шинж чанар, эможи тайлбараар таагаарай.
                  </p>
                </div>
              </div>

              <div className="flex items-center sm:justify-end justify-center z-10 w-full sm:w-auto">
                <div className="w-10 h-10 border border-white/10 group-hover:border-indigo-400 group-hover:text-indigo-400 text-slate-400 rounded-full flex items-center justify-center transition-all duration-300">
                  <Play size={12} className="translate-x-[1px] fill-current" />
                </div>
              </div>
            </motion.div>

            {/* Card 3: POWER QUIZ */}
            <motion.div 
              whileHover={{ y: -4, scale: 1.01 }}
              className="relative rounded-2xl border border-white/10 hover:border-pink-500/30 bg-gradient-to-r from-[#240618] to-[#0a0105] p-5 text-left flex flex-col sm:flex-row items-center sm:items-stretch justify-between gap-4 overflow-hidden group cursor-pointer"
              onClick={() => handleCategoryClick("powerQuiz")}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.1),transparent_70%)] pointer-events-none" />
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 z-10 w-full min-w-0">
                <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/20 rounded-2xl flex items-center justify-center text-pink-400 flex-shrink-0">
                  <Eye size={20} />
                </div>
                <div className="text-center sm:text-left min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                    <span className="text-pink-400 font-mono text-[9px] font-bold tracking-widest uppercase block">SECTION 03</span>
                    {highScores.powerQuiz > 0 && (
                      <span className="inline-flex self-center px-1.5 py-0.5 bg-pink-500/15 border border-pink-500/20 text-pink-300 font-mono text-[8px] rounded-full items-center space-x-1 mt-1 sm:mt-0">
                        <Trophy size={8} />
                        <span>РЕКОРД: {highScores.powerQuiz}</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-sans text-lg font-extrabold text-white tracking-tight mt-1">
                    Хүч & Чадвар Таах Хэсэг
                  </h3>
                  <p className="text-slate-400 font-sans text-[11px] mt-1 leading-relaxed max-w-md">
                    Дүрүүдийн ашигладаг тусгай техникийн нэршил, тэсрэлттэй онцгой хүчнүүдийг тааж шалгаарай.
                  </p>
                </div>
              </div>

              <div className="flex items-center sm:justify-end justify-center z-10 w-full sm:w-auto">
                <div className="w-10 h-10 border border-white/10 group-hover:border-pink-400 group-hover:text-pink-400 text-slate-400 rounded-full flex items-center justify-center transition-all duration-300">
                  <Play size={12} className="translate-x-[1px] fill-current" />
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Right column: Leaderboard only (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Leaderboard Panel (nested name-based leaderboard) */}
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 text-left flex flex-col justify-between overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 z-10 w-full">
              <div className="flex justify-between items-center">
                <span className="text-pink-400 font-mono text-[10px] font-bold tracking-widest uppercase block">
                  ШИЛДЭГ 10 ТОГЛОГЧ // TOP 10 PLAYERS
                </span>
                <div className="flex items-center space-x-2">
                  {leaderboard.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm("Та чансааны бүх мэдээллийг устгахдаа итгэлтэй байна уу?")) {
                          resetStats();
                          triggerSound("click");
                        }
                      }}
                      className="p-1 hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                      title="Чансаа устгах // Reset Records"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                  <Trophy size={14} className="text-pink-400 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-10 px-4 text-slate-500 text-xs font-sans border border-dashed border-white/5 rounded-xl">
                    <p className="mb-1 text-sm text-slate-400">📭 Чансаа хоосон байна.</p>
                    <p className="opacity-70">Тоглоом тоглож, өөрийн рекордоо хамгийн эхэнд бүртгүүлээрэй!</p>
                  </div>
                ) : (
                  leaderboard.slice(0, 10).map((entry, index) => {
                    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`;
                    const isCurrentUser = entry.name.toLowerCase() === playerName.toLowerCase();
                    return (
                      <div 
                        key={entry.id} 
                        className={`flex items-center justify-between p-2 rounded-xl border text-[11px] transition-all duration-300 ${
                          isCurrentUser 
                            ? "bg-purple-500/15 border-purple-500/40 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.1)]" 
                            : "bg-white/[0.01] border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className={`w-5 h-5 flex items-center justify-center font-mono text-[9px] rounded-full flex-shrink-0 ${
                            index === 0 ? "bg-amber-400/20 text-amber-400 border border-amber-400/30" : 
                            index === 1 ? "bg-slate-300/20 text-slate-300 border border-slate-300/30" : 
                            index === 2 ? "bg-amber-700/20 text-amber-600 border border-amber-600/30" : 
                            "text-slate-500 border border-transparent"
                          }`}>
                            {medal}
                          </span>
                          <div className="min-w-0">
                            <span className="font-sans font-bold text-white block truncate">{entry.name}</span>
                            <span className="text-[8px] font-mono text-slate-500 truncate block">
                              {categoryTitles[entry.category] || "Таавар"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-mono font-bold text-amber-400 text-xs block">{entry.score} <span className="text-[8px] text-slate-500 font-normal">оноо</span></span>
                          <span className="text-[8px] font-mono text-slate-600 block">{entry.timestamp.split(" ")[0]}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Redirect bottom flow button */}
      <div className="flex justify-center pt-4">
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
                    <span className={`w-1.5 h-1.5 rounded-full ${themeSongPlaying ? "bg-[#00E676] animate-ping" : "bg-slate-500"}`} />
                    <span>
                      {themeSongPlaying 
                        ? "ОРИГИНАЛ АЯ ТОГЛОЖ БАЙНА" 
                        : themeSongLoading 
                        ? "АЯЫГ УНШИЖ БАЙНА..." 
                        : "ОРИГИНАЛ АЯ ТОГЛООГҮЙ"}
                    </span>
                  </div>
                  
                  {/* Equalizer lines */}
                  {themeSongPlaying && (
                    <div className="flex items-end space-x-0.5 h-3">
                      <div className="w-0.5 bg-[#00E676] h-2 animate-[pulse_0.6s_infinite]" />
                      <div className="w-0.5 bg-[#00E676] h-3 animate-[pulse_0.4s_infinite_0.1s]" />
                      <div className="w-0.5 bg-[#00E676] h-1.5 animate-[pulse_0.8s_infinite_0.2s]" />
                      <div className="w-0.5 bg-[#00E676] h-3.5 animate-[pulse_0.5s_infinite_0.15s]" />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Interactive Theme Song Audio Control Player */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="w-72 md:w-80 bg-slate-900/90 border border-white/10 rounded-2xl p-4 flex flex-col items-center space-y-3 backdrop-blur-md shadow-lg"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <Music className={`w-4 h-4 ${themeSongPlaying ? "text-emerald-400 animate-pulse" : "text-slate-400"}`} />
                    <span className="text-[10px] font-mono tracking-wider text-slate-300 font-medium">
                      ХӨГЖМИЙН УДИРДЛАГА
                    </span>
                  </div>
                  
                  {themeSongPlaying && (
                    <div className="flex items-end space-x-0.5 h-3">
                      <div className="w-0.5 bg-emerald-400 h-2 animate-[pulse_0.6s_infinite]" />
                      <div className="w-0.5 bg-emerald-400 h-3 animate-[pulse_0.4s_infinite_0.1s]" />
                      <div className="w-0.5 bg-emerald-400 h-1.5 animate-[pulse_0.8s_infinite_0.2s]" />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 w-full">
                  <button
                    onClick={() => {
                      triggerSound("click");
                      toggleThemeSong();
                    }}
                    disabled={themeSongLoading}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300 border cursor-pointer ${
                      themeSongPlaying
                        ? "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400 hover:text-rose-300"
                        : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400 hover:text-emerald-300"
                    } disabled:opacity-50`}
                  >
                    {themeSongLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        <span>Уншиж байна...</span>
                      </>
                    ) : themeSongPlaying ? (
                      <>
                        <Pause size={14} />
                        <span>Ая зогсоох</span>
                      </>
                    ) : (
                      <>
                        <Play size={14} />
                        <span>Ая тоглуулах (Оригинал)</span>
                      </>
                    )}
                  </button>
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
              if (score > 0) {
                saveResult(score, false);
              }
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

      {/* High-fidelity Name Input Modal overlay */}
      <AnimatePresence>
        {showNamePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-6 shadow-[0_0_50px_rgba(168,85,247,0.25)] relative overflow-hidden"
            >
              {/* Decorative grid backdrop */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-2 relative z-10">
                <span className="text-purple-400 font-mono text-[9px] font-bold tracking-widest uppercase">
                  ТОГЛОГЧИЙН НЭР ОРУУЛАХ
                </span>
                <h3 className="font-sans text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <User className="text-purple-400" size={20} />
                  <span>ТА ХЭН БЭ? // ENTER NAME</span>
                </h3>
                <p className="text-slate-400 font-sans text-xs leading-relaxed">
                  Та өөрийн нэрийг оруулна уу. Таны авсан оноо, рекорд амжилтууд энэ нэрээр **Leaderboard** дээр бүртгэгдэх болно!
                </p>
              </div>

              <div className="space-y-2 relative z-10">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">НЭР // PLAYER NAME</label>
                <input
                  type="text"
                  maxLength={16}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Жишээ: Zoro_Otaku"
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-purple-500/40 focus:border-purple-500 focus:outline-none rounded-2xl py-3.5 px-4 text-white font-sans text-sm transition-all duration-300"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && playerName.trim()) {
                      const finalName = playerName.trim();
                      setPlayerName(finalName);
                      localStorage.setItem("anime_guess_player_name", finalName);
                      if (pendingCategory) {
                        startQuiz(pendingCategory);
                      }
                      setShowNamePrompt(false);
                    }
                  }}
                />
                <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                  <span>*Тэмдэгтүүд: Хамгийн ихдээ 16</span>
                  <span>{playerName.length}/16 тэмдэгт</span>
                </div>
              </div>

              <div className="flex gap-3 relative z-10 pt-2">
                <button
                  onClick={() => {
                    triggerSound("click");
                    setShowNamePrompt(false);
                  }}
                  className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-2xl font-semibold text-xs tracking-wider transition-all duration-300 border border-white/5 cursor-pointer text-center"
                >
                  ЦУЦЛАХ // BACK
                </button>
                <button
                  onClick={() => {
                    triggerSound("click");
                    const finalName = playerName.trim() || "Отаку";
                    setPlayerName(finalName);
                    localStorage.setItem("anime_guess_player_name", finalName);
                    if (pendingCategory) {
                      startQuiz(pendingCategory);
                    }
                    setShowNamePrompt(false);
                  }}
                  disabled={!playerName.trim()}
                  className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 text-white rounded-2xl font-bold text-xs tracking-widest uppercase transition-all duration-300 shadow-[0_4px_15px_rgba(168,85,247,0.3)] hover:scale-[1.01] cursor-pointer text-center"
                >
                  ЭХЛЭХ // PLAY ➔
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
