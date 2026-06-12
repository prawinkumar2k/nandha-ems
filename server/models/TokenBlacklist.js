import mongoose from "mongoose";

/**
 * TokenBlacklist — Revoked JWT registry.
 * 
 * Every token issued has a unique `jti` (JWT ID). On logout or password change,
 * the jti is inserted here. The authMiddleware checks this on every request.
 * MongoDB TTL index auto-expires entries when the original token would have expired.
 */
const tokenBlacklistSchema = new mongoose.Schema({
  jti: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  revokedAt: {
    type: Date,
    default: Date.now
  },
  reason: {
    type: String,
    enum: ["logout", "password_change", "admin_revoke", "suspicious_activity"],
    default: "logout"
  },
  ipAddress: { type: String, default: "" },
  // TTL: MongoDB auto-deletes this document when expiresAt is reached
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  }
});

export default mongoose.models.TokenBlacklist || mongoose.model("TokenBlacklist", tokenBlacklistSchema);
