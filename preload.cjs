const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  logViolation: (type) => ipcRenderer.send('log-violation', type),
  onAnswersUpdated: (data) => ipcRenderer.send('answers-updated', data),
  exitApp: () => ipcRenderer.send('exit-app')
});
