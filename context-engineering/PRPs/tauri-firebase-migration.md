# PRP: PsyPsy CMS Tauri 2.0 + Firebase Migration Implementation

## Feature Overview

**Project**: PsyPsy CMS - Healthcare Management System
**Project Path**: `/Users/andreichira/Documents/Mobile_App_Dev/PsyPsy/CMS/context-engineering/tauri-app`
**Current Status**: 5% Complete (UI shell exists, backend missing)
**Target**: Tauri 2.0 desktop app with Firebase backend replacing Electron + Parse Server
**Critical Requirements**: HIPAA compliance, offline support, real-time sync
**Confidence Score**: 8/10 for one-pass implementation

## Important Instructions for AI Agent

**WHEN IMPLEMENTING THIS PRP**:
1. **Ask Questions**: Use `mcp__deepwiki__ask_question` to ask ONE specific question at a time about any GitHub repository when you need clarification
2. **Analyze Code**: Use `mcp__kit__` tools to analyze and explore any Git repository mentioned below for implementation patterns
3. **Web Searches**: Use `mcp__tavily__` tools to search for any additional documentation, examples, or troubleshooting guides
4. **Be Specific**: When uncertain about implementation details, ASK rather than assume. One question at a time for clarity.

## Context & Resources

### Git Repositories to Analyze (Use kit mcp)

**INSTRUCTION**: Use `mcp__kit__open_repository` followed by search/analysis tools for each repo:

1. **Firestore Rust Client** - PRIMARY REFERENCE
   - URL: `https://github.com/abdolence/firestore-rs`
   - Purpose: Production Firestore integration patterns
   - Key Files: `/examples/`, `/src/fluent_api/`, `/src/cache/`
   - Use for: CRUD operations, transactions, real-time listeners, caching

2. **Firebase Admin SDK for Rust**
   - URL: `https://github.com/expl/rs-firebase-admin-sdk`
   - Purpose: Firebase authentication patterns
   - Key Files: `/examples/verify_token/`, `/src/auth/`
   - Use for: Token verification, user management, session handling

3. **Tauri Core Repository**
   - URL: `https://github.com/tauri-apps/tauri`
   - Purpose: Tauri command patterns and state management
   - Key Files: `/examples/`, `/core/tauri/src/command.rs`
   - Use for: Async commands, State handling, IPC patterns

4. **Tauri Plugin Examples**
   - URL: `https://github.com/tauri-apps/awesome-tauri`
   - Purpose: Real-world Tauri app examples
   - Search for: Firebase integration, authentication patterns

5. **Rust Crypto Libraries**
   - URL: `https://github.com/RustCrypto/AEADs`
   - Purpose: AES-256-GCM encryption implementation
   - Key Files: `/aes-gcm/examples/`
   - Use for: HIPAA-compliant encryption

6. **Google Cloud Rust Samples**
   - URL: `https://github.com/GoogleCloudPlatform/rust-docs-samples`
   - Purpose: GCP/Firebase service account setup
   - Search for: Firestore examples, authentication patterns

### Documentation & Web Resources (Use tavily mcp)

**INSTRUCTION**: Use `mcp__tavily__tavily-search` for these topics when needed:

#### Firebase Documentation
- Firebase Admin SDK setup for Rust
- Firebase service account configuration
- Firestore security rules for healthcare
- Firebase Auth custom claims for RBAC

#### Tauri Documentation
- **Commands**: https://v2.tauri.app/develop/calling-rust/
- **Async Patterns**: https://sneakycrow.dev/blog/2024-05-12-running-async-tasks-in-tauri-v2
- **State Management**: https://v2.tauri.app/develop/state-management/

#### HIPAA Compliance
- HIPAA Security Rule 2024 updates
- Healthcare encryption requirements (AES-256)
- Audit logging retention (6 years)
- PHI data handling best practices

### Mobile App Firebase Structure (Reference for Desktop Tables)

