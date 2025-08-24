name: "TanStack Query Integration for Parse Server - Data Layer Migration"
description: |

## Purpose
Replace the current Parse Server service layer in PsyPsy CMS with TanStack Query for improved data fetching, caching, and state management. Eliminate manual `useEffect` + `fetch` patterns and provide automatic background refetching, optimistic updates, and robust error handling.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Implement TanStack Query as the primary data layer for PsyPsy CMS, replacing direct Parse Server calls with a cacheable, optimistic-update-enabled query system that maintains compatibility with existing Parse Server authentication and data structures.

## Why
- **Business value**: Improved user experience through faster data loading and offline-first behavior
- **Integration**: Seamless replacement of existing service layer while preserving Parse Server backend
- **Problems solved**: Eliminates loading states, reduces server requests, provides optimistic updates for professional verification and client management

## What
A complete data layer replacement where:
- All existing Parse Server services (ClientService, ProfessionalService, DashboardService) use TanStack Query
- Automatic caching and background refetching for dashboard statistics
- Optimistic updates for critical operations (professional verification, client status changes)
- Proper error handling and retry logic for Parse Server operations
- Maintains existing authentication patterns and Parse Server data structures

### Success Criteria
- [ ] All existing data operations work with TanStack Query
- [ ] Dashboard statistics automatically refresh in background
- [ ] Optimistic updates work for professional verification
- [ ] Client/Professional data grids show loading states properly
- [ ] Parse Server authentication integration maintained
- [ ] Performance improvement measurable (faster perceived loading)

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://tanstack.com/query/latest
  why: Core TanStack Query concepts and API reference
  
- url: https://tanstack.com/query/latest/docs/framework/react/guides/mutations
  why: Mutations for Create/Update/Delete operations with Parse Server
  
- url: https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates  
  why: Optimistic updates for professional verification workflow
  
- url: https://docs.parseplatform.org/js/guide/
  why: Parse Server integration patterns and best practices
  
- file: src/services/parseService.js
  why: Current Parse Server integration, authentication patterns, UserService structure
  
- file: src/services/clientService.js  
  why: Current client data fetching patterns, pagination, search, filtering
  
- file: src/components/ClientsDataGrid/index.js
  why: Current data consumption patterns, loading states, error handling

- file: src/layouts/dashboard/index.js
  why: Dashboard data loading patterns and statistics components

- docfile: INITIAL.md
  why: TanStack Query examples and Parse Server integration requirements
```

### Current Codebase tree
```bash
src/
├── services/
│   ├── parseService.js          # Current Parse integration (Auth, Data, User services)
│   ├── clientService.js         # Client data operations
│   ├── professionalService.js   # Professional data operations  
│   ├── dashboardService.js      # Dashboard statistics
│   └── appointmentService.js    # Appointment management
├── components/
│   ├── ClientsDataGrid/         # Current MUI DataGrid with manual loading
│   ├── ProfessionalsDataGrid/   # Professional management grid
│   └── LoadingState/            # Loading state components
├── layouts/
│   └── dashboard/               # Dashboard with statistics components
├── context/
│   └── index.js                 # Material-UI controller (global state)
└── utils/
    └── devTools.js              # Development utilities
```

### Desired Codebase tree with files to be added
```bash
src/
├── hooks/                       # New: React Query hooks
│   ├── useClients.js           # Client data fetching hooks
│   ├── useProfessionals.js     # Professional data hooks
│   ├── useDashboard.js         # Dashboard statistics hooks
│   ├── useAppointments.js      # Appointment management hooks
│   └── mutations/              # Mutation hooks
│       ├── useClientMutations.js
│       ├── useProfessionalMutations.js
│       └── useAuthMutations.js
├── providers/
│   └── QueryProvider.js        # TanStack Query client configuration
├── config/
│   └── queryClient.js          # Query client setup with Parse Server
├── services/                   # Enhanced service layer
│   ├── parseService.js         # Keep existing auth, add query functions
│   ├── queryService.js         # New: TanStack Query Parse Server adapter
│   └── queryKeys.js            # Query key factory functions
├── components/                 # Updated components
│   ├── ClientsDataGrid/        # Updated to use hooks instead of direct service calls
│   └── ProfessionalsDataGrid/  # Updated with TanStack Query
└── layouts/
    └── dashboard/              # Updated dashboard with automatic refetching
```

### Known Gotchas & Library Quirks
```javascript
// CRITICAL: Parse Server returns Parse.Object instances, not plain objects
// TanStack Query expects serializable data, need transformation layer
// Example: client.get('name') instead of client.name

