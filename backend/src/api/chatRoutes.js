import express from "express";
import mlService from "../lib/mlService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { user_id, message, context } = req.body;
  
  if (!user_id || !message) {
    return res.status(400).json({ error: "user_id and message are required" });
  }

  try {
    const response = await mlService.chatWithAssistant(user_id, message, context);
    if (!response || !response.reply) {
      return res.status(500).json({ error: "Failed to get reply from AI assistant" });
    }

    res.json({ reply: response.reply });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
