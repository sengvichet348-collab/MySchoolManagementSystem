const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 880,
    minWidth: 1080,
    minHeight: 720,
    icon: path.join(__dirname, 'assets/images/school-logo.png'),
    frame: false, // Frameless window for custom luxury desktop titlebar
    titleBarStyle: 'hidden',
    backgroundColor: '#0b0f19',
    show: false, // Show once ready-to-show to avoid white flashes
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Track window state for maximize/restore icon toggle
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized-state', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-maximized-state', false);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for Window Controls
ipcMain.on('window-minimize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.minimize();
  }
});

ipcMain.on('window-maximize-toggle', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
  }
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// IPC Handler for Native Print
ipcMain.handle('print-active-window', async (event, options = {}) => {
  if (!mainWindow) return { success: false, error: 'Window not found' };

  return new Promise((resolve) => {
    mainWindow.webContents.print({
      silent: options.silent || false,
      printBackground: true,
      deviceName: options.deviceName || ''
    }, (success, failureReason) => {
      if (!success) {
        resolve({ success: false, error: failureReason });
      } else {
        resolve({ success: true });
      }
    });
  });
});

// IPC Handler for Exporting to PDF directly
ipcMain.handle('export-to-pdf', async (event, { defaultFileName = 'document.pdf', landscape = false }) => {
  if (!mainWindow) return { success: false, error: 'Window not found' };

  try {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'រក្សាទុកឯកសារជា PDF / 导出PDF文件',
      defaultPath: defaultFileName,
      filters: [
        { name: 'PDF Documents (*.pdf)', extensions: ['pdf'] }
      ]
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    const pdfData = await mainWindow.webContents.printToPDF({
      printBackground: true,
      landscape: landscape,
      pageSize: 'A4',
      margins: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    });

    await fs.promises.writeFile(filePath, pdfData);
    return { success: true, filePath };
  } catch (error) {
    console.error('PDF Export Error:', error);
    return { success: false, error: error.message };
  }
});

// IPC Handler for Native Save File (for JSON Backups)
ipcMain.handle('dialog-save-file', async (event, { defaultFileName = 'backup.json', data = '', filters = [] }) => {
  if (!mainWindow) return { success: false, error: 'Window not found' };

  try {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'រក្សាទុកទិន្នន័យបម្រុងទុក (Export Backup)',
      defaultPath: defaultFileName,
      filters: filters.length ? filters : [{ name: 'JSON Backup (*.json)', extensions: ['json'] }]
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    await fs.promises.writeFile(filePath, data, 'utf-8');
    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC Handler for Native Open File (for JSON Restore)
ipcMain.handle('dialog-open-file', async (event, { filters = [] }) => {
  if (!mainWindow) return { success: false, error: 'Window not found' };

  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'ជ្រើសរើសឯកសារបម្រុងទុក (Import Backup)',
      properties: ['openFile'],
      filters: filters.length ? filters : [{ name: 'JSON Backup (*.json)', extensions: ['json'] }]
    });

    if (canceled || !filePaths || filePaths.length === 0) {
      return { success: false, canceled: true };
    }

    const content = await fs.promises.readFile(filePaths[0], 'utf-8');
    return { success: true, filePath: filePaths[0], content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// App Lifecycle
app.whenReady().then(() => {
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
