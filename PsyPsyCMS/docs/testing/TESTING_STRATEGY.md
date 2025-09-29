# PsyPsy CMS Testing Strategy
**Last Updated**: September 29, 2025  
**Audience**: Developers, QA Engineers, DevOps  
**Prerequisites**: React 19, Tauri 2.1+, Vitest, Playwright  
**Categories**: Testing, Quality Assurance, Development  
**Topics**: Unit Testing, Integration Testing, E2E Testing, Vitest, Playwright  

## Overview

This document outlines the comprehensive testing strategy for the PsyPsy CMS Tauri 2.0 migration, implementing multi-layer testing with 90%+ backend coverage and 85%+ frontend coverage.

### Related Documentation
- [Firebase Emulator Setup](../setup/setup-firebase-emulator.md) - Local testing environment configuration
- [UI Component Testing](test-ui-components.md) - Frontend component testing checklist
- [Architecture Guide](../development/architecture.md) - System design and testing considerations
- [Compliance Overview](../compliance/overview.md) - Compliance validation testing requirements

## Table of Contents

- [Testing Pyramid](#testing-pyramid)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Performance Testing](#performance-testing)
- [Compliance Testing](#compliance-testing)

## Testing Pyramid

### Layer 1: Unit Tests (70% of total tests)
- **Rust Backend**: Comprehensive unit tests for all business logic
- **React Frontend**: Component and hook testing with React Testing Library
- **Target Coverage**: 90%+ backend, 85%+ frontend

### Layer 2: Integration Tests (20% of total tests)
- **Tauri IPC Commands**: Test frontend-backend communication
- **Firebase Integration**: Database operations and authentication
- **State Management**: TanStack Query and React Context integration

### Layer 3: End-to-End Tests (10% of total tests)
- **User Workflows**: Complete healthcare management scenarios
- **Cross-Platform**: Windows, macOS, Linux compatibility
- **Performance**: Load testing and resource monitoring

## 🦀 Rust Backend Testing

### Unit Testing Framework
```toml
# Cargo.toml dependencies for testing
[dev-dependencies]
tokio-test = "0.4"
serde_json = "1.0"
mockall = "0.12"
proptest = "1.4"
criterion = "0.5"
test-log = "0.2"
```

### Test Organization Structure
```
src-tauri/src/
├── lib.rs
├── commands/
│   ├── mod.rs
│   ├── client.rs
│   ├── professional.rs
│   ├── appointment.rs
│   └── dashboard.rs
├── services/
│   ├── mod.rs
│   ├── firebase.rs
│   ├── database.rs
│   └── notification.rs
├── models/
│   ├── mod.rs
│   ├── client.rs
│   ├── professional.rs
│   └── appointment.rs
└── tests/
    ├── unit/
    │   ├── commands/
    │   ├── services/
    │   └── models/
    ├── integration/
    │   ├── firebase_integration.rs
    │   ├── database_integration.rs
    │   └── ipc_integration.rs
    └── common/
        ├── mod.rs
        ├── fixtures.rs
        └── mock_services.rs
```

### Rust Testing Implementation

#### 1. Model Testing
```rust
// tests/unit/models/client_test.rs
use crate::models::client::{Client, ClientStatus};
use serde_json;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_client_creation() {
        let client = Client::new(
            "john.doe@example.com".to_string(),
            "John".to_string(),
            "Doe".to_string(),
        );
        
        assert_eq!(client.email, "john.doe@example.com");
        assert_eq!(client.first_name, "John");
        assert_eq!(client.last_name, "Doe");
        assert_eq!(client.status, ClientStatus::Active);
    }

    #[test]
    fn test_client_serialization() {
        let client = Client::new(
            "test@example.com".to_string(),
            "Test".to_string(),
            "User".to_string(),
        );
        
        let json = serde_json::to_string(&client).expect("Serialization failed");
        let deserialized: Client = serde_json::from_str(&json).expect("Deserialization failed");
        
        assert_eq!(client.email, deserialized.email);
    }

    #[test]
    fn test_client_validation() {
        // Test email validation
        let result = Client::validate_email("invalid-email");
        assert!(result.is_err());
        
        let result = Client::validate_email("valid@example.com");
        assert!(result.is_ok());
    }
}
```

#### 2. Service Layer Testing with Mocks
```rust
// tests/unit/services/firebase_service_test.rs
use mockall::predicate::*;
use mockall::mock;
use crate::services::firebase::FirebaseService;
use crate::models::client::Client;

mock! {
    FirebaseClient {}
    
    #[async_trait]
    impl FirebaseService for FirebaseClient {
        async fn create_client(&self, client: &Client) -> Result<String, FirebaseError>;
        async fn get_client(&self, id: &str) -> Result<Client, FirebaseError>;
        async fn update_client(&self, id: &str, client: &Client) -> Result<(), FirebaseError>;
        async fn delete_client(&self, id: &str) -> Result<(), FirebaseError>;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio_test;

    #[tokio_test]
    async fn test_create_client_success() {
        let mut mock_firebase = MockFirebaseClient::new();
        mock_firebase
            .expect_create_client()
            .with(predicate::always())
            .times(1)
            .return_const(Ok("client_id_123".to_string()));

        let client = Client::new(
            "test@example.com".to_string(),
            "Test".to_string(),
            "User".to_string(),
        );

        let result = mock_firebase.create_client(&client).await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "client_id_123");
    }

    #[tokio_test]
    async fn test_create_client_failure() {
        let mut mock_firebase = MockFirebaseClient::new();
        mock_firebase
            .expect_create_client()
            .with(predicate::always())
            .times(1)
            .return_const(Err(FirebaseError::NetworkError("Connection failed".to_string())));

        let client = Client::new(
            "test@example.com".to_string(),
            "Test".to_string(),
            "User".to_string(),
        );

        let result = mock_firebase.create_client(&client).await;
        assert!(result.is_err());
    }
}
```

#### 3. Tauri Command Testing
```rust
// tests/unit/commands/client_commands_test.rs
use crate::commands::client::{create_client_command, get_client_command};
use crate::tests::common::mock_services::MockFirebaseService;

#[cfg(test)]
mod tests {
    use super::*;
    use tokio_test;

    #[tokio_test]
    async fn test_create_client_command() {
        let mock_service = MockFirebaseService::new();
        let client_data = serde_json::json!({
            "email": "test@example.com",
            "firstName": "Test",
            "lastName": "User"
        });

        let result = create_client_command(client_data, mock_service).await;
        assert!(result.is_ok());
    }

    #[tokio_test]
    async fn test_get_client_command() {
        let mock_service = MockFirebaseService::new();
        let client_id = "test_client_id";

        let result = get_client_command(client_id.to_string(), mock_service).await;
        assert!(result.is_ok());
    }
}
```

## ⚛️ React Frontend Testing

### Testing Dependencies
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.4",
    "@testing-library/user-event": "^14.5.1",
    "vitest": "^1.0.0",
    "jsdom": "^23.0.0",
    "msw": "^2.0.0",
    "happy-dom": "^12.0.0",
    "@vitest/coverage-v8": "^1.0.0"
  }
}
```

### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/main.tsx',
        'src/vite-env.d.ts'
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/services': path.resolve(__dirname, './src/services'),
    }
  }
});
```

