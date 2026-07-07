const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  _id: String,
  url: String,
  updated_at: Number
}, { collection: "settings" }); // ✅ חשוב מאוד

module.exports = mongoose.model("Settings", settingsSchema);