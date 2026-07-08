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

class FirestoreRestClient {
  private projectId: string = "";
  private databaseId: string = "";
  private apiKey: string = "";
  public isReady: boolean = false;

  constructor() {
    try {
      const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
      if (fs.existsSync(firebaseConfigPath)) {
        const config = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
        this.projectId = config.projectId;
        this.databaseId = config.firestoreDatabaseId || "(default)";
        this.apiKey = config.apiKey;
        this.isReady = !!(this.projectId && this.apiKey);
        console.log(`Google Cloud Firestore REST Client initialized with databaseId: ${this.databaseId}!`);
      } else {
        console.warn("firebase-applet-config.json was not found. Firestore REST Client disabled.");
      }
    } catch (error) {
      console.error("Error initializing Google Cloud Firestore REST Client:", error);
    }
  }

  private toFirestoreValue(val: any): any {
    if (typeof val === "string") {
      return { stringValue: val };
    }
    if (typeof val === "number") {
      if (Number.isInteger(val)) {
        return { integerValue: String(val) };
      }
      return { doubleValue: val };
    }
    if (typeof val === "boolean") {
      return { booleanValue: val };
    }
    if (Array.isArray(val)) {
      return {
        arrayValue: {
          values: val.map(v => this.toFirestoreValue(v))
        }
      };
    }
    if (val === null || val === undefined) {
      return { nullValue: null };
    }
    if (typeof val === "object") {
      const fields: any = {};
      for (const key of Object.keys(val)) {
        fields[key] = this.toFirestoreValue(val[key]);
      }
      return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
  }

  private fromFirestoreValue(fieldVal: any): any {
    if (!fieldVal) return null;
    if ("stringValue" in fieldVal) return fieldVal.stringValue;
    if ("integerValue" in fieldVal) return Number(fieldVal.integerValue);
    if ("doubleValue" in fieldVal) return Number(fieldVal.doubleValue);
    if ("booleanValue" in fieldVal) return fieldVal.booleanValue;
    if ("timestampValue" in fieldVal) return fieldVal.timestampValue;
    if ("arrayValue" in fieldVal) {
      const values = fieldVal.arrayValue.values || [];
      return values.map(v => this.fromFirestoreValue(v));
    }
    if ("mapValue" in fieldVal) {
      const fields = fieldVal.mapValue.fields || {};
      const obj: any = {};
      for (const key of Object.keys(fields)) {
        obj[key] = this.fromFirestoreValue(fields[key]);
      }
      return obj;
    }
    if ("nullValue" in fieldVal) return null;
    return null;
  }

  async addDocument(collectionName: string, data: any): Promise<{ id: string }> {
    if (!this.isReady) {
      throw new Error("Firestore REST client not initialized");
    }
    const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/${this.databaseId}/documents/${collectionName}?key=${this.apiKey}`;
    
    const fields: any = {};
    for (const key of Object.keys(data)) {
      fields[key] = this.toFirestoreValue(data[key]);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Firestore REST POST failed with status ${response.status}: ${errText}`);
    }

    const result = await response.json() as any;
    const nameParts = result.name.split("/");
    const id = nameParts[nameParts.length - 1];
    return { id };
  }

  async runQuery(collectionName: string, orderByField: string, direction: "ASCENDING" | "DESCENDING" = "DESCENDING", limitNum: number = 30): Promise<any[]> {
    if (!this.isReady) {
      throw new Error("Firestore REST client not initialized");
    }
    const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/${this.databaseId}/documents:runQuery?key=${this.apiKey}`;

    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: collectionName }],
        orderBy: [
          {
            field: { fieldPath: orderByField },
            direction: direction
          }
        ],
        limit: limitNum
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(queryBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Firestore REST runQuery failed with status ${response.status}: ${errText}`);
    }

    const results = await response.json() as any[];
    const list: any[] = [];

    if (Array.isArray(results)) {
      for (const item of results) {
        if (item.document && item.document.fields) {
          const fields = item.document.fields;
          const data: any = {};
          for (const key of Object.keys(fields)) {
            data[key] = this.fromFirestoreValue(fields[key]);
          }
          
          const nameParts = item.document.name.split("/");
          const id = nameParts[nameParts.length - 1];
          
          list.push({
            id,
            ...data
          });
        }
      }
    }

    return list;
  }
}