### Frontend Test Structure
```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Input.tsx
│   │   ├── Input.test.tsx
│   │   ├── Calendar.tsx
│   │   └── Calendar.test.tsx
│   ├── forms/
│   │   ├── ClientForm.tsx
│   │   ├── ClientForm.test.tsx
│   │   ├── AppointmentForm.tsx
│   │   └── AppointmentForm.test.tsx
│   └── dashboard/
│       ├── DashboardStats.tsx
│       ├── DashboardStats.test.tsx
│       ├── RecentAppointments.tsx
│       └── RecentAppointments.test.tsx
├── hooks/
│   ├── useClients.ts
│   ├── useClients.test.ts
│   ├── useAppointments.ts
│   └── useAppointments.test.ts
├── services/
│   ├── tauri.ts
│   ├── tauri.test.ts
│   ├── firebase.ts
│   └── firebase.test.ts
└── test/
    ├── setup.ts
    ├── mocks/
    │   ├── handlers.ts
    │   ├── server.ts
    │   └── tauri.ts
    └── utils/
        ├── test-utils.tsx
        └── fixtures.ts
```

### Component Testing Examples

#### 1. Basic Component Testing
```typescript
// src/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant styles', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
```

#### 2. Form Component Testing
```typescript
// src/components/forms/ClientForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClientForm } from './ClientForm';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('ClientForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<ClientForm />, { wrapper: createWrapper() });
    
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save client/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<ClientForm />, { wrapper: createWrapper() });

    const submitButton = screen.getByRole('button', { name: /save client/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<ClientForm />, { wrapper: createWrapper() });

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /save client/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    
    render(<ClientForm onSubmit={mockOnSubmit} />, { wrapper: createWrapper() });

    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
    await user.type(screen.getByLabelText(/phone/i), '+1234567890');

    const submitButton = screen.getByRole('button', { name: /save client/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
      });
    });
  });
});
```

