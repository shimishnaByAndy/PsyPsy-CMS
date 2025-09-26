# Serena MCP Usage Guide

## Project Type: Tauri
## Language: Typescript
## Build Tools: Vite, Vite

This document provides project-specific guidance for using Serena MCP tools in your tauri project.

## MCP Server Configuration

Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "serena": {
      "command": "/path/to/serenaMCP/start-serena-mcp.sh"
    }
  }
}
```

## Essential Serena MCP Tools

### Core Development Tools
- `mcp__serena__get_symbols_overview` - Get high-level code structure
- `mcp__serena__find_symbol` - Find specific functions, classes, methods
- `mcp__serena__find_referencing_symbols` - Find where symbols are used
- `mcp__serena__search_for_pattern` - Search code patterns across files

### Editing Tools
- `mcp__serena__replace_symbol_body` - Replace entire function/class bodies
- `mcp__serena__insert_after_symbol` - Add code after symbols
- `mcp__serena__insert_before_symbol` - Add code before symbols

### Project Management
- `mcp__serena__activate_project` - Switch between projects
- `mcp__serena__write_memory` - Store project knowledge
- `mcp__serena__read_memory` - Access stored knowledge
- `mcp__serena__list_memories` - See available knowledge files

### File Operations
- `mcp__serena__list_dir` - Browse directory structure
- `mcp__serena__find_file` - Find files by pattern

## Language Server Recommendations

- Rust Analyzer for backend
- TypeScript LSP for frontend
- Tauri API completions


## Tauri Specific Development

### Rust Backend
- Use `mcp__serena__find_symbol` to navigate Rust commands in `src-tauri/src/`
- Focus on `#[tauri::command]` functions for frontend-backend communication
- Handle async operations properly with Tauri's async support

### Frontend-Backend Communication
- Analyze `invoke()` calls from frontend to Rust backend
- Review command definitions and their implementations
- Ensure proper error handling across the bridge

### Build and Development
- Use `npm run tauri dev` for development
- Use `npm run tauri build` for production builds
- Monitor both frontend and backend for errors


## Common Workflow Patterns

### Code Exploration
1. Start with `mcp__serena__get_symbols_overview` on key files
2. Use `mcp__serena__find_symbol` to dive into specific implementations
3. Use `mcp__serena__find_referencing_symbols` to understand usage patterns
4. Use `mcp__serena__search_for_pattern` for cross-file pattern analysis

### Code Modification
1. Analyze existing code structure first
2. Use symbol-based editing for complete function/class replacements
3. Use targeted insertion for adding new functionality
4. Test changes incrementally

### Knowledge Management
1. Use `mcp__serena__write_memory` to document important discoveries
2. Store architecture decisions and patterns
3. Keep track of complex business logic explanations
4. Document integration patterns and gotchas

## Integration with Claude Code

This documentation is automatically referenced in your project's `CLAUDE.md` file to ensure Claude Code understands how to effectively use Serena MCP tools for your specific project type.

For more detailed information about Serena MCP capabilities, refer to the main Serena documentation.
