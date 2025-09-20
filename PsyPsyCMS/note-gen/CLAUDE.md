# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NoteGen is a cross-platform Markdown note-taking application built with Next.js 15, React 19, and Tauri 2. It's designed to bridge recording and writing, organizing fragmented knowledge into readable notes with AI assistance.

## Technology Stack

- **Frontend**: Next.js 15.3.2 with React 19.1.0, TypeScript
- **Desktop Framework**: Tauri 2 with Rust backend
- **State Management**: Zustand for client state
- **Storage**: Tauri Plugin Store for persistence, SQLite via tauri-plugin-sql
- **UI Components**: Radix UI components with Tailwind CSS
- **Package Manager**: pnpm (primary)
- **Build Tool**: Next.js with Turbopack
- **Internationalization**: next-intl

## Development Commands

```bash
# Frontend development
pnpm dev                    # Start Next.js dev server on port 3456 with Turbopack
pnpm build                  # Build Next.js app for production
pnpm start                  # Start production server
pnpm lint                   # Run ESLint

# Tauri development
pnpm tauri dev             # Start Tauri development mode
pnpm tauri build           # Build desktop application
pnpm tauri --help          # See all Tauri commands

# Documentation
pnpm docs:build            # Build documentation (in ./docs directory)
```

## Local Development Setup

### Prerequisites
- **Node.js** 16+ and **pnpm** package manager
- **Rust** toolchain (latest stable)
- **Tauri CLI** v2.8+ (`cargo install tauri-cli`)

### Quick Setup
```bash
# 1. Clone the repository
git clone https://github.com/codexu/note-gen.git
cd note-gen

# 2. Install dependencies
pnpm install

# 3. Start development
pnpm tauri dev              # Full Tauri desktop app development
# OR
pnpm dev                    # Next.js web development only (port 3456)
```

### Build Scripts Approval
After first `pnpm install`, you may need to approve build scripts for native dependencies:
- Select packages: `@parcel/watcher`, `sharp`, `tesseract.js`, `unrs-resolver`
- These are required for file watching, image processing, and OCR functionality

### Database Initialization
NoteGen automatically initializes SQLite databases on first launch:
- **Core databases**: `chats`, `marks`, `notes`, `tags`, `vector_documents`
- **Location**: Local SQLite files managed by Tauri
- **Migration**: Handled by `initAllDatabases()` function in `src/db/index.ts`

### AI Provider Configuration
Configure AI models through the application settings (accessible via UI):

1. **Navigate to Settings** → AI Configuration
2. **Add AI Providers**: Configure baseURL, apiKey, and model parameters
3. **Supported Providers**: OpenAI, Anthropic, Gemini, Ollama, LM Studio, DeepSeek, Grok
4. **Model Types**: Assign specialized models for different tasks:
   - `primaryModel`: Chat/generation
   - `embeddingModel`: Vector search (required for RAG)
   - `rerankingModel`: Search optimization
   - `markDescModel`: OCR descriptions
   - `placeholderModel`: Chat suggestions
   - `translateModel`: Language translation

**Example Configuration**:
```json
{
  "title": "GPT-4",
  "baseURL": "https://api.openai.com/v1",
  "apiKey": "your-api-key",
  "model": "gpt-4",
  "temperature": 0.7,
  "topP": 1.0,
  "modelType": "chat"
}
```

### First Run Checklist
- [ ] Application launches successfully with Tauri desktop window
- [ ] Database tables created automatically
- [ ] AI configuration accessible via settings page
- [ ] RAG system available (requires embedding model configuration)

## Architecture Overview

### Frontend Structure (Next.js App Router)

```
src/
├── app/                   # Next.js 13+ App Router
│   ├── core/             # Main application features
│   │   ├── article/      # Article/writing functionality
│   │   ├── image/        # Image management
│   │   ├── record/       # Recording functionality
│   │   ├── search/       # Search features
│   │   └── setting/      # Application settings
│   ├── mobile/           # Mobile-specific layouts/pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # Reusable React components
│   ├── ui/              # Shadcn/ui base components
│   └── [feature-components]
├── stores/              # Zustand state management
├── lib/                 # Utility libraries
├── hooks/               # Custom React hooks
├── db/                  # Database schemas/types
├── config/              # Configuration files
└── i18n/               # Internationalization
```

