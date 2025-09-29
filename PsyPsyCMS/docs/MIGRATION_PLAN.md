# Documentation Structure and Migration Plan
**Date**: September 29, 2025  
**Project**: PsyPsy CMS Documentation Cleanup Initiative  

## New Documentation Structure

Based on the audit findings, this plan outlines the new documentation organization and migration strategy.

## Proposed Directory Structure

```
docs/
├── README.md                          # 🆕 Master documentation index
├── onboarding/                        # 🆕 New developer resources
│   ├── quick-start.md                 # 🆕 15-minute setup guide
│   ├── developer-setup.md             # 🆕 Complete setup instructions
│   └── troubleshooting.md             # 🆕 Common issues and solutions
├── development/                       # 🆕 Development workflows
│   ├── architecture.md                # 🔄 Merge from CMS_IMPLEMENTATION_GUIDE.md
│   ├── development-workflow.md        # 🔄 Extract from existing docs
│   └── code-standards.md              # 🔄 Reference DEVELOPMENT_RULES_2025.md
├── compliance/                        # 🔄 Consolidate existing compliance docs
│   ├── overview.md                    # 🆕 Compliance quick reference
│   ├── quebec-law25.md                # 🔄 Merge quebec-* files
│   ├── hipaa.md                       # 🔄 Extract from existing docs
│   └── testing-compliance.md          # 🔄 Consolidate compliance tests
├── testing/                          # 🔄 Reorganize existing test docs
│   ├── testing-strategy.md           # ✅ Keep existing
│   ├── automated-testing.md          # 🔄 Extract from COMPREHENSIVE_TEST_SUITE.md
│   └── manual-testing.md             # 🔄 Extract manual tests
├── deployment/                       # 🆕 Deployment information
│   ├── build-process.md              # 🆕 Build and deployment guide
│   └── deployment-guide.md           # 🆕 Production deployment
├── api/                              # 🆕 API documentation
│   ├── tauri-commands.md             # 🔄 Extract from implementation guide
│   └── firebase-integration.md       # 🔄 Extract Firebase docs
└── archived/                         # 🆕 Historical documents
    ├── TAURI_MIGRATION_EXECUTION_REPORT.md
    └── legacy-implementations/
```

## Migration Mapping

### Files to Merge/Consolidate

#### 1. Implementation Guides → development/architecture.md
**Source Files**:
- `docs/CMS_IMPLEMENTATION_GUIDE.md` (990+ lines) - **PRIMARY SOURCE**
- `docs/IMPLEMENTATION_SUMMARY.md` - **MERGE INTO PRIMARY**

**Migration Strategy**:
1. Use CMS_IMPLEMENTATION_GUIDE.md as the base
2. Extract unique content from IMPLEMENTATION_SUMMARY.md
3. Update all TanStack Query v4 → v5 syntax
4. Update React 18 → React 19 references
5. Split into logical sections:
   - Architecture overview → `development/architecture.md`
   - API documentation → `api/` directory
   - Setup instructions → `onboarding/` directory

#### 2. Compliance Documentation → compliance/
**Source Files**:
- `docs/quebec-law25-compliance-report.md` ✅ **KEEP**
- `docs/quebec-ai-models-compliance-guide.md` ✅ **KEEP**  
- `docs/compliance-validation-report.md` ✅ **KEEP**
- `docs/compliance/COMPLIANCE_TEST_REPORT.md` ✅ **KEEP**
- `docs/compliance/compliance-testing-guide.md` ✅ **KEEP**

**Migration Strategy**:
1. Create `compliance/overview.md` - Quick reference guide
2. Reorganize existing files with better cross-references
3. Extract HIPAA content scattered across other docs

#### 3. Testing Documentation → testing/
**Source Files**:
- `COMPREHENSIVE_TEST_SUITE.md` - **SPLIT INTO MULTIPLE FILES**
- `docs/testing/TESTING_STRATEGY.md` ✅ **KEEP**
- `docs/testing/test-ui-components.md` ✅ **KEEP**

**Migration Strategy**:
1. Split COMPREHENSIVE_TEST_SUITE.md into:
   - `testing/automated-testing.md` (automated test procedures)
   - `testing/manual-testing.md` (manual test procedures)
2. Update React 18 → React 19 references
3. Cross-reference with testing strategy

### Files to Update (Tech Stack Modernization)

#### High Priority Updates
1. **docs/CMS_IMPLEMENTATION_GUIDE.md**
   - 15+ instances of `isLoading` → `isPending`
   - 8+ instances of `useErrorBoundary` → `throwOnError`
   - Update React patterns to remove manual memoization

