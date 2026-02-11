const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 3001;
const MODEL = process.env.MODEL || "gpt-4.1-mini";

app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/ai/analyze", async (req, res) => {
  try {
    const { text, temperature = 0.2 } = req.body || {};
    if (!text) return res.status(400).json({ error: "Missing 'text'" });

    const system = "Eres un Senior SRE. Devuelve SOLO JSON válido.";
    const user = `LOGS:\n${text}\n\nDevuelve un JSON con: summary, signals, hypotheses (con confidence), safe_mitigations, escalate_when.`;

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        temperature,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ]
      })
    });

    const data = await r.json();
    const content = data.choices[0].message.content;
    res.json(JSON.parse(content));
  } catch (e) {
    res.status(500).json({ error: "Server error", details: String(e) });
  }
});

app.listen(PORT, () => console.log(`Servidor en: http://localhost:${PORT}`));
