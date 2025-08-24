name: "Drag & Drop Integration with DND Kit - Advanced Table Interactions"
description: |

## Purpose
Implement drag and drop functionality using @dnd-kit/core for TanStack Table components in PsyPsy CMS, providing column reordering, row reordering, and enhanced user interactions while maintaining accessibility standards and Material-UI theming.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Integrate @dnd-kit/core with TanStack Table components to provide drag and drop functionality for column reordering, row reordering, and enhanced table interactions while maintaining WCAG accessibility standards and seamless Material-UI integration.

## Why
- **Business value**: Enhanced user experience for data management, customizable table layouts, improved workflow efficiency
- **Integration**: Seamless integration with existing TanStack Table components and Material-UI theming
- **Problems solved**: Static table layouts, lack of user customization, poor accessibility in drag operations

## What
A comprehensive drag and drop system where:
- Column headers can be reordered by dragging with keyboard and touch support
- Table rows can be reordered for priority management and organization
- Professional verification workflow supports drag-based status management
- Appointment scheduling allows drag-and-drop time slot management
- Full accessibility support with ARIA labels, keyboard navigation, and screen reader announcements

### Success Criteria
- [ ] Column reordering works with mouse, keyboard, and touch interactions
- [ ] Row reordering functional for appointment and client management
- [ ] Professional verification supports drag-based status workflow
- [ ] Accessibility standards met (WCAG 2.1 AA compliance)
- [ ] Material-UI theming consistency maintained throughout
- [ ] Drag operations provide visual feedback and state persistence

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://docs.dndkit.com/
  why: Core DND Kit concepts, accessibility features, architecture
  
- url: https://docs.dndkit.com/presets/sortable
  why: Sortable preset for column and row reordering
  
- url: https://docs.dndkit.com/introduction/getting-started
  why: Setup patterns, sensors configuration, collision detection
  
- url: https://docs.dndkit.com/accessibility
  why: WCAG compliance, keyboard navigation, screen reader support
  
- file: src/components/TanStackTable/index.js
  why: Current table implementation for drag and drop integration
  
- file: src/components/ClientsDataGrid/index.js
  why: Client table component for row reordering implementation
  
- file: src/components/ProfessionalsDataGrid/index.js  
  why: Professional management for status-based drag operations
  
- file: src/assets/theme/components/table/
  why: Material-UI table styling for drag operation visual feedback

- docfile: INITIAL.md
  why: DND Kit examples and Material-UI integration requirements

- file: src/localization/locales/en/translation.json
  why: Accessibility announcements and drag operation messages
```

### Current Codebase tree
```bash
src/
├── components/
│   ├── TanStackTable/           # TanStack Table implementation
│   │   ├── index.js            # Main table component
│   │   ├── TableHeader.js      # Sortable header component
│   │   ├── TableBody.js        # Table body with rows
│   │   └── TableCell.js        # Individual table cells
│   ├── ClientsDataGrid/         # Client management table
│   ├── ProfessionalsDataGrid/   # Professional management table
│   └── AppointmentsDataGrid/    # Appointment scheduling table
├── assets/theme/components/table/
│   ├── tableCell.js             # Material-UI cell styling
│   ├── tableContainer.js        # Container styling
│   └── tableHead.js             # Header styling
├── localization/
│   └── locales/
│       ├── en/translation.json  # English accessibility messages
│       └── fr/translation.json  # French accessibility messages
└── utils/
    └── tableHelpers.js          # Table utility functions
