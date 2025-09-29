# PsyPsy CMS - Development Standards & Policies
**Last Updated**: September 29, 2025
**Audience**: All AI agents and developers
**Enforcement**: Mandatory for all code changes

## 🚫 **FORBIDDEN DEVELOPMENT PATTERNS**

### **NEVER Create Multiple Versions of the Same File**

**❌ PROHIBITED FILE NAMING PATTERNS:**
- `lib_full.rs`, `lib_minimal.rs`, `lib_enhanced.rs`
- `config_basic.ts`, `config_advanced.ts`, `config_premium.ts`
- `service_v1.ts`, `service_v2.ts`, `service_v3.ts`
- `component_simple.tsx`, `component_complex.tsx`
- Any file with suffixes: `_minimal`, `_full`, `_enhanced`, `_basic`, `_advanced`, `_premium`, `_v1`, `_v2`, etc.

**✅ CORRECT APPROACH:**
- **ONE file per purpose**: `lib.rs`, `config.ts`, `service.ts`, `component.tsx`
- **Use feature flags or configuration** for different functionality levels
- **Use conditional compilation** (`#[cfg(feature = "...")]` in Rust, environment variables in TypeScript)

### **File Duplication Prevention Rules**

#### **Rule 1: Single Source of Truth**
- Each functionality MUST have exactly ONE implementation file
- Use configuration, feature flags, or conditional compilation for variations
- Delete unused alternative files immediately

#### **Rule 2: Feature Flag Pattern**
```rust
// ✅ CORRECT: Single file with feature flags
#[cfg(feature = "full-firebase")]
pub async fn initialize_firebase_full() -> Result<FirebaseService> { ... }

#[cfg(not(feature = "full-firebase"))]
pub async fn initialize_firebase_minimal() -> Result<MockFirebaseService> { ... }
```

```typescript
// ✅ CORRECT: Single file with environment-based behavior
const isDevelopment = process.env.NODE_ENV === 'development';
const firebaseConfig = isDevelopment ? mockConfig : productionConfig;
```

#### **Rule 3: Temporary Functionality Disabling**
When testing requires disabling certain features, document it in this central location:

---

## 📋 **TEMPORARY FEATURE TOGGLES**

### **Currently Disabled Features**
*Document any temporarily disabled functionality here*

| Feature | Status | Reason | Date Disabled | Re-enable When | Agent Responsible |
|---------|--------|--------|---------------|----------------|-------------------|
| *None currently* | - | - | - | - | - |

### **Feature Toggle Instructions**

#### **To Temporarily Disable a Feature:**
1. **Document here first** - Add entry to the table above
2. **Use feature flags** - Don't create new files
3. **Add TODO comments** - Reference this document
4. **Set reminder** - Include re-enable conditions

#### **Example Proper Disabling:**
```rust
// TODO: Re-enable when Firebase emulator is stable
// See docs/DEVELOPMENT_STANDARDS.md "Temporary Feature Toggles" section
#[cfg(not(feature = "disable-firebase-during-testing"))]
pub async fn sync_to_firebase() -> Result<()> {
    // Implementation here
}
```

---

## 🏗️ **ARCHITECTURE STANDARDS**

### **File Organization Principles**

#### **1. Single Responsibility**
- Each file serves ONE clear purpose
- No "kitchen sink" files with mixed responsibilities
- Clear naming that indicates exact purpose

#### **2. No Experimental Files in Main Code**
- Experimental code goes in `/experiments/` directory (gitignored)
- Prototypes stay out of `/src/` directory
- Working implementations replace prototypes, not alongside them

#### **3. Configuration-Driven Variation**
```rust
// ✅ CORRECT: Configuration-driven behavior
pub struct ServiceConfig {
    pub use_full_features: bool,
    pub enable_encryption: bool,
    pub debug_mode: bool,
}

impl Service {
    pub fn new(config: ServiceConfig) -> Self {
        // Single implementation that varies by configuration
    }
}
```