// CRITICAL: Parse Server authentication uses session tokens
// Must include session token in all queries and mutations
// Session token changes after login, must invalidate queries

// CRITICAL: Parse Server queries are not serializable
// Cannot cache Parse.Query objects directly
// Must convert to plain parameters and reconstruct queries

// CRITICAL: Parse Server has specific error codes
// 101: Invalid credentials, 209: Session expired
// Handle these specific codes for proper error states

// CRITICAL: Parse Server pagination uses skip/limit, not page-based
// TanStack Query infinite queries need proper pagination adapter

// CRITICAL: Parse Server Live Queries are separate from TanStack Query
// Don't mix Live Query subscriptions with TanStack Query caching
// Use TanStack Query for request-based data, Live Query for real-time
```

## Implementation Blueprint

### Data models and structure

Create Query client configuration and Parse Server adapter functions.
```typescript
// config/queryClient.js - TanStack Query client configuration
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { ParseAuth } from '../services/parseService';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes  
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error.code === 101 || error.code === 209) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      // Handle session expiry globally
      if (error.code === 209) {
        ParseAuth.logout();
        window.location.href = '/authentication/login';
      }
    },
  }),
});

// services/queryKeys.js - Query key factory
export const queryKeys = {
  all: ['parse'] as const,
  users: () => [...queryKeys.all, 'users'] as const,
  clients: () => [...queryKeys.users(), 'clients'] as const,
  clientsList: (filters: any) => [...queryKeys.clients(), 'list', filters] as const,
  clientDetail: (id: string) => [...queryKeys.clients(), 'detail', id] as const,
  professionals: () => [...queryKeys.users(), 'professionals'] as const,
  professionalsList: (filters: any) => [...queryKeys.professionals(), 'list', filters] as const,
  dashboard: () => [...queryKeys.all, 'dashboard'] as const,
  dashboardStats: () => [...queryKeys.dashboard(), 'stats'] as const,
};
```

### List of tasks to be completed to fulfill the PRP in the order they should be completed

```yaml
Task 1: Setup TanStack Query Infrastructure
CREATE config/queryClient.js:
  - PATTERN: Follow React Query client setup from TanStack docs
  - Configure Parse Server specific retry logic and error handling
  - Set appropriate staleTime and cacheTime for CMS use case
  - Add global error handling for session expiry (code 209)

CREATE services/queryKeys.js:
  - PATTERN: Query key factories from TanStack Query docs
  - Create hierarchical key structure for Parse Server entities
  - Include filters and pagination in keys for proper invalidation

CREATE providers/QueryProvider.js:
  - PATTERN: Standard React Query provider wrapper
  - Include QueryClient configuration
  - Add React Query DevTools for development

Task 2: Create Parse Server Query Adapter
CREATE services/queryService.js:
  - PATTERN: Transform Parse.Object to plain objects for caching
  - Implement Parse Server query parameter serialization
  - Add session token injection for all requests
  - Handle Parse Server specific pagination (skip/limit)

MODIFY src/services/parseService.js:
  - PRESERVE existing ParseAuth functionality
  - ADD queryFn helper functions for TanStack Query integration  
  - MAINTAIN existing session management patterns

Task 3: Implement Client Data Hooks
CREATE hooks/useClients.js:
  - PATTERN: useQuery hook for fetching clients list
  - Include search, filtering, pagination parameters
  - Transform Parse objects to frontend-friendly format
  - Handle loading states and error conditions

CREATE hooks/mutations/useClientMutations.js:
  - PATTERN: useMutation hooks for client operations
  - Implement optimistic updates for client status changes
  - Include proper cache invalidation after mutations
  - Handle Parse Server validation errors

Task 4: Implement Professional Data Hooks  
CREATE hooks/useProfessionals.js:
  - PATTERN: Similar to useClients but for Professional Parse objects
  - Include professional verification status in queries
  - Add professional search and filtering capabilities

CREATE hooks/mutations/useProfessionalMutations.js:
  - PATTERN: Professional-specific mutations with optimistic updates
  - Critical: Professional verification optimistic updates
  - Invalidate professional queries after verification status changes

Task 5: Implement Dashboard Statistics Hooks
CREATE hooks/useDashboard.js:
  - PATTERN: useQuery with short staleTime for real-time stats
  - Background refetching every 30 seconds for dashboard
  - Include client stats, professional stats, appointment stats
  - Handle aggregate data transformations from Parse Server

Task 6: Update Components to Use Hooks
MODIFY src/components/ClientsDataGrid/index.js:
  - REPLACE: ClientService.getClients direct calls
  - WITH: useClients hook consumption
  - PRESERVE existing loading states, error handling, pagination
  - MAINTAIN: Same component interface and props

