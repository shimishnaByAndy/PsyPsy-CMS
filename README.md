# PsyPsy CMS Workspace

This workspace contains multiple projects for the PsyPsy psychology platform, including desktop applications, server components, and development tools.

## Projects

### 📱 electron-cms/
Electron-based desktop CMS application built with React and Material-UI.
- **Tech Stack**: Electron 36.0.0, React 18, Material-UI v5, Parse Server
- **Purpose**: Administrative dashboard for psychology platform
- **Port**: 3022 (development)

### 🔧 PsyPsyCMS/
Modern Tauri application representing the next-generation desktop client.
- **Tech Stack**: Tauri 2.0, React, TypeScript, Vite, Radix UI, TanStack Query
- **Purpose**: Modern desktop application with enhanced UI/UX
- **Status**: Active development

### 💎 crystal/
Claude Code multi-session management tool for development workflow optimization.
- **Tech Stack**: Electron, pnpm workspaces
- **Purpose**: Development productivity and Claude Code session management
- **Version**: 0.2.3

### 🔌 mcps/
Model Context Protocol (MCP) servers and tools collection.
- **Purpose**: AI-powered development assistance and automation
- **Components**: React analyzer, task management, and development tools

## Quick Start

### Electron CMS
```bash
cd electron-cms
npm install
npm run electron:dev
```

### Tauri Application (PsyPsyCMS)
```bash
cd PsyPsyCMS
npm install
npm run tauri:dev
```

### Crystal (Claude Code Manager)
```bash
cd crystal
pnpm install
pnpm dev
```

## Credits

This project is based on [Material Dashboard React](https://github.com/creativetimofficial/material-dashboard-react) by Creative Tim.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 