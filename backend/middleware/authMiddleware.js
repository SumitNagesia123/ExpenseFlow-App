import jwt from "jsonwebtoken";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "expenseflow_secret";

// Initialize Firebase Admin if credentials are provided
let firebaseApp = null;
if (process.env.FIREBASE_PROJECT_ID && !admin.apps.length) {
  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    console.log("🔥 Firebase Admin initialized successfully.");
  } catch (err) {
    console.error("🔥 Firebase Admin initialization error:", err);
  }
}

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 1. Try Firebase verification first if configured
    if (firebaseApp) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        // Extract UID precisely as the user requested
        req.user = {
          id: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name || decodedToken.email,
        };
        return next();
      } catch (firebaseErr) {
        // If Firebase fails, we can fall through to local JWT check below
        console.warn("Firebase token check failed, trying local JWT...", firebaseErr.message);
      }
    }

    // 2. Fallback to local custom JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // The local JWT should contain { id: ... }
    next();

  } catch (error) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};
