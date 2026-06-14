import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./middleware/auth.js";

let io;

export const initSocket = (server) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:5173", "http://localhost:8080", "http://localhost:3000", "http://localhost:8085"];

  io = new Server(server, {
    cors: {
      // ─── SECURITY VULN-005: No more wildcard CORS ─────────────────────────
      origin: allowedOrigins,
      credentials: true
    }
  });

  // ─── PHASE 5: SOCKET SCALABILITY (REDIS ADAPTER) ─────────────────────────
  if (process.env.REDIS_URL) {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();
    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      io.adapter(createAdapter(pubClient, subClient));
      console.log("✅ Socket.io Redis Adapter Connected");
    }).catch(err => console.error("❌ Redis Adapter Error:", err));
  }

  // ─── PHASE 1: DEVICE & STUDENT SECURE SOCKET AUTHENTICATION ───────────────
  io.use(async (socket, next) => {
    try {
      const studentToken = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace("Bearer ", "");
      const deviceToken = socket.handshake.auth?.deviceToken || socket.handshake.headers?.["x-device-authorization"]?.replace("Bearer ", "");
      const machineFingerprint = socket.handshake.auth?.machineFingerprint || socket.handshake.headers?.["x-machine-fingerprint"];

      if (!studentToken) {
        console.warn(`[SOCKET SECURITY] Connection rejected — no student token. socket.id: ${socket.id}`);
        return next(new Error("AUTH_REQUIRED"));
      }

      // Verify Student Token
      const decodedUser = jwt.verify(studentToken, JWT_SECRET);
      socket.user = decodedUser;

      // Verify Device Token (If strict Lab Security is active, Admin/HOD may bypass this rule if needed, but students cannot)
      if (decodedUser.role === "student") {
        if (!deviceToken || !machineFingerprint) {
          console.warn(`[SOCKET SECURITY] Student rejected — no device token. socket.id: ${socket.id}`);
          return next(new Error("DEVICE_AUTH_REQUIRED"));
        }

        const Device = mongoose.model("Device");
        const device = await Device.findOne({ machineFingerprint, status: "approved" });

        if (!device || !device.deviceSecret) {
          console.warn(`[SOCKET SECURITY] Student rejected — unauthorized device. socket.id: ${socket.id}`);
          return next(new Error("UNAUTHORIZED_DEVICE"));
        }

        const decodedDevice = jwt.verify(deviceToken, device.deviceSecret);
        if (decodedDevice.machineFingerprint !== machineFingerprint) {
          return next(new Error("FINGERPRINT_MISMATCH"));
        }

        socket.device = device;
      }

      next();
    } catch (err) {
      console.warn(`[SOCKET SECURITY] Connection rejected — invalid token. Error: ${err.message}`);
      next(new Error("INVALID_TOKEN"));
    }
  });

  io.on("connection", (socket) => {
    const { id: userId, role } = socket.user || {};
    console.log(`🔌 Authenticated socket: ${socket.id} | user: ${userId} | role: ${role}`);

    // ─── Dashboard Room (Admin/HOD/Faculty only) ───────────────────────────
    socket.on("join-dashboard", () => {
      if (!["admin", "hod", "faculty"].includes(role)) {
        console.warn(`[SOCKET SECURITY] Unauthorized join-dashboard by role: ${role}, userId: ${userId}`);
        return;
      }
      socket.join("admin-dashboard");
      console.log(`👤 ${role} ${userId} joined admin-dashboard`);
    });

    // ─── User Room (own room only) ────────────────────────────────────────
    socket.on("join-user-room", (requestedUserId) => {
      // ─── SECURITY: User can only join their OWN room ─────────────────────
      if (userId !== requestedUserId) {
        console.warn(`[SOCKET SECURITY] User ${userId} tried to join room of user ${requestedUserId}`);
        return;
      }
      socket.join(`user-${userId}`);
      console.log(`👤 Socket ${socket.id} joined user-${userId}`);
    });

    // ─── Messaging ────────────────────────────────────────────────────────
    socket.on("send-message", async (data) => {
      try {
        // ─── SECURITY: Sender must be the authenticated user ──────────────
        if (data.senderId !== userId) {
          console.warn(`[SOCKET SECURITY] Message spoofing attempt: socket user ${userId} used senderId ${data.senderId}`);
          return;
        }
        const Message = mongoose.model("Message");
        const msg = await Message.create({
          sender: data.senderId,
          receiver: data.receiverId,
          content: data.content
        });

        io.to(`user-${data.receiverId}`).emit("receive-message", msg);
        io.to(`user-${data.senderId}`).emit("receive-message", msg);
      } catch (err) {
        console.error("❌ Send message error:", err.message);
      }
    });

    const lastScreenUpdate = new Map();

    // ─── Live Screen Monitoring ───────────────────────────────────────────
    socket.on("join-exam-room-monitoring", (examId) => {
      // Only proctors can join monitoring rooms
      if (!["admin", "hod", "faculty"].includes(role)) {
        console.warn(`[SOCKET SECURITY] Unauthorized monitoring join by role: ${role}`);
        return;
      }
      console.log(`📡 MONITOR-JOIN: ${role} ${userId} joining monitoring-${examId}`);
      socket.join(`monitoring-${examId}`);
    });

    socket.on("screen-data", ({ examId, frame, studentId, studentName, studentRoll, violationCount }) => {
      if (!examId || !frame) return;

      // ─── SECURITY: Only students send screen data, and it must be their OWN ─
      if (role !== "student") return;
      if (studentId && studentId !== userId) {
        console.warn(`[SOCKET SECURITY] screen-data spoofing: socket user ${userId} sent data for student ${studentId}`);
        return;
      }

      // Rate limit: max 1 frame per 2.5s per socket
      const now = Date.now();
      if (lastScreenUpdate.has(socket.id) && now - lastScreenUpdate.get(socket.id) < 2500) return;
      lastScreenUpdate.set(socket.id, now);

      io.to(`monitoring-${examId}`).emit("screen-update", {
        studentId: userId, // Always use the authenticated userId
        studentName,
        studentRoll,
        frame,
        violationCount,
        lastUpdate: new Date().toISOString()
      });
    });

    // ─── ELECTRON KIOSK EVENTS ────────────────────────────────────────────────
    socket.on("live-frame", ({ deviceId, studentId, frame }) => {
      if (!deviceId || !frame) return;
      io.to(`monitoring-device-${deviceId}`).emit("live-frame-update", {
        deviceId,
        studentId,
        frame,
        timestamp: new Date().toISOString()
      });
    });

    socket.on("security-violation", async ({ type, deviceId, studentId, examId, timestamp, evidenceImage }) => {
      try {
        const SecurityEvent = mongoose.model("SecurityEvent");
        const newEvent = await SecurityEvent.create({
          eventType: type,
          deviceId,
          studentId,
          examId,
          timestamp,
          evidenceImage // Base64 string for Evidence Vault
        });
        io.to("admin-dashboard").emit("new-security-violation", newEvent);
      } catch(e) {
        console.error("Failed to save security violation from Electron:", e.message);
      }
    });

    // ─── Device Management (Admin/Faculty only) ───────────────────────────
    socket.on("device-connect", async (deviceId) => {
      try {
        const Device = mongoose.model("Device");
        const device = await Device.findOne({ $or: [{ deviceId }, { hostname: deviceId }] });

        if (device) {
          console.log(`💻 Node [${device.hostname}] linked to Authority Room: device-${device._id}`);
          socket.join(`device-${device._id}`);
          device.status = "online";
          device.lastSeen = new Date();
          await device.save();
          io.to("admin-dashboard").emit("device-update", device);
        }
      } catch (err) {
        console.error("Socket device-connect error:", err.message);
      }
    });

    socket.on("send-command", ({ targetIds, command, payload }) => {
      // ─── SECURITY: Only admin/hod/faculty can send commands to devices ────
      if (!["admin", "hod", "faculty"].includes(role)) {
        console.warn(`[SOCKET SECURITY] Unauthorized send-command by role: ${role}, userId: ${userId}`);
        return;
      }
      console.log(`📡 Dispatching command: ${command} to ${targetIds?.length || 0} nodes by ${role} ${userId}`);
      targetIds.forEach(id => {
        io.to(`device-${id}`).emit("receive-command", { command, payload });
      });
    });

    socket.on("disconnect", () => {
      if (socket.deviceId) {
        console.log(`👋 Device ${socket.deviceId} disconnected`);
        updateDeviceConnectivity(socket.deviceId, "offline");
      }
      console.log("👋 Socket disconnected:", socket.id);
    });
  });

  return io;
};

