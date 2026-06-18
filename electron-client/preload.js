const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onStatusUpdate: (callback) => ipcRenderer.on('status-update', (_event, data) => callback(data)),
  onForceAction: (callback) => ipcRenderer.on('force-action', (_event, action) => callback(action)),
  onWarningMessage: (callback) => ipcRenderer.on('warning-message', (_event, message) => callback(message)),
  
  // Future use: renderer -> main communication (e.g. telling the backend the exam started)
  startExam: (examId, studentId) => ipcRenderer.send('exam-started', { examId, studentId }),
  submitExam: () => ipcRenderer.send('exam-submitted'),
  exitApp: () => ipcRenderer.send('exit-app'),
  
  onAnswersUpdated: (data) => ipcRenderer.send('answers-updated', data),
  logViolation: (type) => ipcRenderer.send('log-violation', type)
});
