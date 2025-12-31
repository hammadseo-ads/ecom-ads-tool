import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, trim: true },

    email: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true, 
      lowercase: true 
    },

    password: { 
      type: String, 
      required: function () {
        return !this.googleId;  // password NOT required if Google OAuth user
      }
    },

    googleId: {
      type: String,
      default: null,
    },

    role: { 
      type: String, 
      enum: ["user", "admin"], 
      default: "user" 
    },

    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

// Hash password before saving (ONLY if password exists)
userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password (normal users only)
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false; // prevent crash for Google OAuth users
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
