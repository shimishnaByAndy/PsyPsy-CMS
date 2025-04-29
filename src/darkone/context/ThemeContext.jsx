import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  DEFAULT_THEME_LAYOUT,
  DEFAULT_THEME_MODE,
  DEFAULT_THEME_SKIN,
  THEME_LOCALSTORAGE_KEY,
} from './constants';

// Create the theme context
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Initialize state with default values or stored preferences
  const [mode, setMode] = useState(DEFAULT_THEME_MODE);
  const [skin, setSkin] = useState(DEFAULT_THEME_SKIN);
  const [layout, setLayout] = useState(DEFAULT_THEME_LAYOUT);

  // Load theme settings from localStorage on component mount
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_LOCALSTORAGE_KEY);
    if (storedTheme) {
      try {
        const { mode: storedMode, skin: storedSkin, layout: storedLayout } = JSON.parse(storedTheme);
        if (storedMode) setMode(storedMode);
        if (storedSkin) setSkin(storedSkin);
        if (storedLayout) setLayout(storedLayout);
      } catch (error) {
        console.error('Failed to parse theme settings:', error);
      }
    }
  }, []);

  // Save theme settings to localStorage whenever they change
  useEffect(() => {
    const themeSettings = { mode, skin, layout };
    localStorage.setItem(THEME_LOCALSTORAGE_KEY, JSON.stringify(themeSettings));
    
    // Apply theme classes to the body element
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(`${mode}-mode`);
    
    document.body.classList.remove('default-skin', 'bordered-skin', 'glass-skin');
    document.body.classList.add(`${skin}-skin`);
    
    document.body.classList.remove('vertical-layout', 'horizontal-layout');
    document.body.classList.add(`${layout}-layout`);
  }, [mode, skin, layout]);

  // Theme setter functions
  const setThemeMode = (newMode) => setMode(newMode);
  const setThemeSkin = (newSkin) => setSkin(newSkin);
  const setThemeLayout = (newLayout) => setLayout(newLayout);

  // Context value
  const value = {
    mode,
    skin,
    layout,
    setThemeMode,
    setThemeSkin,
    setThemeLayout,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeContext; 