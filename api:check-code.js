// api/check-code.js
// Vercel serverless function — checks the code the user typed in against Twilio Verify.
//
// Same env vars as send-code.js.

const twilio = require("twilio");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phone, code } = req.body || {};

  if (!phone || !code) {
    return res.status(400).json({ error: "Missing 'phone' or 'code' field" });
  }

  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const check = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phone, code });

    if (check.status === "approved") {
      // Optional: sign a short-lived token here (e.g. JWT) so the
      // Webflow form submission can prove verification happened server-side,
      // instead of trusting the browser.
      return res.status(200).json({ verified: true });
    }

    return res.status(200).json({ verified: false });
  } catch (err) {
    // Twilio throws a 404-style error if the code/phone combo has no
    // pending verification (e.g. expired or already used).
    console.error("Twilio check-code error:", err.message);
    return res.status(200).json({ verified: false });
  }
};
