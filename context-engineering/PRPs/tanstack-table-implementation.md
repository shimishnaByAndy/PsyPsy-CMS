name: "TanStack Table Implementation - MUI DataGrid Replacement"
description: |

## Purpose
Replace MUI DataGrid components with TanStack Table for better performance, type safety, and customization while maintaining Material-UI styling and existing component interfaces. Provides headless table logic with complete control over rendering and theming.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Implement TanStack Table as the foundation for all data grid components in PsyPsy CMS, replacing MUI DataGrid with a headless table solution that maintains Material-UI theming, preserves existing component interfaces, and provides enhanced performance and customization capabilities.

## Why
- **Business value**: Better performance for large datasets, complete control over styling and behavior
- **Integration**: Maintains existing Material-UI component ecosystem and PsyPsy theme
- **Problems solved**: MUI DataGrid limitations (customization, performance, licensing), provides server-side sorting/filtering, infinite scrolling capabilities

## What
A complete table component replacement where:
- ClientsDataGrid, ProfessionalsDataGrid, AppointmentsDataGrid, StringsDataGrid use TanStack Table
- Server-side sorting, filtering, and pagination maintained
- Material-UI styling consistency preserved with MDBox, MDTypography, etc.
- Existing component props and interfaces unchanged for seamless migration
- Enhanced features: column reordering, resizing, advanced filtering

### Success Criteria
- [ ] All existing DataGrid components work with TanStack Table
- [ ] Server-side sorting, filtering, pagination functional
- [ ] Material-UI styling consistency maintained
- [ ] Component interfaces unchanged (backward compatible)
- [ ] Performance improved for large datasets (>1000 rows)
- [ ] Column reordering and resizing work smoothly

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://tanstack.com/table/latest
  why: Core TanStack Table concepts, headless architecture
  
- url: https://tanstack.com/table/latest/docs/framework/react/guide/introduction
  why: React-specific implementation patterns and hooks
  
- url: https://tanstack.com/table/latest/docs/framework/react/examples/material-ui
  why: Material-UI integration examples and styling patterns
  
- url: https://mui.com/material-ui/react-table/
  why: Material-UI table components (Table, TableHead, TableBody, TableCell)
  
- file: src/components/ClientsDataGrid/index.js
  why: Current MUI DataGrid implementation, column definitions, data transformation
  
- file: src/components/ProfessionalsDataGrid/index.js  
  why: Professional-specific table features, verification status columns
  
- file: src/components/MDBox/index.js
  why: Material Dashboard component patterns for consistent styling
  
- file: src/components/MDTypography/index.js
  why: Typography consistency for table headers and cell content

- file: src/assets/theme/components/table/
  why: Existing table theme customizations and Material-UI overrides

- docfile: INITIAL.md
  why: TanStack Table examples and Material-UI integration requirements
```

### Current Codebase tree
```bash
src/
├── components/
│   ├── ClientsDataGrid/         # Current MUI DataGrid implementation
│   ├── ProfessionalsDataGrid/   # Professional management grid
│   ├── AppointmentsDataGrid/    # Appointment scheduling grid
│   ├── StringsDataGrid/         # i18n string management grid
│   ├── LoadingState/            # Loading state components
│   ├── EmptyState/              # Empty state components
│   ├── MDBox/                   # Material Dashboard styled Box
│   ├── MDTypography/            # Material Dashboard typography
│   └── MDButton/                # Material Dashboard buttons
├── services/
│   ├── clientService.js         # Data fetching with pagination/search
│   ├── professionalService.js   # Professional data operations
│   └── appointmentService.js    # Appointment data management
├── assets/theme/components/table/
│   ├── tableCell.js             # Material-UI table cell overrides
│   ├── tableContainer.js        # Table container styling
│   └── tableHead.js             # Table header styling
└── layouts/
    ├── clients/                 # Client management layout
    ├── professionals/           # Professional management layout
    └── appointments/            # Appointment management layout
