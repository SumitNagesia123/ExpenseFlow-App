import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";

const JWT_SECRET = "expenseflow_secret";

// SIGNUP
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, password_hash]
    );

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.error("Signup error:", err.message);
    if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR' || err.message.includes('connect')) {
      return res.status(503).json({ error: "Database connection failed. Please try again later.", details: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// LOGIN  ✅ THIS EXPORT WAS MISSING
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (!users.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Login error:", err.message);
    if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR' || err.message.includes('connect')) {
      return res.status(503).json({ error: "Database connection failed. Please try again later.", details: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};