**IMPORTANT**: The mobile app uses this Firebase structure. The desktop CMS must display and manage ALL this data:

#### Firebase Collections
```typescript
FIREBASE_COLLECTIONS = {
  APPOINTMENTS: 'appointments',
  CLIENTS: 'clients',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  PROFESSIONALS: 'professionals',
  TIME_SLOT_OFFERS: 'timeSlotOffers',
  USER_PROFILES: 'userProfiles',
  USERS: 'users',
}
```

#### Primary Data Models to Display in Desktop CMS

**1. BaseUser (Foundation)**
```typescript
type BaseUser = {
  createdAt: string;
  email: string;
  objectId: string;
  updatedAt: string;
  username: string;
  userType: 'client' | 'professional' | 'admin';
}
```

**2. Professional (Main CMS Focus)**
```typescript
type Professional = {
  // Location & Contact
  addressObj: AddressObject;
  geoPt?: GeoPoint;
  phoneNb: PhoneNumber;
  bussEmail: string;
  businessName: string;

  // Professional Details
  profType: number;
  eduInstitute: number;
  motherTongue: number;
  offeredLangArr: number[];

  // Services & Expertise
  expertises: ExpertiseObject[];
  servOfferedArr: number[];
  servOfferedObj: Record<number, ServiceObject>;
  servedClientele: number[];

  // Business Operations
  availability: number[];
  meetType: 0 | 1 | 2; // 0=both, 1=in-person, 2=online
  thirdPartyPayers: number[];
  partOfOrder: OrderInfo;
} & UserProfile
```

**3. Client**
```typescript
type Client = {
  addressObj: AddressObject;
  geoPt?: GeoPoint;
  searchRadius: number; // km
  spokenLangArr: number[];
} & UserProfile
```

**4. Appointment (Critical for CMS)**
```typescript
type Appointment = {
  createdAt: string;
  objectId: string;
  updatedAt: string;
  clientPtr: string; // Client ID

  // Requirements
  profTypesArr: number[];
  serviceType: number;
  subcategsIndArr: number[];

  // Preferences
  genderPref: 0 | 1 | 2; // 0=none, 1=male, 2=female
  langPref: number;
  meetPref: 'in_person' | 'online' | 'both';

  // Scheduling
  availArr: number[];
  preferredDateTime?: string;
  sessionDuration?: number;

  // Status
  assignedProfessional?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  estimatedCost?: number;
}
```

**5. Supporting Structures**
```typescript
type AddressObject = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

type ExpertiseObject = {
  category: number;
  subcategories: number[];
  experience: number;
  certification?: string;
}

type ServiceObject = {
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  currency: string;
}
```

### Existing Codebase References

#### Current Implementation Status
- **Tauri Backend**: `/src-tauri/src/lib.rs` - Basic 2 commands only
- **Security Module**: `/src-tauri/src/security/auth.rs` - Firebase auth structure exists
- **Frontend API**: `/src/services/api.ts` - Complete API layer calling non-existent commands
- **Dependencies**: `/src-tauri/Cargo.toml` - Security libs included, Firebase libs missing

#### Key Patterns to Follow
```rust
// From existing auth.rs - Follow this JWT pattern
pub async fn create_session(
    &self,
    user: &FirebaseUser,
    role: HealthcareRole,
    ip_address: Option<String>,
    user_agent: Option<String>,
) -> Result<SecuritySession, SecurityError>

// From api.ts - Match these command invocations
async invokeCommand<T>(command: string, args?: Record<string, any>): Promise<T>
```

## Implementation Blueprint

### Phase 1: Firebase Setup & Integration

