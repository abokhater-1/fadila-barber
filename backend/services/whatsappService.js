const axios = require("axios");
const emailService = require("./emailService");
const Settings = require("../models/Settings");

const WAHA_URL = process.env.WAHA_URL;
const WAHA_API_KEY = process.env.WAHA_API_KEY;
const SESSION_NAME = process.env.WAHA_SESSION;

function normalizePhone(phone) {
  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "972" + cleaned.substring(1);
  }

  if (!cleaned.startsWith("972")) {
    cleaned = "972" + cleaned;
  }

  return cleaned;
}

async function sendMessage(phone, message) {
  try {

    // ✅ מושך את ה־WAHA URL מהקולקשן settings
    const config = await Settings.findById("waha_live_url");

    if (!config || !config.url) {
      throw new Error("WAHA URL not found in DB");
    }

    const WAHA_URL = config.url;

    const normalized = normalizePhone(phone);

await axios.post(
  `${WAHA_URL}/api/sendText`,
  {
    chatId: `${normalized}@c.us`,
    text: message,
    session: process.env.WAHA_SESSION
  },
  {
    headers: {
      "x-api-key": process.env.WAHA_API_KEY,   // ✅ זה הנכון
      "Content-Type": "application/json"
    }
  }
);

    console.log("✅ WhatsApp sent using:", WAHA_URL);

  } catch (error) {

    console.error("❌ WhatsApp failed:", error.message);

    await emailService.sendWhatsAppFailureEmail({
      phone,
      message,
      error: error.message
    });
  }
}

module.exports = { sendMessage };