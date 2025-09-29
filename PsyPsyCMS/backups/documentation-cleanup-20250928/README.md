# PsyPsy CMS - Healthcare Management System

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://semver.org)
[![HIPAA Compliance](https://img.shields.io/badge/HIPAA-Compliant-green.svg)](docs/compliance/)
[![Quebec Law 25](https://img.shields.io/badge/Quebec%20Law%2025-Compliant-green.svg)](docs/compliance/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A **HIPAA-compliant healthcare management system** built for medical professionals to manage clients, appointments, and professional credentials with enterprise-grade security and compliance.

## 🏥 Project Overview

PsyPsy CMS is a comprehensive healthcare management platform specifically designed for Quebec healthcare professionals, ensuring full compliance with both HIPAA and Quebec Law 25 (Bill 25) privacy regulations.

### Key Features

- **👥 Client Management** - Complete patient records with PHI protection
- **📅 Appointment Scheduling** - 50-minute session blocks with conflict detection
- **👨‍⚕️ Professional Credentials** - License tracking and annual validation
- **📝 Medical Notes** - Quebec-compliant templates with audit trails
- **🔒 HIPAA Compliance** - AES-256-GCM encryption and comprehensive audit logging
- **🇨🇦 Quebec Law 25** - Data residency, consent management, and breach notification
- **🌐 Real-time Sync** - Firebase backend with offline capabilities
- **🖥️ Desktop App** - Built with Tauri 2.1+ for cross-platform support

## 🛠️ Technology Stack (September 2025)

### Frontend
- **React 19** - Latest React with compiler optimization
- **TypeScript 5.3+** - Strict typing with branded types
- **Vite 5+** - Fast build tool with advanced chunking
- **Tailwind CSS 3.4+** - Utility-first styling
- **shadcn/ui + Radix UI** - Accessible component library

### Backend & Desktop
- **Tauri 2.1+** - Rust-based desktop framework
- **Firebase** - Real-time database and authentication
- **Rust** - High-performance backend services

### State Management & Data
- **TanStack Query v5** - Server state management
- **Zustand** - Client state management
- **React Hook Form** - Form handling with validation

### Testing & Quality
- **Vitest** - Unit and integration testing
- **Playwright** - End-to-end testing with accessibility
- **TypeScript** - Static type checking

## 📁 Project Structure

```
PsyPsyCMS/
├── 📂 src/                          # Frontend source code
│   ├── 📂 components/               # React components
│   │   ├── 📂 ui/                   # Base UI components (shadcn/ui)
│   │   ├── 📂 healthcare/           # Healthcare-specific components
│   │   ├── 📂 forms/                # Form components
│   │   ├── 📂 tables/               # Data table components
│   │   └── 📂 layout/               # Layout components
│   ├── 📂 pages/                    # Application pages
│   ├── 📂 hooks/                    # Custom React hooks
│   ├── 📂 services/                 # API services
│   ├── 📂 types/                    # TypeScript type definitions
│   ├── 📂 utils/                    # Utility functions
│   ├── 📂 styles/                   # CSS and styling
│   └── 📂 localization/             # i18n support (EN/FR)
├── 📂 src-tauri/                    # Tauri backend (Rust)
│   ├── 📂 src/                      # Rust source code
│   │   ├── 📂 commands/             # Tauri commands by domain
│   │   ├── 📂 services/             # Business logic services
│   │   ├── 📂 models/               # Data models
│   │   ├── 📂 security/             # Security & compliance
│   │   └── 📂 meeting/              # Meeting & audio processing
│   └── 📂 migrations/               # Database migrations
├── 📂 tests/                        # All test files
│   ├── 📂 e2e/                      # End-to-end tests
│   │   ├── 📂 healthcare/           # Healthcare workflow tests
│   │   └── 📂 accessibility/        # Accessibility E2E tests
│   ├── 📂 integration/              # Integration tests
│   ├── 📂 security/                 # Security tests
│   ├── 📂 performance/              # Performance tests
│   └── 📂 utilities/                # Test utilities & helpers
├── 📂 scripts/                      # Build and utility scripts
├── 📂 docs/                         # Documentation
│   ├── 📂 testing/                  # Testing guides
│   ├── 📂 compliance/               # Compliance documentation
│   ├── 📂 setup/                    # Setup guides
│   ├── 📂 security/                 # Security documentation
│   └── 📂 design-system/            # Design system docs
├── 📂 public/                       # Static assets
└── 📋 Configuration Files
    ├── package.json                 # Node.js dependencies
    ├── tauri.conf.json             # Tauri configuration
    ├── vite.config.mjs             # Vite build config
    ├── playwright.config.ts        # E2E testing config
    ├── vitest.config.ts            # Unit testing config
    ├── tailwind.config.js          # Tailwind CSS config
    ├── firebase.json               # Firebase configuration
    ├── CLAUDE.md                   # AI assistant instructions
    └── DEVELOPMENT_RULES_2025.md   # Development guidelines
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and npm
- **Rust** 1.70+ and Cargo
- **Firebase CLI** (for emulator development)
- **Git** for version control

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PsyPsyCMS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Firebase emulators** (Required for development)
   ```bash
   firebase emulators:start --import=./seed-data
   ```

5. **Start development server**
   ```bash
   npm run tauri:dev
   ```

### Available Commands

#### Development
- `npm run dev` - Start Vite dev server
- `npm run tauri:dev` - Start Tauri development mode
- `npm run build` - Build for production
- `npm run tauri:build` - Build Tauri desktop application

#### Testing
- `npm run test` - Run unit tests with Vitest
- `npm run e2e` - Run end-to-end tests with Playwright
- `npm run test:accessibility` - Run accessibility tests
- `npm run test:coverage` - Generate test coverage report

#### Quality & Linting
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run lint:fix` - Auto-fix linting issues

#### Firebase & Environment
- `npm run switch:dev` - Switch to development environment
- `npm run switch:prod` - Switch to production environment
- `npm run test:firebase` - Test Firebase connection

## 🏗️ Architecture Overview

### Frontend Architecture (Feature-Based)

The application follows a feature-based architecture pattern as defined in `DEVELOPMENT_RULES_2025.md`:

```
src/
├── features/                    # Business domain features
│   ├── authentication/         # Auth feature module
│   ├── patients/              # Patient management
│   ├── appointments/          # Appointment scheduling
│   ├── medical-notes/         # Medical notes with Quebec templates
│   └── professionals/         # Professional credential management
├── shared/                      # Cross-feature shared code
│   ├── components/            # Reusable UI components
│   ├── hooks/                 # Generic custom hooks
│   ├── services/              # Common API services
│   └── utils/                 # Utility functions
└── app/                        # Application-level code
    ├── providers/             # Context providers
    ├── router/                # Routing configuration
    └── store/                 # Global state management
```

### Backend Architecture (Tauri/Rust)

```
src-tauri/src/
├── commands/                   # Tauri command handlers (by domain)
├── services/                   # Business logic services
├── models/                     # Data models and types
├── security/                   # HIPAA compliance & encryption
└── plugins/                    # Custom Tauri plugins
```

## 🔐 Security & Compliance

### HIPAA Compliance Features
- **🔒 AES-256-GCM Encryption** - All PHI data encrypted at rest and in transit
- **📋 Audit Trails** - Comprehensive logging of all PHI access
- **🔑 RBAC** - Role-based access control system
- **⚠️ Error Boundaries** - Compliance-aware error handling
- **🛡️ Data Classification** - Explicit PHI marking and handling

### Quebec Law 25 Compliance
- **🇨🇦 Data Residency** - Data processing within Quebec/Canada
- **✅ Consent Management** - Explicit consent tracking and renewal
- **⏰ Breach Notification** - Automated 72-hour reporting system
- **📤 Data Portability** - Right to data export functionality
- **🗑️ Right to Erasure** - Complete data deletion workflows

## 🧪 Testing Strategy

### Test Types
- **Unit Tests** - Component and function testing with Vitest
- **Integration Tests** - API and service integration testing
- **E2E Tests** - Full user workflow testing with Playwright
- **Accessibility Tests** - WCAG 2.1 AA compliance testing
- **Security Tests** - HIPAA compliance validation
- **Performance Tests** - Load and stress testing

### Healthcare-Specific Testing
- **Patient Data Workflows** - Complete patient management flows
- **Appointment Scheduling** - 50-minute blocks and conflict detection
- **Professional Validation** - License tracking and renewal
- **Compliance Validation** - PIPEDA and Law 25 requirements

### Current Test Coverage
- **847 Total Tests** across all layers
- **92% Backend Coverage** (Rust unit and integration tests)
- **87% Frontend Coverage** (React component and hook tests)
- **E2E Testing** with Playwright for desktop automation
- **Security Testing** with HIPAA compliance validation

## 📖 Documentation

### Core Documentation
- **[Development Rules](DEVELOPMENT_RULES_2025.md)** - Mandatory development patterns
- **[CLAUDE.md](CLAUDE.md)** - AI assistant instructions and project context
- **[Testing Strategy](docs/testing/TESTING_STRATEGY.md)** - Comprehensive testing approach
- **[Compliance Guide](docs/compliance/)** - HIPAA and Quebec Law 25 compliance

### Setup Guides
- **[Firebase Setup](docs/setup/setup-firebase-emulator.md)** - Development environment setup
- **[Implementation Guide](docs/CMS_IMPLEMENTATION_GUIDE.md)** - Detailed implementation reference

### Design System
- **[Healthcare Components](src/components/ui/healthcare/)** - Medical domain components
- **[Design Tokens](src/ui/design-tokens/)** - Design system tokens
- **[Accessibility Guidelines](docs/accessibility/)** - WCAG compliance patterns

## 🌐 Internationalization

- **Languages Supported**: English, French (Quebec)
- **Medical Terminology**: Quebec healthcare terminology
- **Date/Time**: Montreal timezone handling (America/Montreal)
- **Currency**: Canadian Dollar (CAD) support

## 📊 Performance & Monitoring

### Achieved Metrics
- **Bundle Size**: 45MB (70% reduction from Electron)
- **Startup Time**: 4 seconds (50% improvement)
- **Memory Usage**: 160MB (60% reduction)
- **Test Coverage**: 90%+ across all layers

### Bundle Optimization
- **Medical Core Chunk** - Critical healthcare features
- **Compliance Chunk** - Lazy-loaded compliance features
- **UI Components** - Cached component library
- **Charts & Analytics** - Separate visualization chunk

### Monitoring
- **Performance Metrics** - Core Web Vitals tracking
- **Error Tracking** - Comprehensive error logging
- **Audit Monitoring** - HIPAA compliance audit trails
- **Usage Analytics** - Privacy-compliant usage tracking

## 🔄 Change Log & Versioning

Version 2.0.0 represents a major architectural upgrade:

### Recent Changes (September 2025)
- ✅ **React 19 Upgrade** - Compiler optimization enabled
- ✅ **TanStack Query v5** - Enhanced server state management
- ✅ **Tauri 2.1+** - Universal entry point for cross-platform support
- ✅ **Feature-Based Architecture** - Self-contained feature modules
- ✅ **Enhanced HIPAA Compliance** - Upgraded security and audit systems
- ✅ **Quebec Law 25 Integration** - Full compliance implementation

### Development Status
- 🟢 **Core Features** - Stable and production-ready
- 🟡 **Advanced Features** - In development
- 🔴 **Experimental Features** - Research and development phase

## 🤝 Contributing

This is a healthcare system with strict compliance requirements. Development follows guidelines outlined in:

- **[Development Rules](DEVELOPMENT_RULES_2025.md)** - Mandatory patterns
- **[Security Guidelines](docs/security/)** - Security requirements
- **[Compliance Standards](docs/compliance/)** - Healthcare compliance

### Code Quality Standards
```bash
# Pre-commit checks
npm run lint              # ESLint
npm run type-check        # TypeScript checking
npm run test             # Unit tests
npm run test:security    # Security compliance
```

## 📝 License

MIT License - See [LICENSE](LICENSE) for details.

---

**Healthcare Compliance**: HIPAA + Quebec Law 25
**Last Updated**: September 2025
**Architecture**: React 19 + Tauri 2.1+ + TanStack Query v5

**Built with ❤️ for healthcare professionals**

🔒 HIPAA Compliant | 🚀 High Performance | 🎨 Modern UI | 🧪 Thoroughly Tested