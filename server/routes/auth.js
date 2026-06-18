import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { JWT_SECRET } from "../middleware/auth.js";

// ─── POST /api/auth/login ───────────────────────────────────────────────────
export const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const User = mongoose.model("User");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");

    // Log failures
    if (!user) {
      try {
        await mongoose.model("LoginLog").create({
          email,
          status: "failed",
          failReason: "user_not_found",
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"]
        });
      } catch (e) {}
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      try {
        await mongoose.model("LoginLog").create({
          user: user._id,
          email,
          status: "failed",
          failReason: "wrong_password",
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"]
        });
      } catch (e) {}
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    // Success log
    try {
      await mongoose.model("LoginLog").create({
        user: user._id,
        email,
        role: user.role,
        status: "success",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });
    } catch (e) {}

    // ─── Generate JWT with unique jti for revocability ─────────────────────
    const jti = uuidv4();
    const token = jwt.sign(
      {
        jti,                                         // Unique token ID for revocation
        id: user._id.toString(),
        role: user.role,
        dept: user.department
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        profilePic: user.profilePic,
        mustChangePassword: user.mustChangePassword
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── POST /api/auth/logout ──────────────────────────────────────────────────
export const handleLogout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.jti) {
          // Calculate when this token expires so TTL index can auto-clean
          const expiresAt = new Date(decoded.exp * 1000);
          const TokenBlacklist = mongoose.model("TokenBlacklist");
          await TokenBlacklist.create({
            jti: decoded.jti,
            userId: decoded.id,
            reason: "logout",
            ipAddress: req.ip,
            expiresAt
          });
        }
      } catch {
        // Token already invalid — nothing to blacklist
      }
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
