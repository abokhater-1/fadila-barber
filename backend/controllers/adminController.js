const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });
  if (!admin) return res.status(400).json({ error: "Invalid credentials" });

  const match = await admin.comparePassword(password);
  if (!match) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: admin._id }, "supersecretkey");

  res.json({ token });
};

exports.createAdmin = async () => {
  const exists = await Admin.findOne({ username: "owner" });
  if (!exists) {
    await Admin.create({
      username: "owner",
      password: "123456"
    });
    console.log("✅ Default admin created (owner / 123456)");
  }
};