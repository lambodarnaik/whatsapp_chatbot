// api/webhook.js
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";
import verifySignature from "../src/utils/verifySignature.js";
import { handleIncoming } from "../src/handlers/messageHandler.js";

dotenv.config();
const app = express();

app.use(bodyParser.json({
  verify: verifySignature(process.env.APP_SECRET)
}));

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// webhook verification for Meta (GET)
app.get("/api/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// webhook receiver (POST)
app.post("/api/webhook", async (req, res) => {
  try {
    const body = req.body;
    if (body.object && body.entry) {
      await handleIncoming(body, sendWhatsAppMessage);
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.sendStatus(500);
  }
});

async function sendWhatsAppMessage(payload) {
  const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;
  return axios.post(url, payload, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
}

// ✅ Export for Vercel (no app.listen)
export default app;
