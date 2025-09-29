# PsyPsy CMS - Claude Code Instructions
**Last Updated**: September 29, 2025
**Project Type**: Healthcare Desktop Application (Tauri 2.1+ + React 19)
**Compliance**: HIPAA, Quebec Law 25, PIPEDA
**Documentation Standard**: World-Class Healthcare Documentation Framework

This file provides comprehensive guidance to Claude Code when working with the PsyPsy CMS project.

## 🏥 Healthcare Application Context

**CRITICAL**: This is a healthcare application managing Protected Health Information (PHI). All code changes, documentation updates, and system modifications must prioritize:

1. **Patient Safety**: Never compromise data integrity or access controls
2. **Regulatory Compliance**: Maintain HIPAA, Quebec Law 25, and PIPEDA compliance
3. **Security**: Preserve multi-layer security architecture
4. **Audit Trails**: Ensure all changes are properly logged and traceable

## 📚 Documentation Maintenance Rules

### Documentation Standards Compliance

**MANDATORY**: All documentation must follow the established world-class documentation framework:

#### Document Template Requirements
```markdown
# Document Title
**Last Updated**: [YYYY-MM-DD]
**Audience**: [Target users]
**Prerequisites**: [Required knowledge]
**Categories**: [Primary categories]
**Topics**: [Specific topics covered]

## Overview
[Document purpose and scope]

## Table of Contents
[Comprehensive TOC for documents >500 words]

## Related Documentation
[Cross-references to related docs]
```

#### Documentation Change Protocol
When making ANY code changes, you MUST:

1. **Update Affected Documentation**:
   - Architecture docs for system changes
   - API docs for endpoint changes
   - Security docs for security-related changes
   - Performance docs for optimization changes
   - Accessibility docs for UI/UX changes

2. **Maintain Documentation Integrity**:
   - Verify all code examples are functional
   - Update technical references (React 19, TanStack Query v5, Tauri 2.1+)
   - Preserve healthcare context and compliance considerations
   - Maintain consistent formatting and structure

3. **Log Documentation Changes**:
   - Add entry to `docs/CHANGELOG.md` (create if missing)
   - Update "Last Updated" metadata
   - Document rationale for changes

### Code Change Documentation Requirements

#### For ANY Code Modification:
```typescript
// REQUIRED: Document the change impact
/*
 * CHANGE LOG ENTRY
 * Date: [YYYY-MM-DD]
 * Type: [feature|bugfix|security|performance|compliance]
 * Component: [affected component/module]
 * Impact: [brief description]
 * Documentation Updated: [list of affected docs]
 * Healthcare Impact: [any PHI/compliance considerations]
 */
```

#### Documentation Update Checklist:
- [ ] Architecture documentation updated if system design changed
- [ ] API documentation updated if endpoints changed
- [ ] Security documentation updated if security model changed
- [ ] Performance documentation updated if optimization added
- [ ] Scripts documentation updated if build/test scripts changed
- [ ] Compliance documentation updated if regulatory impact
- [ ] Accessibility documentation updated if UI/UX changed

## 🛠️ Technical Stack Compliance

### Current Technology Standards
**ENFORCE STRICTLY**: All code must use current technology stack:

- **Frontend**: React 19 with Compiler Optimization (NO manual memo/useMemo/useCallback)
- **State Management**: TanStack Query v5 (use `isPending` NOT `isLoading`, `gcTime` NOT `cacheTime`)
- **Desktop Framework**: Tauri 2.1+ with Universal Entry Point
- **TypeScript**: 5.3+ with strict typing and branded types for medical IDs
- **Styling**: Tailwind CSS 3.4+ with shadcn/ui components
- **Testing**: Vitest + Playwright with accessibility testing (axe-core)

### Deprecated Patterns - DO NOT USE:
```typescript
// ❌ FORBIDDEN - React 18 patterns
const MemoComponent = memo(Component);
const value = useMemo(() => calculation(), [deps]);
const callback = useCallback(() => {}, [deps]);
const { isLoading } = useQuery(); // TanStack Query v4

// ❌ FORBIDDEN - Manual optimization in React 19
useEffect(() => {
  // Manual optimization logic
}, []);

// ❌ FORBIDDEN - Old error handling
const { useErrorBoundary } = useQuery();
```

### Required Patterns - ALWAYS USE:
```typescript
// ✅ REQUIRED - React 19 patterns
function Component({ data }: Props) {
  // Automatic optimization by React Compiler
  const result = expensiveCalculation(data);
  return <div>{result}</div>;
}

// ✅ REQUIRED - TanStack Query v5
const { data, isPending, error } = useQuery({
  queryKey: ['patients'],
  queryFn: fetchPatients,
  gcTime: 1000 * 60 * 30, // v5 syntax
  throwOnError: true, // v5 error handling
});
```

