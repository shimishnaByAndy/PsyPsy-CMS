# TanStack Library Integration Plan for PsyPsy CMS

## Recommended TanStack Stack

When implementing TanStack libraries in PsyPsy CMS, use this recommended stack for optimal integration:

**Core TanStack Libraries:**
- **Table core**: `@tanstack/react-table` - Headless table logic and state management
- **Virtualization**: `@tanstack/react-virtual` - Performance optimization for large datasets
- **Data fetching**: `@tanstack/react-query` - Server state management and caching
- **Forms**: `@tanstack/react-form` - Type-safe form handling with validation
- **Devtools**: `@tanstack/react-query-devtools` - Development debugging tools

**UI & Styling:**
- **UI Components**: Material-UI Table components (`Table`, `TableHead`, `TableRow`, `TableCell`) for consistent styling with existing PsyPsy theme
- **Icons**: `@mui/icons-material` (already included) for table actions and sorting indicators

**Enhanced Functionality:**
- **Drag & Drop**: `@dnd-kit/core` - Column and row reordering capabilities
- **Data Export**: 
  - `xlsx` - Excel export functionality
  - `papaparse` - CSV export and parsing
- **Accessibility**: 
  - Keep to Material-UI semantics for base accessibility
  - `@react-aria` patterns for complex custom widgets (optional)

**Validation & Type Safety:**
- **Schema Validation**: `zod` - Type-safe validation schemas
- **Form Adapter**: `@tanstack/zod-form-adapter` - Zod integration with TanStack Form

**Installation Command:**
```bash
npm install @tanstack/react-table @tanstack/react-virtual @tanstack/react-query @tanstack/react-form @tanstack/react-query-devtools @tanstack/zod-form-adapter @dnd-kit/core xlsx papaparse zod
```

**Development Dependencies:**
```bash
npm install --save-dev @react-aria/interactions @react-aria/utils
```

## FEATURE: TanStack Query Integration

Replace the current Parse Server service layer with TanStack Query for improved data fetching, caching, and state management. This will eliminate the manual `useEffect` + `fetch` patterns currently used in services like `clientService.js`, `professionalService.js`, and `dashboardService.js`.

**Implementation Areas:**
- Dashboard statistics with automatic background refetching
- Client/Professional data fetching with optimistic updates
- Appointment management with real-time synchronization
- Authentication state management with Parse Server
- Error handling and retry logic for Parse Server operations

## EXAMPLES:

**Current Pattern (to be replaced):**
```javascript
// src/services/clientService.js - Current implementation
const fetchClients = async () => {
  try {
    const clients = await parseService.getAll('Client');
    return clients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }
};
```

**TanStack Query Pattern:**
```javascript
// New implementation with TanStack Query
const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => parseService.getAll('Client'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};
```

**Dashboard Statistics Example:**
```javascript
// Enhanced dashboard with automatic refetching
const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => Parse.Cloud.run("fetchClientStats"),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider stale after 10 seconds
  });
};
```

**Optimistic Updates Example:**
```javascript
// Professional verification with optimistic updates
const useVerifyProfessional = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ professionalId, status }) => 
      Parse.Cloud.run("verifyProfessional", { professionalId, status }),
    onMutate: async ({ professionalId, status }) => {
      // Optimistic update
      await queryClient.cancelQueries(['professionals']);
      const previousProfessionals = queryClient.getQueryData(['professionals']);
      
      queryClient.setQueryData(['professionals'], (old) =>
        old.map(prof => 
          prof.id === professionalId 
            ? { ...prof, isVerified: status }
            : prof
        )
      );
      
      return { previousProfessionals };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['professionals'], context.previousProfessionals);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['professionals']);
    },
  });
};
```

## FEATURE: TanStack Table Integration

Replace the current MUI DataGrid components with TanStack Table for better performance, type safety, and customization while maintaining Material-UI styling.

**Implementation Areas:**
- `ClientsDataGrid` component replacement
- `ProfessionalsDataGrid` component replacement  
- `AppointmentsDataGrid` component replacement
- `StringsDataGrid` component replacement
- Custom filtering and sorting for Parse Server data

