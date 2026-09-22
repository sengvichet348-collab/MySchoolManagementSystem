const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,

  // Window Controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximizeToggle: () => ipcRenderer.send('window-maximize-toggle'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  onMaximizeChange: (callback) => {
    ipcRenderer.on('window-maximized-state', (event, isMax) => callback(isMax));
  },

  // Native Print & PDF Export
  print: (options) => ipcRenderer.invoke('print-active-window', options),
  exportPDF: (options) => ipcRenderer.invoke('export-to-pdf', options),

  // File System Dialogs
  saveFile: (options) => ipcRenderer.invoke('dialog-save-file', options),
  openFile: (options) => ipcRenderer.invoke('dialog-open-file', options)
});