```rust
// 1. Add to Cargo.toml dependencies
[dependencies]
firestore = "0.47"
rs-firebase-admin-sdk = "1.0"
gcloud-sdk = "0.25"
rustls = "0.23"  # TLS provider
tracing = "0.1"  # For audit logging
tracing-subscriber = { version = "0.3", features = ["env-filter", "json"] }

// 2. Create src-tauri/src/services/firebase_service.rs
use firestore::{FirestoreDb, FirestoreDbOptions, FirestoreResult};
use rs_firebase_admin_sdk::{App, auth::FirebaseAuthService, credentials_provider};
use std::sync::Arc;

pub struct FirebaseService {
    app: App,
    db: FirestoreDb,
    auth: Arc<FirebaseAuthService>,
}

impl FirebaseService {
    pub async fn new(project_id: &str, service_account_path: &str) -> Result<Self, Box<dyn Error>> {
        // Install TLS provider
        rustls::crypto::ring::default_provider()
            .install_default()
            .expect("Failed to install rustls crypto provider");

        // Initialize Firestore with fluent API support
        let db = FirestoreDb::with_options_service_account_key_file(
            FirestoreDbOptions::new(project_id.to_string()),
            service_account_path.into()
        ).await?;

        // Initialize Firebase Admin SDK for auth
        let gcp_sa = credentials_provider::from_file(service_account_path).await?;
        let app = App::live(gcp_sa).await?;
        let auth = Arc::new(app.auth());

        Ok(Self { app, db, auth })
    }
}
```

### Phase 2: Tauri Command Implementation

```rust
// src-tauri/src/commands/auth_commands.rs
use tauri::State;
use crate::services::FirebaseService;

#[tauri::command]
pub async fn auth_login(
    email: String,
    password: String,
    firebase: State<'_, Arc<Mutex<FirebaseService>>>,
) -> Result<AuthResponse, String> {
    let firebase = firebase.lock().await;

    // Verify with Firebase Auth
    let token = firebase.auth
        .verify_id_token(&id_token)
        .await
        .map_err(|e| e.to_string())?;

    // Create session (using existing auth.rs pattern)
    let session = firebase.create_session(&user, role, ip, user_agent)
        .await
        .map_err(|e| e.to_string())?;

    Ok(AuthResponse {
        user: user.into(),
        access_token: session.access_token,
        refresh_token: session.refresh_token,
    })
}

// Pattern for all CRUD operations using Firestore fluent API
#[tauri::command]
pub async fn get_clients(
    page: u32,
    limit: u32,
    filters: Option<SearchFilters>,
    firebase: State<'_, Arc<Mutex<FirebaseService>>>,
    auth: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<PaginatedResponse<Client>, String> {
    // Verify authentication
    let auth_state = auth.read().await;
    if !auth_state.is_authenticated() {
        return Err("Unauthorized".to_string());
    }

    // Query Firestore using fluent API
    let firebase = firebase.lock().await;

    // Build query with filters
    let clients_stream = firebase.db
        .fluent()
        .select()
        .from("clients")
        .filter(|q| {
            let mut conditions = vec![];

            if let Some(ref f) = filters {
                if let Some(status) = &f.status {
                    conditions.push(q.field(path!(Client::status)).eq(status));
                }
                if let Some(assigned_to) = &f.assigned_professional {
                    conditions.push(
                        q.field(path!(Client::assigned_professionals))
                            .contains(&assigned_to)
                    );
                }
            }

            q.for_all(conditions.into_iter().flatten())
        })
        .order_by([(path!(Client::created_at), FirestoreQueryDirection::Descending)])
        .page_size(limit)
        .page(page)
        .obj::<Client>()
        .stream_query_with_errors()
        .await
        .map_err(|e| e.to_string())?;

    // Collect results
    let clients: Vec<Client> = clients_stream
        .try_collect()
        .await
        .map_err(|e| e.to_string())?;

    // Audit log the access
    firebase.audit_log(
        "LIST_CLIENTS",
        &format!("page={},limit={}", page, limit),
        &auth_state.user_id
    ).await?;

    Ok(PaginatedResponse {
        data: clients,
        page,
        limit,
        total: clients.len() as u32,
    })
}
```

### Phase 3: Data Models & Firestore Operations

