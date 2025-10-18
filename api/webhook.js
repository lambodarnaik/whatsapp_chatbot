import axios from "axios";
import verifySignature from "../src/utils/verifySignature.js";
import { handleIncoming } from "../src/handlers/messageHandler.js";
import dotenv from "dotenv";

dotenv.config();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

export default async function handler(req, res) {
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook verified");
      res.statusCode = 200;
      return res.end(challenge);
    }

    res.statusCode = 403;
    return res.end("Forbidden");
  }

  if (req.method === "POST") {
    console.log("req",req)
    console.log("req body", req.body)
    console.log("req body object", req.body.object)
    console.log("req body object", req.body.entry)
    console.log("checking error", req.body.object && req.body.entry)
    try {
      if (req.body.object && req.body.entry) {
        await handleIncoming(req.body, sendWhatsAppMessage);
      }
      res.statusCode = 200;
      return res.end("OK");
    } catch (err) {
      console.error("❌ Webhook error:", err);
      res.statusCode = 500;
      return res.end("Internal Server Error");
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.statusCode = 405;
  return res.end(`Method ${req.method} Not Allowed`);
}

async function sendWhatsAppMessage(payload) {
  const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;
  return axios.post(url, payload, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
}
