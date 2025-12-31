import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1️⃣ Try Authorization header first
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2️⃣ If no header token, try cookie token
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // 3️⃣ If still no token → fail
    if (!token) {
      return res.status(401).json({ message: "Unauthorized. Token missing." });
    }

    // 4️⃣ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5️⃣ Load user
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    // 6️⃣ Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Error:", err);
    return res.status(401).json({ message: "Unauthorized. Invalid token." });
  }
};

export default protect;
