# PsyPsy CMS Advanced Tables Guide

A comprehensive table system built with **TanStack Table v8**, designed specifically for healthcare data management in Quebec, Canada, with full **PIPEDA** and **Quebec Law 25** compliance.

## 🌟 Features Overview

### Core Capabilities
- **TanStack Table v8** - Latest version with React Compiler support
- **Server-side Operations** - Filtering, sorting, pagination with Firebase Firestore
- **Export Functionality** - CSV, Excel, JSON with audit logging
- **Quebec Compliance** - PIPEDA + Law 25 audit trails and data residency
- **Responsive Design** - Mobile-friendly with adaptive layouts
- **Type Safety** - Full TypeScript support with branded types

### Advanced Features
- **Real-time Updates** - Optimistic updates with rollback on failure
- **Column Management** - Show/hide columns, custom column ordering
- **Global Search** - Debounced search across all visible columns
- **Bulk Operations** - Multi-row selection and bulk actions
- **Progressive Enhancement** - Works without JavaScript (accessibility)
- **Performance Optimized** - Virtualization ready for 100k+ rows

## 📋 Table Components

### 1. DataTable (Base Component)
The foundational table component that powers all specialized tables.

```typescript
import { DataTable } from '@/components/tables'

<DataTable
  data={data}
  columns={columns}
  onSortingChange={setSorting}
  onColumnFiltersChange={setFilters}
  onPaginationChange={setPagination}
  containsPersonalInfo={true}
  auditTableAccess={auditFunction}
/>
```

### 2. UsersTable
Specialized for platform user management.

```typescript
import { UsersTable } from '@/components/tables'

<UsersTable
  onUserStatusChange={handleUserBlock}
  onViewProfile={handleViewProfile}
  enableUserActions={true}
/>
```

**Features:**
- User type filtering (Admin, Professional, Client)
- Account status management (Active, Blocked, Inactive)
- Onboarding completion tracking
- Device registration monitoring

### 3. ProfessionalsTable
Designed for healthcare professional verification and management.

```typescript
import { ProfessionalsTable } from '@/components/tables'

<ProfessionalsTable
  onVerificationAction={handleVerification}
  onViewProfile={handleViewProfile}
  enableVerificationActions={true}
/>
```

**Features:**
- Professional verification workflow
- License expiry tracking with warnings
- Quebec Order membership validation
- Specialty and location filtering
- Client acceptance status

### 4. AppointmentsTable
Healthcare appointment workflow management.

```typescript
import { AppointmentsTable } from '@/components/tables'

<AppointmentsTable
  onStatusUpdate={handleStatusUpdate}
  onViewDetails={handleViewDetails}
  enableStatusActions={true}
/>
```

**Features:**
- Appointment status workflow
- Urgency prioritization (Emergency, High, Medium, Low)
- Professional-client matching visualization
- Budget and insurance tracking
- Meeting type indicators (Online/In-person)

## 🔧 Installation & Setup

### Dependencies
```bash
npm install @tanstack/react-table @tanstack/react-query file-saver xlsx date-fns

# Development dependencies
npm install -D @types/file-saver

# shadcn/ui components (if not already installed)
npx shadcn-ui@latest add table button input select badge avatar card dropdown-menu skeleton
```

### Firebase Configuration
Ensure your Firebase Firestore is configured with proper security rules:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Quebec Law 25 compliant access rules
    match /users/{userId} {
      allow read, write: if isAuthorizedAdmin() && auditAccess();
    }

    match /professionals/{professionalId} {
      allow read, write: if isAuthorizedAdmin() && auditAccess();
    }

    match /appointments/{appointmentId} {
      allow read, write: if isAuthorizedAdmin() && auditAccess();
    }
  }

  function isAuthorizedAdmin() {
    return request.auth != null &&
           request.auth.token.userType == 0 && // Admin
           request.auth.token.isBlocked == false;
  }

  function auditAccess() {
    // Log access for Quebec Law 25 compliance
    return true;
  }
}
```

## 🏛️ Quebec Law 25 & PIPEDA Compliance

### Audit Logging
All table operations are automatically logged for compliance:

```typescript
const auditTableAccess = (action: string, filters?: any) => {
  console.log('[AUDIT]', {
    action,
    timestamp: new Date().toISOString(),
    containsPersonalInfo: true,
    jurisdiction: 'Quebec, Canada',
    compliance: ['PIPEDA', 'Law25'],
    dataResidency: 'Canada',
    ...filters,
  })
}
```

### Personal Information Handling
Tables automatically detect and flag personal information:

```typescript
<DataTable
  data={personalData}
  columns={columns}
  containsPersonalInfo={true}  // Triggers compliance warnings
  auditTableAccess={auditFunction}
