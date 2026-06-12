import mongoose from "mongoose";
import { Readable } from "stream";

let bucket;

const getBucket = () => {
  if (!bucket && mongoose.connection.readyState === 1) {
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "screenshots"
    });
  }
  return bucket;
};

/**
 * Save Base64 screenshot to GridFS.
 * Returns the GridFS file ID or null if failed.
 */
export const saveScreenshot = async (base64Data, filename = "screenshot.jpg") => {
  if (!base64Data || typeof base64Data !== "string") return null;

  try {
    // If it is a data URL, extract the base64 part
    const matches = base64Data.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    let buffer;
    let contentType = "image/jpeg";

    if (matches && matches.length === 3) {
      contentType = `image/${matches[1]}`;
      buffer = Buffer.from(matches[2], "base64");
    } else {
      // Direct base64 string
      buffer = Buffer.from(base64Data, "base64");
    }

    const gridfsBucket = getBucket();
    if (!gridfsBucket) {
      console.warn("⚠️ GridFS bucket not ready. Falling back.");
      return null;
    }

    return new Promise((resolve, reject) => {
      const uploadStream = gridfsBucket.openUploadStream(filename, {
        contentType,
        metadata: { uploadedAt: new Date() }
      });

      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);

      readableStream
        .pipe(uploadStream)
        .on("error", (err) => {
          console.error("❌ GridFS Upload Error:", err.message);
          reject(err);
        })
        .on("finish", () => {
          resolve(uploadStream.id);
        });
    });
  } catch (err) {
    console.error("❌ saveScreenshot Error:", err.message);
    return null;
  }
};

/**
 * Retrieve screenshot stream from GridFS by ID.
 */
export const getScreenshotStream = (fileId) => {
  const gridfsBucket = getBucket();
  if (!gridfsBucket) return null;
  try {
    const id = new mongoose.Types.ObjectId(fileId);
    return gridfsBucket.openDownloadStream(id);
  } catch (err) {
    console.error("❌ getScreenshotStream Error:", err.message);
    return null;
  }
};

/**
 * Delete a screenshot from GridFS.
 */
export const deleteScreenshot = async (fileId) => {
  const gridfsBucket = getBucket();
  if (!gridfsBucket) return false;
  try {
    const id = new mongoose.Types.ObjectId(fileId);
    await gridfsBucket.delete(id);
    return true;
  } catch (err) {
    console.error("❌ deleteScreenshot Error:", err.message);
    return false;
  }
};
