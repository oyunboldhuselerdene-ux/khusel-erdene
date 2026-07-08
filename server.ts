import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { Firestore, FieldValue } from "@google-cloud/firestore";

dotenv.config();

const LEADERBOARD_FILE = path.join(process.cwd(), "leaderboard.json");

function readLeaderboard(): any[] {
  try {
    if (fs.existsSync(LEADERBOARD_FILE)) {
      const data = fs.readFileSync(LEADERBOARD_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading leaderboard file:", error);
  }
  return [];
}

function writeLeaderboard(data: any[]) {
  try {
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing leaderboard file:", error);
  }
}

let cachedLeaderboard: any[] = readLeaderboard().sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));

// Safely initialize Firebase Firestore Admin on the server side using the config file or ADC
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
let firestoreDb: any = null;

try {
  if (fs.existsSync(firebaseConfigPath)) {
    const config = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
    firestoreDb = new Firestore({
      projectId: config.projectId,
      databaseId: config.firestoreDatabaseId || "(default)",
    });
    console.log(`Google Cloud Firestore Server SDK initialized with databaseId: ${config.firestoreDatabaseId || "(default)"}!`);
  } else {
    firestoreDb = new Firestore();
    console.warn("firebase-applet-config.json was not found. Initialized Firestore with ADC.");
  }
} catch (error) {
  console.error("Error initializing Google Cloud Firestore Server SDK:", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, role, userApiKey } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // If user provides their own API key, use it. Otherwise, fallback to env GEMINI_API_KEY
      const apiKey = userApiKey?.trim() || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({ 
          error: "API key is missing. Please configure GEMINI_API_KEY in the environment or provide your key in the settings tab." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Define System Instructions
      let systemInstruction = "";
      if (role === "me") {
        systemInstruction = `Чи бол Хүсэл-эрдэнийн (khusel-erdene) AI хувилбар — түүний portfolio сайтын найрсаг туслах байна.
Чи Хүсэл-эрдэнэ шиг бодож, ярьдаг.

ХЭН БЭ (зөвхөн нийтэд ил, нууц БИШ мэдээлэл):
- Нэр: Хүсэл-эрдэнэ (khusel-erdene)
- Сонирхол / хобби: волейбол тоглох (volleyball), дугуй унах (dugui unah), Mobile Legends тоглох (mobile legends togloh)
- Дуртай зүйл (хөгжим, спорт, кино…): Rokit Bay-ийн дуунд маш их дуртай (rokitbayiin duund durtai)
- Зорилго / мөрөөдөл: Сайн IT инженер болох (sain IT ingener boloh)

ЗАН ЧАНАР / ҮЗЭЛ БОДОЛ:
- Шударга үнэнч, ичимхий, нөхөрсөг (shudarga unench, ichimhii, nohorsog)

ЯРИХ ХЭВ МАЯГ:
- Бодсон хэв маягтай ярина. "бодсон хэв маягтай", "за байз", "бодож үзье" гэх үгсийг яриандаа байнга ашигладаг. Гэрийн хаяг асуувал нууцлах.

ҮҮРЭГ:
- Зочдод миний portfolio сайтыг тайлбарлаж өгөх (ямар хэсэгтэй, юу хийсэн талаар).
  - Нүүр хэсэг (Home): Хүсэл-эрдэнийн ерөнхий танилцуулга вэбсайт.
  - Тоглоомын хэсэг (Game): Хүсэл-эрдэнийн өөрийн хийсэн сонирхолтой тоглоомын хуудас.
  - Миний тухай (About): Хүсэл-эрдэнийн сонирхол, нас (14), дуртай дуучин (Rokitbay), дуртай анимэ (Haikyuu), сонирхдог зүйлсийн талаарх мэдээлэл.
  - Холбоо барих (Contact): Түүнтэй холбогдох хуудас.
- Миний сонирхол, төслийн талаар найрсаг хариул.
- Зочдод зөвлөгөө, чиглүүлэг өгөх.

Давуу тал (davaa tal):
- Математик болон Биологиор олимпиадад явдаг.
- Математикаар улсын олимпиадад явж байсан туршлагатай.
- Таэквондогоор улсаас хүрэл медальтай.

🛡 PRIVACY / АЮУЛГҮЙ БАЙДАЛ:
- Хувийн нууц мэдээлэл (гэрийн хаяг, утасны дугаар, сургуулийн нэр, нууц үг, ID, гэр бүлийн мэдээлэл) ХЭЗЭЭ Ч бүү хэл. Асуувал эелдгээр татгалз: "Уучлаарай, тэр хувийн мэдээллийг хуваалцаж чадахгүй."
- Зөвхөн нийтэд ил, нууц биш зүйлээр хариул.
- Эрүүл мэнд, аюул, хүнд асуудлаар жинхэнэ зөвлөгөө бүү өг — "итгэдэг том хүн (эцэг эх, багш)-тайгаа ярь" гэж зөвлө.
- Мэдэхгүй зүйлийг бүү зохио.

ХЯЗГААР:
- Найрсаг, эерэг, үнэнч байх.`;
      } else {
        systemInstruction = `Чи бол Rokit Bay (Монголын алдартай рэппэр, продюсер Баяраа) юм.
Чи бол Хүсэл-эрдэнийн шүтээн (Idol) бөгөөд энэхүү вэбсайт дээр түүний "Idol Coach" (Шүтээн дасгалжуулагч) байдлаар зочдод болон Хүсэл-эрдэнэд өөрөөрөө байх, тууштай хөдөлмөрлөх, зорилгодоо үнэнч байхын чухлыг зөвлөх үүрэгтэй.

Үг яриа, зан чанар:
- Шулуун шударга, маш гүн ухаанлаг, шийдэмгий, хурц хэрцгий боловч ухаалаг, урам зориг өгсөн өнго аястай ярина.
- Rokit Bay-ийн дууны хэв маяг, философи шиг "Хөдөлмөрлө, өөрийгөө битгий гол, тууштай бай" гэсэн уур амьсгалыг өгнө.
- Чи Хүсэл-эрдэнийг маш сайн IT инженер болж чадна гэдэгт итгэдэг ба урам өгдөг.

Чиний үүрэг:
- Зочдыг угтаж, Хүсэл-эрдэнийн шүтээн болохын хувьд түүнийг хэрхэн дэмжиж, ямар мундаг хүүхэд болохын хувьд түүний давуу тал болон амжилтыг тайлбарлах (Таэквондогоор улсын хүрэл медальтай, математикаар улсын олимпиадад явж байсан, одоо сайн IT инженер болохын төлөө суралцаж буй г.м).
- Залууст зорилгодоо хүрэх, өөрийнхөөрөө үнэнч байх талаар зөвлөгөө өгөх.
- Хэрэв зочид Хүсэл-эрдэнийн талаар эсвэл түүний дуртай зүйлсийг асуувал Rokit Bay-ийн байр сууринаас хариулах.
- "Уучлаарай, тэр хувийн мэдээллийг хуваалцаж чадахгүй." гэх зэрэг аюулгүй байдлын дүрмийг баримталж, гэр бүл, утас, хаягийг нууцлах.`;
      }

      // Format history to match SDK expectation
      const formattedHistory = (history || []).map((h: any) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }],
      }));

      // Try multiple models in sequence to prevent 503 unavailable errors
      const candidateModels = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.5-flash"];
      let response = null;
      let lastError = null;

      for (const modelName of candidateModels) {
        try {
          console.log(`Attempting chat with model: ${modelName}`);
          const chat = ai.chats.create({
            model: modelName,
            config: {
              systemInstruction,
            },
            history: formattedHistory,
          });

          response = await chat.sendMessage({ message });
          if (response && response.text) {
            console.log(`Successfully completed chat with model: ${modelName}`);
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} failed or was unavailable:`, err.message || err);
          lastError = err;
        }
      }

      if (!response) {
        throw lastError || new Error("All candidate models failed to generate content.");
      }

      return res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // GET: Retrieve shared leaderboard
  app.get("/api/leaderboard", (req, res) => {
    res.json(cachedLeaderboard);
  });

  // POST: Add score to shared leaderboard
  app.post("/api/leaderboard", (req, res) => {
    try {
      const { name, score, category, timestamp } = req.body;
      if (!name || score === undefined) {
        return res.status(400).json({ error: "Name and score are required" });
      }

      const newEntry = {
        id: Math.random().toString(36).substring(2, 11),
        name: String(name).trim().substring(0, 16),
        score: Number(score),
        category: String(category || "emojiQuiz"),
        timestamp: String(timestamp || new Date().toLocaleString())
      };

      cachedLeaderboard.push(newEntry);
      // Sort descending by score
      cachedLeaderboard.sort((a, b) => b.score - a.score);
      // Keep top 1000 entries so player records are safely retained
      cachedLeaderboard = cachedLeaderboard.slice(0, 1000);

      writeLeaderboard(cachedLeaderboard);
      res.json(cachedLeaderboard);
    } catch (error) {
      console.error("Error writing to leaderboard:", error);
      res.status(500).json({ error: "Failed to save leaderboard score" });
    }
  });

  // POST: Reset shared leaderboard
  app.post("/api/leaderboard/reset", (req, res) => {
    try {
      cachedLeaderboard = [];
      writeLeaderboard([]);
      res.json([]);
    } catch (error) {
      console.error("Error resetting leaderboard:", error);
      res.status(500).json({ error: "Failed to reset leaderboard" });
    }
  });

  // POST: Save to Firestore "anime_guess" collection (name + WPM + score + category)
  app.post("/api/firestore-save", async (req, res) => {
    try {
      const { name, wpm, score, category } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      if (!firestoreDb) {
        console.warn("Firestore is not initialized yet.");
        return res.status(503).json({ error: "Firestore database is not ready or initialized" });
      }

      const cleanName = String(name).trim().substring(0, 16);
      const cleanWpm = Number(wpm) || 0;
      const cleanScore = Number(score) || 0;
      const cleanCategory = String(category || "emojiQuiz");

      const docRef = await firestoreDb.collection("anime_guess").add({
        name: cleanName,
        wpm: cleanWpm,
        score: cleanScore,
        category: cleanCategory,
        timestamp: FieldValue.serverTimestamp()
      });

      console.log(`Saved entry to "anime_guess" Firestore. Doc ID: ${docRef.id}`);
      return res.json({ success: true, id: docRef.id });
    } catch (error: any) {
      console.error("Error saving entry to Firestore:", error);
      return res.status(500).json({ error: error.message || "Failed to save entry to Firestore" });
    }
  });

  // POST: Save score to Firestore "scores" collection
  app.post("/api/scores", async (req, res) => {
    try {
      const { name, score, category, wpm, answers } = req.body;
      if (!name || score === undefined) {
        return res.status(400).json({ error: "Name and score are required" });
      }

      if (!firestoreDb) {
        console.warn("Firestore is not initialized.");
        return res.status(503).json({ error: "Firestore database is not ready" });
      }

      const cleanName = String(name).trim().substring(0, 16);
      const cleanScore = Number(score) || 0;
      const cleanWpm = Number(wpm) || 0;
      const cleanCategory = String(category || "emojiQuiz");
      const cleanAnswers = Array.isArray(answers) ? answers : [];

      const docRef = await firestoreDb.collection("scores").add({
        name: cleanName,
        score: cleanScore,
        wpm: cleanWpm,
        category: cleanCategory,
        answers: cleanAnswers,
        timestamp: FieldValue.serverTimestamp()
      });

      console.log(`Saved score to Firestore "scores" collection. ID: ${docRef.id}`);
      return res.json({ success: true, id: docRef.id });
    } catch (error: any) {
      console.error("Error saving score to Firestore:", error);
      return res.status(500).json({ error: error.message || "Failed to save score" });
    }
  });

  // GET: Retrieve scores from Firestore "scores" collection
  app.get("/api/scores", async (req, res) => {
    try {
      if (!firestoreDb) {
        console.warn("Firestore is not initialized.");
        return res.status(503).json({ error: "Firestore database is not ready" });
      }

      // Try with ordering first
      try {
        const snapshot = await firestoreDb.collection("scores")
          .orderBy("score", "desc")
          .limit(30)
          .get();

        const list: any[] = [];
        snapshot.forEach((doc: any) => {
          const data = doc.data();
          let formattedDate = new Date().toLocaleString("mn-MN");
          if (data.timestamp) {
            try {
              const date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
              formattedDate = date.toLocaleDateString("mn-MN") + " " + date.toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" });
            } catch (e) {
              console.error("Error formatting timestamp:", e);
            }
          }
          list.push({
            id: doc.id,
            name: data.name,
            score: data.score,
            wpm: data.wpm,
            category: data.category,
            answers: data.answers || [],
            timestamp: formattedDate
          });
        });
        return res.json(list);
      } catch (orderError: any) {
        console.warn("Query with order failed, falling back to unordered fetch and sort:", orderError.message || orderError);
        // Fallback: If no index is created yet or ordered query fails, return unordered scores
        const snapshot = await firestoreDb.collection("scores").limit(100).get();
        const list: any[] = [];
        snapshot.forEach((doc: any) => {
          const data = doc.data();
          let formattedDate = new Date().toLocaleString("mn-MN");
          if (data.timestamp) {
            try {
              const date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
              formattedDate = date.toLocaleDateString("mn-MN") + " " + date.toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" });
            } catch (e) {}
          }
          list.push({
            id: doc.id,
            name: data.name,
            score: data.score,
            wpm: data.wpm,
            category: data.category,
            answers: data.answers || [],
            timestamp: formattedDate
          });
        });
        list.sort((a, b) => b.score - a.score);
        return res.json(list.slice(0, 30));
      }
    } catch (error: any) {
      console.error("Error fetching scores from Firestore:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch scores" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