```

### Desired Codebase tree with files to be added
```bash
src/
├── components/
│   ├── TanStackTable/           # New: Reusable TanStack Table component
│   │   ├── index.js            # Main table component
│   │   ├── TableHeader.js      # Sortable header with Material-UI styling
│   │   ├── TableBody.js        # Table body with row virtualization
│   │   ├── TableCell.js        # Themed table cell component
│   │   ├── TablePagination.js  # Material-UI pagination integration
│   │   ├── TableToolbar.js     # Search, filter, export toolbar
│   │   └── hooks/              # Table-specific hooks
│   │       ├── useTableConfig.js
│   │       ├── useTableSorting.js
│   │       └── useTableFiltering.js
│   ├── ClientsDataGrid/         # Updated to use TanStack Table
│   ├── ProfessionalsDataGrid/   # Updated with TanStack Table
│   ├── AppointmentsDataGrid/    # Updated TanStack implementation
│   └── StringsDataGrid/         # Updated for i18n management
├── hooks/
│   ├── useTableData.js          # Generic table data fetching
│   └── useServerSideTable.js    # Server-side table operations
├── utils/
│   ├── tableHelpers.js          # Table utility functions
│   └── columnDefinitions.js     # Reusable column definitions
└── types/
    └── table.types.js           # TypeScript definitions for table
```

### Known Gotchas & Library Quirks
```javascript
// CRITICAL: TanStack Table is headless - no built-in styling
// Must wrap with Material-UI Table components for consistent theming
// Use Table, TableHead, TableBody, TableRow, TableCell from @mui/material

// CRITICAL: TanStack Table requires stable column definitions
// Use useMemo for column definitions to prevent infinite re-renders
// Column accessors must match data structure exactly

// CRITICAL: Server-side operations need manual implementation
// TanStack Table doesn't handle server pagination/sorting automatically
// Must implement onSortingChange, onPaginationChange handlers

// CRITICAL: Parse Server data structure requires transformation
// Parse objects use .get() method, TanStack Table expects plain objects
// Must transform data in service layer or accessor functions

// CRITICAL: Material-UI table styling needs sx prop customization
// Default table styling may conflict with PsyPsy theme
// Use existing theme/components/table/ overrides

// CRITICAL: Row selection state must be managed manually
// TanStack Table provides selection helpers but not automatic UI
// Integrate with Material-UI checkbox components
```

## Implementation Blueprint

### Data models and structure

Create reusable TanStack Table component with Material-UI integration.
```typescript
// components/TanStackTable/types.js
export interface TableColumn {
  id: string;
  accessorKey?: string;
  accessorFn?: (row: any) => any;
  header: string | React.ComponentType;
  cell?: (info: CellContext) => React.ReactNode;
  enableSorting?: boolean;
  enableResizing?: boolean;
  size?: number;
  minSize?: number;
  maxSize?: number;
}

export interface TableProps {
  data: any[];
  columns: TableColumn[];
  loading?: boolean;
  error?: string | null;
  
  // Server-side operations
  serverSide?: boolean;
  onSortingChange?: (sorting: SortingState) => void;
  onPaginationChange?: (pagination: PaginationState) => void;
  onGlobalFilterChange?: (filter: string) => void;
  
  // Pagination
  pageCount?: number;
  pageIndex?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  
  // Styling & behavior
  enableSorting?: boolean;
  enableColumnResizing?: boolean;
  enableRowSelection?: boolean;
  onRowClick?: (row: any) => void;
  
  // Empty & loading states
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
}

// utils/columnDefinitions.js - Reusable column definitions
export const clientColumns = [
  {
    id: 'name',
    accessorFn: (row) => `${row.clientPtr?.firstName || ''} ${row.clientPtr?.lastName || ''}`.trim(),
    header: 'Name',
    cell: (info) => (
      <MDBox lineHeight={1} py={1}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {info.getValue()}
        </MDTypography>
        <MDTypography variant="caption" color="text" fontWeight="regular">
          {info.row.original.email}
        </MDTypography>
      </MDBox>
    ),
    enableSorting: true,
    size: 250,
  },
  {
    id: 'age',
    accessorFn: (row) => calculateAge(row.clientPtr?.dob),
    header: 'Age',
    cell: (info) => (
      <MDTypography variant="caption" fontWeight="medium">
        {info.getValue()}
      </MDTypography>
    ),
    enableSorting: true,
    size: 100,
  },
  // ... more column definitions
];
```

### List of tasks to be completed to fulfill the PRP in the order they should be completed

```yaml
Task 1: Install Dependencies and Setup
CREATE package.json additions:
  - INSTALL: @tanstack/react-table@latest
  - VERIFY: @mui/material compatibility with TanStack Table
  - CHECK: No version conflicts with existing Material-UI setup