const updateDeviceConnectivity = async (deviceId, status) => {
  try {
    const Device = mongoose.model("Device");
    const device = await Device.findOneAndUpdate(
      { deviceId },
      { status, lastSeen: new Date() },
      { new: true }
    );
    if (device && io) {
      io.to("admin-dashboard").emit("device-update", device);
      broadcastSystemStats();
    }
  } catch (err) {
    console.error("❌ Device connectivity update failed:", err.message);
  }
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

// ─── Real-time broadcast helpers ─────────────────────────────────────────────

export const notifyViolation = (violation) => {
  if (io) {
    io.to("admin-dashboard").emit("new-violation", violation);
  }
};

export const notifyActivity = (activity) => {
  if (io) {
    io.to("admin-dashboard").emit("new-activity", activity);
  }
};

export const updateDeviceStatus = (deviceId, status) => {
  if (io) {
    io.to("admin-dashboard").emit("device-update", { deviceId, status });
  }
};

export const broadcastSystemStats = async () => {
  if (!io) return;
  try {
    const User = mongoose.model("User");
    const Exam = mongoose.model("Exam");
    const Device = mongoose.model("Device");
    const Submission = mongoose.model("Submission");

    const [students, faculty, devices, online, activeExams, violationsToday] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "faculty" }),
      Device.countDocuments(),
      Device.countDocuments({ status: "online" }),
      Exam.countDocuments({ status: "active" }),
      Submission.countDocuments({
        "violations.timestamp": { $gte: new Date().setHours(0, 0, 0, 0) }
      })
    ]);

    io.to("admin-dashboard").emit("stats-update", {
      students, faculty, devices, online, activeExams, violationsToday
    });
  } catch (err) {
    console.error("❌ Socket broadcast error:", err.message);
  }
};
