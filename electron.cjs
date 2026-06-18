const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "NEC EMS - Secure Examination Platform",
    kiosk: true,             // 🔒 OS Level Lock: Fullscreen without exit buttons
    alwaysOnTop: true,       // 🔒 OS Level Lock: Prevents switching to other apps
    skipTaskbar: true,       // 🔒 Hides from taskbar
    autoHideMenuBar: true,   // 🔒 Hides menu bar
    webPreferences: {
      preload: require('path').join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load the running dev server
  mainWindow.loadURL('http://localhost:8080');

  // Strict Keyboard Blocking
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (
      input.alt || 
      input.meta || 
      (input.control && ['c', 'v', 'x', 'a', 'r', 'p'].includes(input.key.toLowerCase())) ||
      ['F11', 'F5', 'Escape'].includes(input.key)
    ) {
      console.log(`Strictly blocked key event: ${input.key}`);
      event.preventDefault();
    }
  });

  // Block basic escape shortcuts to prevent cheating/exiting easily
  mainWindow.on('focus', () => {
    globalShortcut.register('CommandOrControl+W', () => {
      console.log('Blocked window close');
    });
    globalShortcut.register('Alt+Tab', () => {
      console.log('Blocked alt+tab');
    });
  });

  mainWindow.on('blur', () => {
    globalShortcut.unregisterAll();
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('exit-app', () => {
  app.exit(0);
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