```rust
// src-tauri/src/models/mod.rs
use serde::{Deserialize, Serialize};
use firestore::FirestoreTimestamp;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Client {
    #[serde(default)]
    pub id: String,
    pub user_id: String,
    pub personal_info: PersonalInfo,
    pub medical_info: MedicalInfo,
    pub preferences: ClientPreferences,
    pub assigned_professionals: Vec<String>,
    pub status: ClientStatus,
    pub created_at: FirestoreTimestamp,
    pub updated_at: FirestoreTimestamp,
}

// Implement Firestore traits
impl firestore::FirestoreSerializable for Client {
    fn to_document(&self) -> firestore::FirestoreDocument {
        firestore::to_document(self).unwrap()
    }
}

// src-tauri/src/services/firestore_service.rs
impl FirestoreService {
    pub async fn create_client(&self, client: Client) -> FirestoreResult<String> {
        // Encrypt sensitive data before storing
        let encrypted_client = self.encrypt_sensitive_fields(client)?;

        // Create in Firestore
        let doc_id = self.db
            .fluent()
            .insert()
            .into("clients")
            .document_id(Uuid::new_v4().to_string())
            .object(&encrypted_client)
            .execute()
            .await?;

        // Audit log
        self.audit_log("CREATE_CLIENT", &doc_id, None).await?;

        Ok(doc_id)
    }
}
```

### Phase 4: Security & HIPAA Implementation

```rust
// src-tauri/src/security/crypto.rs
use aes_gcm::{Aes256Gcm, Key, Nonce};
use aes_gcm::aead::{Aead, NewAead};

pub struct CryptoService {
    cipher: Aes256Gcm,
}

impl CryptoService {
    pub fn encrypt_phi(&self, data: &[u8]) -> Result<Vec<u8>, CryptoError> {
        let nonce = generate_nonce();
        let ciphertext = self.cipher
            .encrypt(&nonce, data)
            .map_err(|e| CryptoError::EncryptionFailed)?;
        Ok(ciphertext)
    }
}

// src-tauri/src/security/audit.rs
use tracing::{info, warn, error, instrument};
use firestore::FirestoreTimestamp;

#[derive(Debug, Serialize, Deserialize)]
pub struct HipaaAuditLog {
    pub id: String,
    pub timestamp: FirestoreTimestamp,
    pub action: String,
    pub resource: String,
    pub user_id: String,
    pub ip_address: String,
    pub user_agent: Option<String>,
    pub result: String,  // success, failure, partial
    pub phi_accessed: bool,
    pub details: Option<serde_json::Value>,
    #[serde(with = "firestore::serialize_as_timestamp")]
    pub created_at: DateTime<Utc>,
}

#[instrument(skip(db))]
pub async fn hipaa_audit_log(
    db: &FirestoreDb,
    action: &str,
    resource: &str,
    user_id: &str,
    phi_accessed: bool,
    details: Option<serde_json::Value>,
) -> Result<(), AuditError> {
    let log_entry = HipaaAuditLog {
        id: Uuid::new_v4().to_string(),
        timestamp: FirestoreTimestamp(Utc::now()),
        action: action.to_string(),
        resource: resource.to_string(),
        user_id: user_id.to_string(),
        ip_address: get_client_ip(),
        user_agent: get_user_agent(),
        result: "success".to_string(),
        phi_accessed,
        details,
        created_at: Utc::now(),
    };

    // Log to tracing for immediate visibility
    info!(
        target: "hipaa_audit",
        user_id = %user_id,
        action = %action,
        resource = %resource,
        phi_accessed = %phi_accessed,
        "HIPAA audit event"
    );

    // Store in Firestore audit_logs collection (required for 6-year retention)
    db.fluent()
        .insert()
        .into("audit_logs")
        .document_id(&log_entry.id)
        .object(&log_entry)
        .execute()
        .await
        .map_err(|e| {
            error!("Failed to store audit log: {}", e);
            AuditError::StorageFailed
        })?;

    Ok(())
}
```

