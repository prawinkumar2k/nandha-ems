const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const crypto = require('crypto');

class OfflineRecoveryEngine {
  constructor() {
    this.storePath = path.join(app.getPath('userData'), 'exam_state.enc');
    const { machineIdSync } = require('node-machine-id');
    this.encryptionKey = crypto.scryptSync(machineIdSync(true), 'neclms_exam_salt', 32);
  }

  // Answer Sync Queue
  queueAnswer(examId, questionId, selectedOption) {
    const state = this._read();
    if (!state.answerQueue) state.answerQueue = [];
    
    // Remove existing answer for the same question before appending new one
    state.answerQueue = state.answerQueue.filter(a => a.questionId !== questionId);
    state.answerQueue.push({ examId, questionId, selectedOption, timestamp: new Date() });
    
    this._write(state);
  }

  getAnswerQueue() {
    const state = this._read();
    return state.answerQueue || [];
  }

  clearAnswerQueue() {
    const state = this._read();
    state.answerQueue = [];
    this._write(state);
  }

  // State Recovery
  saveExamState(stateData) {
    const state = this._read();
    state.currentExam = stateData;
    this._write(state);
  }

  getExamState() {
    return this._read().currentExam || null;
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
      console.warn("Offline state corrupted or empty. Initializing new state.");
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

module.exports = new OfflineRecoveryEngine();
