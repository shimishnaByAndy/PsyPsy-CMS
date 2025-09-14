/// <reference types="vite/client" />

// Tauri global types
interface Window {
  __TAURI__?: {
    convertFileSrc: (src: string) => string;
    invoke: (cmd: string, args?: any) => Promise<any>;
    [key: string]: any;
  };
  __TAURI_PLUGIN_STORE__?: any;
  __TAURI_PLUGIN_WINDOW__?: any;
}

// DevTools position types
type DevtoolsPosition = 'top' | 'right' | 'bottom' | 'left' | 'bottom-right';

// Environment variables
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}