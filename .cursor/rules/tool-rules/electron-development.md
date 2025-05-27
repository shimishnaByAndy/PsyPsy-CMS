# Electron Development Guidelines

## Context
- When working with Electron applications in development mode
- When making changes to React components or Electron configuration
- When debugging routing or component rendering issues
- When user is on hot reload setup

## Critical Rules

1. **NEVER run build or restart commands automatically**
   - Do NOT run `npm run electron:restart`
   - Do NOT run `npm run electron:dev`
   - Do NOT run `npm start` or `npm run build`
   - Let hot reload handle updates automatically

2. **Hot Reload Workflow**
   - User is on hot reload - changes are picked up automatically
   - Only suggest manual restart if explicitly requested by user
   - Trust that Electron reloader will handle file changes

3. **Debugging Approach**
   - Make code changes and let hot reload apply them
   - Ask user to test changes after hot reload completes
   - Use console.log for debugging instead of restarting processes
   - Focus on code fixes rather than process management

4. **When Manual Restart IS Needed**
   - Only when user explicitly requests it
   - Only when changing Electron main process files (main.js, preload.js)
   - Only when package.json scripts are modified
   - Always ask permission before running restart commands

## Examples

<example type="good">
// Good: Make code changes and let hot reload handle it
"I've updated the route configuration. The hot reload should pick up this change automatically. Can you try clicking Settings again?"

// Good: Ask before restarting
"This change requires restarting Electron. Would you like me to run `npm run electron:restart`?"
</example>

<example type="bad">
// Bad: Automatically running restart commands
"Let me restart the Electron app: npm run electron:restart"

// Bad: Running build commands without permission
"Running npm start to apply changes..."
</example>

## Development Flow

1. **Make Code Changes**: Edit files as needed
2. **Wait for Hot Reload**: Let the system pick up changes
3. **Ask User to Test**: Request user to verify changes
4. **Debug if Needed**: Add logging or make further code changes
5. **Only Restart if Necessary**: And only with user permission

## Notes
- Hot reload is faster and less disruptive than full restarts
- User knows their development environment better than the AI
- Focus on solving the actual code issues rather than process management
- Respect the user's workflow and development setup 