## EXAMPLES:

**Current MUI DataGrid Pattern:**
```javascript
// src/components/ClientsDataGrid/index.js - Current implementation
import { DataGrid } from '@mui/x-data-grid';

const ClientsDataGrid = ({ clients, loading }) => {
  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 150 },
    // ... more columns
  ];

  return (
    <DataGrid
      rows={clients}
      columns={columns}
      loading={loading}
      pageSize={10}
    />
  );
};
```

**TanStack Table Pattern:**
```javascript
// New TanStack Table implementation
import { useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';

const ClientsTable = () => {
  const { data: clients, isLoading } = useClients();
  
  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <MDTypography variant="body2">
          {row.original.get('name')}
        </MDTypography>
      ),
    },
    // ... more columns with custom Material-UI components
  ], []);

  const table = useReactTable({
    data: clients || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <MDBox>
      {/* Custom Material-UI table implementation */}
      <Table>
        <TableHead>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableCell key={header.id}>
                  <MDButton
                    variant="text"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </MDButton>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </MDBox>
  );
};
```

## FEATURE: TanStack Form Integration

Enhance form handling throughout the application with type-safe validation and better user experience, particularly for authentication, professional registration, and client onboarding forms.

## EXAMPLES:

**Professional Registration Form:**
```javascript
// Enhanced professional registration with TanStack Form
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';

const professionalSchema = z.object({
  email: z.string().email(),
  credentials: z.string().min(10),
  specialties: z.array(z.string()).min(1),
  licenseNumber: z.string().regex(/^[A-Z0-9]{6,10}$/),
});

const ProfessionalRegistrationForm = () => {
  const form = useForm({
    defaultValues: {
      email: '',
      credentials: '',
      specialties: [],
      licenseNumber: '',
    },
    onSubmit: async ({ value }) => {
      // Submit to Parse Server
      const professional = new Parse.Object('Professional');
      professional.set('email', value.email);
      // ... set other fields
      await professional.save();
    },
    validatorAdapter: zodValidator,
  });

  return (
    <MDBox component="form" onSubmit={(e) => {
      e.preventDefault();
      e.stopPropagation();
      void form.handleSubmit();
    }}>
      <form.Field
        name="email"
        validators={{
          onChange: professionalSchema.shape.email,
        }}
        children={(field) => (
          <MDInput
            label="Email"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors.length > 0}
            helperText={field.state.meta.errors[0]}
          />
        )}
      />
      {/* More fields... */}
      <MDButton type="submit" disabled={!form.state.canSubmit}>
        Register Professional
      </MDButton>
    </MDBox>
  );
};
```

## FEATURE: TanStack Virtual Integration

Implement virtualization for large datasets in data grids when performance becomes an issue with thousands of records.

## EXAMPLES:

**Virtualized Client List:**
```javascript
// Large client list with virtualization
import { useVirtualizer } from '@tanstack/react-virtual';

const VirtualizedClientList = () => {
  const { data: clients } = useClients();
  const parentRef = useRef();

  const rowVirtualizer = useVirtualizer({
    count: clients?.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Estimated row height
    overscan: 10,
  });

  return (
    <MDBox
      ref={parentRef}
      sx={{
        height: '600px',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ClientRow client={clients[virtualItem.index]} />
          </div>
        ))}
      </div>
    </MDBox>
  );
};
```

## FEATURE: Enhanced Table Features with Recommended Stack

Integrate drag & drop, export functionality, and accessibility features using the recommended stack.

## EXAMPLES:

