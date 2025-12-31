
// server.js
import dotenv from "dotenv";

import express from "express";

import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import passport from "passport";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import googleAdsRoutes from "./routes/googleAdsRoutes.js";
import performanceRoutes from "./routes/performance.js";
import onDemandReportRoutes from "./routes/onDemandReportRoutes.js";

import logger from "./config/logger.js";
import { morganMiddleware } from "./config/logger.js"; // assuming you export morganMiddleware as `morgan`
import errorHandler from "./middleware/errorHandler.js";
import path from "path";
import { fileURLToPath } from "url";
// Fix for ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// LOAD .env MANUALLY — THIS FIXES EVERYTHING
dotenv.config({ path: path.join(__dirname, "../.env") });

// Load Passport Google Strategy (session: false inside)
import "./config/passport.js";

const app = express();

// ========== CORS - Perfect for localhost:8080 + production ==========
const allowedOrigins = [
  "http://localhost:8080",     // Vite/React frontend
  "http://127.0.0.1:8080",
  "http://localhost:3000",     // fallback for CRA
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (Postman, mobile, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Required for HttpOnly cookies
  })
);

// ========== SECURITY ==========
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // adjust later if needed
  })
);

app.use(cookieParser());
app.use((req, res, next) => {
  req.cookies = req.cookies || {};
  next();
});
app.use(express.json());
app.use(morganMiddleware); // HTTP logging

// ========== PASSPORT (NO SESSION!) ==========
app.use(passport.initialize());
// passport.session() is REMOVED on purpose → we use JWT cookies instead

// ========== ROUTES ==========
app.use("/api/auth", authRoutes);
app.use("/api/google-ads", googleAdsRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/on-demand-report", onDemandReportRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Ads Insight API is running!",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

// ========== ERROR HANDLING ==========
app.use(errorHandler);

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
// LOAD .env MANUALLY — THIS FIXES EVERYTHING
// dotenv.config({ path: path.join(__dirname, "../.env") });
console.log(
  "MongoDB URI loaded:",
  process.env.MONGO_URI ? "YES" : "NO"
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info("MongoDB connected successfully");
    logger.info(`Google Developer Token loaded: ${process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? "YES ✓" : "❌ MISSING - Google Ads API will fail!"}`);
    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`Frontend URL: http://localhost:8080`);
      logger.info(`Google OAuth ready`);
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection failed:", err.message);
    console.error(err); // <-- THIS SHOWS THE REAL CAUSE
    process.exit(1);
  });