/**
 * Chinese Kindergarten Score Management System
 * Electron Bridge - Desktop Integrations & Universal Fallback
 */

const ElectronBridge = {
  isElectron: false,

  init() {
    this.isElectron = typeof window.electronAPI !== 'undefined' && window.electronAPI.isElectron === true;
    
    document.body.classList.toggle('is-electron-app', this.isElectron);
    document.body.classList.toggle('is-web-browser', !this.isElectron);

    this.setupTitlebar();
    this.bindKeyboardShortcuts();

    console.log(`[ElectronBridge] Initialized in ${this.isElectron ? 'Electron Native Desktop' : 'Standard Web Browser'} mode.`);
  },

  setupTitlebar() {
    const titlebar = document.getElementById('desktop-titlebar');
    if (!titlebar) return;

    const btnMinimize = document.getElementById('win-btn-minimize');
    const btnMaximize = document.getElementById('win-btn-maximize');
    const btnClose = document.getElementById('win-btn-close');

    if (this.isElectron) {
      if (btnMinimize) {
        btnMinimize.addEventListener('click', () => {
          window.electronAPI.minimize();
        });
      }

      if (btnMaximize) {
        btnMaximize.addEventListener('click', () => {
          window.electronAPI.maximizeToggle();
        });
      }

      if (btnClose) {
        btnClose.addEventListener('click', () => {
          window.electronAPI.close();
        });
      }

      // Track maximize state changes
      if (window.electronAPI.onMaximizeChange) {
        window.electronAPI.onMaximizeChange((isMax) => {
          if (btnMaximize) {
            btnMaximize.innerHTML = isMax ? '&#10064;' : '&#9633;';
            btnMaximize.title = isMax ? 'ស្តារឡើងវិញ / 还原' : 'ពង្រីកពេញអេក្រង់ / 最大化';
          }
        });
      }
    } else {
      // Running inside browser: provide browser-friendly window controls
      if (btnMinimize) {
        btnMinimize.style.display = 'none';
      }
      if (btnMaximize) {
        btnMaximize.title = 'ពេញអេក្រង់ (Fullscreen)';
        btnMaximize.addEventListener('click', () => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            btnMaximize.innerHTML = '&#10064;';
          } else {
            document.exitFullscreen().catch(() => {});
            btnMaximize.innerHTML = '&#9633;';
          }
        });
      }
      if (btnClose) {
        btnClose.style.display = 'none';
      }
    }
  },

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ctrl+P or Cmd+P to print active view
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        const activeTab = App.currentTab;
        if (activeTab === 'reports' || activeTab === 'certificates') {
          this.printDocument();
        } else {
          App.switchTab('reports');
          setTimeout(() => this.printDocument(), 300);
        }
      }
    });
  },

  async printDocument() {
    if (this.isElectron && window.electronAPI.print) {
      return await window.electronAPI.print();
    } else {
      window.print();
    }
  },

  async exportPDF(defaultFileName = 'Kindergarten-Report.pdf', landscape = false) {
    if (this.isElectron && window.electronAPI.exportPDF) {
      App.showToast('កំពុងដំណើរការបង្កើតឯកសារ PDF...', 'info');
      const result = await window.electronAPI.exportPDF({ defaultFileName, landscape });
      if (result.success) {
        App.showToast(`រក្សាទុក PDF បានជោគជ័យ: ${result.filePath}`, 'success');
        return true;
      } else if (result.canceled) {
        return false;
      } else {
        App.showToast(`មិនអាចរក្សាទុក PDF បានទេ: ${result.error}`, 'error');
        return false;
      }
    } else {
      // Fallback for Web Browser: triggers print dialog which allows "Save as PDF"
      App.showToast('សូមជ្រើសរើស "Save as PDF" ក្នុងផ្ទាំងបោះពុម្ព', 'info');
      window.print();
      return true;
    }
  },

  async saveBackupFile(jsonData, defaultFileName = 'chinese-kindergarten-backup.json') {
    if (this.isElectron && window.electronAPI.saveFile) {
      const result = await window.electronAPI.saveFile({
        defaultFileName,
        data: jsonData,
        filters: [{ name: 'JSON Backup (*.json)', extensions: ['json'] }]
      });

      if (result.success) {
        App.showToast('ទិន្នន័យត្រូវបានរក្សាទុកដោយជោគជ័យ!', 'success');
        return true;
      } else if (result.canceled) {
        return false;
      } else {
        App.showToast(`រក្សាទុកមិនបានជោគជ័យ: ${result.error}`, 'error');
        return false;
      }
    } else {
      // Web browser blob download fallback
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      App.showToast('ទាញយកទិន្នន័យបម្រុងទុកបានជោគជ័យ!', 'success');
      return true;
    }
  },

  async openBackupFile() {
    if (this.isElectron && window.electronAPI.openFile) {
      const result = await window.electronAPI.openFile({
        filters: [{ name: 'JSON Backup (*.json)', extensions: ['json'] }]
      });

      if (result.success && result.content) {
        return result.content;
      }
      return null;
    } else {
      // Web browser file input fallback handled in Storage module
      return null;
    }
  }
};