### Phase 5: Offline Support & Sync

```rust
// src-tauri/src/services/offline_service.rs
use sqlx::{SqlitePool, migrate::MigrateDatabase};

pub struct OfflineService {
    pool: SqlitePool,
    sync_queue: Arc<Mutex<Vec<SyncOperation>>>,
}

impl OfflineService {
    pub async fn cache_locally(&self, collection: &str, data: &serde_json::Value) -> Result<(), Error> {
        // Store in SQLite
        sqlx::query!(
            "INSERT INTO cache (collection, data, synced) VALUES (?, ?, false)",
            collection,
            data.to_string()
        )
        .execute(&self.pool)
        .await?;

        // Add to sync queue
        self.sync_queue.lock().await.push(SyncOperation {
            collection: collection.to_string(),
            data: data.clone(),
            operation: OperationType::Create,
        });

        Ok(())
    }

    pub async fn sync_with_firebase(&self, firebase: &FirebaseService) -> Result<(), Error> {
        let operations = self.sync_queue.lock().await.clone();

        for op in operations {
            match op.operation {
                OperationType::Create => {
                    firebase.db.create(&op.collection, &op.data).await?;
                }
                // Handle other operations
            }
        }

        Ok(())
    }
}
```

## Working Directory Setup

```bash
# ALWAYS start by navigating to the project directory
cd /Users/andreichira/Documents/Mobile_App_Dev/PsyPsy/CMS/context-engineering/tauri-app

# Verify you're in the correct location
pwd
# Should output: /Users/andreichira/Documents/Mobile_App_Dev/PsyPsy/CMS/context-engineering/tauri-app

# Check existing structure
ls -la src-tauri/src/
```

## Implementation Tasks (In Order)

1. **Environment Setup**
   - [ ] Create Firebase project and download service account JSON
   - [ ] Store service account in `src-tauri/firebase-service-account.json` (gitignored)
   - [ ] Create `.env` files for development and production configs

2. **Firebase Integration**
   - [ ] Add Firebase dependencies to Cargo.toml
   - [ ] Create `src-tauri/src/services/firebase_service.rs`
   - [ ] Initialize Firebase app in main.rs
   - [ ] Test Firebase connection

3. **Authentication Implementation**
   - [ ] Complete `src-tauri/src/security/auth.rs` Firebase integration
   - [ ] Implement auth_login, auth_logout, auth_get_current_user commands
   - [ ] Add JWT token validation middleware
   - [ ] Test authentication flow

4. **Data Models Creation**
   - [ ] Create all data models in `src-tauri/src/models/`
   - [ ] Implement Firestore serialization traits
   - [ ] Add validation logic

5. **CRUD Commands Implementation**
   - [ ] Implement client management commands
   - [ ] Implement professional management commands
   - [ ] Implement appointment commands
   - [ ] Implement dashboard stats command

6. **Security & HIPAA Compliance**
   - [ ] Complete encryption service (crypto.rs)
   - [ ] Implement audit logging (audit.rs)
   - [ ] Add rate limiting (rate_limit.rs)
   - [ ] Implement RBAC (rbac.rs)

7. **Offline Support**
   - [ ] Setup SQLite database and migrations
   - [ ] Implement caching service
   - [ ] Create sync mechanism
   - [ ] Handle conflict resolution

8. **Frontend Connection**
   - [ ] Update `src-tauri/src/lib.rs` with all commands
   - [ ] Fix frontend api.ts to match actual commands
   - [ ] Test all API endpoints
   - [ ] Handle error states

9. **Testing**
   - [ ] Unit tests for all services
   - [ ] Integration tests for Firebase operations
   - [ ] E2E tests for critical workflows
   - [ ] HIPAA compliance validation

10. **Production Preparation**
    - [ ] Performance optimization
    - [ ] Security audit
    - [ ] Documentation
    - [ ] CI/CD pipeline setup

