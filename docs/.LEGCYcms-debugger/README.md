# PsyPsy CMS Debugger - Healthcare-Compliant Development Tools

**Version**: 3.0.0
**Compliance**: HIPAA + Quebec Law 25
**Architecture**: Tauri 2.1+ | React 19 | Firebase | TanStack Query v5

## Overview

The PsyPsy CMS Debugger is a specialized MCP (Model Context Protocol) server designed for healthcare management system development. It provides HIPAA-compliant debugging tools, Firebase integration, and Quebec Law 25 compliance features.

## Architecture

### Subagent System

The debugger uses a multi-subagent architecture with specialized tools for different aspects of healthcare development:

```
🐛 Debug Subagent       - Tauri 2.1+ debugging, React 19 patterns
🔥 Firebase Subagent    - Healthcare data integration, emulator testing
🎨 Styling Subagent     - TailwindCSS + shadcn/ui healthcare UI
📊 Data Subagent        - TanStack Query v5 + medical data patterns
📋 Planning Subagent    - Healthcare feature planning & architecture
```

### Healthcare Compliance Features

- **PHI Protection**: All debugging tools respect Protected Health Information
- **Audit Trails**: Complete logging of all debugging activities
- **Quebec Law 25**: Data residency and consent management compliance
- **HIPAA**: Healthcare-grade security and access controls

## Quick Start

### 1. Initialize Debugger
```bash
# The debugger has been pre-initialized with healthcare configurations
ls -la .cms-debugger/
```

### 2. Configure MCP Server
```bash
# Copy the MCP configuration to your Claude Code settings
cp .cms-debugger/mcp-server-config.json ~/.mcp.json
```

### 3. Start Healthcare Development
```bash
# Start Firebase emulators with healthcare seed data
firebase emulators:start --import=./seed-data

# Start Tauri development with healthcare debugging
npm run tauri:dev
```

## Configuration Files

### Main Configuration
- **`cms-debugger.config.json`** - Primary debugger configuration
- **`debug.config.json`** - Legacy configuration (preserved)
- **`mcp-server-config.json`** - MCP server integration

### Subagent Configurations
- **`config/subagents/debug-subagent.md`** - Debug tools for Tauri + React
- **`config/subagents/firebase-subagent.md`** - Healthcare Firebase integration
- **`config/subagents/styling-subagent.md`** - Medical UI/UX patterns
- **`config/subagents/data-subagent.md`** - PHI-compliant data handling
- **`config/subagents/planning-subagent.md`** - Healthcare feature planning

## Healthcare-Specific Features

### 🏥 Medical Data Debugging
- **PHI-Safe Logging**: No sensitive data in debug outputs
- **Audit Compliance**: All debugging activities logged for HIPAA
- **Quebec Regulations**: Law 25 compliance in all operations
- **Professional Credentials**: License validation debugging

### 🔒 Security Debugging
- **Encryption Validation**: AES-256-GCM compliance testing
- **Access Control**: Role-based permission debugging
- **Data Residency**: Quebec/Canada data location validation
- **Consent Management**: Patient consent tracking debug tools

### ⚡ Performance Healthcare Patterns
- **50-Minute Sessions**: Appointment scheduling validation
- **Emergency Contacts**: Mandatory field validation
- **Professional Licensing**: Annual renewal tracking
- **Conflict Prevention**: Double-booking detection

## Subagent Tool Overview

### Debug Subagent (16 tools)
```typescript
// Healthcare-aware Tauri debugging
await mcp__opcode_cms_debugger__start_tauri_app({
  mode: 'healthcare_debug',
  auditEnabled: true,
  phiProtection: true
});
```

### Firebase Subagent (12 tools)
```typescript
// PHI-safe database queries
await firestore_query({
  collection: 'patients',
  use_emulator: true,
  audit: true,
  phiProtection: true
});
```

### Data Subagent (10 tools)
```typescript
// TanStack Query with audit trails
await tanstack_query_setup({
  healthcareMode: true,
  auditMutations: true,
  phiCacheStrategy: 'no-persist'
});
```

## Development Workflows

### Daily Healthcare Development
```bash
# 1. Start emulators with healthcare data
firebase emulators:start --import=./seed-data --export-on-exit

# 2. Launch debugger with healthcare compliance
npm run dev:healthcare

# 3. Test with healthcare scenarios
npm run test:healthcare
```

### Compliance Validation
```bash
# Run HIPAA compliance checks
npm run validate:hipaa

# Test Quebec Law 25 requirements
npm run test:quebec-law25

# Audit PHI handling patterns
npm run audit:phi-protection
```

## Integration with Existing Tools

### Serena MCP Integration
- **Code Analysis**: Healthcare-aware semantic analysis
- **Symbol Search**: Medical domain-specific patterns
- **Compliance Editing**: PHI-safe code modifications

### Task Master AI Integration
- **Healthcare Tasks**: Medical workflow task management
- **Compliance Tracking**: Regulatory requirement planning
- **Research**: Quebec healthcare regulation research

### Firebase MCP Integration
- **Emulator Testing**: Healthcare scenario validation
- **Security Rules**: PHI access control testing
- **Audit Logging**: Medical data access tracking

## Healthcare Error Categories

### 🚨 Critical (Immediate Notification)
- PHI data exposure
- Security breaches
- Quebec Law 25 violations
- HIPAA compliance failures

### ⚠️ Standard (Audit Required)
- Patient data access issues
- Appointment booking conflicts
- Professional credential problems
- Authentication failures

### 📝 Development (Debug Only)
- UI/UX issues
- Performance problems
- Non-PHI data handling
- General application errors

## Compliance Checklist

- [ ] **PHI Protection**: No sensitive data in debug logs
- [ ] **Audit Trails**: All medical data access logged
- [ ] **Data Residency**: Quebec/Canada server validation
- [ ] **Consent Tracking**: Patient consent renewal workflows
- [ ] **Professional Validation**: Healthcare license verification
- [ ] **Emergency Contacts**: Mandatory field enforcement
- [ ] **Encryption**: AES-256-GCM implementation
- [ ] **Access Control**: Role-based permission system

## Troubleshooting

### Common Healthcare Debugging Issues

1. **PHI Exposure in Logs**
   ```bash
   # Check for PHI in debug output
   grep -r "ssn\|medical_history" ./debug-logs/
   ```

2. **Emulator Connection Issues**
   ```bash
   # Verify healthcare emulator setup
   firebase emulators:start --only=firestore,auth,database
   ```

3. **Compliance Validation Failures**
   ```bash
   # Run comprehensive compliance check
   npm run validate:all-compliance
   ```

## Support & Documentation

- **Healthcare Debugging**: See subagent configuration files
- **Compliance Questions**: Refer to HIPAA/Quebec Law 25 docs
- **Technical Issues**: Check debug-subagent.md patterns
- **Firebase Integration**: See firebase-subagent.md guidelines

---

**🏥 Healthcare Development Ready**
*PsyPsy CMS Debugger v3.0.0*
*HIPAA + Quebec Law 25 Compliant*

Last Updated: September 26, 2025