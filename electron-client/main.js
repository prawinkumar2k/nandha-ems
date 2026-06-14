const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const { getDeviceFingerprint } = require('./services/hardware');
const { registerDevice, sendHeartbeat } = require('./services/api');
const { captureScreen } = require('./services/streamer');
const store = require('./storage/store');
const io = require('socket.io-client');
const os = require('os');

let mainWindow;
let socket;
let deviceStatus = "pending"; // pending, approved, offline, locked, exam_running
let currentStudentId = null;
let currentExamId = null;

// ─── Phase 2: KIOSK MODE SETUP ───────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    fullscreen: true,
    kiosk: true,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // Load the waiting room UI (we will build this in renderer/index.html)
  mainWindow.loadFile('renderer/index.html');

  // Prevent Navigation
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Only allow navigation to localhost or the approved server IP
    if (!url.startsWith('http://localhost') && !url.startsWith(process.env.API_URL || 'http://localhost:8081')) {
      event.preventDefault();
      console.log('Blocked external navigation attempt.');
    }
  });

  // Block new windows
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  setupSecurityListeners();
}

// ─── Phase 8: EXAM SECURITY (Anti-Cheat) ──────────────────────────────────────
function setupSecurityListeners() {
  mainWindow.on('blur', () => {
    if (deviceStatus === "exam_running") {
      console.warn("Security Event: Window Blur (Possible Alt+Tab)");
      logSecurityEvent("ALT_TAB_DETECTED");
      mainWindow.focus(); // Force focus back
    }
  });

  mainWindow.on('leave-full-screen', () => {
    if (deviceStatus === "exam_running") {
      console.warn("Security Event: Fullscreen Exit");
      logSecurityEvent("FULLSCREEN_EXIT");
      mainWindow.setFullScreen(true); // Force back to fullscreen
    }
  });

  // Register Global Shortcuts to block system keys
  const blockedKeys = ['CommandOrControl+R', 'CommandOrControl+Shift+R', 'F5', 'F11', 'Alt+Tab', 'CommandOrControl+Shift+I', 'Alt+F4', 'PrintScreen', 'CommandOrControl+C', 'CommandOrControl+V', 'CommandOrControl+X', 'Super+V'];
  blockedKeys.forEach(key => {
    globalShortcut.register(key, () => {
      console.warn(`Blocked KeyPress: ${key}`);
      if (deviceStatus === "exam_running") logSecurityEvent(`BLOCKED_KEY_${key}`);
    });
  });
}

function logSecurityEvent(type) {
  if (socket && socket.connected) {
    // Capture high-res evidence for violation
    captureScreen().then(screenshot => {
      socket.emit("security-violation", {
        type,
        deviceId: store.get('deviceId'),
        studentId: currentStudentId,
        examId: currentExamId,
        timestamp: new Date(),
        evidenceImage: screenshot ? screenshot.highRes.toString('base64') : null
      });
    });
  }
}

// ─── Boot Sequence ────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  createWindow();

  mainWindow.webContents.once('did-finish-load', async () => {
    try {
      console.log("Getting fingerprint...");
      const hw = await getDeviceFingerprint();
      store.set('deviceId', hw.deviceId);
      console.log("Fingerprint:", hw.deviceId);

      // Phase 4: Device Registration
      console.log("Registering device...");
      const regResult = await registerDevice();
      console.log("Reg Result:", regResult.status);
      
      if (regResult.status === "approved") {
        deviceStatus = "online";
        if (regResult.deviceToken) {
          store.set('deviceToken', regResult.deviceToken);
        }
        initSocketConnection();
        mainWindow.webContents.send('status-update', { message: "Device Approved. Launching Exam Environment..." });
        
        // Wait 2 seconds so the user can see the success message, then load the actual LMS
        setTimeout(() => {
          mainWindow.loadURL(process.env.API_URL ? process.env.API_URL.replace('/api', '/student') : 'http://localhost:8080/student');
        }, 2000);
      } else {
        deviceStatus = "pending";
        console.log("Device pending, sending IPC...");
        mainWindow.webContents.send('status-update', { message: "Device Pending Admin Approval..." });
        // Start polling for approval every 10 seconds
        setInterval(pollForApproval, 10000);
      }
      
      startHeartbeatEngine();

    } catch (err) {
      console.error("Boot Error:", err.message);
      mainWindow.webContents.send('status-update', { message: `Network Error: ${err.message}` });
    }
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// ─── Phase 6 & Phase C.6: HEARTBEAT & MONITORING ──────────────────────────────
function startHeartbeatEngine() {
  setInterval(async () => {
    try {
      let frame = null;

      // Only capture screen if exam is running to save bandwidth
      if (deviceStatus === "exam_running") {
        const screenshot = await captureScreen();
        if (screenshot && socket && socket.connected) {
          socket.emit("live-frame", {
            deviceId: store.get('deviceId'),
            studentId: currentStudentId,
            frame: screenshot.lowRes,
          });
        }
      }

      const data = {
        deviceId: store.get('deviceId'),
        studentId: currentStudentId,
        examId: currentExamId,
        status: deviceStatus,
        cpuUsage: process.cpuUsage().user / 1000000,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        networkStatus: "connected"
      };
      await sendHeartbeat(data);
    } catch (err) {
      console.error("Heartbeat sync failed:", err.message);
    }
  }, 5000);
}

// ─── Approval Polling ─────────────────────────────────────────────────────────
async function pollForApproval() {
  if (deviceStatus !== "pending") return;
  try {
    const regResult = await registerDevice();
    if (regResult.status === "approved" && regResult.deviceToken) {
      store.set('deviceToken', regResult.deviceToken);
      deviceStatus = "online";
      initSocketConnection();
      mainWindow.webContents.send('status-update', { message: "Device Approved. Ready for Exam." });
    }
  } catch(e) {}
}

// ─── Phase 10: FORCE CONTROL ENGINE (Socket) ──────────────────────────────────
async function initSocketConnection() {
  const hw = await getDeviceFingerprint();
  const token = store.get('deviceToken');

  socket = io(process.env.API_URL || 'http://localhost:8080', {
    auth: {
      deviceToken: token,
      machineFingerprint: hw.machineFingerprint,
    }
  });

  socket.on("connect", () => {
    console.log("Connected to Lab Security Hub.");
    socket.emit("device-connect", hw.deviceId);
  });

  socket.on("receive-command", ({ command, payload }) => {
    switch (command) {
      case "device_lock":
        deviceStatus = "locked";
        mainWindow.webContents.send('force-action', 'lock');
        break;
      case "device_unlock":
        deviceStatus = "online";
        mainWindow.webContents.send('force-action', 'unlock');
        break;
      case "force_submit":
        mainWindow.webContents.send('force-action', 'submit');
        break;
      case "restart_client":
        app.relaunch();
        app.exit(0);
        break;
      case "warning_message":
        mainWindow.webContents.send('warning-message', payload);
        break;
    }
  });
}

// ─── IPC Hooks from Renderer ──────────────────────────────────────────────────
ipcMain.on('answers-updated', (event, { examId, answers }) => {
  const offlineEngine = require('./services/offline');
  offlineEngine.saveExamState({ examId, answers, timestamp: new Date() });
});

ipcMain.on('log-violation', (event, type) => {
  logSecurityEvent(type);
});
