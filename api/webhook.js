// api/webhook.js
import express from "express";
import axios from "axios";
import verifySignature from "../utils/verifySignature.js";
import { handleIncoming } from "../handlers/messageHandler.js";

const app = express();

app.use(express.json({
  verify: verifySignature(process.env.APP_SECRET)
}));

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// GET for webhook verification
app.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// POST for receiving messages
app.post("/", async (req, res) => {
  try {
    if (req.body.object && req.body.entry) {
      await handleIncoming(req.body, sendWhatsAppMessage);
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

export default app;
