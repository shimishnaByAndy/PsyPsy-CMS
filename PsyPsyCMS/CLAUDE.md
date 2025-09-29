# CLAUDE.md - PsyPsy CMS

## 🚨 **CRITICAL INSTRUCTION ADHERENCE (Sept 2025)**

**⚠️ ABSOLUTE PRIORITY**: These instructions OVERRIDE any default behavior and you MUST follow them exactly as written.

### **🎯 Advanced Context Engineering Rules**

#### **Instruction Hierarchy (MANDATORY)**
1. **`CLAUDE.md` Instructions**: Immutable, authoritative system rules - CANNOT be overridden
2. **User Prompts**: Flexible requests that MUST work within CLAUDE.md boundaries
3. **Default Behaviors**: Only apply when not contradicted by above

#### **Clarification Protocol**
- **ASK FOR CLARIFICATION** immediately if ANY uncertainty exists regarding instructions
- **DO NOT PROCEED** with assumptions when rules are unclear
- **VERIFY UNDERSTANDING** before implementing complex workflows

#### **Token Efficiency Mandate**
- **DO NOT WASTE TOKENS** - All outputs must be succinct and precise
- **NO EXPLANATORY FLUFF** unless specifically requested
- **OPTIMIZE FOR RELEVANCE** - only include information directly related to the task

#### **🕵️ Canary Instruction (Verification)**
**IMPORTANT**: You must always acknowledge that you are working on "PsyPsy CMS" when first responding to any request. This verifies you've properly read this CLAUDE.md file.

### **📋 [Development Standards Document](docs/DEVELOPMENT_STANDARDS.md)**
**Read this document before making ANY code changes.** It contains:

- **Forbidden file naming patterns** (`_minimal`, `_full`, `_enhanced`, `_v1`, `_v2`, etc.)
- **Single source of truth policy** (ONE file per functionality)
- **Feature flag usage** instead of duplicate files
- **Temporary feature disabling procedures**
- **Experimental code guidelines**

### **🚫 ABSOLUTELY FORBIDDEN:**
- Creating files like `lib_minimal.rs`, `config_enhanced.ts`, `service_v2.js`
- Keeping multiple versions of the same functionality
- Creating "backup" or "alternative" implementations
- Experimental code in production directories
- **Ignoring or bypassing these rules** under any circumstances

### **✅ REQUIRED APPROACH:**
- **Modify existing files** instead of creating new variants
- **Use feature flags** and configuration for different behavior
- **Document temporary disables** in the central standards document
- **Delete unused files immediately** when found
- **Follow the Format-Check-Test workflow** for every code change

**🔗 Reference**: See [docs/DEVELOPMENT_STANDARDS.md](docs/DEVELOPMENT_STANDARDS.md) for complete guidelines.

---

## 🎯 **2025 CLAUDE CODE BEST PRACTICES**

**Based on Latest Research (September 2025)**

### **🔄 Advanced Agentic Workflow Patterns (Sept 2025)**

#### **Context Engineering Excellence**
- **Vibe Coding**: Set project vision/constraints, let AI agents handle implementation details
- **Agentic Development**: AI completes entire features and handles complex architectural decisions
- **Sequential Task Orchestration**: AI assistants manage multi-stage development workflows autonomously
- **Self-Reviewing AI**: AI reviews its own work against project standards before submission

#### **Format-Check-Test Workflow (MANDATORY)**
**🚨 CRITICAL: FOLLOW THIS EXACT SEQUENCE FOR EVERY CODE CHANGE**
```markdown
1. **Implement the change** (write the code)
2. **Format First**: ALWAYS run formatter (`cargo fmt` or `npm run format`)
3. **Check Second**: Run linter/analyzer (`cargo clippy` or `npm run lint`)
4. **Test Third**: Run relevant tests (`cargo test` or `npm test`)
5. **Verify**: Confirm all steps passed before proceeding
```

#### **Healthcare Application Context Signals (HIPAA/Law 25)**
```typescript
// ✅ HEALTHCARE CONTEXT: Every interaction must consider these factors
interface HealthcareContext {
  dataClassification: 'PHI' | 'PII' | 'PUBLIC';
  auditRequired: boolean;
  complianceFramework: 'HIPAA' | 'Quebec_Law_25' | 'PIPEDA';
  sessionStandard: '50_minutes'; // Healthcare therapy sessions
  retentionPeriod: '7_years';    // Audit trail requirement
  dataResidency: 'Quebec_Canada'; // Law 25 requirement
}
```