const restClient = new FirestoreRestClient();


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

      const cleanName = String(name).trim().substring(0, 16);
      const cleanWpm = Number(wpm) || 0;
      const cleanScore = Number(score) || 0;
      const cleanCategory = String(category || "emojiQuiz");
      const formattedDate = new Date().toLocaleString("mn-MN");

      const localEntry = {
        id: Math.random().toString(36).substring(2, 11),
        name: cleanName,
        score: cleanScore,
        wpm: cleanWpm,
        category: cleanCategory,
        timestamp: formattedDate
      };

      if (restClient.isReady) {
        try {
          const docRef = await restClient.addDocument("anime_guess", {
            name: cleanName,
            wpm: cleanWpm,
            score: cleanScore,
            category: cleanCategory,
            timestamp: new Date().toISOString()
          });

          console.log(`Saved entry to "anime_guess" Firestore. Doc ID: ${docRef.id}`);
          return res.json({ success: true, id: docRef.id });
        } catch (error: any) {
          console.warn("Firestore save to 'anime_guess' failed, falling back to local leaderboard.json storage. Error:", error.message || error);
        }
      }

      // Fallback: save to local leaderboard JSON file
      const currentList = readLeaderboard();
      currentList.push(localEntry);
      currentList.sort((a, b) => b.score - a.score);
      writeLeaderboard(currentList);
      cachedLeaderboard = currentList; // Sync memory cache
      return res.json({ success: true, id: localEntry.id, fallback: true });
    } catch (error: any) {
      console.error("Error saving entry:", error);
      return res.status(500).json({ error: error.message || "Failed to save entry" });
    }
  });

  // POST: Save score to Firestore "scores" collection
  app.post("/api/scores", async (req, res) => {
    try {
      const { name, score, category, wpm, answers } = req.body;
      if (!name || score === undefined) {
        return res.status(400).json({ error: "Name and score are required" });
      }

      const cleanName = String(name).trim().substring(0, 16);
      const cleanScore = Number(score) || 0;
      const cleanWpm = Number(wpm) || 0;
      const cleanCategory = String(category || "emojiQuiz");
      const cleanAnswers = Array.isArray(answers) ? answers : [];
      const formattedDate = new Date().toLocaleString("mn-MN");

      const localEntry = {
        id: Math.random().toString(36).substring(2, 11),
        name: cleanName,
        score: cleanScore,
        wpm: cleanWpm,
        category: cleanCategory,
        answers: cleanAnswers,
        timestamp: formattedDate
      };

      if (restClient.isReady) {
        try {
          const docRef = await restClient.addDocument("scores", {
            name: cleanName,
            score: cleanScore,
            wpm: cleanWpm,
            category: cleanCategory,
            answers: cleanAnswers,
            timestamp: new Date().toISOString()
          });

          console.log(`Saved score to Firestore "scores" collection. ID: ${docRef.id}`);
          return res.json({ success: true, id: docRef.id });
        } catch (error: any) {
          console.warn("Firestore save to 'scores' failed, falling back to local leaderboard.json storage. Error:", error.message || error);
        }
      }

      // Fallback: save to local leaderboard JSON file
      const currentList = readLeaderboard();
      currentList.push(localEntry);
      currentList.sort((a, b) => b.score - a.score);
      writeLeaderboard(currentList);
      cachedLeaderboard = currentList; // Sync memory cache
      return res.json({ success: true, id: localEntry.id, fallback: true });
    } catch (error: any) {
      console.error("Error saving score:", error);
      return res.status(500).json({ error: error.message || "Failed to save score" });
    }
  });

  // GET: Retrieve scores from Firestore "scores" collection
  app.get("/api/scores", async (req, res) => {
    try {
      if (restClient.isReady) {
        try {
          const results = await restClient.runQuery("scores", "score", "DESCENDING", 10);
          const list: any[] = [];
          for (const data of results) {
            let formattedDate = new Date().toLocaleString("mn-MN");
            if (data.timestamp) {
              try {
                const date = new Date(data.timestamp);
                formattedDate = date.toLocaleDateString("mn-MN") + " " + date.toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" });
              } catch (e) {
                console.error("Error formatting timestamp:", e);
              }
            }
            list.push({
              id: data.id,
              name: data.name,
              score: data.score,
              wpm: data.wpm,
              category: data.category,
              answers: data.answers || [],
              timestamp: formattedDate
            });
          }
          return res.json(list);
        } catch (orderError: any) {
          console.warn("REST query with order failed, falling back to local leaderboard. Error:", orderError.message || orderError);
        }
      }
    } catch (firestoreError: any) {
      console.warn("Firestore fetch 'scores' failed, returning scores from local leaderboard.json file. Error:", firestoreError.message || firestoreError);
    }

    // Fallback: Read from local leaderboard JSON file
    try {
      const currentList = readLeaderboard();
      const formattedList = currentList.map((entry: any) => ({
        id: entry.id,
        name: entry.name,
        score: Number(entry.score) || 0,
        wpm: Number(entry.wpm || entry.score * 3) || 0, // estimate WPM if not stored
        category: entry.category || "emojiQuiz",
        answers: entry.answers || [],
        timestamp: entry.timestamp || new Date().toLocaleString("mn-MN")
      }));
      formattedList.sort((a: any, b: any) => b.score - a.score);
      return res.json(formattedList.slice(0, 10));
    } catch (fallbackErr: any) {
      console.error("Local fallback leaderboard fetch failed:", fallbackErr);
      return res.status(500).json({ error: "Failed to fetch scores" });
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
