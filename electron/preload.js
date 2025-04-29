const { ipcRenderer, contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    send: (channel, data) => {
      // whitelist channels
      let validChannels = ['toMain', 'app-reload'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      let validChannels = ['fromMain', 'reload'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Reload function for renderer
    reload: () => {
      ipcRenderer.send('app-reload');
    },
    // Add any other methods you need to expose to the renderer
  }
);

// Create a global variable to indicate we're in Electron
window.isElectron = true;

// Notify main process that preload script has loaded
ipcRenderer.send('preload-loaded'); 