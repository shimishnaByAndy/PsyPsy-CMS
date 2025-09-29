# Development Rules & Patterns for PsyPsy CMS (September 2025)

**Last Updated**: September 2025
**Tech Stack**: Tauri 2.1+ | React 19 | TanStack Query v5 | TypeScript 5.3+

## 🏗️ Architecture Rules

### **AR-001: Feature-Based Architecture (MANDATORY)**
```
src/
├── features/                    # Business domain features
│   ├── authentication/         # Self-contained feature modules
│   │   ├── components/         # Feature-specific components
│   │   ├── hooks/              # Custom hooks for this feature
│   │   ├── services/           # API calls and business logic
│   │   ├── types/              # TypeScript definitions
│   │   ├── utils/              # Helper functions
│   │   └── index.ts            # Public API exports ONLY
│   ├── patients/
│   ├── appointments/
│   └── medical-notes/
├── shared/                      # Cross-feature shared code ONLY
│   ├── components/             # Reusable UI components
│   ├── hooks/                  # Generic custom hooks
│   ├── services/               # Common API services
│   ├── utils/                  # Utility functions
│   └── types/                  # Global type definitions
├── app/                        # Application-level code
│   ├── providers/              # Context providers
│   ├── router/                 # Routing configuration
│   └── store/                  # Global state management
└── assets/                     # Static assets
```

**RULE**: Each feature MUST be completely self-contained. No deep imports allowed (e.g., `@features/patients/components/internal/helper` is FORBIDDEN).

### **AR-002: Tauri Project Structure (MANDATORY)**
```
src-tauri/src/
├── commands/                   # Tauri command handlers
│   ├── mod.rs                 # Module declarations
│   ├── auth.rs                # Authentication commands
│   ├── patients.rs            # Patient management
│   └── medical_notes.rs       # Medical notes operations
├── services/                   # Business logic services
│   ├── mod.rs
│   ├── auth_service.rs        # Authentication service
│   ├── database.rs            # Database operations
│   └── encryption.rs          # Security services
├── models/                     # Data models
├── utils/                      # Utility functions
├── plugins/                    # Custom Tauri plugins
├── lib.rs                     # Main library entry
└── main.rs                    # Application entry point
```

**RULE**: All Tauri commands MUST be organized by business domain, not technical function.

## ⚛️ React 19 Rules

### **R19-001: React Compiler Optimization (MANDATORY)**
```typescript
// ✅ CORRECT: Let React Compiler handle optimization
const PatientDashboard = ({ patientId }: { patientId: string }) => {
  // No manual useMemo/useCallback needed
  const expensiveCalculation = computePatientRiskScore(patientData, historicalData)

  const handlePatientUpdate = (data: PatientUpdate) => {
    updatePatient(patientId, data)
    logAuditEvent('patient_updated', { patientId, data })
  }

  return <PatientCard onUpdate={handlePatientUpdate} />
}

// ❌ FORBIDDEN: Manual memoization when React Compiler is enabled
const PatientDashboard = memo(({ patientId }) => {
  const expensiveCalculation = useMemo(() =>
    computePatientRiskScore(patientData, historicalData), [patientData, historicalData])

  const handlePatientUpdate = useCallback((data) => {
    updatePatient(patientId, data)
  }, [patientId])

  return <PatientCard onUpdate={handlePatientUpdate} />
})
```

**RULE**: Never use manual `memo`, `useMemo`, or `useCallback` when React Compiler is enabled. Let the compiler optimize automatically.

### **R19-002: Enhanced use() API (REQUIRED)**
```typescript
// ✅ CORRECT: Use use() for promises in render
const PatientDetails = ({ patientPromise }: { patientPromise: Promise<Patient> }) => {
  const patient = use(patientPromise)
  return <PatientCard patient={patient} />
}

// ❌ FORBIDDEN: useEffect for promise handling in render
const PatientDetails = ({ patientId }: { patientId: string }) => {
  const [patient, setPatient] = useState<Patient | null>(null)

  useEffect(() => {
    fetchPatient(patientId).then(setPatient)
  }, [patientId])

  if (!patient) return <Loading />
  return <PatientCard patient={patient} />
}
```

**RULE**: Always use `use()` API for promise-based data fetching in components. Avoid `useEffect` for data fetching.