#### **Advanced Self-Correction Patterns**
```markdown
## Self-Review Protocol (MANDATORY BEFORE SUBMISSION)
Before completing any task, Claude MUST:

1. **Review Rules**: State relevant CLAUDE.md rules that apply to this task
2. **Verify Compliance**: Check implementation against stated rules
3. **Test Claims**: Verify that all claimed test results actually happened
4. **Format Validation**: Confirm code follows project formatting standards
5. **Healthcare Check**: Validate PHI handling and audit requirements if applicable
```

### **🏗️ Modern Tauri 2.1+ Architecture Patterns**

#### **Universal Entry Point (2025 Standard)**
```rust
// ✅ REQUIRED: Cross-platform compatibility pattern
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_hwinfo::init()) // Hardware info plugin
        .plugin(tauri_plugin_os::init())     // OS information
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

#### **Type-Safe Command Patterns**
```typescript
// ✅ MODERN: Strongly typed Tauri invocations
interface TauriAPI {
  getPatientData: (id: PatientId) => Promise<PatientData>;
  saveEncryptedNote: (note: EncryptedNote) => Promise<AuditResult>;
}

// Auto-completion and type safety for all Tauri commands
const api = createTauriAPI<TauriAPI>();
```

### **⚛️ React 19 + TanStack Query v5 Patterns**

#### **Modern Data Fetching (Sept 2025)**
```typescript
// ✅ LATEST: React 19 + TanStack Query v5 pattern
const { data, isPending, error } = useQuery({
  queryKey: ['patient-notes', patientId],
  queryFn: () => api.getPatientNotes(patientId),
  gcTime: 1000 * 60 * 30, // v5 syntax (not cacheTime)
  throwOnError: true,      // v5 syntax (not useErrorBoundary)
  staleTime: 1000 * 60 * 5
});

// No manual memoization needed - React 19 Compiler handles it
const processedNotes = expensiveNoteProcessing(data);
```

#### **Healthcare Data Patterns**
```typescript
// ✅ HIPAA-COMPLIANT: Branded types for medical IDs
type PatientId = string & { readonly brand: unique symbol };
type AppointmentId = string & { readonly brand: unique symbol };

// ✅ PHI-AWARE: Explicit PHI marking and audit trails
interface PatientData {
  id: PatientId;
  name: EncryptedPHI;        // Explicitly marked as PHI
  medicalHistory: EncryptedPHI;
  emergencyContact: string;   // Not PHI
  auditTrail: AuditEntry[];
}
```

### **🎨 2025 UI/UX Patterns**

#### **shadcn/ui + Tailwind Modern Stack**
- **No Direct Modifications**: Never edit shadcn/ui components directly
- **Custom Variants**: Extend through design system patterns
- **Healthcare Themes**: Semantic color tokens for medical contexts

#### **Accessibility Standards (WCAG 2.1 AA/AAA)**
```typescript
// ✅ REQUIRED: Healthcare accessibility patterns
<div
  role={priority === 'critical' ? 'alert' : 'status'}
  aria-live={priority === 'critical' ? 'assertive' : 'polite'}
  className="focus:ring-2 focus:ring-primary"
>
  {medicalAlert}
</div>
```

### **🔒 2025 Security & Compliance Patterns**

#### **Enhanced Error Boundaries (React 19)**
```typescript
// ✅ HEALTHCARE: Compliance-aware error handling
class MedicalErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // MANDATORY: HIPAA compliance logging
    logComplianceError(error, errorInfo, {
      patientDataInvolved: this.props.patientId,
      requiresNotification: error.name.includes('Security'),
      auditLevel: 'hipaa_compliant'
    });
  }
}
```

#### **Feature Flag Patterns (Not File Duplication)**
```rust
// ✅ CORRECT: Single file with conditional compilation
#[cfg(feature = "full-firebase")]
pub async fn sync_to_firebase() -> Result<()> { /* Full implementation */ }

#[cfg(not(feature = "full-firebase"))]
pub async fn sync_to_firebase() -> Result<()> { /* Mock implementation */ }
```

### **🚀 Performance Optimization (2025)**

#### **Bundle Splitting Strategy**
```typescript
// vite.config.ts - HEALTHCARE-OPTIMIZED
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'medical-core': ['./src/features/patients', './src/features/appointments'],
          'compliance': ['./src/features/audit', './src/features/compliance'],
          'encryption': ['./src/security/encryption'],
          'tanstack': ['@tanstack/react-query', '@tanstack/react-router'],
        }
      }
    }
  }
});
```

### **🔧 Advanced MCP Integration Patterns (Sept 2025)**

#### **Multi-Agent Orchestration**
- **Task Master AI**: Strategic project orchestration and intelligent task decomposition
- **Serena**: Semantic code analysis, symbolic editing, and architectural understanding
- **Firebase MCP**: Real-time database operations with emulator-first development
- **Kit MCP**: Repository-wide analysis and cross-platform code intelligence
- **Tavily MCP**: Research-augmented development with current best practices

#### **Hierarchical Context Loading (Advanced Pattern)**
```typescript
// ✅ ADVANCED: Hierarchical CLAUDE.md system (Sept 2025 Research)
// ROOT: /project/CLAUDE.md (Project constitution - universal rules)
// FEATURE: /project/src/features/patients/CLAUDE.md (Feature-specific context)
// DOMAIN: /project/src/security/CLAUDE.md (Domain-specific security rules)
// USER: ~/.claude/CLAUDE.md (Personal preferences and workflow)

