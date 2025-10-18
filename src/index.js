import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import verifySignature from "./utils/verifySignature.js";
import webhookRoutes from "./webhook.js";

dotenv.config();

const app = express();
app.use(bodyParser.json({
  verify: verifySignature(process.env.APP_SECRET)
}));

// mount webhook routes
app.use("/webhook", webhookRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
