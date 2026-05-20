const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('__ELECTRON__', true);
contextBridge.exposeInMainWorld('electronAPI', {
  openMainWindow: () => ipcRenderer.send('open-main-window'),
  resizeWidget: (width, height) => ipcRenderer.send('resize-widget', width, height),
});
