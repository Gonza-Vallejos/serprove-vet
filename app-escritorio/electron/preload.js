import { contextBridge, ipcRenderer } from 'electron';

// Exponemos una API segura al frontend React a través de window.desktopAPI
contextBridge.exposeInMainWorld('desktopAPI', {
  isElectron: true,
  printTicket: (htmlContent) => ipcRenderer.invoke('print-ticket', htmlContent),
  openCashDrawer: () => ipcRenderer.invoke('open-cash-drawer'),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version')
});
