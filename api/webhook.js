import axios from "axios";
import verifySignature from "../src/utils/verifySignature.js";
import { handleIncoming } from "../src/handlers/messageHandler.js";
import dotenv from "dotenv"

dotenv.config();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

console.log(VERIFY_TOKEN)

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Webhook verification
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook verified");
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }

  if (req.method === "POST") {
    // Receiving messages
    try {
      if (req.body.object && req.body.entry) {
        await handleIncoming(req.body, sendWhatsAppMessage);
      }
      return res.sendStatus(200);
    } catch (err) {
      console.error("❌ Webhook error:", err);
      return res.sendStatus(500);
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

async function sendWhatsAppMessage(payload) {
  const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;
  return axios.post(url, payload, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
}