Task 2: Create Core TanStack Table Component
CREATE components/TanStackTable/index.js:
  - PATTERN: Headless table with Material-UI Table wrapper
  - IMPLEMENT: useReactTable hook with server-side configuration
  - INTEGRATE: Material-UI Table, TableHead, TableBody, TableRow, TableCell
  - PRESERVE: PsyPsy theme styling and MDBox/MDTypography patterns

CREATE components/TanStackTable/TableHeader.js:
  - PATTERN: Sortable headers with Material-UI TableHead
  - IMPLEMENT: Sort indicators using Material-UI icons (ArrowUpward, ArrowDownward)
  - INTEGRATE: Existing theme/components/table/tableHead.js styling
  - ADD: Column resizing handles with Material-UI styling

CREATE components/TanStackTable/TableBody.js:
  - PATTERN: Virtualized table body for performance
  - IMPLEMENT: Row rendering with Material-UI TableBody/TableRow
  - HANDLE: Loading states, empty states, error states
  - PRESERVE: Existing hover effects and row styling

Task 3: Create Table Utility Components
CREATE components/TanStackTable/TablePagination.js:
  - PATTERN: Material-UI TablePagination component integration
  - IMPLEMENT: Server-side pagination controls
  - MAINTAIN: Same pagination interface as current DataGrid
  - ADD: Page size selection with existing pageSizeOptions

CREATE components/TanStackTable/TableToolbar.js:
  - PATTERN: Material-UI Toolbar with search, filter controls
  - IMPLEMENT: Global search input with Material-UI TextField
  - ADD: Export buttons (Excel, CSV) with Material-UI Button
  - INTEGRATE: Existing MDButton and MDInput components

Task 4: Create Column Definition Utilities
CREATE utils/columnDefinitions.js:
  - PATTERN: Factory functions for common column types
  - IMPLEMENT: Client columns matching current ClientsDataGrid
  - IMPLEMENT: Professional columns with verification status
  - IMPLEMENT: Appointment columns with status and time formatting
  - PRESERVE: All existing cell renderers and formatters

CREATE utils/tableHelpers.js:
  - PATTERN: Utility functions for data transformation
  - IMPLEMENT: Parse object to plain object transformation
  - IMPLEMENT: Age calculation, phone formatting, date formatting
  - IMPLEMENT: Status chip generation with Material-UI Chip

Task 5: Create Table Data Hooks
CREATE hooks/useServerSideTable.js:
  - PATTERN: Generic server-side table data management
  - IMPLEMENT: Sorting, pagination, filtering state management
  - INTEGRATE: With existing service layer (clientService, etc.)
  - HANDLE: Loading states, error states, optimistic updates

CREATE hooks/useTableData.js:
  - PATTERN: Data fetching hook for table components
  - IMPLEMENT: Integration with TanStack Query (if available)
  - FALLBACK: Direct service calls if TanStack Query not implemented
  - HANDLE: Real-time data updates and cache invalidation

Task 6: Update ClientsDataGrid Component
MODIFY src/components/ClientsDataGrid/index.js:
  - REPLACE: MUI DataGrid with TanStack Table component
  - PRESERVE: All existing props and interface (onViewClient, searchTerm, filters)
  - MAINTAIN: Loading states, empty states, error handling
  - IMPLEMENT: Server-side sorting, pagination, search
  - KEEP: All existing cell renderers (name, age, gender, phone, etc.)

Task 7: Update ProfessionalsDataGrid Component  
MODIFY src/components/ProfessionalsDataGrid/index.js:
  - REPLACE: MUI DataGrid implementation
  - PRESERVE: Professional verification workflow
  - IMPLEMENT: Professional-specific column definitions
  - MAINTAIN: Verification status indicators and actions
  - ADD: Professional search and filtering capabilities

Task 8: Update AppointmentsDataGrid Component
MODIFY src/components/AppointmentsDataGrid/index.js:
  - REPLACE: MUI DataGrid with appointment-specific TanStack Table
  - PRESERVE: Appointment status workflow and actions
  - IMPLEMENT: Date/time column sorting and filtering
  - MAINTAIN: Appointment status indicators and scheduling actions

Task 9: Update StringsDataGrid Component
MODIFY src/components/StringsDataGrid/index.js:
  - REPLACE: MUI DataGrid with internationalization-specific table
  - PRESERVE: String editing and translation workflow
  - IMPLEMENT: Multi-language string display
  - MAINTAIN: String status and completion indicators

Task 10: Integration Testing and Optimization
TEST all DataGrid components:
  - VERIFY: Same functionality as before migration
  - CHECK: Performance improvement with large datasets
  - VALIDATE: Server-side operations work correctly
  - CONFIRM: Material-UI theming consistency maintained