/>
```

### Data Residency
All data processing occurs within Canada, complying with Quebec Law 25 requirements for data residency.

## 🎨 Customization

### Custom Columns
```typescript
const columns = [
  {
    id: 'custom',
    header: 'Custom Field',
    cell: ({ row }) => (
      <div className="custom-cell">
        {/* Your custom content */}
      </div>
    ),
  },
]
```

### Custom Filters
```typescript
const CustomFilter = ({ column, value, onChange }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </Select>
)
```

### Theming
The tables use your existing Tailwind CSS configuration and shadcn/ui theme:

```typescript
// Customize in your tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'medical-primary': '#3b82f6',
        'medical-success': '#22c55e',
        'medical-warning': '#f59e0b',
        'medical-danger': '#ef4444',
      },
    },
  },
}
```

## 📊 Server-Side Operations

### TanStack Query Integration
```typescript
const {
  data: result,
  isLoading,
  error,
} = useUsersTableQuery(
  { pagination, sorting, columnFilters },
  { userType: UserType.PROFESSIONAL }
)
```

### Custom Queries
```typescript
const useCustomTableQuery = (params) => {
  return useServerSideTableQuery(params, {
    collectionName: 'custom_collection',
    containsPersonalInfo: true,
    staleTime: 5 * 60 * 1000,
  })
}
```

### Optimistic Updates
```typescript
const updateMutation = useTableMutation('users', true)

await updateMutation.mutateAsync({
  action: 'update',
  id: userId,
  data: { isBlocked: true },
})
```

## 📱 Responsive Design

### Mobile Adaptations
- Automatic column hiding on mobile devices
- Touch-friendly controls
- Swipe gestures for navigation
- Optimized spacing for smaller screens

### Breakpoint Configuration
```typescript
<DataTable
  data={data}
  columns={columns}
  mobileBreakpoint={768}  // Customize mobile breakpoint
/>
```

## 🚀 Performance Optimization

### Virtualization (For Large Datasets)
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

// Automatically handles 100k+ rows
const virtualizer = useVirtualizer({
  count: data.length,
  getScrollElement: () => containerRef.current,
  estimateSize: () => 50,
})
```

### Caching Strategy
- **5 minutes** - User data (dynamic)
- **30 minutes** - Professional data (semi-static)
- **1 minute** - Appointment data (highly dynamic)
- **30 seconds** - Notification data (real-time)

### Bundle Optimization
```typescript
// Lazy load tables for better performance
const UsersTable = lazy(() => import('@/components/tables/UsersTable'))
const ProfessionalsTable = lazy(() => import('@/components/tables/ProfessionalsTable'))
```

## 🧪 Testing

### Unit Tests
```typescript
import { render, screen } from '@testing-library/react'
import { DataTable } from '@/components/tables'

test('renders table with data', () => {
  render(
    <DataTable data={mockData} columns={mockColumns} />
  )

  expect(screen.getByRole('table')).toBeInTheDocument()
})
```

### E2E Tests
```typescript
// Playwright test example
test('table filtering works correctly', async ({ page }) => {
  await page.goto('/users')
  await page.fill('[placeholder="Search users..."]', 'admin')
  await expect(page.locator('table tbody tr')).toHaveCount(2)
})
```

## 🔒 Security Considerations

### XSS Prevention
- All user input is sanitized
- HTML content is properly escaped
- CSP headers recommended

### Data Access Control
- Role-based access control
- Row-level security
- Audit trails for all access

### Export Security
- File size limits (max 10MB)
- Rate limiting (1 export per minute)
- Virus scanning for uploaded files

## 📈 Monitoring & Analytics

### Performance Metrics
```typescript
// Monitor table performance
const metrics = {
  loadTime: Date.now() - startTime,
  rowCount: data.length,
  columnCount: columns.length,
  renderTime: performanceEntry.duration,
}
```

### User Analytics
- Most filtered columns
- Export patterns
- Performance bottlenecks
- Error rates

## 🆘 Troubleshooting

### Common Issues

**1. Slow Loading**
```typescript
// Solution: Implement pagination or virtualization
<DataTable
  data={data}
  columns={columns}
  enablePagination={true}
  pagination={{ pageIndex: 0, pageSize: 25 }}
/>
```

**2. Export Timeouts**
```typescript
// Solution: Implement chunked exports for large datasets
const exportLargeDataset = async (data, chunkSize = 1000) => {
  // Export in chunks
}
```

**3. Memory Issues**
```typescript
// Solution: Use React.memo and stable references
const memoizedColumns = useMemo(() => columns, [])
```

### Debug Mode
```typescript
<DataTable
  data={data}
  columns={columns}
  debug={process.env.NODE_ENV === 'development'}
/>
```

## 📚 Additional Resources

- [TanStack Table Documentation](https://tanstack.com/table/latest)
- [Quebec Law 25 Guide](https://www.quebec.ca/en/government/law-25)
- [PIPEDA Overview](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/)
- [shadcn/ui Components](https://ui.shadcn.com)

## 🤝 Contributing

1. Follow Quebec healthcare compliance requirements
2. Include audit logging in all new features
3. Write comprehensive tests
4. Update documentation
5. Ensure mobile responsiveness

---

**Last Updated**: September 2025
**Compliance Level**: PIPEDA + Quebec Law 25
**Tech Stack**: TanStack Table v8 + React 19 + TypeScript 5.3+