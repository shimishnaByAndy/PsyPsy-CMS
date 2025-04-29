/**
 * Constants for the Darkone theme
 */

// App name and description
export const APP_NAME = 'PsyPsy CMS';
export const APP_DESCRIPTION = 'Psychology Platform CMS';
export const APP_VERSION = '1.0.0';

// Theme modes
export const THEME_MODE_LIGHT = 'light';
export const THEME_MODE_DARK = 'dark';
export const THEME_MODE_OPTIONS = [THEME_MODE_LIGHT, THEME_MODE_DARK];
export const DEFAULT_THEME_MODE = THEME_MODE_LIGHT;

// Theme skins
export const THEME_SKIN_DEFAULT = 'default';
export const THEME_SKIN_BORDERED = 'bordered';
export const THEME_SKIN_GLASS = 'glass';
export const THEME_SKIN_OPTIONS = [THEME_SKIN_DEFAULT, THEME_SKIN_BORDERED, THEME_SKIN_GLASS];
export const DEFAULT_THEME_SKIN = THEME_SKIN_DEFAULT;

// Theme layouts
export const THEME_LAYOUT_VERTICAL = 'vertical';
export const THEME_LAYOUT_HORIZONTAL = 'horizontal';
export const THEME_LAYOUT_OPTIONS = [THEME_LAYOUT_VERTICAL, THEME_LAYOUT_HORIZONTAL];
export const DEFAULT_THEME_LAYOUT = THEME_LAYOUT_VERTICAL;

// Storage keys
export const STORAGE_KEY_PREFIX = 'psypsy_cms_';
export const THEME_CONFIG_STORAGE_KEY = `${STORAGE_KEY_PREFIX}theme_config`;
export const THEME_LOCALSTORAGE_KEY = 'themeSettings';

// Navigation constants
export const NAV_COLLAPSED_STORAGE_KEY = `${STORAGE_KEY_PREFIX}nav_collapsed`;
export const DEFAULT_NAV_COLLAPSED = false;

export const currency = '$';
export const currentYear = new Date().getFullYear();
export const developedByLink = '';
export const developedBy = '';
export const contactUs = '';
export const buyLink = '';
export const basePath = '';
export const DEFAULT_PAGE_TITLE = '  Darkone - Responsive Admin dashboards Template   ';

// Replace the URL's value in env with your backend's URL or if you're using nextjs's API, add the server's origin URL
export const API_BASE_PATH = '';
export const colorVariants = ['primary', 'secondary', 'success', 'info', 'warning', 'dark', 'purple', 'pink', 'orange', 'light', 'link'];