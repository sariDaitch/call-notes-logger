import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from 'electron-store';
import log from 'electron-log';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    win.loadURL('http://localhost:5173');
  }
}

app.whenReady().then(() => {
  log.info("Log file:", log.transports.file.getFile().path);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

import fs from 'fs';

// IPC Handlers
ipcMain.handle("notes:save", async (_event, text) => {
  store.set("noteText", text);
  
  // Also save to a local text file in Documents
  const docPath = app.getPath('documents');
  const filePath = path.join(docPath, 'call-notes-log.txt');
  try {
     fs.writeFileSync(filePath, text);
     log.info(`Saved to file: ${filePath}`);
  } catch (err) {
     log.error(`Failed to write to file: ${err}`);
  }

  log.info(`Saved note (len=${text.length})`);
  return true;
});

ipcMain.handle("notes:load", async () => {
  const text = store.get("noteText", "");
  log.info(`Loaded note (len=${text.length})`);
  return text;
});

ipcMain.handle("log", async (_event, level, message) => {
    if (log[level]) {
        log[level](message);
    } else {
        log.info(message);
    }
    return true;
});
