import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

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
