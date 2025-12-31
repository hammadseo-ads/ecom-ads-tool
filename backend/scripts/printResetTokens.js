import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

async function main() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const users = await User.find({ passwordResetToken: { $exists: true, $ne: null } }).select("email passwordResetToken passwordResetExpires");
  if (!users.length) {
    console.log("No users with passwordResetToken found.");
  } else {
    console.log(`Found ${users.length} user(s):`);
    users.forEach((u) => {
      console.log("---");
      console.log("email:", u.email);
      console.log("passwordResetToken:", u.passwordResetToken);
      console.log("passwordResetExpires:", u.passwordResetExpires);
    });
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
