# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Meetily is a privacy-first AI meeting assistant that captures, transcribes, and summarizes meetings entirely on local infrastructure. It consists of a Tauri-based desktop frontend built with Next.js and a Python FastAPI backend with local Whisper transcription capabilities.

## Architecture

### High-Level Components

- **Frontend**: Next.js 14 + Tauri 2.x desktop application (in `frontend/`)
- **Backend**: Python FastAPI server for meeting management and AI processing (in `backend/app/`)
- **Transcription**: Local Whisper.cpp server for speech-to-text
- **Storage**: SQLite database + ChromaDB for vector search
- **AI Integration**: Support for local (Ollama) and cloud providers (Claude, Groq, OpenAI)

### Key Directories

```
meeting-minutes/
├── frontend/                 # Tauri + Next.js desktop app
│   ├── src/                 # Next.js frontend code
│   ├── src-tauri/           # Rust backend for native features
│   └── package.json         # Frontend dependencies
├── backend/                 # Python FastAPI server
│   ├── app/                # Main application code
│   │   ├── main.py         # FastAPI app entry point
│   │   ├── db.py          # Database management
│   │   └── transcript_processor.py  # AI processing logic
│   └── requirements.txt    # Python dependencies
└── docs/                   # Architecture documentation
```

## Development Commands

### Frontend Development
```bash
# Navigate to frontend directory first
cd frontend

# Install dependencies
pnpm install

# Development mode (with Tauri)
pnpm run tauri:dev
# or use the shell script (macOS/Linux)
./clean_run.sh

# Build for production
pnpm run tauri:build
# or use the shell script (macOS/Linux)
./clean_build.sh

# Frontend only (Next.js dev server)
pnpm run dev

# Type checking
pnpm run lint
```

### Backend Development
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI development server
python app/main.py
# Server runs on http://localhost:5167

# Alternative: Start with output logging
./start_with_output.ps1  # Windows
./clean_start_backend.sh # macOS/Linux
```

### Whisper Transcription Server
```bash
# Build Whisper server (one-time setup)
cd backend
./build_whisper.sh        # macOS/Linux
./build_whisper.cmd       # Windows

# Start Whisper server manually
cd whisper-server-package
./run-server.sh           # Server runs on http://localhost:8178
```

### Docker Setup (Alternative)
```bash
cd backend

# Build containers
./build-docker.sh cpu     # Linux/macOS
./build-docker.ps1 cpu    # Windows

# Run with interactive setup
./run-docker.sh start --interactive    # Linux/macOS
./run-docker.ps1 start -Interactive    # Windows
```

### Testing and Quality Assurance
```bash
# Frontend linting
cd frontend
pnpm run lint               # ESLint for JavaScript/TypeScript

# Run tests (when available)
pnpm test                   # Unit tests for frontend

