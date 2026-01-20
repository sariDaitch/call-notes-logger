const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("api", {
  log: (level, message) => ipcRenderer.invoke("log", level, message),
  notes: {
    save: (text) => ipcRenderer.invoke("notes:save", text),
    load: () => ipcRenderer.invoke("notes:load"),
  },
});