2. **docs/TABLES_GUIDE.md**
   - Update TanStack Query examples
   - Modernize component patterns

3. **COMPREHENSIVE_TEST_SUITE.md**
   - Update React 18 → React 19 references
   - Update testing patterns

4. **RUN_TESTS.md**
   - Update stack references
   - Modernize testing commands

#### Medium Priority Updates
1. **CLAUDE.md** - Clean up mixed syntax examples
2. **CHANGELOG.md** - Condense historical entries
3. Component documentation in `src/components/ui/healthcare/`

### Files to Archive

#### Historical Documents → docs/archived/
1. **TAURI_MIGRATION_EXECUTION_REPORT.md**
   - Historical value only
   - Move to `docs/archived/`

2. **Legacy changelog entries**
   - Condense CHANGELOG.md to recent entries only
   - Archive older entries

### New Files to Create

#### 1. Master Index - docs/README.md
**Purpose**: Central navigation hub for all documentation
**Content**:
- Quick start links
- Documentation categories
- Search/navigation aids
- Contribution guidelines

#### 2. Onboarding Guides
**Purpose**: Streamlined developer onboarding
**Files**:
- `onboarding/quick-start.md` - 15-minute setup
- `onboarding/developer-setup.md` - Complete setup
- `onboarding/troubleshooting.md` - Common issues

#### 3. Compliance Overview
**Purpose**: Quick reference for compliance requirements
**File**: `compliance/overview.md`
**Content**:
- Quebec Law 25 checklist
- HIPAA requirements
- Quick compliance verification

## Migration Phases

### Phase 1: Structure Creation (Tasks 4-6)
1. Create new directory structure
2. Merge implementation guides
3. Update technical content
4. Consolidate compliance docs

### Phase 2: Content Organization (Tasks 7-11)
1. Create master index
2. Implement document templates
3. Add cross-references
4. Categorize all documentation
5. Add table of contents

### Phase 3: Enhancement (Tasks 16-19)
1. Create onboarding materials
2. Add troubleshooting guides
3. Create quick-start guides
4. Progressive documentation journey

## Quality Standards

### Document Templates
**Standard Header**:
```markdown
# [Document Title]
**Last Updated**: [Date]  
**Audience**: [Developers/Admins/Compliance]  
**Prerequisites**: [Required knowledge/setup]  

## Overview
[Brief description and purpose]

## Table of Contents
[Auto-generated TOC]
```

### Cross-Reference Format
- Relative links: `[Link Text](../category/document.md)`
- Section links: `[Section](document.md#section-heading)`
- External links: Clearly marked as external

### Code Example Standards
- Use current syntax (React 19, TanStack Query v5, Tauri 2.1+)
- Include working examples
- Add explanatory comments
- Show both ❌ incorrect and ✅ correct patterns

## Risk Mitigation

### Content Loss Prevention
1. ✅ **Backup created** - All content preserved in `backups/`
2. **Git tracking** - All changes tracked in version control
3. **Review process** - Each merge reviewed before finalization

### Continuity Assurance
1. **Gradual migration** - Implement in phases
2. **Redirect strategy** - Temporary redirects from old to new docs
3. **Team communication** - Notify team of structure changes

### Quality Assurance
1. **Link validation** - Verify all internal links work
2. **Content review** - Ensure no information lost in merges
3. **Technical accuracy** - Verify all code examples work

## Success Metrics

### Quantitative Goals
- **File reduction**: 31 → 22 files (30% reduction)
- **Content accuracy**: 100% current syntax
- **Navigation coverage**: 95% cross-referenced
- **Onboarding time**: 40% reduction target

### Qualitative Goals
- Consistent formatting across all documents
- Clear navigation pathways
- Comprehensive onboarding experience
- Easy-to-find compliance information

## Implementation Timeline

**Week 1**: Tasks 1-3 (✅ Complete)
- Audit and backup complete
- Migration plan finalized

**Week 2**: Tasks 4-6 (Next)
- Content consolidation
- Technical modernization
- Compliance reorganization

**Week 3**: Tasks 7-11
- Structure implementation
- Navigation creation
- Cross-referencing

**Week 4**: Tasks 12-15
- Script optimization
- Documentation cleanup

**Week 5-6**: Tasks 16-20
- Enhancement features
- Final review and approval

This plan ensures systematic migration while preserving all valuable content and improving overall documentation quality.