**Drag & Drop Column Reordering:**
```javascript
// Enhanced table with drag & drop using @dnd-kit/core
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DraggableTableHeader = ({ header, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: header.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableCell
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {children}
    </TableCell>
  );
};

const ClientsTableWithDragDrop = () => {
  const { data: clients } = useClients();
  const [columnOrder, setColumnOrder] = useState(['id', 'name', 'email', 'status']);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Table>
        <TableHead>
          <SortableContext items={columnOrder} strategy={verticalListSortingStrategy}>
            <TableRow>
              {columnOrder.map((columnId) => {
                const header = table.getHeaderGroups()[0].headers.find(h => h.id === columnId);
                return (
                  <DraggableTableHeader key={columnId} header={header}>
                    <MDTypography variant="subtitle2">
                      {header.column.columnDef.header}
                    </MDTypography>
                  </DraggableTableHeader>
                );
              })}
            </TableRow>
          </SortableContext>
        </TableHead>
        <TableBody>
          {/* Table body implementation */}
        </TableBody>
      </Table>
    </DndContext>
  );
};
```

**Data Export Functionality:**
```javascript
// Enhanced table with Excel and CSV export using xlsx and papaparse
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const useTableExport = (data, filename = 'export') => {
  const exportToExcel = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map(client => ({
        ID: client.id,
        Name: client.get('name'),
        Email: client.get('email'),
        Status: client.get('status'),
        'Created At': client.get('createdAt').toLocaleDateString(),
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }, [data, filename]);

  const exportToCSV = useCallback(() => {
    const csvData = data.map(client => ({
      ID: client.id,
      Name: client.get('name'),
      Email: client.get('email'),
      Status: client.get('status'),
      'Created At': client.get('createdAt').toLocaleDateString(),
    }));
    
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  }, [data, filename]);

  return { exportToExcel, exportToCSV };
};

const ClientsTableWithExport = () => {
  const { data: clients } = useClients();
  const { exportToExcel, exportToCSV } = useTableExport(clients, 'clients');

  return (
    <MDBox>
      {/* Export Actions */}
      <MDBox mb={2} display="flex" gap={2}>
        <MDButton
          variant="outlined"
          color="success"
          onClick={exportToExcel}
          startIcon={<DownloadIcon />}
        >
          Export Excel
        </MDButton>
        <MDButton
          variant="outlined"
          color="info"
          onClick={exportToCSV}
          startIcon={<DownloadIcon />}
        >
          Export CSV
        </MDButton>
      </MDBox>

      {/* Table implementation */}
      <Table>
        {/* Table content */}
      </Table>
    </MDBox>
  );
};
```

**Enhanced Accessibility with React Aria:**
```javascript
// Accessible table interactions using @react-aria patterns
import { useFocusRing } from '@react-aria/focus';
import { useHover } from '@react-aria/interactions';
import { mergeProps } from '@react-aria/utils';

const AccessibleTableCell = ({ children, ...props }) => {
  const { isFocusVisible, focusProps } = useFocusRing();
  const { isHovered, hoverProps } = useHover({});

  return (
    <TableCell
      {...mergeProps(props, focusProps, hoverProps)}
      sx={{
        outline: isFocusVisible ? '2px solid #1976d2' : 'none',
        backgroundColor: isHovered ? 'action.hover' : 'transparent',
        transition: 'background-color 0.2s ease',
      }}
    >
      {children}
    </TableCell>
  );
};

// Accessible sortable header with keyboard navigation
const AccessibleSortableHeader = ({ column, children }) => {
  const { isFocusVisible, focusProps } = useFocusRing();
  const sortDirection = column.getIsSorted();

  return (
    <TableCell
      component="th"
      scope="col"
      {...focusProps}
      sx={{
        outline: isFocusVisible ? '2px solid #1976d2' : 'none',
        cursor: 'pointer',
      }}
    >
      <MDButton
        variant="text"
        onClick={column.getToggleSortingHandler()}
        endIcon={
          sortDirection === 'asc' ? <ArrowUpwardIcon /> :
          sortDirection === 'desc' ? <ArrowDownwardIcon /> : 
          <UnfoldMoreIcon />
        }
        aria-label={`Sort by ${children} ${
          sortDirection === 'asc' ? 'descending' : 
          sortDirection === 'desc' ? 'remove sort' : 
          'ascending'
        }`}
        aria-describedby={`sort-help-${column.id}`}
      >
        {children}
      </MDButton>
      <span id={`sort-help-${column.id}`} className="sr-only">
        {sortDirection ? `Sorted ${sortDirection}ending` : 'Not sorted'}
      </span>
    </TableCell>
  );
};
```