### **R19-003: Enhanced Error Boundaries (MANDATORY)**
```typescript
// ✅ REQUIRED: Enhanced error boundaries for medical apps
class MedicalDataErrorBoundary extends Component {
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      errorType: error.name.includes('HIPAA') ? 'compliance' : 'technical',
      canRetry: !error.message.includes('permanent'),
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // MANDATORY: Enhanced logging for medical compliance
    logComplianceError(error, errorInfo, {
      patientDataInvolved: this.props.patientId,
      timestamp: new Date().toISOString(),
      requiresNotification: error.name.includes('Security')
    })
  }
}
```

**RULE**: All error boundaries MUST implement compliance-aware error categorization and logging.

## 🔍 TanStack Query v5 Rules

### **TQ5-001: Breaking Changes Compliance (MANDATORY)**
```typescript
// ✅ CORRECT: v5 terminology
const { data, isPending, isError } = useQuery({
  queryKey: ['patients'],
  queryFn: fetchPatients,
  throwOnError: true,  // Renamed from useErrorBoundary
})

// ❌ FORBIDDEN: v4 terminology
const { data, isLoading, isError } = useQuery({
  queryKey: ['patients'],
  queryFn: fetchPatients,
  useErrorBoundary: true,  // Old v4 syntax
})
```

**RULE**: Always use v5 terminology: `isPending` (not `isLoading`), `throwOnError` (not `useErrorBoundary`).

### **TQ5-002: Enhanced Query Patterns (REQUIRED)**
```typescript
// ✅ CORRECT: Enhanced mutation with audit trails
const usePatientMutation = () => {
  return useMutation({
    mutationFn: updatePatient,
    throwOnError: true,
    retry: (failureCount, error) => {
      if (error.message.includes('HIPAA_VIOLATION')) return false
      return failureCount < 3
    },
    onMutate: async (variables) => {
      // MANDATORY: Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['patients', variables.id] })

      // MANDATORY: Snapshot for rollback
      const previous = queryClient.getQueryData(['patients', variables.id])

      // MANDATORY: Optimistic update with audit info
      queryClient.setQueryData(['patients', variables.id], (old: Patient) => ({
        ...old,
        ...variables,
        updatedAt: new Date().toISOString(),
        status: 'pending_update'
      }))

      return { previous }
    }
  })
}
```

**RULE**: All mutations MUST implement optimistic updates with proper rollback and audit trails.

### **TQ5-003: Query Composition (MANDATORY)**
```typescript
// ✅ CORRECT: Type-safe query composition
const useMedicalRecordData = (patientId: string) => {
  const patientQuery = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => invoke<Patient>('get_patient', { id: patientId }),
    staleTime: 5 * 60 * 1000
  })

  const appointmentsQuery = useQuery({
    queryKey: ['appointments', patientId],
    queryFn: () => invoke<Appointment[]>('get_patient_appointments', { patientId }),
    enabled: !!patientQuery.data,
    placeholderData: [] // v5 pattern for empty states
  })

  // MANDATORY: Return as const for better type inference
  return {
    patient: patientQuery.data,
    appointments: appointmentsQuery.data ?? [],
    isLoading: patientQuery.isPending || appointmentsQuery.isPending,
    hasError: patientQuery.isError || appointmentsQuery.isError,
    isComplete: patientQuery.isSuccess && appointmentsQuery.isSuccess,
    canEdit: patientQuery.data?.status === 'active' && !appointmentsQuery.isPending
  } as const
}
```

**RULE**: Always use `as const` for return objects in custom hooks for better TypeScript inference.

## 🖥️ Tauri 2.1+ Rules