# Backend connection testing
# Check test_backend_connection and debug_backend_connection in frontend/src-tauri/src/api.rs
```

**Testing Practices**:
- Unit tests required for new features and modified code
- Integration tests encouraged for complex features
- All tests must pass before PR submission
- Manual testing workflow:
  1. Start both frontend and backend services
  2. Verify Whisper server at http://localhost:8178
  3. Verify backend API at http://localhost:5167/docs
  4. Test audio recording and transcription in desktop app

**Development Workflow**:
- Branch strategy: `main` (production) ← `devtest` (development) ← feature branches
- Pull requests require CI checks to pass
- Code review required before merging
- Structured commit messages with conventional format

## Technology Stack

### Frontend (Tauri + Next.js)
- **Framework**: Next.js 14 with TypeScript
- **Desktop**: Tauri 2.x for native desktop integration
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives, Lucide React icons
- **Rich Text**: TipTap editor for note-taking
- **State**: React state with custom hooks
- **Audio**: Native Tauri APIs for system audio capture

### Backend (Python FastAPI)
- **API Framework**: FastAPI with Pydantic models
- **Database**: SQLite with custom DatabaseManager
- **AI Processing**: Custom TranscriptProcessor with chunking
- **LLM Integration**: Support for Ollama, Claude, Groq, OpenAI
- **Transcription**: Whisper.cpp server integration
- **Background Tasks**: FastAPI BackgroundTasks for async processing

### Build and Packaging
- **Frontend Build**: Next.js static export + Tauri bundling
- **Backend Deployment**: Native installation scripts for Windows/macOS
- **Docker**: Multi-platform containers with GPU support
- **Distribution**: GitHub releases with platform-specific installers

## Key Implementation Details

### Audio Processing Flow
1. Tauri captures system audio + microphone input
2. Audio streams to local Whisper server (port 8178)
3. Real-time transcription results sent to FastAPI backend
4. Backend stores transcripts and triggers AI summarization

### AI Processing Pipeline
The `TranscriptProcessor` in `backend/app/transcript_processor.py`:
- Chunks long transcripts with configurable overlap
- Supports multiple LLM providers with unified interface
- Processes chunks in parallel for better performance
- Aggregates results into structured meeting summaries

### Database Schema
SQLite database managed by `DatabaseManager` in `backend/app/db.py`:
- **meetings**: Meeting metadata and titles
- **transcripts**: Raw transcript data with timestamps
- **processes**: Background task tracking
- **summaries**: AI-generated meeting summaries
- **model_configs**: User AI model preferences

### Privacy and Security Architecture
**Core Privacy Features**:
- **Complete Local Processing**: All audio transcription and AI summarization occurs on user's device
- **Data Sovereignty**: No vendor lock-in, full control over sensitive conversations
- **Optional Cloud Integration**: Users explicitly provide their own API keys for cloud providers
- **Analytics Consent**: `AnalyticsConsentSwitch` component allows opt-in/opt-out of anonymous usage data
- **Transparent Privacy Policy**: Clear documentation of data handling practices

**Security Measures**:
- File system permissions scoped to application data directory (`$APPDATA/**`)
- No cloud uploads by default - meeting content stays local
- User-controlled API keys for optional third-party services
- Local SQLite database with no external dependencies
- Open source codebase for transparency and community security review
- Data migration safety mechanisms during upgrades

## Configuration Files

- `frontend/src-tauri/tauri.conf.json` - Tauri app configuration
- `frontend/package.json` - Frontend dependencies and scripts
- `backend/requirements.txt` - Python dependencies
- `backend/docker-compose.yml` - Docker orchestration
- Platform-specific build scripts in `backend/` for deployment

## API Architecture

The FastAPI backend (`backend/app/main.py`) provides:
- **Meeting Management**: CRUD operations for meetings and transcripts
- **AI Processing**: Background transcript processing with status tracking
- **Model Configuration**: User preference storage for LLM providers
- **Search**: Vector search across meeting transcripts
- **Real-time Status**: WebSocket-style background task monitoring

Key endpoints:
- `POST /process-transcript` - Start AI summarization
- `GET /get-summary/{meeting_id}` - Get processing status/results
- `GET /get-meetings` - List all meetings
- `POST /save-transcript` - Save transcript without processing

## Performance Optimization and Resource Management

### Model Selection and Hardware Optimization
**Whisper Model Recommendations by RAM**:
- 8GB RAM: `base` or `small` models
- 16GB RAM: `medium` model
- 32GB+ RAM: `large-v3` model

**Performance Optimizations**:
- **GPU Acceleration**: CUDA support for Windows/Linux (`DGGML_CUDA=1` during compilation)
- **Apple Silicon**: Optimized with OpenMP acceleration (`libomp`) and LLVM compiler
- **Local Processing**: Avoids network latency, uses `whisper.cpp` for efficient transcription
- **Docker Performance**: Native installation 20-30% faster than Docker deployment

### Resource Management
**Audio Processing**:
- Audio chunked into 30-second segments for better sentence processing
- Resampling to 16kHz mono format for Whisper compatibility
- `AUDIO_CHUNK_QUEUE` with `MAX_AUDIO_QUEUE_SIZE` of 10 to prevent overflow
- Automatic dropping of old audio chunks when queue is full
- `chunk-drop-warning` events notify frontend of resource constraints

**Concurrent Operations**:
- 3 concurrent transcription workers (`NUM_WORKERS = 3`) using `tokio::spawn`
- FastAPI backend supports parallel transcript processing
- Background tasks for AI summarization to avoid blocking API responses

**System Requirements**:
- Minimum: 8GB RAM, 4GB disk space, 4+ CPU cores
- Recommended: 16GB+ RAM, 10GB+ disk space, 8+ CPU cores
- Docker: 8GB+ allocated RAM, 4+ CPU cores for optimal performance

## Development Notes

- The codebase follows a privacy-first design with local-by-default processing
- Docker setup is available but native installation provides 20-30% better performance
- The application requires both Whisper server and FastAPI backend to be running
- Frontend communicates with backend via REST API (no WebSocket currently)
- Background processing uses FastAPI's BackgroundTasks for AI summarization
- CI/CD pipeline exists with automated checks required for pull requests
- Structured development workflow with `main` → `devtest` → feature branch strategy