```

### Per task pseudocode

```typescript
// Task 2: Core TanStack Table Component
// components/TanStackTable/index.js
import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';

// Material-UI components
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
} from '@mui/material';

// Material Dashboard components  
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import EmptyState from 'components/EmptyState';

const TanStackTable = ({
  data,
  columns,
  loading = false,
  error = null,
  serverSide = false,
  onSortingChange,
  onPaginationChange,
  pageCount = -1,
  pageIndex = 0,
  pageSize = 10,
  enableSorting = true,
  enableColumnResizing = false,
  onRowClick,
  emptyState,
}) => {
  // PATTERN: Memoize column definitions to prevent re-renders
  const memoizedColumns = useMemo(() => columns, [columns]);
  const memoizedData = useMemo(() => data || [], [data]);
  
  // PATTERN: TanStack Table configuration
  const table = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    pageCount: serverSide ? pageCount : undefined,
    
    // Core functionality
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    
    // Server-side configuration
    manualSorting: serverSide,
    manualPagination: serverSide,
    
    // State management
    state: {
      pagination: { pageIndex, pageSize },
    },
    
    // Event handlers for server-side operations
    onSortingChange: serverSide ? onSortingChange : undefined,
    onPaginationModelChange: serverSide ? onPaginationChange : undefined,
    
    // Features
    enableSorting,
    enableColumnResizing,
  });

  return (
    <MDBox>
      {/* Loading Progress Bar */}
      {loading && <LinearProgress />}
      
      {/* Error State */}
      {error && (
        <MDBox p={2}>
          <MDTypography color="error">{error}</MDTypography>
        </MDBox>
      )}
      
      {/* Table Container */}
      <TableContainer component={Paper} elevation={0}>
        <Table
          sx={{
            '& .MuiTableCell-head': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              fontWeight: 600,
            },
            '& .MuiTableRow-hover:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          {/* Table Header */}
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell
                    key={header.id}
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    sx={{
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      userSelect: 'none',
                      width: header.getSize(),
                    }}
                  >
                    <MDBox display="flex" alignItems="center">
                      {header.isPlaceholder ? null : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {/* Sort indicators */}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted()] ?? null}
                    </MDBox>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          
          {/* Table Body */}
          <TableBody>
            {!loading && !error && memoizedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  {emptyState || <EmptyState type="clients" size="medium" />}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  hover={!!onRowClick}
                  onClick={() => onRowClick?.(row.original)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </MDBox>
  );
};

// Task 6: Updated ClientsDataGrid Implementation
// components/ClientsDataGrid/index.js (MODIFIED)
import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import TanStackTable from 'components/TanStackTable';
import { clientColumns } from 'utils/columnDefinitions';
import { ClientService } from 'services/clientService';

function ClientsDataGrid({ 
  onViewClient, 
  searchTerm = '', 
  filters = {},
  height = '100%' 
}) {
  const { t } = useTranslation();
  
  // PRESERVE: Same state structure as original
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([{ id: 'createdAt', desc: true }]);
  
  // PATTERN: Column definitions with Material-UI components
  const columns = useMemo(() => clientColumns(t, onViewClient), [t, onViewClient]);
  
  // PATTERN: Server-side data fetching
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await ClientService.getClients({
        page: pagination.pageIndex,
        limit: pagination.pageSize,
        search: searchTerm,
        sortBy: sorting[0]?.id || 'createdAt',
        sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
        filters: filters
      });
      
      setData(result.results);
      setRowCount(result.total);
    } catch (err) {
      setError(err.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, [pagination, sorting, searchTerm, filters]);
  
  // PATTERN: TanStack Table event handlers
  const handleSortingChange = useCallback((updaterOrValue) => {
    setSorting(updaterOrValue);
  }, []);
  
  const handlePaginationChange = useCallback((updaterOrValue) => {
    setPagination(updaterOrValue);
  }, []);
  
  // PRESERVE: Same useEffect pattern for data loading
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return (
    <TanStackTable
      data={data}
      columns={columns}
      loading={loading}
      error={error}
      
      // Server-side operations
      serverSide={true}
      onSortingChange={handleSortingChange}
      onPaginationChange={handlePaginationChange}
      pageCount={Math.ceil(rowCount / pagination.pageSize)}
      pageIndex={pagination.pageIndex}
      pageSize={pagination.pageSize}
      
      // Row interaction
      onRowClick={(row) => onViewClient?.(row.objectId || row.id)}
      
      // Features
      enableSorting={true}
      enableColumnResizing={false}
    />
  );
}

export default ClientsDataGrid;
```

### Integration Points
```yaml
DEPENDENCIES:
  - add to: package.json
  - packages: |
      @tanstack/react-table: "^8.10.0"

MATERIAL-UI:
  - preserve: Existing Table, TableHead, TableBody, TableCell components
  - enhance: Custom table styling with sx prop
  - integrate: MDBox, MDTypography, MDButton for consistency

THEMING:
  - maintain: assets/theme/components/table/ customizations
  - extend: TanStack Table specific styling requirements
  - preserve: PsyPsy brand colors and typography

COMPONENTS:
  - replace: All DataGrid components with TanStack Table
  - preserve: Component interfaces and props
  - enhance: Performance and customization capabilities
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
npm install @tanstack/react-table@^8.10.0
npm run build # Ensure no compilation errors with new table components
npx eslint src/components/TanStackTable/ # Check code style

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests
```javascript
// CREATE __tests__/components/TanStackTable.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import TanStackTable from '../../../components/TanStackTable';

const mockColumns = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Email',
  },
];

const mockData = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
];

test('TanStackTable renders data correctly', () => {
  render(
    <TanStackTable
      data={mockData}
      columns={mockColumns}
      loading={false}
    />
  );
  
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('jane@example.com')).toBeInTheDocument();
});

test('TanStackTable shows loading state', () => {
  render(
    <TanStackTable
      data={[]}
      columns={mockColumns}
      loading={true}
    />
  );
  
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
});

test('TanStackTable handles sorting', () => {
  const mockOnSortingChange = jest.fn();
  
  render(
    <TanStackTable
      data={mockData}
      columns={mockColumns}
      serverSide={true}
      onSortingChange={mockOnSortingChange}
    />
  );
  
  fireEvent.click(screen.getByText('Name'));
  expect(mockOnSortingChange).toHaveBeenCalled();
});

test('ClientsDataGrid maintains same interface', () => {
  const mockOnViewClient = jest.fn();
  
  render(
    <ClientsDataGrid
      onViewClient={mockOnViewClient}
      searchTerm=""
      filters={{}}
    />
  );
  
  // Should render without errors and maintain same props interface
  expect(screen.getByTestId('clients-table')).toBeInTheDocument();
});
```

```bash
# Run tests iteratively until passing:
npm test -- __tests__/components/TanStackTable
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Test
```bash
# Start the development server
npm start

# Test in browser - Navigate to data grid pages
# Navigate to /clients - should load with TanStack Table
# Navigate to /professionals - should show professional data
# Navigate to /appointments - should display appointment grid

# Expected behaviors:
# - All data grids load without visual changes
# - Sorting functionality works correctly
# - Pagination controls function properly
# - Search and filtering maintain same behavior
# - Performance improved for large datasets
# - Material-UI theming consistent throughout
```

## Final Validation Checklist
- [ ] All tests pass: `npm test -- __tests__/components/TanStackTable`
- [ ] No linting errors: `npx eslint src/components/TanStackTable/`
- [ ] No compilation errors: `npm run build`
- [ ] ClientsDataGrid works with TanStack Table
- [ ] ProfessionalsDataGrid maintains verification workflow
- [ ] AppointmentsDataGrid shows appointment data correctly
- [ ] StringsDataGrid handles i18n strings properly
- [ ] Server-side sorting, filtering, pagination functional
- [ ] Material-UI theming consistency maintained
- [ ] Performance improved for large datasets
- [ ] Component interfaces unchanged (backward compatible)

---

## Anti-Patterns to Avoid
- ❌ Don't use TanStack Table without Material-UI wrapper components
- ❌ Don't forget to memoize column definitions - causes infinite re-renders
- ❌ Don't mix client-side and server-side table operations
- ❌ Don't ignore Parse Server data transformation requirements
- ❌ Don't override Material-UI table theme without preserving PsyPsy brand
- ❌ Don't change existing component props - maintain backward compatibility

## Confidence Score: 8/10

High confidence due to:
- TanStack Table has excellent React documentation and Material-UI examples
- Existing DataGrid components provide clear interface requirements
- Material-UI table components already integrated in theme
- Parse Server data transformation patterns established

Minor uncertainty around performance optimization for very large datasets and potential Material-UI styling conflicts that may require theme adjustments.