
// server.js
import dotenv from "dotenv";
import dns from "dns";

// Use public DNS resolvers — local/ISP DNS often blocks MongoDB SRV lookups
dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);

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
import keywordReportRoutes from "./routes/keywordReportRoutes.js";
import productRoasRoutes from "./routes/productRoasRoutes.js";
import heatMapRoutes from "./routes/heatMapRoutes.js";
import geoRoutes from "./routes/geoRoutes.js";

import logger from "./config/logger.js";
import { morganMiddleware } from "./config/logger.js"; // assuming you export morganMiddleware as `morgan`
import errorHandler from "./middleware/errorHandler.js";
import path from "path";
import { fileURLToPath } from "url";
// Fix for ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// LOAD .env MANUALLY
dotenv.config({ path: path.join(__dirname, ".env") });

// Load Passport Google Strategy (session: false inside)
import "./config/passport.js";

const app = express();

// Trust proxy headers (X-Forwarded-*) — needed when running behind nginx/Cloudflare
// so `secure` cookies and req.ip work correctly.
app.set("trust proxy", 1);

// ========== CORS ==========
// ALLOWED_ORIGINS env var is a comma-separated list, e.g.
//   ALLOWED_ORIGINS=http://localhost:8080,https://test.managingseo.com
// Falls back to common localhost dev origins if unset.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:8080,http://127.0.0.1:8080,http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (Postman, curl, server-to-server, same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
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
app.use("/api/keyword-report", keywordReportRoutes);
app.use("/api/product-roas", productRoasRoutes);
app.use("/api/heat-map", heatMapRoutes);
app.use("/api/geo", geoRoutes);

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
    // Bind to "::" (all IPv6 interfaces). On Linux this dual-binds to IPv4 too,
    // so we keep working on docker-compose AND on Railway (whose private
    // service-to-service network is IPv6-only).
    app.listen(PORT, "::", () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Frontend URL (configured): ${process.env.FRONTEND_URL || "(unset)"}`);
      logger.info(`Google OAuth ready`);
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection failed:", err.message);
    console.error(err); // <-- THIS SHOWS THE REAL CAUSE
    process.exit(1);
  });