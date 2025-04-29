/**
 * Development utilities for the application
 */

/**
 * Checks if the app is running in Electron
 * @returns {boolean} True if running in Electron
 */
export const isElectron = () => {
  return window.isElectron || 
    (navigator.userAgent.toLowerCase().indexOf(' electron/') > -1);
};

/**
 * Reloads the Electron window
 */
export const reloadElectron = () => {
  if (isElectron() && window.electron) {
    window.electron.reload();
  }
};

/**
 * Initializes dev tools for the app
 */
export const initDevTools = () => {
  // Add keyboard shortcut for reload: Ctrl+R or Cmd+R
  if (isElectron()) {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        reloadElectron();
      }
    });
    
    console.log('Development tools initialized in Electron environment');
  }
};

export default {
  isElectron,
  reloadElectron,
  initDevTools,
}; 