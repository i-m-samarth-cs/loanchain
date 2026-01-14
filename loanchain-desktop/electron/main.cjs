const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0a0a0f',
    frame: false,
    show: false
  });

  // Load app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Window controls for frameless window
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

// File operations for offline vault
ipcMain.handle('save-deal', async (event, dealData) => {
  const userDataPath = app.getPath('userData');
  const dealsPath = path.join(userDataPath, 'deals');

  if (!fs.existsSync(dealsPath)) {
    fs.mkdirSync(dealsPath, { recursive: true });
  }

  const filename = `deal-${Date.now()}.json`;
  const filepath = path.join(dealsPath, filename);

  fs.writeFileSync(filepath, JSON.stringify(dealData, null, 2));
  return { success: true, filepath };
});

ipcMain.handle('load-deals', async () => {
  const userDataPath = app.getPath('userData');
  const dealsPath = path.join(userDataPath, 'deals');

  if (!fs.existsSync(dealsPath)) {
    return [];
  }

  const files = fs.readdirSync(dealsPath);
  const deals = files
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const content = fs.readFileSync(path.join(dealsPath, f), 'utf-8');
      return JSON.parse(content);
    });

  return deals;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
