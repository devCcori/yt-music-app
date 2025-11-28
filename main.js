const { app, BrowserWindow, shell, globalShortcut } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "YouTube Music",
        backgroundColor: '#000000',
        autoHideMenuBar: true, // Importante en Linux para quitar la barra superior gris
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    win.loadURL('https://music.youtube.com');

    // Manejo de enlaces externos (para que no se abran dentro de la app)
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https://music.youtube.com')) {
            return { action: 'allow' };
        }
        shell.openExternal(url);
        return { action: 'deny' };
    });
    
    // Atajos de teclado multimedia (Play/Pause, Next, Prev)
    globalShortcut.register('MediaPlayPause', () => {
        win.webContents.executeJavaScript(`
            var btn = document.querySelector('#play-pause-button');
            if (btn) btn.click();
        `);
    });
    
    globalShortcut.register('MediaNextTrack', () => {
        win.webContents.executeJavaScript(`
            var btn = document.querySelector('.next-button');
            if (btn) btn.click();
        `);
    });

    globalShortcut.register('MediaPreviousTrack', () => {
        win.webContents.executeJavaScript(`
            var btn = document.querySelector('.previous-button');
            if (btn) btn.click();
        `);
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