### **Code Evolution Pattern**

#### **Development Phases:**
1. **Prototype** (in `/experiments/` directory)
2. **Implementation** (replaces prototype in `/src/`)
3. **Enhancement** (modify existing, don't duplicate)
4. **Maintenance** (continuous improvement of single implementation)

**❌ NEVER:**
- Keep prototype alongside implementation
- Create "enhanced" versions of existing files
- Maintain multiple parallel implementations

---

## 🧪 **TESTING & EXPERIMENTATION POLICIES**

### **Proper Experimentation Workflow**

#### **For Testing Different Approaches:**
1. **Create branch**: `git checkout -b experiment/feature-name`
2. **Use `/experiments/` directory** for prototypes
3. **Document in this file** if disabling existing features
4. **Replace or integrate** when experiment succeeds
5. **Clean up** experimental code before merging

#### **For A/B Testing Features:**
```typescript
// ✅ CORRECT: Single file with A/B logic
const useExperimentalFeature = process.env.EXPERIMENT_FEATURE_X === 'true';

if (useExperimentalFeature) {
    // New implementation
} else {
    // Current implementation
}
```

### **Testing with Disabled Features**

#### **When Temporarily Disabling for Testing:**
1. **Document in the table above**
2. **Use environment variables or feature flags**
3. **Add clear TODO comments with re-enable conditions**
4. **Set calendar reminder to re-enable**

```rust
// ✅ CORRECT: Temporary disabling with documentation
#[cfg(not(feature = "testing-without-firebase"))]
pub async fn save_to_firebase() -> Result<()> {
    // TODO: Re-enable after emulator stability fixes
    // See DEVELOPMENT_STANDARDS.md - Added 2025-09-29
    // Re-enable when: Firebase emulator connects consistently
}
```

---

## 🚨 **VIOLATION DETECTION & ENFORCEMENT**

### **Automated Checks**
These patterns trigger automatic violations:

1. **Multiple lib files**: `lib*.rs` (except main `lib.rs`)
2. **Versioned files**: `*_v1.*`, `*_v2.*`, etc.
3. **Variant files**: `*_minimal.*`, `*_full.*`, `*_enhanced.*`
4. **Duplicate functionality**: Files with >80% similar function signatures

### **Agent Responsibilities**

#### **When Creating New Files:**
1. **Check for existing similar files** before creating
2. **Verify file serves unique purpose**
3. **Use configuration/feature flags for variations**
4. **Update this document** if temporarily disabling features

#### **When Finding Duplicate Files:**
1. **Identify which file is actively used**
2. **Verify no references exist to unused files**
3. **Delete unused files immediately**
4. **Report cleanup action to user**

#### **When Modifying Existing Files:**
1. **Never create "enhanced" versions**
2. **Modify existing file in place**
3. **Use feature flags for conditional behavior**
4. **Document breaking changes in changelog**

---

## 🎯 **SUCCESS METRICS**

### **Clean Codebase Indicators**
- ✅ **One file per responsibility**
- ✅ **No duplicate/variant files**
- ✅ **Clear, descriptive file names**
- ✅ **Configuration-driven behavior variations**
- ✅ **All temporary disables documented**

### **Red Flags**
- ❌ Multiple files with similar names
- ❌ Files with version/variant suffixes
- ❌ Undocumented feature disabling
- ❌ Experimental code in production directories

---

## 🔄 **MAINTENANCE SCHEDULE**

### **Weekly Reviews**
- [ ] Check for duplicate files
- [ ] Review temporary feature toggles
- [ ] Verify experimental cleanup

### **Monthly Audits**
- [ ] Full codebase duplicate detection
- [ ] Unused feature flag cleanup
- [ ] Documentation accuracy verification

---

**Remember**: When in doubt, modify existing files rather than creating new ones. Use configuration and feature flags to handle variations. Keep the codebase clean and maintainable by having exactly one implementation per feature.