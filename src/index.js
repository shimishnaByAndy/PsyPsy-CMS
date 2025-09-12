/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css"; // Import Tailwind CSS

// Material Dashboard 2 React Context Provider
import { MaterialUIControllerProvider } from "./context";

// Suppress ResizeObserver loop errors - these are benign and common in React apps
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('ResizeObserver loop completed with undelivered notifications')) {
    return; // Suppress this specific error
  }
  originalError.apply(console, args);
};

// Also handle ResizeObserver errors at the global level
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    event.preventDefault();
    return false;
  }
});

// Handle unhandled promise rejections that might contain ResizeObserver errors
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    event.preventDefault();
    return false;
  }
});

// Debounce ResizeObserver to prevent loop errors
if (typeof window !== 'undefined' && window.ResizeObserver) {
  const OriginalResizeObserver = window.ResizeObserver;
  
  window.ResizeObserver = class extends OriginalResizeObserver {
    constructor(callback) {
      let timeoutId;
      const debouncedCallback = (entries, observer) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          try {
            callback(entries, observer);
          } catch (error) {
            if (!error.message.includes('ResizeObserver loop completed with undelivered notifications')) {
              throw error;
            }
          }
        }, 0);
      };
      super(debouncedCallback);
    }
  };
}

// Use HashRouter instead of BrowserRouter for Electron compatibility
const container = document.getElementById("app") || document.getElementById("root");
const root = createRoot(container);

root.render(
  <HashRouter>
    <MaterialUIControllerProvider>
      <App />
    </MaterialUIControllerProvider>
  </HashRouter>
);