MODIFY src/components/ProfessionalsDataGrid/index.js:
  - REPLACE: Direct service calls with useProfessionals
  - ADD: Professional verification mutations
  - IMPLEMENT: Optimistic updates for verification status

Task 7: Update Dashboard Components
MODIFY src/layouts/dashboard/index.js:
  - REPLACE: Direct dashboard service calls
  - WITH: useDashboard hook for automatic background refetching
  - ADD: Real-time statistics updates without user intervention

Task 8: Add Authentication Integration
CREATE hooks/mutations/useAuthMutations.js:
  - PATTERN: Login/logout mutations that invalidate all queries
  - Clear query cache on logout
  - Refresh session-dependent queries on login

Task 9: Integrate with App Root
MODIFY src/App.js:
  - ADD: QueryProvider wrapper around app components
  - ENSURE: Providers are in correct order (Theme > Query > Router)
  - ADD: React Query DevTools in development mode

Task 10: Add Development Tools Integration
MODIFY src/utils/devTools.js:
  - ADD: Query client access for debugging
  - ADD: Helper functions to inspect query cache
  - ADD: Manual cache invalidation for development
```

### Per task pseudocode

```typescript
// Task 2: Parse Server Query Adapter
// services/queryService.js
import Parse from 'parse';
import { ParseAuth } from './parseService';

// Transform Parse objects to cacheable plain objects
export const transformParseObject = (parseObj) => {
  if (!parseObj) return null;
  
  const plainObj = {
    id: parseObj.id,
    objectId: parseObj.id,
    createdAt: parseObj.get('createdAt'),
    updatedAt: parseObj.get('updatedAt'),
  };
  
  // Copy all attributes
  parseObj.attributes && Object.keys(parseObj.attributes).forEach(key => {
    const value = parseObj.get(key);
    // Recursively transform nested Parse objects
    plainObj[key] = value instanceof Parse.Object ? transformParseObject(value) : value;
  });
  
  return plainObj;
};

// Generic Parse Server query function for TanStack Query
export const executeParseQuery = async ({ className, conditions, include, limit, skip, sortBy, ascending }) => {
  const ParseClass = Parse.Object.extend(className);
  const query = new Parse.Query(ParseClass);
  
  // Apply session token for authentication
  const currentUser = ParseAuth.getCurrentUser();
  if (!currentUser) throw new Error('Authentication required');
  
  // Apply conditions, pagination, sorting
  conditions && Object.entries(conditions).forEach(([key, value]) => {
    query.equalTo(key, value);
  });
  
  include && include.forEach(field => query.include(field));
  limit && query.limit(limit);
  skip && query.skip(skip);
  sortBy && (ascending ? query.ascending(sortBy) : query.descending(sortBy));
  
  const results = await query.find();
  return results.map(transformParseObject);
};

// Task 3: Client Data Hooks Implementation
// hooks/useClients.js
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '../services/queryKeys';
import { executeParseQuery } from '../services/queryService';

export const useClients = (filters = {}) => {
  const { page = 0, limit = 10, search = '', sortBy = 'createdAt', sortDirection = 'desc' } = filters;
  
  return useQuery({
    queryKey: queryKeys.clientsList(filters),
    queryFn: async () => {
      // PATTERN: Parse Server users with userType = 2 (clients)
      const conditions = { userType: 2 };
      
      // Add search conditions if provided
      if (search) {
        // GOTCHA: Parse Server search requires OR queries for multiple fields
        const searchConditions = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
        conditions.$or = searchConditions;
      }
      
      const results = await executeParseQuery({
        className: '_User', // Parse Server user class
        conditions,
        include: ['clientPtr'], // Include client profile data
        limit,
        skip: page * limit,
        sortBy,
        ascending: sortDirection === 'asc'
      });
      
      return {
        results,
        total: await getClientCount(search),
        page,
        limit
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for user data
    // GOTCHA: Keep previous data while loading new page
    keepPreviousData: true,
  });
};

// Task 4: Professional Mutations with Optimistic Updates
// hooks/mutations/useProfessionalMutations.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../services/queryKeys';

export const useVerifyProfessional = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ professionalId, isVerified }) => {
      // PATTERN: Parse Server mutation with master key requirement
      return Parse.Cloud.run('verifyProfessional', { 
        professionalId, 
        isVerified 
      });
    },
    // CRITICAL: Optimistic updates for immediate UI feedback
    onMutate: async ({ professionalId, isVerified }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(queryKeys.professionals());
      
      // Snapshot the previous value
      const previousProfessionals = queryClient.getQueryData(queryKeys.professionalsList({}));
      
      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.professionalsList({}), old => {
        if (!old?.results) return old;
        
        return {
          ...old,
          results: old.results.map(prof => 
            prof.objectId === professionalId 
              ? { ...prof, isVerified }
              : prof
          )
        };
      });
      
      return { previousProfessionals };
    },
    // CRITICAL: Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        queryKeys.professionalsList({}), 
        context.previousProfessionals
      );
    },
    // Always refetch after mutation to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries(queryKeys.professionals());
    },
  });
};
```

### Integration Points
```yaml
DEPENDENCIES:
  - add to: package.json
  - packages: |
      @tanstack/react-query: "^5.0.0"
      @tanstack/react-query-devtools: "^5.0.0"