#### 3. Hook Testing
```typescript
// src/hooks/useClients.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useClients } from './useClients';
import * as tauriService from '@/services/tauri';

// Mock Tauri service
vi.mock('@/services/tauri');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useClients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches clients successfully', async () => {
    const mockClients = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
    ];

    vi.mocked(tauriService.getClients).mockResolvedValue(mockClients);

    const { result } = renderHook(() => useClients(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockClients);
    expect(tauriService.getClients).toHaveBeenCalledTimes(1);
  });

  it('handles fetch error', async () => {
    const errorMessage = 'Failed to fetch clients';
    vi.mocked(tauriService.getClients).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useClients(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe(errorMessage);
  });
});
```

## 🎭 Playwright E2E Testing

### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run tauri dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

### E2E Test Examples

#### 1. Authentication Flow
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.fill('[data-testid="email-input"]', 'admin@psypsy.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@psypsy.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL('/dashboard');

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    await expect(page).toHaveURL('/login');
  });
});
```

#### 2. Client Management Workflow
```typescript
// tests/e2e/client-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Client Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@psypsy.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create a new client', async ({ page }) => {
    await page.goto('/clients');
    
    // Click new client button
    await page.click('[data-testid="new-client-button"]');
    
    // Fill client form
    await page.fill('[data-testid="first-name-input"]', 'John');
    await page.fill('[data-testid="last-name-input"]', 'Doe');
    await page.fill('[data-testid="email-input"]', 'john.doe@example.com');
    await page.fill('[data-testid="phone-input"]', '+1234567890');
    
    // Submit form
    await page.click('[data-testid="save-client-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Client created successfully');
    
    // Should appear in clients list
    await expect(page.locator('[data-testid="clients-table"]')).toContainText('John Doe');
    await expect(page.locator('[data-testid="clients-table"]')).toContainText('john.doe@example.com');
  });

  test('should edit existing client', async ({ page }) => {
    await page.goto('/clients');
    
    // Click edit button for first client
    await page.click('[data-testid="client-row"]:first-child [data-testid="edit-button"]');
    
    // Update client information
    await page.fill('[data-testid="phone-input"]', '+1987654321');
    await page.click('[data-testid="save-client-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Should update in table
    await expect(page.locator('[data-testid="clients-table"]')).toContainText('+1987654321');
  });

  test('should search clients', async ({ page }) => {
    await page.goto('/clients');
    
    // Type in search box
    await page.fill('[data-testid="search-input"]', 'John');
    
    // Should filter results
    const rows = page.locator('[data-testid="client-row"]');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('John');
  });

  test('should delete client', async ({ page }) => {
    await page.goto('/clients');
    
    // Click delete button
    await page.click('[data-testid="client-row"]:first-child [data-testid="delete-button"]');
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Client deleted successfully');
  });
});
```

#### 3. Appointment Scheduling
```typescript
// tests/e2e/appointments.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Appointment Scheduling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@psypsy.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
  });

  test('should create new appointment', async ({ page }) => {
    await page.goto('/appointments');
    
    await page.click('[data-testid="new-appointment-button"]');
    
    // Select client
    await page.click('[data-testid="client-select"]');
    await page.click('[data-testid="client-option"]:first-child');
    
    // Select professional
    await page.click('[data-testid="professional-select"]');
    await page.click('[data-testid="professional-option"]:first-child');
    
    // Select date and time
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-testid="date-today"]');
    await page.click('[data-testid="time-slot-10am"]');
    
    // Add notes
    await page.fill('[data-testid="notes-input"]', 'Initial consultation');
    
    // Save appointment
    await page.click('[data-testid="save-appointment-button"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should show appointment conflicts', async ({ page }) => {
    await page.goto('/appointments');
    
    await page.click('[data-testid="new-appointment-button"]');
    
    // Try to schedule at already booked time
    await page.click('[data-testid="client-select"]');
    await page.click('[data-testid="client-option"]:first-child');
    await page.click('[data-testid="professional-select"]');
    await page.click('[data-testid="professional-option"]:first-child');
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-testid="date-today"]');
    await page.click('[data-testid="time-slot-10am"]'); // Already booked
    
    await expect(page.locator('[data-testid="conflict-warning"]')).toBeVisible();
    await expect(page.locator('[data-testid="conflict-warning"]')).toContainText('Time slot already booked');
  });
});
```

## 🔒 Security Testing

### Security Testing Framework
```typescript
// tests/security/auth-security.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
  test('should prevent access to protected routes without authentication', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
    
    await page.goto('/clients');
    await expect(page).toHaveURL('/login');
    
    await page.goto('/appointments');
    await expect(page).toHaveURL('/login');
  });

  test('should sanitize user input', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@psypsy.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await page.goto('/clients');
    await page.click('[data-testid="new-client-button"]');
    
    // Try XSS injection
    await page.fill('[data-testid="first-name-input"]', '<script>alert("XSS")</script>');
    await page.fill('[data-testid="last-name-input"]', 'Test');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.click('[data-testid="save-client-button"]');
    
    // Should not execute script - content should be escaped
    await expect(page.locator('[data-testid="clients-table"]')).toContainText('&lt;script&gt;');
  });

  test('should enforce session timeout', async ({ page }) => {
    // This would need to be implemented with session management
    // Login and wait for session timeout
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@psypsy.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Simulate session timeout (this would need backend support)
    await page.evaluate(() => {
      localStorage.removeItem('auth-token');
      sessionStorage.clear();
    });
    
    // Try to access protected resource
    await page.goto('/clients');
    await expect(page).toHaveURL('/login');
  });
});
```

### HIPAA Compliance Testing
```typescript
// tests/security/hipaa-compliance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('HIPAA Compliance', () => {
  test('should not expose sensitive data in URLs', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@psypsy.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await page.goto('/clients');
    await page.click('[data-testid="client-row"]:first-child [data-testid="view-button"]');
    
    // URL should not contain sensitive data
    const url = page.url();
    expect(url).not.toMatch(/ssn|social/i);
    expect(url).not.toMatch(/dob|birth/i);
  });

  test('should require re-authentication for sensitive operations', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@psypsy.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to sensitive data
    await page.goto('/clients');
    await page.click('[data-testid="client-row"]:first-child [data-testid="medical-records-button"]');
    
    // Should prompt for re-authentication
    await expect(page.locator('[data-testid="re-auth-modal"]')).toBeVisible();
  });

  test('should encrypt sensitive data display', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@psypsy.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await page.goto('/clients');
    
    // SSN should be masked by default
    const ssnField = page.locator('[data-testid="client-ssn"]:first-child');
    await expect(ssnField).toContainText('***-**-****');
    
    // Show full SSN only on explicit user action
    await page.click('[data-testid="reveal-ssn-button"]:first-child');
    await expect(ssnField).not.toContainText('***-**-****');
  });
});
```

## 📊 Performance Testing

### Performance Test Configuration
```typescript
// tests/performance/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load dashboard within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@psypsy.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@psypsy.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await page.goto('/clients');
    
    // Load 1000+ clients
    const startTime = Date.now();
    await page.click('[data-testid="load-all-clients"]');
    await page.waitForSelector('[data-testid="clients-table"]');
    const loadTime = Date.now() - startTime;
    
    // Should load large dataset within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    // Should implement virtualization for performance
    const visibleRows = await page.locator('[data-testid="client-row"]:visible').count();
    expect(visibleRows).toBeLessThan(50); // Only render visible rows
  });

  test('should maintain responsive UI during data operations', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@psypsy.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await page.goto('/appointments');
    
    // Start bulk operation
    await page.click('[data-testid="select-all-appointments"]');
    await page.click('[data-testid="bulk-update-status"]');
    
    // UI should remain responsive
    const navigationStartTime = Date.now();
    await page.click('[data-testid="clients-nav-link"]');
    await page.waitForURL('/clients');
    const navigationTime = Date.now() - navigationStartTime;
    
    // Navigation should not be blocked by background operations
    expect(navigationTime).toBeLessThan(1000);
  });
});
```

### Memory Usage Testing
```typescript
// tests/performance/memory.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Memory Usage Tests', () => {
  test('should not have memory leaks during navigation', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@psypsy.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Navigate through multiple pages
    for (let i = 0; i < 10; i++) {
      await page.goto('/clients');
      await page.goto('/professionals');
      await page.goto('/appointments');
      await page.goto('/dashboard');
    }
    
    // Force garbage collection if available
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });
    
    // Check final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Memory usage should not increase significantly
    const memoryIncrease = finalMemory - initialMemory;
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
  });
});
```

## 🚀 CI/CD Pipeline Configuration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  rust-tests:
    name: Rust Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          components: clippy, rustfmt
      
      - name: Cache Rust dependencies
        uses: actions/cache@v3
        with:
          path: |
            ~/.cargo/bin/
            ~/.cargo/registry/index/
            ~/.cargo/registry/cache/
            ~/.cargo/git/db/
            src-tauri/target/
          key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}
      
      - name: Run Rust tests
        working-directory: src-tauri
        run: |
          cargo test --verbose
          cargo clippy -- -D warnings
          cargo fmt --all -- --check
      
      - name: Generate coverage report
        working-directory: src-tauri
        run: |
          cargo install cargo-tarpaulin
          cargo tarpaulin --out xml --output-dir ../coverage/
      
      - name: Upload Rust coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/cobertura.xml
          flags: rust

  frontend-tests:
    name: Frontend Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Generate coverage report
        run: npm run test:coverage
      
      - name: Upload frontend coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: frontend

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [rust-tests, frontend-tests]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
      
      - name: Install dependencies
        run: |
          npm ci
          npx playwright install --with-deps
      
      - name: Build application
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload E2E results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
      
      - name: Run Rust security audit
        working-directory: src-tauri
        run: |
          cargo install cargo-audit
          cargo audit
      
      - name: Upload SARIF results
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: snyk.sarif

  quality-gate:
    name: Quality Gate
    runs-on: ubuntu-latest
    needs: [rust-tests, frontend-tests, e2e-tests, security-scan]
    if: always()
    steps:
      - name: Check test results
        run: |
          if [[ "${{ needs.rust-tests.result }}" == "failure" ]]; then
            echo "Rust tests failed"
            exit 1
          fi
          if [[ "${{ needs.frontend-tests.result }}" == "failure" ]]; then
            echo "Frontend tests failed"
            exit 1
          fi
          if [[ "${{ needs.e2e-tests.result }}" == "failure" ]]; then
            echo "E2E tests failed"
            exit 1
          fi
          if [[ "${{ needs.security-scan.result }}" == "failure" ]]; then
            echo "Security scan failed"
            exit 1
          fi
          echo "All quality gates passed"
```

## 📈 Coverage and Quality Metrics

### Coverage Configuration
```typescript
// vitest.config.ts - Coverage thresholds
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        global: {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90
        },
        // Stricter thresholds for critical modules
        'src/services/': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        },
        'src/hooks/': {
          branches: 90,
          functions: 95,
          lines: 95,
          statements: 95
        }
      }
    }
  }
});
```

### Quality Metrics Dashboard
```json
{
  "quality_metrics": {
    "code_coverage": {
      "rust_backend": "90%+",
      "react_frontend": "85%+",
      "integration_tests": "80%+"
    },
    "performance_budgets": {
      "startup_time": "<3s",
      "bundle_size": "<2MB",
      "memory_usage": "<200MB",
      "cpu_usage": "<30%"
    },
    "security_compliance": {
      "hipaa_compliance": "100%",
      "vulnerability_scan": "0 high/critical",
      "dependency_audit": "0 known vulnerabilities"
    },
    "code_quality": {
      "complexity_score": "<10",
      "maintainability_index": ">70",
      "technical_debt_ratio": "<5%"
    }
  }
}
```

This comprehensive testing strategy ensures high-quality, secure, and performant healthcare software that meets HIPAA compliance requirements while maintaining excellent developer experience through automated testing and continuous integration.