import crypto from "crypto";

export default function verifySignature(appSecret) {
  return function (req, res, buf) {
    // if no secret provided, skip verification (useful in dev)
    if (!appSecret) {
      req.rawBody = buf;
      return;
    }
    const signature = req.headers["x-hub-signature-256"];
    if (!signature) {
      throw new Error("Missing signature");
    }
    const expected = "sha256=" + crypto.createHmac("sha256", appSecret).update(buf).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
      throw new Error("Invalid signature");
    }
    req.rawBody = buf;
  };
}