```

### Desired Codebase tree with files to be added
```bash
src/
├── components/
│   ├── DragAndDrop/             # New: Drag and drop components
│   │   ├── index.js            # Main DnD provider and context
│   │   ├── DragOverlay.js      # Custom drag overlay with Material-UI styling
│   │   ├── SortableItem.js     # Sortable item wrapper
│   │   ├── DroppableArea.js    # Droppable zone component
│   │   └── DragHandle.js       # Drag handle component with accessibility
│   ├── TanStackTable/           # Enhanced with drag and drop
│   │   ├── index.js            # Updated with DnD context
│   │   ├── DraggableHeader.js  # Draggable column headers
│   │   ├── DraggableRow.js     # Draggable table rows
│   │   └── hooks/              # Drag and drop hooks
│   │       ├── useColumnDragging.js
│   │       ├── useRowDragging.js
│   │       └── useDragAccessibility.js
│   ├── ClientsDataGrid/         # Enhanced with row reordering
│   ├── ProfessionalsDataGrid/   # Enhanced with status drag operations
│   └── AppointmentsDataGrid/    # Enhanced with time slot dragging
├── hooks/
│   ├── useDragAndDrop.js        # Generic drag and drop hook
│   └── useTableDragState.js     # Table-specific drag state management
├── utils/
│   ├── dragDropHelpers.js       # Drag and drop utility functions
│   └── accessibility.js         # Accessibility helper functions
└── constants/
    └── dragTypes.js             # Drag operation type definitions
```

### Known Gotchas & Library Quirks
```javascript
// CRITICAL: DND Kit requires stable IDs for all draggable items
// Use consistent ID generation, avoid array indices as IDs
// IDs must persist across re-renders and data updates

// CRITICAL: Sensors must be configured for touch, mouse, and keyboard
// PointerSensor for mouse/touch, KeyboardSensor for accessibility
// Use sortableKeyboardCoordinates for keyboard navigation

// CRITICAL: Material-UI Table structure conflicts with DND Kit
// TableRow and TableCell must be wrapped in sortable components
// Use proper ARIA roles and labels for accessibility

// CRITICAL: TanStack Table column state must sync with drag operations
// Column order changes need to update TanStack Table column visibility
// Handle column state persistence across user sessions

// CRITICAL: Parse Server data updates needed after row reordering
// Row reordering may require updating database sort orders
// Handle optimistic updates during drag operations

// CRITICAL: Drag overlay must match Material-UI table styling
// Custom DragOverlay component needed for consistent theming
// Handle different drag overlay content for columns vs rows
```

## Implementation Blueprint

### Data models and structure

Create drag and drop infrastructure with accessibility support.
```typescript
// constants/dragTypes.js - Drag operation type definitions
export const DRAG_TYPES = {
  COLUMN: 'table-column',
  ROW: 'table-row',
  PROFESSIONAL_STATUS: 'professional-status',
  APPOINTMENT_SLOT: 'appointment-slot',
};

export const DROP_ZONES = {
  TABLE_HEADER: 'table-header',
  TABLE_BODY: 'table-body',
  STATUS_AREA: 'status-area',
  CALENDAR_SLOT: 'calendar-slot',
};

// utils/dragDropHelpers.js - Utility functions
export const generateDragId = (type, itemId) => `${type}-${itemId}`;

export const arrayMove = (array, fromIndex, toIndex) => {
  const newArray = array.slice();
  const item = newArray.splice(fromIndex, 1)[0];
  newArray.splice(toIndex, 0, item);
  return newArray;
};

export const getItemPosition = (id, items) => {
  return items.findIndex(item => item.id === id);
};

// utils/accessibility.js - Accessibility helper functions
export const getDragAnnouncement = (operation, itemName, position, total, t) => {
  switch (operation) {
    case 'start':
      return t('accessibility.drag.started', { item: itemName });
    case 'move':
      return t('accessibility.drag.moved', { 
        item: itemName, 
        position: position + 1, 
        total 
      });
    case 'end':
      return t('accessibility.drag.completed', { item: itemName });
    case 'cancel':
      return t('accessibility.drag.cancelled', { item: itemName });
    default:
      return '';
  }
};
```

### List of tasks to be completed to fulfill the PRP in the order they should be completed

```yaml
Task 1: Install Dependencies and Setup
INSTALL packages:
  - @dnd-kit/core: "^6.0.0"
  - @dnd-kit/sortable: "^8.0.0" 
  - @dnd-kit/utilities: "^3.2.0"
  - VERIFY: No conflicts with existing React/Material-UI versions

