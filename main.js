const { app, BrowserWindow, shell, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const express = require('express');

// --- Configuración del Servidor ---
const apiApp = express();
const PORT = 9863;
let win;

// --- ESTADO GLOBAL (Aquí guardamos la info) ---
// Usamos un objeto 'state' para que coincida con el resto del código
const state = {
    track: {
        title: 'Esperando...',
        author: 'Iniciando...',
        isPaused: true
    }
};

// --- API PARA OH MY POSH ---
apiApp.get('/query', (req, res) => {
    // 1. Obtenemos el estado (asumiendo que 'state' está definido globalmente y actualizado)
    const safeState = (typeof state !== 'undefined') ? state : { 
        track: { title: 'Desconocido', author: 'Desconocido', isPaused: true } 
    };

    let displayString = '';

    // 2. CORRECCIÓN CLAVE: 
    // Ahora, SIEMPRE enviamos el título si hay una canción, sin importar si está pausada.
    if (safeState.track.title && safeState.track.title !== 'Desconocido') {
        // Nota: Solo enviamos el título y el autor, OMP pondrá el icono.
        displayString = `${safeState.track.title} - ${safeState.track.author}`;
    }

    // 3. Enviamos un JSON SIMPLE con el string generado
    const responseData = {
        display: displayString,
        isPaused: safeState.track.isPaused
    };

    // Forzamos el header para que OMP lo lea como JSON
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(responseData));
});

// Manejo de errores de puerto (por si se queda colgado)
const server = apiApp.listen(PORT, '127.0.0.1', () => {
    console.log(`\n🚀 SERVIDOR LISTO: http://127.0.0.1:${PORT}/query\n`);
});
server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`❌ PUERTO ${PORT} OCUPADO. Ejecuta: killall -9 electron`);
        process.exit(1);
    }
});

// --- VENTANA DE ELECTRON ---
function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "YouTube Music",
        backgroundColor: '#000000',
        autoHideMenuBar: false,
        frame: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadURL('https://music.youtube.com');

    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https://music.youtube.com')) return { action: 'allow' };
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Atajos
    const sendKey = (code) => { if (win && !win.isDestroyed()) win.webContents.executeJavaScript(code).catch(() => {}); };
    globalShortcut.register('MediaPlayPause', () => sendKey(`document.querySelector('#play-pause-button')?.click()`));
    globalShortcut.register('MediaNextTrack', () => sendKey(`document.querySelector('.next-button')?.click()`));
    globalShortcut.register('MediaPreviousTrack', () => sendKey(`document.querySelector('.previous-button')?.click()`));
    globalShortcut.register('Ctrl+Shift+Q', () => { if(win) win.close(); });

    // Barra de título personalizada
    win.webContents.on('did-finish-load', () => {
        win.webContents.insertCSS(`body { margin-top: 30px; }`).catch(() => {});
        const titleBarHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; background-color: #333; color: white; padding: 0 10px; height: 30px; -webkit-app-region: drag; font-family: sans-serif; font-size: 12px;">
                <span>YouTube Music</span>
                <button id="closeButton" style="background-color: transparent; border: none; color: white; cursor: pointer; -webkit-app-region: no-drag;">✕</button>
            </div>
        `;
        win.webContents.executeJavaScript(`
            if (!document.getElementById('custom-title-bar')) {
                const d = document.createElement('div');
                d.id = 'custom-title-bar';
                d.innerHTML = \`${titleBarHTML}\`;
                document.body.prepend(d);
                document.getElementById('closeButton').onclick = () => window.myAPI.closeWindow();
            }
        `).catch(() => {});
    });
}

// --- ACTUALIZADOR DE DATOS ---
setInterval(async () => {
    if (!win || win.isDestroyed() || win.webContents.isLoading()) return;

    try {
        const data = await win.webContents.executeJavaScript(`
            (function() {
                try {
                    const video = document.querySelector('video');
                    const isPaused = video ? video.paused : true;

                    // Prioridad: MediaSession API
                    if (navigator.mediaSession && navigator.mediaSession.metadata) {
                        return {
                            title: navigator.mediaSession.metadata.title,
                            author: navigator.mediaSession.metadata.artist,
                            isPaused: isPaused
                        };
                    }
                    
                    // Fallback: HTML Scraping
                    const titleEl = document.querySelector('.title.ytmusic-player-bar');
                    const artistEl = document.querySelector('.byline.ytmusic-player-bar');
                    return {
                        title: titleEl ? titleEl.innerText : 'Desconocido',
                        author: artistEl ? artistEl.innerText : '',
                        isPaused: isPaused
                    };
                } catch(e) { return null; }
            })();
        `);

        if (data) {
            let cleanAuthor = data.author || '';
            if (cleanAuthor.includes('•')) cleanAuthor = cleanAuthor.split('•')[0].trim();
            if (cleanAuthor.includes('\n')) cleanAuthor = cleanAuthor.split('\n')[0].trim();

            // ACTUALIZAMOS LA VARIABLE GLOBAL 'state'
            state.track.title = data.title || 'Desconocido';
            state.track.author = cleanAuthor || 'Desconocido';
            state.track.isPaused = data.isPaused;
            
            // Console log opcional para depurar
            // console.log(`🎵 ${state.track.title}`); 
        }
    } catch (e) {}
}, 1000);

ipcMain.on('close-window', () => { if(win) win.close(); });

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('will-quit', () => globalShortcut.unregisterAll());
