# Debug Subagent Configuration - PsyPsy CMS

## Subagent Details
- **Category**: Debug & Development (🐛)
- **Specialization**: Tauri app debugging, development server management, build processes
- **Resource Limits**: 512MB RAM, 15min timeout

## Healthcare Context Integration

### HIPAA-Compliant Error Handling
```typescript
// ✅ REQUIRED: Enhanced error boundaries with compliance logging
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  logComplianceError(error, errorInfo, {
    patientDataInvolved: this.props.patientId,
    timestamp: new Date().toISOString(),
    requiresNotification: error.name.includes('Security'),
    auditLevel: 'hipaa_compliant'
  })
}
```

### PsyPsy CMS Debug Patterns

#### Tauri 2.1+ Debugging Patterns
- **Universal Entry Point**: Debug desktop/mobile compatibility
- **Plugin Configuration**: Medical record plugins with encryption
- **Type-Safe Commands**: Healthcare API command validation
- **Security Context**: PHI access auditing

#### React 19 + Healthcare Debugging
- **React Compiler**: No manual memoization debugging
- **Medical Data Flow**: TanStack Query v5 with audit trails
- **Component Isolation**: Feature-based architecture validation
- **Error Categorization**: Compliance vs technical errors

#### Build Process Healthcare Compliance
- **Bundle Splitting**: Medical core vs non-critical features
- **Performance Monitoring**: Healthcare workflow optimization
- **Security Validation**: PHI handling in production builds
- **Compliance Checks**: HIPAA validation in CI/CD

## Specialized Debug Tools

### Available Tools (16 tools)
1. `mcp__opcode_cms_debugger__start_tauri_app` - Healthcare-aware Tauri startup
2. `mcp__opcode_cms_debugger__stop_tauri_app` - Graceful PHI-safe shutdown
3. `mcp__opcode_cms_debugger__list_tauri_apps` - Active healthcare sessions
4. `mcp__opcode_cms_debugger__get_tauri_console` - Medical audit console
5. `mcp__opcode_cms_debugger__get_tauri_errors` - HIPAA-compliant error logs
6. `mcp__opcode_cms_debugger__capture_tauri_error` - PHI-safe error capture
7. `mcp__opcode_cms_debugger__apply_tauri_autofix` - Healthcare pattern fixes
8. `mcp__opcode_cms_debugger__start_electron_app` - Legacy compatibility
9. `mcp__opcode_cms_debugger__electron_evaluate` - Development evaluation
10. `mcp__opcode_cms_debugger__electron_reload` - Hot reload with audit
11. `mcp__opcode_cms_debugger__playwright_interact` - E2E healthcare testing
12. `mcp__opcode_cms_debugger__get_debug_tasks` - Medical workflow debugging
13. `mcp__opcode_cms_debugger__generate_debug_plan` - Healthcare debug strategy
14. `mcp__opcode_cms_debugger__analyze_debug_patterns` - Compliance patterns
15. `mcp__opcode_cms_debugger__init_project` - Healthcare project setup
16. `mcp__opcode_cms_debugger__create_debug_task` - Medical debug tasks

### Healthcare-Specific Debugging Workflows

#### Patient Data Flow Debugging
```typescript
// Debug patient data access with audit trails
const debugPatientAccess = async (patientId: PatientId) => {
  const debugSession = await mcp__opcode_cms_debugger__start_tauri_app({
    mode: 'healthcare_debug',
    auditEnabled: true,
    phiProtection: true
  });

  // Monitor all patient data access
  await mcp__opcode_cms_debugger__capture_tauri_error({
    pattern: 'patient_access',
    auditRequired: true
  });
};
```

#### Appointment Scheduling Debug
- **50-minute block validation**
- **Conflict detection debugging**
- **Quebec timezone handling**
- **Emergency contact validation**

#### Professional Credential Debug
- **License validation debugging**
- **Annual renewal tracking**
- **Specialization verification**
- **Jurisdiction compliance (Quebec)**

## Error Categories for Healthcare

### Critical Errors (Immediate Notification)
- PHI data exposure
- Security breaches
- Quebec Law 25 violations
- HIPAA compliance failures

### Standard Errors (Audit Required)
- Patient data access issues
- Appointment booking conflicts
- Professional credential problems
- Authentication failures

### Development Errors (Debug Only)
- UI/UX issues
- Performance problems
- Non-PHI data handling
- General application errors

## Integration with Other Subagents

### Firebase Subagent Coordination
- **Emulator debugging**: Healthcare data testing
- **Security rules**: PHI access validation
- **Audit logging**: Compliance trail debugging

### Data Subagent Coordination
- **TanStack Query**: Medical record caching
- **State management**: Healthcare workflow state
- **API integration**: Medical API debugging

### Styling Subagent Coordination
- **Healthcare UI**: Medical form debugging
- **Accessibility**: Healthcare compliance
- **Responsive design**: Medical device compatibility

## Success Criteria

1. **Healthcare Compliance**: All debugging maintains HIPAA compliance
2. **PHI Protection**: No sensitive data in debug logs
3. **Audit Trails**: Complete debugging activity logs
4. **Quebec Compliance**: Law 25 adherence in all debug operations
5. **Professional Standards**: Medical workflow integrity maintained

## Context Restrictions

- **PHI Isolation**: No patient data in debug outputs
- **Audit Required**: All debugging activities logged
- **Compliance First**: Healthcare regulations override debug convenience
- **Security Boundaries**: Debug access controls maintained

---

*Healthcare Debug Subagent - PsyPsy CMS v3.0.0*
*HIPAA + Quebec Law 25 Compliant*