## Validation Gates

```bash
# 1. Rust compilation and tests
cd src-tauri
cargo build --release
cargo test

# 2. Clippy linting
cargo clippy -- -D warnings

# 3. Security audit
cargo audit

# 4. Frontend type checking
cd ..
npm run type-check

# 5. Integration tests
npm run test:integration

# 6. E2E tests
npm run test:e2e

# 7. HIPAA compliance check
cargo test --features hipaa-audit

# 8. Build verification
cargo tauri build

# 9. Performance benchmarks
cargo bench
```

## Critical Success Factors

1. **Firebase Service Account**: Must be properly configured with correct permissions
2. **Async Command Pattern**: All commands must use Result<T, String> for async with borrowed types
3. **HIPAA Compliance**:
   - All PHI must be encrypted with AES-256
   - Audit logs for all data access
   - Session timeout after inactivity
4. **Error Handling**: Comprehensive error types and user-friendly messages
5. **Offline Support**: Queue operations when offline, sync when connected
6. **Type Safety**: Frontend and backend types must match exactly

## Known Gotchas & Solutions

1. **Tauri Async Borrowed Types**: Use `Result<T, String>` wrapper for async commands with State
   ```rust
   // ✅ Correct - Result wrapper allows borrowed State in async
   #[tauri::command]
   async fn my_command(state: State<'_, MyState>) -> Result<String, String> {
       Ok("success".to_string())
   }

   // ❌ Wrong - Will not compile
   #[tauri::command]
   async fn my_command(state: State<'_, MyState>) -> String {
       "fails".to_string()
   }
   ```

2. **Firebase CORS**: Use Tauri's fetch API or configure proper scope in tauri.conf.json
3. **JWT Secret Key**: Store in environment variable, never commit to repo
4. **SQLite Concurrent Access**: Use connection pooling with r2d2
5. **Firestore Real-time Listeners**: Use tokio channels for streaming updates
6. **TLS Provider**: Must install rustls crypto provider before using Firestore

## Performance Targets

- Startup time: < 4 seconds
- Memory usage: < 160MB idle
- API response time: < 200ms
- Offline sync: < 5 seconds for 1000 records
- Encryption overhead: < 10ms per operation

## Questions to Ask During Implementation

**IMPORTANT**: Ask these ONE AT A TIME when you reach each phase:

### Phase 1 - Setup Questions
1. "Do you have a Firebase project created? If yes, what's the project ID?"
2. "Where should I store the Firebase service account JSON file?"
3. "What environment variables should be used for dev vs production?"

### Phase 2 - Authentication Questions
1. "Should we support social login providers (Google, Apple, etc.)?"
2. "What's the session timeout duration for HIPAA compliance?"
3. "Should we implement biometric authentication for desktop?"

### Phase 3 - Data Migration Questions
1. "Do you have existing data in Parse Server to migrate?"
2. "What's the priority order for data migration (users, clients, appointments)?"
3. "Should we maintain Parse Server compatibility during transition?"

### Phase 4 - Feature Prioritization
1. "Which feature should be implemented first for MVP?"
2. "Are there specific HIPAA audit requirements for your organization?"
3. "Which social media platforms for initial integration (Postiz, etc.)?"

### When Stuck or Uncertain
Use these tools in this order:
1. `mcp__deepwiki__ask_question` - For specific questions about Git repos
2. `mcp__kit__search_code` - To find implementation patterns in repos
3. `mcp__tavily__tavily-search` - For documentation and troubleshooting

## Confidence Score: 8/10

**Reasoning**:
- Strong existing foundation with security modules
- Clear documentation for Firebase Rust integration
- Well-defined Tauri 2.0 async patterns
- Comprehensive HIPAA guidelines available
- Minor uncertainty around Firebase real-time listeners in Rust

This PRP provides all necessary context for one-pass implementation with validation gates and clear task progression.