### **T21-001: Universal Entry Point (MANDATORY)**
```rust
// ✅ CORRECT: Universal entry point for desktop and mobile
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**RULE**: Always use the universal entry point pattern for cross-platform compatibility.

### **T21-002: Enhanced Plugin System (REQUIRED)**
```rust
// ✅ CORRECT: Enhanced plugin configuration
fn main() {
    tauri::Builder::default()
        .plugin(MedicalRecordsPlugin::new()
            .with_encryption(EncryptionLevel::HIPAA)
            .with_audit_trail(true)
            .with_quebec_law25_compliance(true))
        .plugin(tauri_plugin_biometric_auth::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**RULE**: Always configure plugins with appropriate security levels for medical applications.

### **T21-003: Type-Safe Commands (MANDATORY)**
```typescript
// ✅ CORRECT: Type-safe Tauri API wrapper
type TauriCommand<T = any, P = any> = {
  name: string
  input: P
  output: T
  errors: string[]
}

const createTauriAPI = <T extends Record<string, TauriCommand>>(commands: T) => {
  return Object.fromEntries(
    Object.entries(commands).map(([key, command]) => [
      key,
      async (input: typeof command.input): Promise<typeof command.output> => {
        try {
          return await invoke(command.name, input)
        } catch (error) {
          throw new TauriCommandError(
            error as string,
            command.name,
            input,
            {
              canRetry: !command.errors.includes(error as string),
              requiresUserAction: (error as string).includes('permission'),
              severity: (error as string).includes('security') ? 'critical' : 'normal'
            }
          )
        }
      }
    ])
  ) as {
    [K in keyof T]: (input: T[K]['input']) => Promise<T[K]['output']>
  }
}
```

**RULE**: Always use type-safe wrappers for Tauri commands with proper error categorization.

## 🎨 Styling Rules

### **S-001: shadcn/ui + Tailwind Architecture (MANDATORY)**
```
src/
├── components/ui/              # shadcn/ui base components (DO NOT MODIFY)
├── components/design-system/   # Custom design tokens
│   ├── tokens.ts              # Design tokens
│   ├── themes.ts              # Theme definitions
│   └── variants.ts            # Component variants
└── styles/
    ├── globals.css            # Global styles and CSS variables
    ├── components.css         # Component-specific styles
    └── themes/                # Theme-specific overrides
        ├── light.css
        ├── dark.css
        └── healthcare.css     # Domain-specific theme
```

**RULE**: Never modify shadcn/ui components directly. Always create custom variants or extend through design system.

### **S-002: Design Tokens (REQUIRED)**
```typescript
// ✅ CORRECT: Semantic design tokens
export const designTokens = {
  colors: {
    medical: {
      success: '#22c55e',   // Healthy indicators
      warning: '#f59e0b',   // Attention needed
      critical: '#ef4444',  // Critical alerts
      phi: '#8b5cf6',       // PHI data indicators
    }
  },
  spacing: {
    'card-padding': '1.5rem',
    'section-gap': '2rem',
    'form-field-gap': '1rem',
  },
  typography: {
    'heading-medical': ['1.25rem', { fontWeight: '600', lineHeight: '1.5' }],
    'body-phi': ['0.875rem', { fontWeight: '500', letterSpacing: '0.025em' }],
  }
}
```

**RULE**: Always use semantic naming for design tokens related to medical/healthcare context.

## 🚀 Performance Rules

### **P-001: Bundle Splitting (MANDATORY)**
```typescript
// vite.config.ts - REQUIRED configuration
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // MANDATORY: Separate medical core from other features
          'medical-core': ['./src/features/patients', './src/features/appointments'],
          'compliance': ['./src/features/audit', './src/features/compliance'],
          'charts': ['recharts', 'react-chartjs-2'],
          'tanstack': ['@tanstack/react-query', '@tanstack/react-router'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-select']
        }
      }
    }
  }
})
```

**RULE**: Medical core features MUST be in separate chunks from non-critical features.

### **P-002: Lazy Loading (REQUIRED)**
```typescript
// ✅ CORRECT: Enhanced lazy loading with preloading
const createFeatureModule = <T extends Record<string, any>>(
  config: FeatureModuleConfig<T>
) => {
  return {
    Component: lazy(() => import(`../features/${config.name}/index.tsx`)),
    preload: () => import(`../features/${config.name}/index.tsx`),
    ErrorBoundary: config.ErrorBoundary ?? DefaultFeatureErrorBoundary,
    permissions: config.permissions ?? [],
    auditLevel: config.auditLevel ?? 'standard'
  }
}
```

**RULE**: All feature modules MUST implement lazy loading with preloading capabilities.

## 🔐 Security Rules

### **SEC-001: HIPAA Compliance (MANDATORY)**
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

**RULE**: All error handling MUST include HIPAA compliance logging with patient data tracking.

### **SEC-002: PHI Data Handling (MANDATORY)**
```typescript
// ✅ CORRECT: PHI-aware data handling
const handlePatientData = (data: PatientData) => {
  // MANDATORY: Mark PHI fields
  const sanitizedData = {
    ...data,
    ssn: markAsPHI(data.ssn),
    medicalHistory: markAsPHI(data.medicalHistory),
    // Non-PHI fields remain unmarked
    name: data.name,
    id: data.id
  }

  // MANDATORY: Audit all PHI access
  auditPHIAccess('view', sanitizedData.id, getCurrentUser().id)

  return sanitizedData
}
```

**RULE**: All PHI data MUST be explicitly marked and audited.

## 📝 TypeScript Rules

### **TS-001: Strict Type Safety (MANDATORY)**
```typescript
// ✅ CORRECT: Strict typing with branded types for medical IDs
type PatientId = string & { readonly brand: unique symbol }
type AppointmentId = string & { readonly brand: unique symbol }

const createPatientId = (id: string): PatientId => id as PatientId
const createAppointmentId = (id: string): AppointmentId => id as AppointmentId

// MANDATORY: Use branded types for medical identifiers
const getPatient = (id: PatientId): Promise<Patient> => {
  return invoke('get_patient', { id })
}
```

**RULE**: Always use branded types for medical identifiers to prevent ID mixing bugs.

### **TS-002: Generic Constraints (REQUIRED)**
```typescript
// ✅ CORRECT: Constrained generics for medical data
type MedicalRecord<T extends 'patient' | 'appointment' | 'note'> = {
  id: T extends 'patient' ? PatientId :
      T extends 'appointment' ? AppointmentId :
      NoteId
  type: T
  data: T extends 'patient' ? PatientData :
        T extends 'appointment' ? AppointmentData :
        NoteData
  phi: boolean
  auditTrail: AuditEntry[]
}
```

**RULE**: Use constrained generics for type-safe medical record handling.

## 🧪 Testing Rules

### **TEST-001: Feature Testing (MANDATORY)**
```typescript
// ✅ REQUIRED: Feature-based test organization
// tests/features/patients/patients.test.tsx
describe('Patients Feature', () => {
  beforeEach(() => {
    // MANDATORY: Reset query client between tests
    queryClient.clear()
    // MANDATORY: Mock HIPAA compliance
    mockHIPAACompliance()
  })

  it('should audit all patient data access', async () => {
    const auditSpy = jest.spyOn(auditService, 'logPHIAccess')

    render(<PatientsList />, { wrapper: TestQueryProvider })

    await waitFor(() => {
      expect(auditSpy).toHaveBeenCalledWith('view', expect.any(String), expect.any(String))
    })
  })
})
```

**RULE**: All tests MUST include HIPAA compliance validation and audit verification.

## 📚 Documentation Rules

### **DOC-001: Component Documentation (REQUIRED)**
```typescript
/**
 * PatientCard - Displays patient information with HIPAA compliance
 *
 * @example
 * ```tsx
 * <PatientCard
 *   patient={patient}
 *   showPHI={false}  // Default: false for privacy
 *   onEdit={handleEdit}
 * />
 * ```
 *
 * @param patient - Patient data object
 * @param showPHI - Whether to display PHI fields (requires audit)
 * @param onEdit - Callback when edit is triggered (optional)
 *
 * @compliance HIPAA - All PHI access is automatically audited
 * @audit-level standard
 */
```

**RULE**: All components handling medical data MUST include compliance documentation.

## 🚫 Forbidden Patterns

### **NEVER DO THESE:**

1. **❌ Direct PHI logging**: `console.log(patient.ssn)`
2. **❌ Unaudited PHI access**: Direct database queries without audit trails
3. **❌ Mixed medical IDs**: Using string instead of branded types for medical IDs
4. **❌ Manual memoization**: With React Compiler enabled
5. **❌ Deep feature imports**: Importing internal feature files directly
6. **❌ Untyped Tauri commands**: Using raw `invoke()` without type safety
7. **❌ v4 TanStack syntax**: Using `isLoading` or `useErrorBoundary`
8. **❌ Modifying shadcn/ui**: Directly editing shadcn/ui component files

## 🔄 Migration Checklist

When updating existing code:

- [ ] Replace `isLoading` with `isPending`
- [ ] Replace `useErrorBoundary` with `throwOnError`
- [ ] Remove manual `memo`, `useMemo`, `useCallback`
- [ ] Add branded types for medical IDs
- [ ] Implement compliance error boundaries
- [ ] Add audit logging for all PHI access
- [ ] Update Tauri commands to use type-safe wrappers
- [ ] Migrate to feature-based architecture
- [ ] Add proper bundle splitting configuration

---

**Compliance Level**: HIPAA + Quebec Law 25
**Last Reviewed**: September 2025
**Next Review**: December 2025