## FEATURE: TanStack Router Integration (Future Consideration)

Replace React Router with TanStack Router for type-safe routing and better URL state management if the application grows in complexity.

## EXAMPLES:

**Type-Safe Route Definition:**
```javascript
// Type-safe routes with search parameter validation
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const clientsSearchSchema = z.object({
  page: z.number().optional().default(1),
  filter: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'status']).optional().default('name'),
});

export const Route = createFileRoute('/clients')({
  validateSearch: clientsSearchSchema,
  component: ClientsPage,
});

function ClientsPage() {
  const { page, filter, sortBy } = Route.useSearch();
  
  const { data: clients } = useClients({
    page,
    filter,
    sortBy,
  });

  return <ClientsDataGrid clients={clients} />;
}
```

## DOCUMENTATION:

**TanStack Query:**
- **For any questions ask DeepWiki MCP one question at a time about TanStack/query**
- DeepWiki Reference: [Overview (TanStack/query)](/wiki/TanStack/query#1)
- DeepWiki Reference: [Advanced Usage (TanStack/query)](/wiki/TanStack/query#5)
- Official Documentation: https://tanstack.com/query/latest
- Parse Server Integration Guide: https://tanstack.com/query/latest/docs/framework/react/guides/mutations

**TanStack Table:**
- **For any questions ask DeepWiki MCP one question at a time about TanStack/table**
- DeepWiki Reference: [Core Architecture (TanStack/table)](/wiki/TanStack/table#2)
- Official Documentation: https://tanstack.com/table/latest
- React Integration Guide: https://tanstack.com/table/latest/docs/framework/react/guide/introduction
- Material-UI Integration Examples: https://tanstack.com/table/latest/docs/framework/react/examples/material-ui

**TanStack Form:**
- **For any questions ask DeepWiki MCP one question at a time about TanStack/form**
- DeepWiki Reference: [Getting Started (TanStack/form)](/wiki/TanStack/form#3)
- DeepWiki Reference: [Validation System (TanStack/form)](/wiki/TanStack/form#4)
- Official Documentation: https://tanstack.com/form/latest
- Zod Integration: https://tanstack.com/form/latest/docs/framework/react/guides/validation

**TanStack Virtual:**
- **For any questions ask DeepWiki MCP one question at a time about TanStack/virtual**
- DeepWiki Reference: [Architecture (TanStack/virtual)](/wiki/TanStack/virtual#1.1)
- DeepWiki Reference: [Getting Started (TanStack/virtual)](/wiki/TanStack/virtual#1.2)
- Official Documentation: https://tanstack.com/virtual/latest
- React Integration: https://tanstack.com/virtual/latest/docs/framework/react/guide/introduction

**TanStack Router:**
- **For any questions ask DeepWiki MCP one question at a time about TanStack/router**
- DeepWiki Reference: [Overview (TanStack/router)](/wiki/TanStack/router#1)
- Official Documentation: https://tanstack.com/router/latest
- Migration Guide: https://tanstack.com/router/latest/docs/framework/react/guide/migrating

**TanStack Store:**
- **For any questions ask DeepWiki MCP one question at a time about TanStack/store**
- DeepWiki Reference: [Features and Benefits (TanStack/store)](/wiki/TanStack/store#1.1)
- DeepWiki Reference: [Core Concepts (TanStack/store)](/wiki/TanStack/store#2.1)
- Official Documentation: https://tanstack.com/store/latest

**TanStack Devtools:**
- **For any questions ask DeepWiki MCP one question at a time about TanStack/query (devtools are part of TanStack Query)**
- Official Documentation: https://tanstack.com/query/latest/docs/framework/react/devtools
- Installation Guide: https://tanstack.com/query/latest/docs/framework/react/devtools#installation

**Material-UI:**
- **For any questions ask DeepWiki MCP one question at a time about mui/material-ui**
- DeepWiki Reference: [Component Libraries (mui/material-ui)](/wiki/mui/material-ui#2)
- DeepWiki Reference: [Version Management (mui/material-ui)](/wiki/mui/material-ui#5.2)
- Official Documentation: https://mui.com/material-ui/
- Table Components Guide: https://mui.com/material-ui/react-table/
- Theme Customization: https://mui.com/material-ui/customization/theming/
- **Latest Features**: sx prop for inline styling, CSS theme variables in v6, @mui/base unstyled components

**DND Kit:**
- **For any questions ask DeepWiki MCP one question at a time about clauderic/dnd-kit**
- DeepWiki Reference: [Packages (clauderic/dnd-kit)](/wiki/clauderic/dnd-kit#1.1)
- DeepWiki Reference: [Architecture (clauderic/dnd-kit)](/wiki/clauderic/dnd-kit#1.2)
- Official Documentation: https://docs.dndkit.com/
- Sortable Guide: https://docs.dndkit.com/presets/sortable
- React Integration: https://docs.dndkit.com/introduction/getting-started
- **Key Features**: useSortable hook, KeyboardSensor with sortableKeyboardCoordinates, touch support with activation constraints

**PapaParse:**
- **For any questions ask DeepWiki MCP one question at a time about mholt/PapaParse**
- DeepWiki Reference: [Overview (mholt/PapaParse)](/wiki/mholt/PapaParse#1)
- DeepWiki Reference: [Features and Capabilities (mholt/PapaParse)](/wiki/mholt/PapaParse#1.1)
- DeepWiki Reference: [Advanced Features (mholt/PapaParse)](/wiki/mholt/PapaParse#4)
- Official Documentation: https://www.papaparse.com/
- API Reference: https://www.papaparse.com/docs
- React Examples: https://www.papaparse.com/demo
- **Key Features**: Streaming with step/chunk callbacks, Web Worker support (worker: true), RFC 4180 compliance, dynamic typing

**React Spectrum (Adobe):**
- **For any questions ask DeepWiki MCP one question at a time about adobe/react-spectrum**
- DeepWiki Reference: [Overview (adobe/react-spectrum)](/wiki/adobe/react-spectrum#1)
- Official Documentation: https://react-spectrum.adobe.com/
- React Aria Documentation: https://react-spectrum.adobe.com/react-aria/
- Accessibility Guide: https://react-spectrum.adobe.com/react-aria/accessibility.html
- **Key Features**: Unstyled accessibility hooks (useButton, useTable, useComboBox), WAI-ARIA compliance, keyboard navigation support

**Parse SDK JS:**
- **For any questions ask DeepWiki MCP one question at a time about parse-community/Parse-SDK-JS**
- DeepWiki Reference: [Node.js Environment (parse-community/Parse-SDK-JS)](/wiki/parse-community/Parse-SDK-JS#5.2)
- DeepWiki Reference: [Development and Contributing (parse-community/Parse-SDK-JS)](/wiki/parse-community/Parse-SDK-JS#7)
- Official Documentation: https://docs.parseplatform.org/js/guide/
- API Reference: https://parseplatform.org/Parse-SDK-JS/api/
- React Integration Guide: https://docs.parseplatform.org/js/guide/#react
- **Key Features**: Live Query with async/await, ParseQuery.watch() for field-specific updates, Promise-based async operations

## LATEST INTEGRATION EXAMPLES:

### Material-UI v5+ Integration with TanStack Table

**Using sx prop with theme integration:**
```javascript
// Enhanced table styling with sx prop and theme variables
const StyledTable = () => {
  return (
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
        boxShadow: 1, // theme.shadows[1]
        borderRadius: 2, // theme.shape.borderRadius * 2
      }}
    >
      {/* Table content */}
    </Table>
  );
};
```

**Using @mui/base for headless integration:**
```javascript
// Headless button with TanStack Table sorting
import { useButton } from '@mui/base/useButton';
import { useReactTable } from '@tanstack/react-table';

const SortableHeader = ({ column, children }) => {
  const { getRootProps } = useButton({
    onClick: column.getToggleSortingHandler(),
  });

  return (
    <TableCell {...getRootProps()}>
      <Box display="flex" alignItems="center">
        {children}
        {column.getIsSorted() && (
          <ArrowIcon direction={column.getIsSorted()} />
        )}
      </Box>
    </TableCell>
  );
};
```

### DND Kit Latest Integration Patterns

**Enhanced sortable with keyboard and touch support:**
```javascript
// Complete sortable implementation with accessibility
import { 
  DndContext, 
  KeyboardSensor, 
  PointerSensor, 
  TouchSensor,
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

const AccessibleSortableTable = () => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Prevent accidental touch drags
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      accessibility={{
        restoreFocus: true,
        screenReaderInstructions: {
          draggable: 'To pick up a sortable item, press the space bar.',
        },
      }}
    >
      {/* Sortable content */}
    </DndContext>
  );
};
```

### PapaParse Streaming with React Hooks

**Modern CSV processing with streaming and workers:**
```javascript
// Custom hook for CSV processing with streaming
import { useCallback, useState } from 'react';
import Papa from 'papaparse';

const useCsvProcessor = () => {
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback((file) => {
    setIsProcessing(true);
    setProgress(0);
    const results = [];

    Papa.parse(file, {
      header: true,
      worker: true, // Use web worker for large files
      step: (row, parser) => {
        results.push(row.data);
        // Update progress periodically
        if (results.length % 100 === 0) {
          setProgress((results.length / file.size) * 100);
        }
      },
      complete: () => {
        setData(results);
        setIsProcessing(false);
        setProgress(100);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setIsProcessing(false);
      },
    });
  }, []);

  return { processFile, data, progress, isProcessing };
};
```

### React Aria Integration with Material-UI

**Enhanced accessibility for complex components:**
```javascript
// Accessible combobox with Material-UI styling
import { useComboBox } from '@react-aria/combobox';
import { useComboBoxState } from '@react-stately/combobox';

const AccessibleAutocomplete = ({ options, ...props }) => {
  const state = useComboBoxState({
    ...props,
    defaultItems: options,
  });

  const {
    buttonProps,
    inputProps,
    listBoxProps,
    labelProps,
  } = useComboBox(props, state);

  return (
    <MDBox>
      <MDTypography {...labelProps}>
        {props.label}
      </MDTypography>
      <MDInput
        {...inputProps}
        sx={{
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
          },
        }}
      />
      {state.isOpen && (
        <List {...listBoxProps}>
          {/* Options */}
        </List>
      )}
    </MDBox>
  );
};
```

### Parse SDK JS Latest Features

**Live Query with React hooks and async/await:**
```javascript
// Modern Parse integration with Live Query
import { useState, useEffect, useCallback } from 'react';
import Parse from 'parse';

const useParseQuery = (className, queryConstraints = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const query = new Parse.Query(className);
      
      // Apply query constraints
      Object.entries(queryConstraints).forEach(([key, value]) => {
        query.equalTo(key, value);
      });

      const results = await query.find();
      setData(results);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [className, queryConstraints]);

  // Live Query subscription
  useEffect(() => {
    let subscription;

    const setupLiveQuery = async () => {
      try {
        const query = new Parse.Query(className);
        Object.entries(queryConstraints).forEach(([key, value]) => {
          query.equalTo(key, value);
        });

        // Use latest ParseQuery.watch() for field-specific updates
        query.watch(['status', 'updatedAt']);
        
        subscription = await query.subscribe();
        
        subscription.on('create', (object) => {
          setData(prev => [...prev, object]);
        });
        
        subscription.on('update', (object) => {
          setData(prev => prev.map(item => 
            item.id === object.id ? object : item
          ));
        });
        
        subscription.on('delete', (object) => {
          setData(prev => prev.filter(item => item.id !== object.id));
        });
        
      } catch (err) {
        console.error('Live Query setup error:', err);
      }
    };

    fetchData();
    setupLiveQuery();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Usage in component
const ClientsList = () => {
  const { data: clients, loading, error } = useParseQuery('Client', {
    status: 'active'
  });

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  
  return (
    <List>
      {clients.map(client => (
        <ListItem key={client.id}>
          <ListItemText primary={client.get('name')} />
        </ListItem>
      ))}
    </List>
  );
};
```

## OTHER CONSIDERATIONS:

**Parse Server Integration Gotchas:**
- TanStack Query expects Promise-based APIs, but Parse Server methods return Parse.Promise. Wrap Parse operations in native Promises
- Parse Server objects use `.get()` and `.set()` methods, not direct property access. Ensure TanStack Table cell renderers account for this
- Parse Server queries with `include()` return nested objects that may need flattening for table display
- Parse Server `createdAt` and `updatedAt` are Date objects, not strings - format appropriately in table cells

**Material-UI Theme Integration:**
- TanStack Table is headless and won't automatically inherit Material-UI theme colors. Use `sx` prop and theme variables
- Ensure TanStack Form components use Material-UI's error states and validation styling patterns
- Custom table components should follow the existing MDBox, MDTypography patterns for consistency

**Performance Considerations:**
- Start with TanStack Query's default caching behavior before optimizing `staleTime` and `gcTime`
- TanStack Table with large datasets may need `enableRowSelection: false` to prevent performance issues
- Use TanStack Virtual only when you have >1000 rows, as it adds complexity without benefit for smaller datasets

**Development vs Production:**
- TanStack Devtools should be included only in development builds (similar to current React DevTools setup)
- Configure TanStack Query's `retry` behavior differently for development (more retries) vs production (fewer retries)
- Use stricter TypeScript configuration to catch TanStack integration issues early

**Migration Strategy:**
- Don't migrate all data grids at once - start with the simplest one (`StringsDataGrid`) as a proof of concept
- Keep the existing service layer temporarily while migrating to TanStack Query to enable rollback
- Test Parse Server query performance with TanStack Query caching to ensure it doesn't interfere with Parse Server's built-in caching

**Electron-Specific Considerations:**
- TanStack Query's background refetching works well with Electron's window focus/blur events
- Be mindful of network connectivity changes in desktop apps - configure appropriate retry and offline behavior
- Consider using TanStack Query's `persistQueryClient` for offline support in the Electron app

**Type Safety Requirements:**
- Define TypeScript interfaces for all Parse Server object types (Client, Professional, Appointment, etc.)
- Use generic types with TanStack libraries: `useQuery<ParseClient[]>`, `useReactTable<ParseProfessional>`
- Ensure TanStack Form validation schemas match Parse Server validation rules to prevent server-side errors

## PSYPSY CMS DEVELOPMENT PLAN

### Phase 1: Core Functionality
**Priority**: CRITICAL - Foundation for all features

#### Data Layer Migration
- **TanStack Query Integration**
  - Replace Parse Server service layer with TanStack Query
  - Implement automatic caching and background refetching for dashboard statistics
  - Add optimistic updates for professional verification and client management
  - Configure proper error handling and retry logic for Parse Server operations

- **TanStack Table Implementation**
  - Replace MUI DataGrid with TanStack Table for better performance and customization
  - Migrate `ClientsDataGrid`, `ProfessionalsDataGrid`, `AppointmentsDataGrid`, `StringsDataGrid`
  - Implement server-side sorting, filtering, and pagination
  - Maintain Material-UI styling consistency with headless approach

#### Form Enhancement
- **TanStack Form Integration**
  - Implement type-safe form validation with Zod schemas
  - Enhance authentication forms (login, professional registration)
  - Add real-time validation for critical data entry points
  - Integrate with Parse Server data models

#### Core Infrastructure
- **Development Dependencies**
  ```bash
  npm install @tanstack/react-query @tanstack/react-table @tanstack/react-form @tanstack/zod-form-adapter zod
  ```

### Phase 2: UX & Performance
**Priority**: HIGH - User experience and scalability improvements

#### Advanced Table Features
- **Drag & Drop Integration**
  - Install DND Kit: `npm install @dnd-kit/core @dnd-kit/sortable`
  - Implement column reordering with keyboard and touch accessibility
  - Add sortable rows with proper ARIA support

- **Data Export Functionality**
  - Install export libraries: `npm install xlsx papaparse`
  - Add Excel and CSV export capabilities
  - Implement streaming export for large datasets

#### Performance Optimization
- **Virtualization Implementation**
  - Install TanStack Virtual: `npm install @tanstack/react-virtual`
  - Add virtualization for large client/professional lists (>1000 records)
  - Optimize table rendering performance

#### Enhanced Accessibility
- **React Aria Integration**
  - Install accessibility helpers: `npm install --save-dev @react-aria/interactions @react-aria/utils`
  - Enhance focus management and keyboard navigation
  - Implement WCAG 2.1 AA compliance for custom table components

### Phase 3: Animations & Polish
**Priority**: NICE-TO-HAVE - Optional polish once Phases 1 and 2 are stable

#### Animation Framework Setup
- **Motion (Framer Motion) Integration**
  - **For any questions ask DeepWiki MCP one question at a time about motiondivision/motion**
  - DeepWiki Reference: [Overview (motiondivision/motion)](/wiki/motiondivision/motion#1)
  - DeepWiki Reference: [AnimatePresence (motiondivision/motion)](/wiki/motiondivision/motion#4.2)
  - Install Motion: `npm install motion`
  - Configure global animation settings with `MotionConfig`
  - Implement `useReducedMotion` accessibility support throughout application

#### Page Transitions
- **Route-Level Animations**
  ```javascript
  // Page transitions with accessibility support
  const PageTransition = ({ children, routeKey }) => {
    const shouldReduceMotion = useReducedMotion();
    
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={routeKey}
          initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : -20 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  };
  ```

#### Table Micro-Interactions
- **Row Enter/Exit Animations**
  - Implement staggered row animations for data loading
  - Add smooth row insertion/deletion with `AnimatePresence`
  - Optimize animations for large datasets with TanStack Virtual

- **Interactive Feedback**
  - Add hover animations for table rows and buttons
  - Implement loading state animations for data operations
  - Create drag preview animations for DND Kit operations

#### Dialog & Modal Polish
- **Animated Overlays**
  ```javascript
  // Enhanced Material-UI dialogs with Motion
  const AnimatedDialog = ({ open, onClose, children }) => (
    <AnimatePresence>
      {open && (
        <Dialog
          open={true}
          onClose={onClose}
          component={motion.div}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          {children}
        </Dialog>
      )}
    </AnimatePresence>
  );
  ```

#### Micro-Animations & Feedback
- **Lottie Animations**
  - Install Lottie: `npm install lottie-react`
  - Add success animations for form submissions
  - Implement onboarding welcome animations
  - Create empty state illustrations for data tables

- **Loading States**
  - Implement skeleton shimmer loaders for tables
  - Add card placeholder animations during data fetching
  - Create smooth loading-to-content transitions

#### Native Desktop Polish
- **Electron/macOS Enhancements**
  - Configure native window vibrancy effects
  - Implement hiddenInset title bar for modern macOS feel
  - Add native context menus for table operations
  - Optimize window controls and traffic light positioning

#### Animation Dependencies
```bash
# Phase 3 Animation Stack
npm install motion lottie-react
npm install --save-dev @types/lottie-web
```

#### Performance Considerations
- **Animation Optimization**
  - Use `will-change` CSS property judiciously
  - Implement animation frame throttling for complex sequences
  - Add GPU-accelerated transforms where appropriate
  - Monitor animation performance with React DevTools Profiler

- **Accessibility First**
  - Respect `prefers-reduced-motion` system setting
  - Provide animation disable option in user settings
  - Ensure animations don't interfere with screen readers
  - Test with assistive technologies throughout development
