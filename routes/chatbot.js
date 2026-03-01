const express = require("express");
const router = express.Router();
const { ChatHistory } = require("../models/ChatHistory");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const AI_MODEL = "qwen/qwen3-coder";

async function aiChat(messages) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({ model: AI_MODEL, messages, temperature: 0.7, max_tokens: 1500 }),
  });
  if (!res.ok) throw new Error(`AI error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

// POST /api/chatbot/message
router.post("/message", async (req, res) => {
  try {
    const { message, userId } = req.body;
    if (!message) return res.status(400).json({ error: "message is required" });

    const botMessage = await aiChat([
      { role: "system", content: "You are an expert plant care advisor specializing in Indian climate, soil types, and native plants. Give practical, actionable advice. Be friendly and concise." },
      { role: "user", content: message },
    ]);

    // Save to history if userId provided
    if (userId) {
      try {
        await ChatHistory.findOneAndUpdate(
          { userId },
          { $push: { messages: { user: message, bot: botMessage } } },
          { upsert: true }
        );
      } catch (e) { /* non-critical */ }
    }

    res.json({ response: botMessage });
  } catch (err) {
    res.status(500).json({ error: "Chatbot failed", details: err.message });
  }
});

// GET /api/chatbot/history
router.get("/history", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId required" });
    const history = await ChatHistory.findOne({ userId });
    res.json({ messages: history ? history.messages : [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history", details: err.message });
  }
});

module.exports = router;
