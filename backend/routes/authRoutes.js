// routes/authRoutes.js
import express from "express";
const router = express.Router();

import { registerUser, loginUser, logoutUser, refreshTokenUser } from "../controllers/identity-controller.js";
import protect from "../middleware/authMiddleware.js";
import restrictTo from "../middleware/role.js";
import { loginLimiter, authLimiter } from "../middleware/rateLimiter.js";
import passport from "passport";
import User from "../models/User.js";
import crypto from "crypto";
import generateToken from "../utils/generateToken.js";
import nodemailer from "nodemailer"; 
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Fix for ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// LOAD .env MANUALLY — THIS FIXES EVERYTHING
dotenv.config({ path: path.join(__dirname, "../.env") });

// Public routes
router.post("/register", authLimiter, registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshTokenUser);

// Google OAuth – NO SESSION!
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:8080/login",
    session: false, // This is crucial!
  }),
  async (req, res) => {
    // req.user is now available → generate JWT cookies
    await generateToken(req.user, res);

    // // Redirect to your frontend
    // res.redirect("http://localhost:8080/dashboard");
    res.redirect("http://localhost:8080");
  }
);

// Protected
router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

router.get("/admin", protect, restrictTo("admin"), (req, res) => {
  res.json({ message: "Welcome Admin!" });
});
console.log(
  "EMail User  loaded:",
  process.env.EMAIL_USER ? "YES" : "NO"
);
console.log(
  "EMail Pass  loaded:",
  process.env.EMAIL_PASS ? "YES" : "NO"
);
// Forgot Password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
router.post("/forgot-password", authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "You have not signed up yet. Please sign up first." });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 mins
  await user.save();

  const resetURL = `http://localhost:8080/reset-password/${resetToken}`;

  try {
    await transporter.sendMail({
      from: `"Ads Insight" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password - Ads Insight",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 12px; background: #f9f9f9;">
          <h2 style="color: #1a56db; text-align: center;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #333;">
            We received a request to reset your password for your Ads Insight account.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" style="background: #1a56db; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Or copy this link:<br>
            <a href="${resetURL}" style="color: #1a56db;">${resetURL}</a>
          </p>
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 13px; text-align: center;">
            This link expires in 15 minutes.<br>
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    });

    console.log("Reset email sent to:", email);
    res.json({ message: "Reset link sent to your email" });
  } catch (error) {
    console.error("Email send failed:", error);
    // Fallback: Log reset URL to console for development
    console.log("🔗 Reset Link (Email failed, using console fallback):", resetURL);
    res.json({ message: "Reset link generated. Check server console for the link." });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  // Debug logging to help diagnose invalid token issues
  console.log("[DEBUG] reset-password called. params.token:", req.params.token);
  console.log("[DEBUG] request body keys:", Object.keys(req.body));
  const hashedToken = crypto.createHash("sha256").update(req.params.token || "").digest("hex");
  console.log("[DEBUG] hashedToken (sha256 hex):", hashedToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    console.log("[DEBUG] No user found for hashed token or token expired");
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  await generateToken(user, res);
  res.json({ message: "Password reset successful" });
});

export default router;