# PsyPsy CMS - Electron Desktop Application

## Overview

PsyPsy CMS is an Electron-based desktop application built with React and Material-UI, serving as an administrative content management system for a psychology platform. The system connects clients with qualified professionals and provides comprehensive platform management tools.

## Technical Stack

- **Desktop**: Electron 36.0.0 with custom preload scripts
- **Frontend**: React 18, Material-UI v5, Material Dashboard 2 React template
- **Backend**: Parse Server 3.6.0 (hosted on Sashido cloud platform)
- **State Management**: React Context API with Material-UI controller
- **Charts**: Chart.js, ApexCharts, React ApexCharts
- **Internationalization**: i18next with browser language detection
- **Styling**: Material-UI theme system with custom PsyPsy theming

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (React only)
npm start

# Start Electron app in development mode
npm run electron:dev

# Build for production
npm run build
npm run electron:build
```

## Development Ports
- React dev server: `http://localhost:3022`
- Parse Server: `http://localhost:1337/parse` (development)

## Project Structure

```
electron-cms/
├── src/                    # React frontend source
├── electron/               # Electron main process
├── build/                  # Production build output
├── public/                 # Static assets
├── scripts/                # Utility scripts (admin, i18n)
├── assets/                 # Themes, icons, i18n files
├── tests/                  # Application tests
├── docs/                   # Project documentation
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Documentation

See the `/docs` directory for detailed documentation:
- `CLAUDE.md` - Development guidelines for Claude Code
- `DASHBOARD_README.md` - Dashboard implementation details
- `FIREBASE_IMPLEMENTATION.md` - Firebase integration guide
- `THEME_USAGE_GUIDE.md` - Theme system documentation
- And more...

## License

Licensed under ISC License.