## 🔒 Security & Compliance Rules

### PHI Handling Requirements
**MANDATORY**: When working with patient data:

1. **Never Log PHI**: No patient identifiers in console.log, error messages, or debug output
2. **Encrypt PHI Fields**: Use AES-256-GCM encryption for all PHI
3. **Audit All Access**: Log all PHI access attempts with user, timestamp, purpose
4. **Principle of Least Privilege**: Grant minimum necessary access only
5. **Data Residency**: Ensure Canadian data residency for Quebec Law 25 compliance

### Security Code Requirements
```typescript
// ✅ REQUIRED - PHI handling pattern
interface PatientData {
  id: MedicalId; // Branded type
  name: EncryptedPHI;
  ssn: EncryptedPHI;
  // Never store PHI as plain strings
}

// ✅ REQUIRED - Audit logging
await auditLogger.logDataAccess({
  userId: user.id,
  action: 'read_patient_data',
  patientId: patient.id,
  timestamp: new Date(),
  purpose: 'medical_review',
});
```

### Security Documentation Updates
When making security-related changes, MUST update:
- `docs/security/README.md` - Security architecture
- `docs/security/FIRESTORE_SECURITY_DOCUMENTATION.md` - Database security
- `docs/compliance/overview.md` - Compliance impact
- `docs/compliance/quebec-law25.md` - Quebec-specific requirements

## 🎨 Accessibility Standards

### WCAG 2.1 AA/AAA Compliance
**MANDATORY**: All UI changes must maintain accessibility standards:

#### Required Accessibility Patterns:
```typescript
// ✅ REQUIRED - Accessible form components
<label htmlFor="patient-id" className="block text-sm font-medium">
  Patient ID <span aria-label="required" className="text-destructive">*</span>
</label>
<input
  id="patient-id"
  aria-describedby="patient-id-help patient-id-error"
  aria-invalid={hasError ? 'true' : 'false'}
  className="focus:ring-2 focus:ring-primary"
/>

// ✅ REQUIRED - Healthcare alerts
<div
  role={priority === 'critical' ? 'alert' : 'status'}
  aria-live={priority === 'critical' ? 'assertive' : 'polite'}
  className="focus:ring-2 focus:ring-destructive"
>
  {message}
</div>
```

#### Accessibility Testing Requirements:
- Run `npm run test:accessibility` before any UI commits
- Verify keyboard navigation works completely
- Test with screen readers (NVDA recommended)
- Validate color contrast meets WCAG AA (4.5:1) or AAA (7:1)

## 📊 Performance Standards

### Performance Budget Compliance
**ENFORCE**: All changes must maintain performance budgets:

- Bundle Size: < 2MB total
- Initial Load: < 2 seconds
- Time to Interactive: < 2.5 seconds
- Memory Usage: < 200MB
- Patient Data Load: < 500ms

### Performance Testing Requirements:
```bash
# REQUIRED before performance-related commits
npm run build:prod
npm run test:performance
npm run lighthouse # Check core web vitals
```

## 🧪 Testing Requirements

### Test Coverage Standards
**MANDATORY**: Maintain test coverage:
- Frontend: >85% coverage
- Backend/Tauri: >90% coverage
- Critical Healthcare Workflows: 100% coverage
- Accessibility: Complete WCAG compliance testing

### Testing Workflow:
```bash
# REQUIRED before ANY commit
npm run quality        # Type check + lint + test coverage
npm run test:a11y     # Accessibility testing
npm run e2e           # End-to-end testing

# RECOMMENDED for comprehensive testing
node scripts/automated-test-runner.js
```

## 📝 Change Logging System

### Required Change Documentation

#### 1. Code Change Log Template:
```markdown
## [YYYY-MM-DD] - [Component/Feature Name]

### Type: [feature|bugfix|security|performance|compliance|docs]

### Changes Made:
- [Specific change 1]
- [Specific change 2]

### Files Modified:
- [file1.ts] - [reason]
- [file2.tsx] - [reason]

### Documentation Updated:
- [docs/path/file.md] - [what was updated]

### Healthcare/Compliance Impact:
- [Any PHI, security, or regulatory considerations]

### Testing Performed:
- [ ] Unit tests updated/added
- [ ] Integration tests passed
- [ ] Accessibility tests passed
- [ ] Security review completed

### Related Issues:
- [Issue/ticket references]
```

#### 2. Documentation Change Log:
Create and maintain `docs/CHANGELOG.md`:
```markdown
# Documentation Changelog

## [YYYY-MM-DD] - [Change Summary]
### Modified:
- [document] - [reason for change]
### Added:
- [new document] - [purpose]
### Impact:
- [how this affects users/developers]
```

