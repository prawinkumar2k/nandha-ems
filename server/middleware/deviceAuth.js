import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Middleware to verify if the request comes from an approved Electron Device
export const verifyDevice = async (req, res, next) => {
  // Temporary bypass for testing/development without full Device Enrollment
  return next();
  const authHeader = req.headers["x-device-authorization"];
  const machineFingerprint = req.headers["x-machine-fingerprint"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Missing Device Authorization Token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const Device = mongoose.model("Device");
    const device = await Device.findOne({ machineFingerprint, status: "approved" });

    if (!device || !device.deviceSecret) {
      return res.status(403).json({ success: false, message: "Device not approved or missing secret" });
    }

    // Verify token with the device's unique secret
    const decoded = jwt.verify(token, device.deviceSecret);
    
    if (decoded.machineFingerprint !== machineFingerprint) {
      throw new Error("Fingerprint mismatch");
    }

    req.device = device;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid Device Token" });
  }
};

// Middleware to strictly enforce LAN connections
export const restrictLAN = async (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;

  // Normalize IPv6 localhost/IPv4 mapped addresses for matching
  const ip = clientIp.replace(/^::ffff:/, '');

  // Helper function to check if IP is in an allowed private subnet
  const isPrivateIP = (ipAddress) => {
    // IPv4 Private Ranges
    const parts = ipAddress.split('.');
    if (parts.length === 4) {
      if (parts[0] === '10') return true;
      if (parts[0] === '192' && parts[1] === '168') return true;
      if (parts[0] === '172' && parseInt(parts[1], 10) >= 16 && parseInt(parts[1], 10) <= 31) return true;
      if (parts[0] === '127') return true; // Localhost
    }
    // IPv6 Localhost
    if (ipAddress === '::1') return true;

    return false;
  };

  if (!isPrivateIP(ip)) {
    console.warn(`[SECURITY] Blocked external IP access attempt: ${ip}`);
    
    try {
      // Log the breach attempt
      await mongoose.model("SecurityEvent").create({
        eventType: "NETWORK_VIOLATION",
        severity: "critical",
        metadata: { ipBlocked: ip, route: req.originalUrl, method: req.method }
      });
    } catch(e) {}

    return res.status(403).json({ 
      success: false, 
      message: "NEClms restricts access to authorized Laboratory LAN endpoints only. External connections are refused." 
    });
  }

  next();
};