Task 2: Create Core Drag and Drop Infrastructure
CREATE components/DragAndDrop/index.js:
  - PATTERN: DndContext provider with sensor configuration
  - IMPLEMENT: Multi-sensor setup (Pointer, Touch, Keyboard)
  - CONFIGURE: Collision detection and accessibility settings
  - INTEGRATE: Material-UI theme with drag operation styling

CREATE components/DragAndDrop/DragOverlay.js:
  - PATTERN: Custom drag overlay with Material-UI components
  - IMPLEMENT: Different overlay content for columns, rows, status items
  - STYLE: Match original item styling with drag state indication
  - INTEGRATE: PsyPsy theme colors and typography

CREATE utils/dragDropHelpers.js:
  - PATTERN: Utility functions for drag operations
  - IMPLEMENT: Array manipulation, ID generation, position calculation
  - PROVIDE: Accessibility announcement helpers
  - HANDLE: Drag state persistence and restoration

Task 3: Create Sortable Components
CREATE components/DragAndDrop/SortableItem.js:
  - PATTERN: Generic sortable item wrapper with useSortable hook
  - IMPLEMENT: Drag handle, keyboard navigation, touch support
  - STYLE: Material-UI integration with drag state styling
  - HANDLE: Accessibility attributes and announcements

CREATE components/DragAndDrop/DragHandle.js:
  - PATTERN: Accessible drag handle component
  - IMPLEMENT: Drag grip icon with proper ARIA labels
  - STYLE: Material-UI icon with hover and focus states
  - INTEGRATE: Keyboard navigation with proper focus management

Task 4: Create Table-Specific Drag Components
CREATE components/TanStackTable/DraggableHeader.js:
  - PATTERN: Draggable table header with Material-UI TableCell
  - IMPLEMENT: Column reordering with sortableKeyboardCoordinates
  - PRESERVE: Existing sorting functionality and header styling
  - HANDLE: Column visibility and order state persistence

CREATE components/TanStackTable/DraggableRow.js:
  - PATTERN: Draggable table row with Material-UI TableRow
  - IMPLEMENT: Row reordering with proper drag handle placement
  - PRESERVE: Existing row click handlers and styling
  - HANDLE: Row selection state during drag operations

Task 5: Create Drag and Drop Hooks
CREATE hooks/useColumnDragging.js:
  - PATTERN: Column reordering state management
  - IMPLEMENT: Column order persistence, TanStack Table integration
  - HANDLE: Column visibility changes during drag operations
  - PROVIDE: Column order state and update functions

CREATE hooks/useRowDragging.js:
  - PATTERN: Row reordering with backend synchronization
  - IMPLEMENT: Optimistic updates during drag operations
  - HANDLE: Parse Server data updates after reordering
  - PROVIDE: Row order state and persistence

CREATE hooks/useDragAccessibility.js:
  - PATTERN: Accessibility management for drag operations
  - IMPLEMENT: Screen reader announcements, keyboard navigation
  - HANDLE: Focus management during drag operations
  - PROVIDE: ARIA labels and accessibility props

Task 6: Enhance TanStack Table with Drag Support
MODIFY components/TanStackTable/index.js:
  - ADD: DndContext wrapper around table component
  - IMPLEMENT: Drag event handlers for column and row operations
  - PRESERVE: Existing table functionality (sorting, pagination, filtering)
  - INTEGRATE: Drag state with table state management

MODIFY components/TanStackTable/TableHeader.js:
  - REPLACE: Static headers with DraggableHeader components
  - PRESERVE: Existing sorting functionality and styling
  - ADD: Visual indicators for drag operations
  - HANDLE: Column reorder state updates

MODIFY components/TanStackTable/TableBody.js:
  - REPLACE: Static rows with DraggableRow components
  - PRESERVE: Existing row interactions and styling
  - ADD: Drag handle placement and visual feedback
  - HANDLE: Row reorder operations and data updates