### Backend Structure (Tauri/Rust)

```
src-tauri/src/
├── main.rs              # Application entry point
├── lib.rs               # Library exports
├── app_setup.rs         # App initialization
├── backup.rs            # Backup functionality
├── fuzzy_search.rs      # Search implementation
├── keywords.rs          # Keyword extraction
├── screenshot.rs        # Screenshot capture
├── tray.rs              # System tray
├── webdav.rs            # WebDAV sync
└── window.rs            # Window management
```

## Key Features & Architecture Patterns

### Dual-Mode Application Architecture
- **Recording Mode**: AI chatbot-like interface for capturing fragmented information with mark system and tag management
- **Writing Mode**: Full Markdown editor with file management, AI toolbar extensions, and document synchronization

### State Management Pattern
- Zustand stores for each major feature domain (article, chat, mark, setting, etc.)
- Persistent storage via Tauri Plugin Store (`store.json`)
- SQLite database for structured data via tauri-plugin-sql
- Vector database for document embeddings (`vector_documents` table)

### AI Integration Architecture
NoteGen implements a sophisticated multi-model AI system with specialized models for different tasks:

#### Specialized AI Models (via `useSettingStore`)
- **`primaryModel`**: General chat conversations and text generation
- **`embeddingModel`**: Text vectorization for RAG system (required for vector DB)
- **`rerankingModel`**: Optimizes search results in RAG system
- **`markDescModel`**: Generates descriptions for OCR-recognized text/images
- **`placeholderModel`**: AI suggestion prompts in chat interface
- **`translateModel`**: Language translation tasks

#### AI Service Layer Patterns
- Unified interface via `createOpenAIClient` in `lib/ai.ts`
- OpenAI-compatible API support for multiple providers (ChatGPT, Gemini, Ollama, DeepSeek)
- Automatic model selection based on task context
- Error handling with user-friendly toast messages via `handleAIError`

#### RAG (Retrieval Augmented Generation) System
- **Vector Database**: SQLite-based storage for document embeddings
- **Document Processing**: Automatic chunking and embedding of Markdown files
- **Similarity Search**: Vector similarity matching for context retrieval
- **Re-ranking**: Enhanced results via reranking model
- **Context Injection**: Relevant content prepended to AI queries

**RAG Workflow**: Document → Chunk → Embed → Store → Query → Search → Re-rank → Inject Context → Generate Response

### Sync & Storage
- Local Markdown files as primary storage format
- Git-based sync (GitHub, GitLab, Gitee)
- WebDAV synchronization support
- Real-time local autosave with 10-second delay

### Cross-Platform Considerations
- Tauri 2 configuration for desktop (Windows, macOS, Linux)
- Mobile support planned (Android/iOS)
- Platform-specific dependencies in Cargo.toml

## Development Guidelines

### Path Resolution
- Use `@/*` path aliases defined in tsconfig.json
- All imports from `src/` should use the `@/` prefix