## 🔄 Serena MCP Integration

### Optimal Tool Usage for Documentation
Use Serena MCP tools efficiently:

#### For Code Analysis:
```bash
# Find components needing documentation updates
mcp__serena__find_symbol "ComponentName" --include-body=false
mcp__serena__find_referencing_symbols "APIEndpoint"
```

#### For Documentation Updates:
```bash
# Update documentation after code changes
mcp__serena__replace_regex --pattern="Last Updated.*" --repl="Last Updated: $(date)"
mcp__serena__write_memory "recent_changes" "Document recent architectural changes"
```

### Code Review Integration:
Before any commit, use Serena to verify:
1. All references to changed code are updated in docs
2. No orphaned documentation remains
3. All examples in docs still work with new code

## 🚀 Development Workflow

### Daily Development Process:

#### 1. Before Starting Work:
```bash
# Ensure environment is current
npm run switch:status
npm run test:firebase
git pull origin main
```

#### 2. During Development:
- Follow established patterns from `docs/development/architecture.md`
- Use scripts documented in `docs/development/scripts.md`
- Maintain security practices from `docs/security/README.md`
- Apply accessibility guidelines from `docs/accessibility/README.md`

#### 3. Before Committing:
```bash
# REQUIRED quality checks
npm run quality
npm run test:a11y
npm run build:prod

# Documentation verification
# - Update affected documentation
# - Verify all code examples work
# - Update changelog entries
```

#### 4. Commit Message Format:
```
type(scope): description

[DOCS UPDATED]: List of documentation files updated
[HEALTHCARE IMPACT]: Any PHI/compliance considerations

Body:
- Detailed change description
- Rationale for changes
- Testing performed

Fixes: #issue-number
```

## 🏗️ Project Structure Guidelines

### File Organization Standards:
```
PsyPsyCMS/
├── docs/                     # World-class documentation
│   ├── README.md            # Master navigation hub
│   ├── development/         # Technical documentation
│   ├── compliance/          # Healthcare compliance
│   ├── security/           # Security framework
│   ├── accessibility/      # WCAG implementation
│   ├── testing/           # Testing strategies
│   └── archived/          # Historical documents
├── src/                    # React 19 application code
├── src-tauri/             # Tauri 2.1+ backend
├── scripts/               # Development automation
└── tests/                 # Comprehensive test suite
```

### Documentation-First Development:
1. **Design First**: Document intended behavior before coding
2. **Code**: Implement following documented patterns
3. **Update**: Revise documentation to match implementation
4. **Test**: Verify documentation examples work
5. **Review**: Ensure documentation completeness

## 📋 Quality Assurance Checklist

### Before Any Code Commit:
- [ ] All affected documentation updated
- [ ] Code examples in docs verified working
- [ ] Healthcare context preserved
- [ ] Security patterns maintained
- [ ] Accessibility standards met
- [ ] Performance budgets maintained
- [ ] Test coverage maintained
- [ ] Change log entries created
- [ ] Cross-references updated

### Monthly Documentation Review:
- [ ] Verify all documentation current with codebase
- [ ] Check for broken internal links
- [ ] Validate code examples still work
- [ ] Review healthcare compliance alignment
- [ ] Update technology version references
- [ ] Assess documentation gaps

## 🎯 Success Metrics

### Documentation Quality KPIs:
- **Technical Accuracy**: 100% (all examples work)
- **Template Compliance**: 100% (consistent formatting)
- **Cross-Reference Completeness**: 100% (all docs linked)
- **Healthcare Context**: 100% (appropriate framing)
- **Currency**: <30 days since last update for active docs

### Healthcare Application Standards:
- **Compliance Coverage**: 100% regulatory requirements documented
- **Security Documentation**: 100% security patterns documented
- **Accessibility Standards**: WCAG 2.1 AA minimum, AAA target
- **Patient Safety**: Zero PHI exposure in logs/debug output

---

## 📞 Emergency Procedures

### For PHI/Security Incidents:
1. **Immediate**: Stop all development activity
2. **Assess**: Determine scope of potential PHI exposure
3. **Document**: Log incident details in security incident log
4. **Notify**: Follow incident response procedures in `docs/security/README.md`
5. **Update**: Revise documentation to prevent recurrence

### For Documentation Emergencies:
1. **Backup**: All current documentation preserved in git
2. **Rollback**: Use git history to restore previous versions
3. **Rebuild**: Follow templates in this CLAUDE.md to recreate
4. **Validate**: Ensure all restored content meets current standards

---

**Remember**: This is a healthcare application. Every change must prioritize patient safety, regulatory compliance, and data security. When in doubt, err on the side of caution and comprehensive documentation.