Task 7: Enhance ClientsDataGrid with Row Reordering
MODIFY src/components/ClientsDataGrid/index.js:
  - ADD: Row reordering functionality for client priority management
  - IMPLEMENT: Client priority field updates after reordering
  - PRESERVE: Existing client management functionality
  - HANDLE: Server-side priority updates with optimistic UI

Task 8: Enhance ProfessionalsDataGrid with Status Dragging
MODIFY src/components/ProfessionalsDataGrid/index.js:
  - ADD: Drag-based professional verification status management
  - IMPLEMENT: Status change workflow via drag operations
  - CREATE: Status zones for "Pending", "Verified", "Rejected"
  - HANDLE: Professional verification state updates

Task 9: Enhance AppointmentsDataGrid with Time Slot Dragging
MODIFY src/components/AppointmentsDataGrid/index.js:
  - ADD: Appointment time slot reordering via drag operations
  - IMPLEMENT: Time slot conflict detection and resolution
  - CREATE: Calendar-style drag and drop interface
  - HANDLE: Appointment schedule updates and conflict management

Task 10: Add Accessibility and Internationalization
CREATE localization additions:
  - ADD: Drag operation announcements in en/fr translation files
  - IMPLEMENT: Screen reader descriptions for drag operations
  - PROVIDE: Keyboard navigation instructions and help text

TEST accessibility compliance:
  - VERIFY: WCAG 2.1 AA compliance for drag operations
  - CHECK: Keyboard navigation works for all drag operations
  - VALIDATE: Screen reader announcements are clear and helpful
  - CONFIRM: Focus management works correctly during drag operations
```

### Per task pseudocode

```typescript
// Task 2: Core Drag and Drop Infrastructure
// components/DragAndDrop/index.js
import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

import { useTranslation } from 'react-i18next';
import DragOverlayComponent from './DragOverlay';
import { getDragAnnouncement } from 'utils/accessibility';

