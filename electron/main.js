const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

// Setup live reload for development
if (isDev) {
  try {
    require('electron-reloader')(module, {
      debug: true,
      watchRenderer: true
    });
    console.log('Electron reloader initialized');
  } catch (err) {
    console.error('Error setting up electron-reloader:', err);
  }
}

function createWindow() {
  console.log('Creating Electron window...');
  
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    show: true, // Ensure window shows
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  
  console.log('Window created successfully');

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3001' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  console.log('Loading URL:', startUrl);
  console.log('isDev:', isDev);
  
  mainWindow.loadURL(startUrl)
    .then(() => {
      console.log('URL loaded successfully');
    })
    .catch((error) => {
      console.error('Error loading URL:', error);
    });

  // Open DevTools in development mode
  if (isDev) {
    // Comment out the line below to prevent auto-opening DevTools
    // mainWindow.webContents.openDevTools();
  }

  // Handle window being closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when Electron has finished initialization
app.on('ready', createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, applications keep running until the user quits explicitly
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create a window when the dock icon is clicked and no windows are open
  if (mainWindow === null) {
    createWindow();
  }
});

// Listen for preload loaded notification
ipcMain.on('preload-loaded', () => {
  console.log('Preload script loaded');
});

// Listen for reload requests from renderer
ipcMain.on('app-reload', () => {
  if (mainWindow) {
    console.log('Reloading app...');
    mainWindow.reload();
  }
});

// Add any additional IPC handlers here
// Example:
// ipcMain.on('some-event', (event, arg) => {
//   console.log(arg);
//   event.reply('some-event-reply', 'pong');
// }); 