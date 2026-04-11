const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { createUser, findUserByEmail } = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET;

async function signup(req, res) {
  try {
    const { email, password } = req.body;

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await createUser(email, hashed);

    const { password: _, ...safeUser } = user;
    res.json({
    message: "User created",
      user: safeUser,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { signup, login };