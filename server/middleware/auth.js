import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// ─── Security Guard: Crash on weak JWT secret ────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error("[SECURITY FATAL] JWT_SECRET is missing or too weak (< 32 chars). Server startup aborted.");
  process.exit(1);
}

// ─── Auth Middleware ──────────────────────────────────────────────────────────
export const authMiddleware = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // ─── Token Blacklist Check ────────────────────────────────────────────────
    // Check if this token's unique ID has been revoked (logout, password change, admin revoke)
    if (decoded.jti) {
      try {
        const TokenBlacklist = mongoose.model("TokenBlacklist");
        const isRevoked = await TokenBlacklist.exists({ jti: decoded.jti });
        if (isRevoked) {
          return res.status(401).json({ message: "Token has been revoked. Please log in again." });
        }
      } catch (dbErr) {
        // If blacklist check fails (e.g. model not loaded yet), log and continue
        console.warn("[SECURITY WARN] Token blacklist check failed:", dbErr.message);
      }
    }

    // Normalize user object for consistency
    req.user = {
      ...decoded,
      id: decoded.id || decoded._id,
      dept: decoded.dept || decoded.department
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const roleMiddleware = (allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Higher authority required" });
  }
  next();
};

export { JWT_SECRET };
