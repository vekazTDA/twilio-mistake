// api/send-code.js
// Vercel serverless function — sends an SMS verification code via Twilio Verify.
//
// Env vars needed (set in Vercel Project Settings → Environment Variables):
//   TWILIO_ACCOUNT_SID
//   TWILIO_AUTH_TOKEN
//   TWILIO_VERIFY_SERVICE_SID

const twilio = require("twilio");

module.exports = async (req, res) => {
  // CORS — restrict this to your Webflow domain in production
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phone } = req.body || {};

  if (!phone || typeof phone !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'phone' field" });
  }

  // Basic E.164 sanity check (e.g. +38761234567). Adjust as needed.
  const e164Pattern = /^\+[1-9]\d{6,14}$/;
  if (!e164Pattern.test(phone)) {
    return res.status(400).json({
      error: "Phone number must be in E.164 format, e.g. +38761234567",
    });
  }

  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: phone, channel: "sms" });

    return res.status(200).json({
      status: verification.status, // "pending"
    });
  } catch (err) {
    console.error("Twilio send-code error:", err.message);
    return res.status(500).json({ error: "Failed to send verification code" });
  }
};
