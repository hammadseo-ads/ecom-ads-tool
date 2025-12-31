// config/passport.js  ← THIS VERSION WORKS 100% IN NODE 22 + ESM
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Fix for ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// LOAD .env MANUALLY — THIS FIXES EVERYTHING
dotenv.config({ path: path.join(__dirname, "../.env") });

// Now these logs will show YES
console.log(
  "Google Client ID loaded:",
  process.env.GOOGLE_CLIENT_ID ? "YES" : "NO"
);
console.log(
  "Google Client Secret loaded:",
  process.env.GOOGLE_CLIENT_SECRET ? "YES" : "NO"
);
console.log(
  "Google Developer Token loaded:",
  process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? "YES" : "NO"
);
console.log("Callback URL:", process.env.GOOGLE_CALLBACK_URL);

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "GOOGLE OAUTH CREDENTIALS MISSING! Check .env file in backend root!"
  );
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:5000/api/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          // First time Google login → create user
          user = await User.create({
            email: profile.emails[0].value,
            username: profile.displayName.replace(/\s+/g, "").toLowerCase(),
            name: profile.displayName,
            profilePicture: profile.photos[0]?.value,
            // DON'T set password → leave it null/undefined
            // password: "google-oauth-user",  ← REMOVE THIS LINE
            isVerified: true,
            googleId: profile.id, // optional: link account
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

export default passport;
