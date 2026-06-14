const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const crypto = require('crypto');

// A basic AES-256-GCM encrypted store for the Device JWT and Secret
class SecureStore {
  constructor() {
    this.storePath = path.join(app.getPath('userData'), 'secure_exam_config.enc');
    // In a real enterprise deployment, this encryption key should be fetched from TPM or Windows DPAPI.
    // For this build, we derive it from the machineId.
    const { machineIdSync } = require('node-machine-id');
    this.encryptionKey = crypto.scryptSync(machineIdSync(true), 'neclms_salt', 32);
  }

  set(key, value) {
    const data = this._read();
    data[key] = value;
    this._write(data);
  }

  get(key) {
    const data = this._read();
    return data[key];
  }

  _read() {
    try {
      if (!fs.existsSync(this.storePath)) return {};
      
      const fileBuffer = fs.readFileSync(this.storePath);
      const iv = fileBuffer.subarray(0, 16);
      const authTag = fileBuffer.subarray(16, 32);
      const encryptedData = fileBuffer.subarray(32);

      const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encryptedData, null, 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (e) {
      console.error("Store read error (possibly corrupted):", e);
      return {};
    }
  }

  _write(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    const authTag = cipher.getAuthTag();
    const payload = Buffer.concat([iv, authTag, encrypted]);
    
    fs.writeFileSync(this.storePath, payload);
  }
}

module.exports = new SecureStore();
