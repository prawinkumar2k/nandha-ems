import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import crypto from "crypto";
import path from "path";
import "dotenv/config";

// ─── SECURITY: Strict file type allowlist (profile pics and exam attachments only) ─
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];
const ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

// ─── Storage Configuration ────────────────────────────────────────────────────
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIMES.includes(file.mimetype)) {
        console.warn(`[SECURITY WARN] Blocked upload attempt: ${file.originalname} from user ${req.user ? req.user.id : "unknown"}`);
        return reject(new Error(`File type not allowed: ${ext}`));
      }

      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);
        const filename = buf.toString("hex") + ext;
        resolve({
          filename,
          bucketName: "uploads",
          metadata: {
            originalName: file.originalname,
            uploadedBy: req.user ? req.user.id : "system",
            uploadType: "secure-gridfs"
          }
        });
      });
    });
  }
});

storage.on('connection', () => {
  console.log("✅ GridFS connected securely for uploads (v8 Compatible)");
});

storage.on('connectionFailed', (err) => {
  console.error("❌ GridFS connection failed:", err.message);
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed. Only JPG, PNG, and PDF are accepted."), false);
  }
};

// ─── Default upload handler (profile pics, evidence) — 10MB limit ─────────────
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});
