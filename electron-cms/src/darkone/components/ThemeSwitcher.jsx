import React from "react";
import { useTheme } from "../context/ThemeContext";
import {
  THEME_MODE_OPTIONS,
  THEME_SKIN_OPTIONS,
  THEME_LAYOUT_OPTIONS
} from "../context/constants";

// Simple icons for theme options
const ModeIcons = {
  light: <span role="img" aria-label="Light mode">☀️</span>,
  dark: <span role="img" aria-label="Dark mode">🌙</span>
};

const SkinIcons = {
  default: <span role="img" aria-label="Default skin">🎨</span>,
  bordered: <span role="img" aria-label="Bordered skin">🖼️</span>,
  glass: <span role="img" aria-label="Glass skin">🔍</span>
};

const LayoutIcons = {
  vertical: <span role="img" aria-label="Vertical layout">↕️</span>,
  horizontal: <span role="img" aria-label="Horizontal layout">↔️</span>
};

export const ThemeSwitcher = () => {
  const { skin, mode, layout, setSkin, setMode, setLayout } = useTheme();

  return (
    <div className="theme-switcher">
      <div className="theme-section">
        <h4>Mode</h4>
        <div className="theme-options">
          {THEME_MODE_OPTIONS.map((option) => (
            <button
              key={option}
              className={`theme-button ${mode === option ? "active" : ""}`}
              onClick={() => setMode(option)}
              title={`${option.charAt(0).toUpperCase() + option.slice(1)} Mode`}
            >
              {ModeIcons[option]} {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="theme-section">
        <h4>Skin</h4>
        <div className="theme-options">
          {THEME_SKIN_OPTIONS.map((option) => (
            <button
              key={option}
              className={`theme-button ${skin === option ? "active" : ""}`}
              onClick={() => setSkin(option)}
              title={`${option.charAt(0).toUpperCase() + option.slice(1)} Skin`}
            >
              {SkinIcons[option]} {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="theme-section">
        <h4>Layout</h4>
        <div className="theme-options">
          {THEME_LAYOUT_OPTIONS.map((option) => (
            <button
              key={option}
              className={`theme-button ${layout === option ? "active" : ""}`}
              onClick={() => setLayout(option)}
              title={`${option.charAt(0).toUpperCase() + option.slice(1)} Layout`}
            >
              {LayoutIcons[option]} {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher; 