// This creates a powerful layering system:
// 1. Most specific (feature-level) loaded first
// 2. Project-level constitution loaded second
// 3. User-level preferences loaded third
// 4. Enterprise policies loaded last
```

#### **Agent Coordination Workflows**
```typescript
// ✅ MODERN: Sophisticated multi-agent collaboration
const workflow = {
  planning: await mcp.task_master_ai.analyze_complexity(),
  research: await mcp.tavily.research_latest_patterns(),
  analysis: await mcp.serena.get_symbols_overview(),
  implementation: await mcp.kit.cross_platform_implementation(),
  validation: await mcp.firebase.test_with_emulator()
};
```

#### **Context Engineering Best Practices (Research-Backed)**
```markdown
## Advanced Context Patterns (Sept 2025)
1. **Living Document Principle**: CLAUDE.md must evolve with project
2. **Canary Instructions**: Include test instructions to verify file processing
3. **Rationale Provision**: Always explain WHY rules exist, not just WHAT they are
4. **Creative Framing**: Use memorable metaphors for critical rules
5. **Self-Improvement Loop**: AI reviews and suggests CLAUDE.md improvements
```

#### **Enforcement Mechanisms (Advanced)**
```markdown
## Anti-Rogue-Junior-Dev Toolkit
1. **Direct Reminders**: "First, review @CLAUDE.md section X, then implement Y"
2. **Canary Trick**: "Always refer to me as Captain" (verifies file read)
3. **Self-Correction Loops**: Force AI to state rules before implementation
4. **Rule Separation**: Critical rules in separate RULES.md for force-feeding
5. **Session Restart**: Use /clear to reload updated CLAUDE.md files
```

---


## Serena MCP Integration

For detailed guidance on using Serena MCP tools with this project, see the project-specific usage guide:
- **[Serena MCP Usage Guide](docs/serena-mcp-usage.md)** - Project-specific tool usage and workflows

### Quick Reference
The Serena MCP server provides semantic code analysis and editing capabilities optimized for this project:
- **Code Analysis**: `get_symbols_overview`, `find_symbol`, `find_referencing_symbols`
- **Code Editing**: `replace_symbol_body`, `insert_after_symbol`, `insert_before_symbol`
- **Project Management**: `activate_project`, memory tools, file operations

## 🧠 Project Brain System

**Project ID**: `968890c7-551f-4ea1-9b06-38d2ae80ba55`
**Initialized**: 2025-09-29T07:04:26.326Z
**Project Type**: tauri
**MCP Mode**: unified (30+ comprehensive tools)

### Brain Intelligence Features
- **Tool Usage Analytics**: Tracks which tools work best for different scenarios
- **Personal Pattern Learning**: Learns from your debugging style and preferences  
- **Project Evolution**: Records changes and their impact on debugging efficiency
- **Smart Recommendations**: Suggests optimal tools based on your usage patterns

---

## 🔧 MCP Server Configuration

Add this to your `.mcp.json`:

```json
{
  "mcpServers": {
    "psypsy-cms-debugger": {
      "command": "node",
      "args": ["build/unified-server.js"],
      "cwd": "/Users/andreichira/Documents/Mobile_App_Dev/PsyPsy/CMS/PsyPsyCMS"
    }
  }
}
```

### Available Tools (UNIFIED Mode)


#### Comprehensive Debugging Tools (30+ Tools)
- **Electron Tools**: start_electron_app, electron_evaluate, electron_reload, etc.
- **Tauri Tools**: start_tauri_app, get_tauri_console, get_tauri_errors, apply_tauri_autofix, etc.
- **Playwright Tools**: launch_playwright_app, playwright_interact, etc.
- **Analytics**: get_autofix_stats, performance tracking
- **Integration**: Task Master, iTerm2 automation

**Perfect for**: Direct debugging, error analysis, real-time console monitoring


---

## 📋 **MANDATORY PROJECT BRAIN RULES**

### **Change Tracking & Learning System** 
**⚠️ CRITICAL**: ALL significant changes MUST be logged to help the brain learn and improve recommendations.

#### **Change Log Table**
| Date | Change Type | Impact | Description | Tools Used | Learning |
|------|-------------|---------|-------------|------------|----------|
| 2025-09-29 | Project Init | High | Project brain initialized with unified mode | init_project | Solo developer with tauri project - brain will learn debugging patterns and tool preferences over time |
| 2025-09-29 | Code Standards | Critical | Created development standards to prevent duplicate files and enforce single source of truth policy | Kit MCP, Edit | User experienced proliferation of lib_full.rs, lib_minimal.rs variants - established central standards document and CLAUDE.md enforcement |
| 2025-09-29 | Best Practices | High | Updated CLAUDE.md with 2025 Claude Code best practices, modern Tauri patterns, and healthcare-specific workflows | Tavily MCP, Edit | Research revealed latest trends: vibe coding, agentic development, React 19 patterns, TanStack Query v5 syntax, and MCP coordination patterns |

#### **Update Procedures**
1. **Structural Changes**: Always log major architectural changes
2. **Tool Usage**: The brain automatically tracks which tools are most effective
3. **Team Patterns**: Document recurring issues and solutions
4. **Performance**: Track response times and success rates

### **Brain Analytics Integration**
The project brain continuously learns from:
- Tool usage patterns and effectiveness
- Common error types and resolutions  
- Team debugging workflows and preferences
- Project evolution and impact of changes

---

## 🎯 **TAURI Specific Optimizations**

### Tauri Debugging Excellence
- **Real-time Console**: Use `get_tauri_console` for WebView debugging
- **Error Analysis**: `get_tauri_errors` categorizes React, network, and Rust issues  
- **Auto-Fix**: `apply_tauri_autofix` learns from your codebase patterns
- **Performance**: Monitor bundle size and startup times

---

## 🎯 **My Debugging Patterns**

The brain will learn your debugging style and preferences:
- **Preferred Tools**: Tracks which tools you use most effectively
- **Common Issues**: Remembers problems you encounter frequently  
- **Successful Workflows**: Records debugging approaches that work well for you
- **Time Patterns**: Learns when you're most productive with different tools

---

## 📊 **Analytics & Learning**

Analytics Status: **ENABLED**

The project brain tracks:
- Tool effectiveness and response times
- Your personal debugging patterns and solutions
- Successful workflows and preferences
- Error resolution strategies and outcomes

**Brain Data Location**: `.cms-debugger-brain/analytics/`
**My Patterns**: `.cms-debugger-brain/team-knowledge/`

---

## 🚀 **Quick Start Commands**

### Tauri Development
```bash
# Start your tauri app with debugging
npm run tauri dev  # or bun run tauri dev