AUTHENTICATION:
  - maintain: Existing ParseAuth system
  - enhance: Query cache invalidation on login/logout
  - pattern: Session token injection in all queries

COMPONENTS:
  - update: All DataGrid components to use hooks
  - preserve: Existing loading states and error handling
  - enhance: Optimistic updates for user actions

DEVELOPMENT:
  - add: React Query DevTools in development mode
  - integrate: Existing devTools.js with query client
  - pattern: Query cache inspection utilities
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
npm install @tanstack/react-query @tanstack/react-query-devtools
npm run build # Ensure no TypeScript/compilation errors
npx eslint src/hooks/ src/services/queryService.js # Check code style

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests
```javascript
// CREATE __tests__/hooks/useClients.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useClients } from '../../hooks/useClients';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

test('useClients fetches client data successfully', async () => {
  const { result } = renderHook(() => useClients(), {
    wrapper: createWrapper(),
  });
  
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data.results).toBeDefined();
  expect(result.current.data.results.length).toBeGreaterThan(0);
});

test('useClients handles search parameter', async () => {
  const { result } = renderHook(() => useClients({ search: 'test' }), {
    wrapper: createWrapper(),
  });
  
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  // Should have applied search filter
  expect(result.current.data.results.every(client => 
    client.username.includes('test') || client.email.includes('test')
  )).toBe(true);
});

test('useProfessionalVerification optimistic updates', async () => {
  const queryClient = new QueryClient();
  const { result } = renderHook(() => useVerifyProfessional(), {
    wrapper: createWrapper(),
  });
  
  // Mock professional data
  queryClient.setQueryData(queryKeys.professionalsList({}), {
    results: [{ objectId: '123', isVerified: false }]
  });
  
  result.current.mutate({ professionalId: '123', isVerified: true });
  
  // Should immediately show optimistic update
  const data = queryClient.getQueryData(queryKeys.professionalsList({}));
  expect(data.results[0].isVerified).toBe(true);
});
```

```bash
# Run tests iteratively until passing:
npm test -- __tests__/hooks/
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Test
```bash
# Start the development server
npm start

# Test in browser - Dashboard should show loading states
# Navigate to /dashboard - statistics should refresh automatically
# Navigate to /clients - data grid should load with TanStack Query
# Try professional verification - should show optimistic updates

# Expected behaviors:
# - Dashboard stats refresh in background every 30 seconds  
# - Client/Professional grids show proper loading states
# - Professional verification shows immediate feedback
# - Error states handled gracefully with retry options
# - React Query DevTools accessible in development
```

## Final Validation Checklist
- [ ] All tests pass: `npm test -- __tests__/hooks/`
- [ ] No linting errors: `npx eslint src/hooks/ src/services/`
- [ ] No compilation errors: `npm run build`
- [ ] Dashboard statistics refresh automatically in background
- [ ] Client/Professional data grids work with TanStack Query
- [ ] Professional verification shows optimistic updates
- [ ] Error states handled with proper retry logic
- [ ] React Query DevTools show query states correctly
- [ ] Parse Server authentication integration maintained
- [ ] Session expiry handled with automatic logout

---

## Anti-Patterns to Avoid
- ❌ Don't cache Parse.Query objects directly - transform to plain objects
- ❌ Don't skip session token validation - all queries need authentication  
- ❌ Don't ignore Parse Server error codes - handle 101, 209 specifically
- ❌ Don't mix Parse Live Queries with TanStack Query cache
- ❌ Don't forget to invalidate queries after mutations
- ❌ Don't use synchronous Parse Server operations in query functions

## Confidence Score: 9/10

High confidence due to:
- Clear Parse Server integration patterns already established
- TanStack Query has excellent documentation for React integration
- Existing component interfaces can be preserved during migration
- Mock data fallbacks available for development
- Comprehensive error handling already implemented

Minor uncertainty around Parse Server specific optimistic update patterns, but the existing verification workflow provides clear guidance.