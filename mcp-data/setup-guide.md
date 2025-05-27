# MCP Shrimp Task Manager Setup Guide

## Configuration Complete ✅

The mcp-shrimp-task-manager has been successfully configured for your PsyPsy CMS project!

## What's Configured

### 1. MCP Server Configuration
- **Location**: `.cursor/mcp.json`
- **Data Directory**: `mcp-data/` (absolute path configured)
- **Template Language**: English
- **GUI**: Disabled (can be enabled by changing `ENABLE_GUI` to `"true"`)

### 2. Project Context
- **Project Config**: `mcp-data/project-config.md`
- **Memory Bank Integration**: Connected to `.memory-bank/` files
- **Project Type**: React.js CMS for mental health professionals

### 3. Custom Modes (Optional)
- **TaskPlanner Mode**: `.cursor/custom-modes/TaskPlanner.md`
- **TaskExecutor Mode**: `.cursor/custom-modes/TaskExecutor.md`

## How to Use

### Method 1: Custom Modes (Recommended)
1. **Enable Custom Modes in Cursor**:
   - Go to Cursor Settings → Features → Enable "Custom modes"
   
2. **Create the modes**:
   - Add "TaskPlanner" mode with content from `.cursor/custom-modes/TaskPlanner.md`
   - Add "TaskExecutor" mode with content from `.cursor/custom-modes/TaskExecutor.md`

3. **Usage**:
   - Switch to **TaskPlanner** mode when planning tasks
   - Switch to **TaskExecutor** mode when executing tasks

### Method 2: Direct Commands
If you prefer not to use custom modes, you can use these commands directly:

#### Planning Tasks:
```
Plan the following task: [describe what you want to accomplish]
```

#### Executing Tasks:
```
Execute task: [task name or description]
```
or
```
List tasks and execute the next one
```

#### Continuous Execution:
```
Enter continuous mode and execute all pending tasks
```

## Available Tools

Once configured, you'll have access to these tools:

### Task Planning
- `plan_task` - Create structured task plans
- `analyze_task` - Deep analysis of requirements
- `process_thought` - Step-by-step reasoning
- `reflect_task` - Reflect and improve solutions

### Task Management
- `list_tasks` - Show all tasks and their status
- `get_task_detail` - Get complete task information
- `split_tasks` - Break tasks into subtasks
- `query_task` - Search for specific tasks
- `delete_task` - Remove incomplete tasks

### Task Execution
- `execute_task` - Execute specific tasks
- `verify_task` - Verify task completion

### Project Management
- `init_project_rules` - Initialize project standards
- `research_mode` - Enter systematic research mode

## Getting Started

### 1. Initialize Project Rules (First Time Only)
```
init project rules
```
This will help the system understand your project's specific patterns and standards.

### 2. Plan Your First Task
```
plan task: Improve the user management interface responsiveness
```

### 3. Execute the Task
```
execute task
```

## Project-Specific Configuration

The system is aware of your project context:
- **Technology Stack**: React.js, Material-UI, Parse Server
- **Current Focus**: UI component refinement, user management
- **Standards**: Material-UI patterns, responsive design, accessibility
- **Key Components**: DashboardNavbar, UserTypeSelector, Tables

## Memory Integration

The task manager integrates with your existing memory bank:
- Reads from `.memory-bank/` files for project context
- Stores task data in `mcp-data/` directory
- Maintains conversation history and task memory
- Provides long-term learning capabilities

## Tips for Best Results

1. **Be Specific**: Provide clear, detailed task descriptions
2. **Use Context**: Reference existing components and patterns
3. **Review Plans**: Always review task plans before execution
4. **Incremental Work**: Break large features into smaller tasks
5. **Feedback**: Provide feedback during planning to refine approaches

## Troubleshooting

If tools aren't available:
1. Restart Cursor IDE to reload MCP configuration
2. Check that the `mcp-data` directory exists
3. Verify the absolute path in `.cursor/mcp.json` is correct
4. Ensure internet connection for downloading the MCP server

## Next Steps

You're now ready to use the mcp-shrimp-task-manager! Try:
1. Initialize project rules if this is your first time
2. Plan a task related to your current UI refinement work
3. Execute the task and see the structured workflow in action 