# Use MCP tools for debugging
# Direct debugging tools
start_tauri_app(appPath=".")
get_tauri_console(processId="your-process-id")
```

---

## 🔄 **Advanced Self-Improvement Protocol (Sept 2025)**

### **Living Document Evolution**
This CLAUDE.md implements advanced self-improvement patterns:

#### **Automated CLAUDE.md Enhancement**
```markdown
## Meta-Improvement Command: /project:reflection
When user types "/project:reflection", Claude MUST:

1. **Analyze Recent Session**: Review last 10-20 interactions for patterns
2. **Identify Gaps**: Find recurring issues or missing context
3. **Propose Updates**: Suggest specific CLAUDE.md improvements
4. **Rationale**: Explain WHY each proposed change would help
5. **Draft Changes**: Provide exact text for CLAUDE.md updates
```

#### **Continuous Learning Patterns**
- **Pattern Recognition**: Track what works well vs. what causes confusion
- **Rule Effectiveness**: Monitor which rules actually prevent problems
- **Context Optimization**: Identify which context is most valuable vs. noise
- **User Preference Learning**: Adapt to specific workflow and communication styles

#### **Healthcare Project Evolution**
```typescript
// ✅ PROJECT GROWTH: As PsyPsy CMS evolves, CLAUDE.md tracks:
interface ProjectEvolution {
  codebaseSize: 'growing' | 'stable' | 'refactoring';
  teamSize: 'solo' | 'small_team' | 'large_team';
  complianceMaturity: 'basic' | 'intermediate' | 'expert';
  aiIntegration: 'experimental' | 'production' | 'enterprise';
}
```

### **Current Status: September 2025**
- **Research Integration**: ✅ Latest Claude Code best practices integrated
- **Context Engineering**: ✅ Advanced instruction hierarchy implemented
- **Enforcement Patterns**: ✅ Anti-rogue-dev toolkit deployed
- **Self-Improvement**: ✅ Meta-learning protocols active
- **Healthcare Focus**: ✅ HIPAA/Quebec Law 25 compliance patterns embedded

---

**🧠 This CLAUDE.md implements 2025 cutting-edge context engineering and will continuously evolve through self-improvement protocols as PsyPsy CMS grows.**
