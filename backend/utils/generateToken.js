// utils/generateToken.js
import jwt from "jsonwebtoken";
import crypto from "crypto";
import RefreshToken from "../models/RefreshToken.js";

const generateToken = async (user, res) => {
  const payload = {
    userId: user._id,
    username: user.username,
    email: user.email,
    role: user.role || "user",
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = crypto.randomBytes(40).toString("hex");

  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  // Set HttpOnly Cookies
  // THIS IS THE KEY — SAME SITE NONE + SECURE
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,           // localhost = no HTTPS
    sameSite: "lax",          // ← CHANGE TO "lax" (not "none")
    path: "/",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
  secure: false,           // localhost = no HTTPS
    sameSite: "lax",          // ← CHANGE TO "lax" (not "none")
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { accessToken, refreshToken };
};

export default generateToken;