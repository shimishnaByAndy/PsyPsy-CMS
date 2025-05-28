# MCP Shrimp Task Manager - Quick Start Guide

## ✅ Installation Complete!

The mcp-shrimp-task-manager is now installed and configured for your PsyPsy CMS project.

## 🚀 How to Use

### Method 1: Direct Commands (Recommended)

You can now use these commands directly in your Cursor chat:

#### 📋 List Tasks
```
list tasks
```
Shows all current tasks with their status and priority.

#### 🎯 Execute a Task
```
execute task: Fix ESLint warnings in strings layout
```
or
```
execute task-001
```

#### 📝 Plan a New Task
```
plan task: Add dark mode toggle to the dashboard
```

#### 🔍 Get Task Details
```
get task detail: task-002
```

#### ✂️ Split Complex Tasks
```
split task: task-003 into smaller subtasks
```

### Method 2: Continuous Mode
```
Enter continuous mode and execute all pending tasks
```
This will execute tasks one by one automatically.

## 📊 Current Tasks Available

### Task 1: Fix ESLint Warnings (Medium Priority)
- **ID**: task-001
- **Status**: Pending
- **Files**: `src/layouts/strings/index.js`
- **Issue**: Remove unused imports (Switch, FormControlLabel, Box, Paper, SimpleErrorMessage)

### Task 2: Test ConnectionError Component (High Priority) 
- **ID**: task-002
- **Status**: Pending
- **Files**: `src/components/ConnectionError/index.js`
- **Goal**: Verify all error types and animations work correctly

### Task 3: Enhance Clients Table (Medium Priority)
- **ID**: task-003
- **Status**: Pending
- **Files**: `src/components/ClientsDataGrid/index.js`
- **Goal**: Add export, bulk actions, and advanced filtering

## 🎮 Try It Now!

1. **Start with the high priority task**:
   ```
   execute task: Test ConnectionError component functionality
   ```

2. **Or fix the ESLint warnings first**:
   ```
   execute task: Fix ESLint warnings in strings layout
   ```

3. **List all tasks to see the overview**:
   ```
   list tasks
   ```

## 🔧 Configuration Details

- **Installation**: Local clone (running from source)
- **Location**: `/Users/andreichira/Documents/Mobile_App_Dev/PsyPsy/CMS/mcp-shrimp-task-manager/`
- **Data Directory**: `mcp-data/`
- **GUI Enabled**: Yes - [Task Manager UI](http://localhost:61459?lang=en)
- **Language**: English
- **Environment**: Development
- **Version**: 1.0.19 (local build)

## 📁 Project Context

The task manager is aware of your project:
- **Technology**: React.js, Material-UI, Parse Server
- **Current Focus**: UI component refinement
- **Key Components**: DashboardNavbar, UserTypeSelector, ClientsDataGrid
- **Recent Work**: ConnectionError component, MUI-X DataGrid implementation

## 💡 Tips

1. **Be Specific**: Use exact task titles or IDs for better results
2. **Check Status**: Use `list tasks` to see current progress
3. **Plan First**: Use `plan task` for complex new features
4. **Review Details**: Use `get task detail` before executing
5. **Split Large Tasks**: Break complex tasks into smaller ones

## 🆘 Need Help?

- Use `list tasks` to see what's available
- Check the setup guide: `mcp-data/setup-guide.md`
- Review project config: `mcp-data/project-config.md`

Ready to start? Try: `list tasks` to see your current task queue! 