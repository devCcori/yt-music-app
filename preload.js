const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
    closeWindow: () => {
        ipcRenderer.send('close-window');
    }
});