### Component Organization
- UI components in `components/ui/` (Radix-based, don't modify directly)
- Feature-specific components in `components/`
- Page components in `app/` following App Router conventions

### State Management
- Each major feature has its own Zustand store in `stores/`
- Store naming follows feature domain (article.ts, chat.ts, setting.ts)
- Persistent state automatically synced via Tauri Plugin Store

### Tauri Commands & Plugin Architecture
- Custom Tauri commands registered in `src-tauri/src/main.rs`
- Key commands: `screenshot`, `webdav_test`, `webdav_backup`, `webdav_sync`
- Plugin capabilities defined in `src-tauri/capabilities/default.json`
- Frontend calls via `@tauri-apps/api` invoke functions
- Command implementations in various `.rs` files based on functionality

### AI Development Patterns

#### Working with AI Models
```typescript
// Always check model availability before operations
const embeddingAvailable = useVectorStore().checkEmbeddingModelAvailable();
const rerankAvailable = useVectorStore().checkRerankModelAvailable();

// Use specialized models for specific tasks
const primaryModel = useSettingStore().primaryModel;    // Chat/generation
const embeddingModel = useSettingStore().embeddingModel; // Vectorization
const rerankingModel = useSettingStore().rerankingModel; // Search optimization
```

#### AI Provider Configuration
- All AI configurations stored in `aiModelList` within `store.json`
- Each provider needs: `key`, `title`, `baseURL`, `apiKey`, `model`
- Model parameters: `temperature` (0.0-2.0), `topP` (0.0-1.0), `modelType` (chat/embedding/rerank)

#### RAG System Development
```typescript
// Enable RAG workflow
const { isRagEnabled, processAllDocuments } = useVectorStore();

// Process documents for vector storage
await processAllDocuments(); // Processes all markdown files

// Query with RAG context (in chat-input.tsx pattern)
if (isRagEnabled) {
  const context = await getContextForQuery(userQuery);
  const enhancedQuery = `${context}\n\nUser Query: ${userQuery}`;
}
```

#### Vector Database Operations
- Vector documents stored in SQLite with `filename`, `chunk_id`, `content`, `embedding`, `updated_at`
- Initialize with `initVectorDb()`
- Index on `filename` for efficient lookups
- Embeddings stored as JSON strings

### AI & ML Features
- AI configuration in `lib/ai.ts` with provider abstractions
- RAG implementation supports embedding and reranking models
- Keyword extraction via `jieba-rs` (Chinese text processing)
- OCR integration via Tesseract.js for image text recognition

### Internationalization
- Uses `next-intl` for i18n support
- Locale files in `src/i18n/`
- Currently supports English and Chinese

## Important Configuration Files

- `next.config.ts`: Next.js configuration with Tauri integration
- `src-tauri/tauri.conf.json`: Tauri application configuration
- `src-tauri/Cargo.toml`: Rust dependencies and platform-specific features
- `components.json`: Shadcn/ui component configuration
- `tailwind.config.ts`: Tailwind CSS configuration with custom extensions

## Testing & Quality

- ESLint configured with Next.js and TypeScript rules
- React hooks exhaustive-deps rule disabled (common in Tauri apps)
- Strict TypeScript configuration enabled
- No explicit test setup found - consider adding Vitest or Jest

## Build & Deployment

### GitHub Actions CI/CD
- Automated builds via `.github/workflows/release.yml`
- Matrix builds for macOS, Ubuntu, and Windows
- Ubuntu builds require specific system dependencies
- Release distribution via GitHub Releases and UpgradeLink service

### Release Management
- Uses `tauri-action` for creating releases and updater artifacts
- Signing handled by `TAURI_SIGNING_PRIVATE_KEY` environment variable
- Updater configuration in `src-tauri/tauri.conf.json`
- Version management through `package.json` and `src-tauri/Cargo.toml`

### Contribution Guidelines
- Create issues for bugs or feature requests first
- Submit Pull Requests to `dev` branch
- PR titles must follow format: `fix(#xxx): ***` or `feat(#xxx): ***`
- Reference issue numbers in PR titles

## Platform-Specific Notes

### Desktop Features (via Tauri plugins)
- Global shortcuts and system tray
- File system access and dialog management
- Screenshot capture (xcap library)
- Window state management and auto-updater

### Mobile Considerations
- App configured for future iOS/Android support
- Some Tauri plugins are desktop-only (conditional compilation)
- OpenSSL vendored for Android builds

## Sync & Backup Systems

The app implements multiple synchronization strategies:
- **Git-based**: Direct integration with GitHub, GitLab, and Gitee APIs
- **WebDAV**: Standard WebDAV protocol support
- **Local backup**: Built-in backup system for data protection

All sync implementations are in corresponding `lib/` files (github.ts, gitlab.ts, webdav.rs).