const DragAndDropProvider = ({ 
  children, 
  onDragEnd, 
  onDragStart, 
  onDragMove,
  items = [],
  strategy 
}) => {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  
  // PATTERN: Multi-sensor configuration for accessibility
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    
    // Find the dragged item for overlay
    const item = items.find(item => item.id === active.id);
    setDraggedItem(item);
    
    // Announce drag start to screen readers
    const announcement = getDragAnnouncement(
      'start', 
      item?.name || active.id, 
      null, 
      items.length, 
      t
    );
    announceToScreenReader(announcement);
    
    onDragStart?.(event);
  };

  const handleDragMove = (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeIndex = items.findIndex(item => item.id === active.id);
      const overIndex = items.findIndex(item => item.id === over.id);
      
      // Announce position change
      const announcement = getDragAnnouncement(
        'move',
        draggedItem?.name || active.id,
        overIndex,
        items.length,
        t
      );
      announceToScreenReader(announcement);
    }
    
    onDragMove?.(event);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const announcement = getDragAnnouncement(
        'end',
        draggedItem?.name || active.id,
        null,
        items.length,
        t
      );
      announceToScreenReader(announcement);
    } else {
      const announcement = getDragAnnouncement(
        'cancel',
        draggedItem?.name || active.id,
        null,
        items.length,
        t
      );
      announceToScreenReader(announcement);
    }
    
    setActiveId(null);
    setDraggedItem(null);
    onDragEnd?.(event);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      accessibility={{
        restoreFocus: true,
        screenReaderInstructions: {
          draggable: t('accessibility.drag.instructions'),
        },
      }}
    >
      <SortableContext items={items} strategy={strategy}>
        {children}
      </SortableContext>
      
      <DragOverlay>
        {activeId ? (
          <DragOverlayComponent
            item={draggedItem}
            dragType={getDragType(activeId)}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// Task 4: Draggable Table Header Implementation
// components/TanStackTable/DraggableHeader.js
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';

// Material-UI components
import { TableCell, Box, IconButton } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

// Material Dashboard components
import MDTypography from 'components/MDTypography';
import DragHandle from 'components/DragAndDrop/DragHandle';

const DraggableHeader = ({ 
  header, 
  children, 
  enableDragging = true,
  ...props 
}) => {
  const { t } = useTranslation();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: header.id,
    disabled: !enableDragging,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleKeyDown = (event) => {
    // PATTERN: Keyboard navigation for drag operations
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // Activate drag with keyboard
    }
  };

  return (
    <TableCell
      ref={setNodeRef}
      style={style}
      {...props}
      sx={{
        cursor: enableDragging ? 'grab' : 'default',
        '&:active': {
          cursor: enableDragging ? 'grabbing' : 'default',
        },
        position: 'relative',
        ...props.sx,
      }}
    >
      <Box display="flex" alignItems="center" width="100%">
        {/* Drag handle */}
        {enableDragging && (
          <DragHandle
            {...attributes}
            {...listeners}
            onKeyDown={handleKeyDown}
            aria-label={t('accessibility.dragColumn', { 
              column: header.column.columnDef.header 
            })}
          />
        )}
        
        {/* Header content */}
        <Box flex={1} ml={enableDragging ? 1 : 0}>
          {children}
        </Box>
      </Box>
    </TableCell>
  );
};

// Task 6: Enhanced TanStack Table with Drag Support
// components/TanStackTable/index.js (MODIFIED)
import React, { useState, useMemo, useCallback } from 'react';
import { flexRender } from '@tanstack/react-table';
import { horizontalListSortingStrategy } from '@dnd-kit/sortable';

import DragAndDropProvider from 'components/DragAndDrop';
import DraggableHeader from './DraggableHeader';
import DraggableRow from './DraggableRow';
import { arrayMove } from 'utils/dragDropHelpers';

const TanStackTable = ({
  table,
  enableColumnDragging = false,
  enableRowDragging = false,
  onColumnOrderChange,
  onRowOrderChange,
  ...props
}) => {
  const [columnOrder, setColumnOrder] = useState(
    table.getAllColumns().map(column => column.id)
  );
  
  const [rowOrder, setRowOrder] = useState(
    table.getRowModel().rows.map(row => row.id)
  );

  // PATTERN: Column drag handler
  const handleColumnDragEnd = useCallback((event) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = columnOrder.indexOf(active.id);
      const newIndex = columnOrder.indexOf(over.id);
      
      const newColumnOrder = arrayMove(columnOrder, oldIndex, newIndex);
      setColumnOrder(newColumnOrder);
      
      // Update TanStack Table column order
      table.setColumnOrder(newColumnOrder);
      
      // Notify parent component
      onColumnOrderChange?.(newColumnOrder);
    }
  }, [columnOrder, table, onColumnOrderChange]);

  // PATTERN: Row drag handler
  const handleRowDragEnd = useCallback((event) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = rowOrder.indexOf(active.id);
      const newIndex = rowOrder.indexOf(over.id);
      
      const newRowOrder = arrayMove(rowOrder, oldIndex, newIndex);
      setRowOrder(newRowOrder);
      
      // Notify parent component with actual row data
      const rows = table.getRowModel().rows;
      const reorderedRows = newRowOrder.map(id => 
        rows.find(row => row.id === id)
      );
      
      onRowOrderChange?.(reorderedRows.map(row => row.original));
    }
  }, [rowOrder, table, onRowOrderChange]);

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table sx={{ ...tableStyles }}>
        {/* Draggable Column Headers */}
        {enableColumnDragging ? (
          <DragAndDropProvider
            items={columnOrder.map(id => ({ id }))}
            strategy={horizontalListSortingStrategy}
            onDragEnd={handleColumnDragEnd}
          >
            <TableHead>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <DraggableHeader
                      key={header.id}
                      header={header}
                      enableDragging={enableColumnDragging}
                    >
                      {header.isPlaceholder ? null : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </DraggableHeader>
                  ))}
                </TableRow>
              ))}
            </TableHead>
          </DragAndDropProvider>
        ) : (
          <TableHead>
            {/* Static headers when dragging disabled */}
          </TableHead>
        )}
        
        {/* Draggable Table Rows */}
        <TableBody>
          {enableRowDragging ? (
            <DragAndDropProvider
              items={rowOrder.map(id => ({ id }))}
              onDragEnd={handleRowDragEnd}
            >
              {table.getRowModel().rows.map(row => (
                <DraggableRow
                  key={row.id}
                  row={row}
                  enableDragging={enableRowDragging}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </DraggableRow>
              ))}
            </DragAndDropProvider>
          ) : (
            table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {/* Static rows when dragging disabled */}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Task 8: Professional Status Drag Operations
// components/ProfessionalsDataGrid/index.js (ENHANCED)
const ProfessionalsDataGrid = ({ onStatusChange, ...props }) => {
  const [professionals, setProfessionals] = useState([]);
  
  const handleStatusDragEnd = useCallback(async (event) => {
    const { active, over } = event;
    
    if (over && over.id.includes('status-zone-')) {
      const professionalId = active.id.replace('professional-', '');
      const newStatus = over.id.replace('status-zone-', '');
      
      // Optimistic update
      setProfessionals(prev => prev.map(prof =>
        prof.id === professionalId
          ? { ...prof, verificationStatus: newStatus }
          : prof
      ));
      
      try {
        // Update Parse Server
        await Parse.Cloud.run('updateProfessionalStatus', {
          professionalId,
          status: newStatus
        });
        
        onStatusChange?.(professionalId, newStatus);
      } catch (error) {
        // Revert optimistic update
        setProfessionals(prev => prev.map(prof =>
          prof.id === professionalId
            ? { ...prof, verificationStatus: active.data.current.originalStatus }
            : prof
        ));
        
        console.error('Failed to update professional status:', error);
      }
    }
  }, [onStatusChange]);

  return (
    <MDBox>
      {/* Status zones for drag operations */}
      <MDBox display="flex" gap={2} mb={3}>
        <StatusDropZone status="pending" count={pendingCount} />
        <StatusDropZone status="verified" count={verifiedCount} />
        <StatusDropZone status="rejected" count={rejectedCount} />
      </MDBox>
      
      {/* Enhanced table with professional status dragging */}
      <TanStackTable
        {...props}
        enableRowDragging={false}
        enableColumnDragging={true}
        customDragLogic={handleStatusDragEnd}
      />
    </MDBox>
  );
};
```

### Integration Points
```yaml
DEPENDENCIES:
  - add to: package.json
  - packages: |
      @dnd-kit/core: "^6.0.0"
      @dnd-kit/sortable: "^8.0.0"
      @dnd-kit/utilities: "^3.2.0"

TANSTACK-TABLE:
  - enhance: Existing TanStack Table components with drag support
  - preserve: Table functionality (sorting, filtering, pagination)
  - integrate: Column order and row order state management

MATERIAL-UI:
  - maintain: Table styling and theming consistency
  - enhance: Drag state visual feedback with Material-UI components
  - integrate: Accessibility features with Material-UI focus management

PARSE-SERVER:
  - integrate: Row reordering with backend data updates
  - handle: Professional status updates via drag operations
  - implement: Optimistic updates with error rollback
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm run build # Ensure no compilation errors with drag components
npx eslint src/components/DragAndDrop/ # Check code style

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests
```javascript
// CREATE __tests__/components/DragAndDrop.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import DraggableHeader from '../../../components/TanStackTable/DraggableHeader';

const mockHeader = {
  id: 'test-column',
  column: {
    columnDef: {
      header: 'Test Column'
    }
  }
};

test('DraggableHeader renders with drag handle', () => {
  render(
    <DndContext>
      <table>
        <thead>
          <tr>
            <DraggableHeader header={mockHeader} enableDragging={true}>
              Test Content
            </DraggableHeader>
          </tr>
        </thead>
      </table>
    </DndContext>
  );
  
  expect(screen.getByLabelText(/drag column/i)).toBeInTheDocument();
  expect(screen.getByText('Test Content')).toBeInTheDocument();
});

test('DraggableHeader keyboard navigation', () => {
  const mockDragEnd = jest.fn();
  
  render(
    <DndContext onDragEnd={mockDragEnd}>
      <table>
        <thead>
          <tr>
            <DraggableHeader header={mockHeader} enableDragging={true}>
              Test Content
            </DraggableHeader>
          </tr>
        </thead>
      </table>
    </DndContext>
  );
  
  const dragHandle = screen.getByLabelText(/drag column/i);
  fireEvent.keyDown(dragHandle, { key: 'Enter' });
  
  // Should handle keyboard activation
  expect(dragHandle).toHaveFocus();
});

// CREATE __tests__/utils/dragDropHelpers.test.js
import { arrayMove, generateDragId } from '../../utils/dragDropHelpers';

test('arrayMove reorders array correctly', () => {
  const array = ['a', 'b', 'c', 'd'];
  const result = arrayMove(array, 1, 3);
  
  expect(result).toEqual(['a', 'c', 'd', 'b']);
  expect(array).toEqual(['a', 'b', 'c', 'd']); // Original unchanged
});

test('generateDragId creates unique IDs', () => {
  const id1 = generateDragId('column', 'test');
  const id2 = generateDragId('row', 'test');
  
  expect(id1).toBe('column-test');
  expect(id2).toBe('row-test');
  expect(id1).not.toBe(id2);
});
```

```bash
# Run tests iteratively until passing:
npm test -- __tests__/components/DragAndDrop
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Test
```bash
# Start the development server
npm start

# Test in browser - Drag and drop functionality
# Navigate to /clients - try column reordering
# Navigate to /professionals - try status drag operations
# Test keyboard navigation with Tab and Enter/Space
# Test touch interactions on mobile viewport

# Expected behaviors:
# - Column headers can be reordered with mouse/keyboard/touch
# - Row reordering works for appointment and client management
# - Professional verification supports drag-based status changes
# - Drag operations provide visual feedback and accessibility
# - Screen reader announcements work during drag operations
# - Material-UI theming consistency maintained
```

## Final Validation Checklist
- [ ] All tests pass: `npm test -- __tests__/components/DragAndDrop`
- [ ] No linting errors: `npx eslint src/components/DragAndDrop/`
- [ ] No compilation errors: `npm run build`
- [ ] Column reordering works with mouse, keyboard, and touch
- [ ] Row reordering functional for appointment and client management
- [ ] Professional verification supports drag-based status workflow
- [ ] Accessibility standards met (WCAG 2.1 AA compliance)
- [ ] Material-UI theming consistency maintained
- [ ] Drag operations provide visual feedback and state persistence
- [ ] Screen reader announcements clear and helpful
- [ ] Keyboard navigation works for all drag operations

---

## Anti-Patterns to Avoid
- ❌ Don't use array indices as drag IDs - use stable unique identifiers
- ❌ Don't skip sensor configuration - accessibility requires multiple sensors
- ❌ Don't ignore drag overlay styling - must match original item appearance
- ❌ Don't forget to handle drag cancellation and error states
- ❌ Don't skip accessibility testing - keyboard navigation is critical
- ❌ Don't override Material-UI table structure without preserving semantics

## Confidence Score: 7/10

Moderate confidence due to:
- DND Kit has excellent documentation and accessibility features
- Material-UI table integration requires careful component wrapping
- TanStack Table state synchronization needs proper implementation
- Accessibility compliance requires comprehensive testing

Higher uncertainty around complex drag operations like professional status management and potential performance issues with large datasets.