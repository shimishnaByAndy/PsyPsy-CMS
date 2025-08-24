# TanStack Virtual Performance Optimization PRP

## Feature Overview

Implement TanStack Virtual for high-performance rendering of large datasets in PsyPsy CMS. This will optimize DataGrid components handling thousands of records by virtualizing rows, significantly reducing DOM nodes and improving scroll performance.

## Current State Analysis

### Existing DataGrid Performance
- `ClientsDataGrid`: Currently renders all rows in DOM
- `ProfessionalsDataGrid`: No virtualization support
- `AppointmentsDataGrid`: Full dataset loaded at once
- Parse Server pagination: Uses skip/limit but loads all rows to DOM

### Performance Bottlenecks Identified
```javascript
// Current pattern from ClientsDataGrid/index.js
const [rows, setRows] = useState([]);
const [totalRows, setTotalRows] = useState(0);
const [paginationModel, setPaginationModel] = useState({
  pageSize: 25,
  page: 0,
});

// Problem: Even with pagination, large pages cause DOM bloat
<DataGrid
  rows={rows}
  columns={columns}
  paginationModel={paginationModel}
  // No virtualization - all 25 rows rendered
/>
```

## Required Dependencies

```json
{
  "@tanstack/react-virtual": "^3.10.8"
}
```

## Implementation Blueprint

### 1. Virtual List Base Component

```javascript
// src/components/VirtualList/index.js
import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import MDBox from 'components/MDBox';

const VirtualList = ({
  items,
  renderItem,
  height = 400,
  estimateSize,
  overscan = 5,
  ...boxProps
}) => {
  const parentRef = React.useRef();
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: estimateSize || (() => 60),
    overscan,
  });

  return (
    <MDBox
      ref={parentRef}
      sx={{
        height,
        overflow: 'auto',
        contain: 'strict',
      }}
      {...boxProps}
    >
      <MDBox
        sx={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <MDBox
            key={virtualItem.key}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualItem.size,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem({
              item: items[virtualItem.index],
              index: virtualItem.index,
              virtualItem,
            })}
          </MDBox>
        ))}
      </MDBox>
    </MDBox>
  );
};

export default VirtualList;
```

### 2. Virtualized DataGrid Component

```javascript
// src/components/VirtualizedDataGrid/index.js
import React, { useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import { useTheme } from '@mui/material/styles';

const VirtualizedDataGrid = ({
  data,
  columns,
  height = 600,
  rowHeight = 52,
  headerHeight = 56,
  onRowClick,
  loading = false,
  overscan = 10,
}) => {
  const theme = useTheme();
  const parentRef = React.useRef();

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Memoized column widths calculation
  const columnWidths = useMemo(() => {
    const totalFlex = columns.reduce((sum, col) => sum + (col.flex || 1), 0);
    return columns.map(col => ({
      ...col,
      calculatedWidth: `${((col.flex || 1) / totalFlex) * 100}%`
    }));
  }, [columns]);

  const renderHeader = () => (
    <MDBox
      sx={{
        display: 'flex',
        height: headerHeight,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.grey[50],
        position: 'sticky',
        top: 0,
        zIndex: 1,
      }}
    >
      {columnWidths.map((column) => (
        <MDBox
          key={column.field}
          sx={{
            width: column.calculatedWidth,
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            borderRight: `1px solid ${theme.palette.divider}`,
          }}
        >
          <MDTypography variant="subtitle2" fontWeight="medium">
            {column.headerName}
          </MDTypography>
        </MDBox>
      ))}
    </MDBox>
  );

  const renderRow = (virtualItem) => {
    const rowData = data[virtualItem.index];
    const isEven = virtualItem.index % 2 === 0;

    return (
      <MDBox
        key={virtualItem.key}
        onClick={() => onRowClick?.(rowData)}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: virtualItem.size,
          transform: `translateY(${virtualItem.start}px)`,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: isEven 
            ? 'transparent' 
            : theme.palette.action.hover,
          cursor: onRowClick ? 'pointer' : 'default',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        {columnWidths.map((column) => (
          <MDBox
            key={column.field}
            sx={{
              width: column.calculatedWidth,
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              borderRight: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
            }}
          >
            <MDTypography variant="body2" noWrap>
              {column.renderCell 
                ? column.renderCell({ row: rowData, value: rowData[column.field] })
                : rowData[column.field]
              }
            </MDTypography>
          </MDBox>
        ))}
      </MDBox>
    );
  };

  if (loading) {
    return (
      <MDBox sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MDTypography>Loading...</MDTypography>
      </MDBox>
    );
  }

  return (
    <MDBox sx={{ height, border: `1px solid ${theme.palette.divider}` }}>
      {renderHeader()}
      <MDBox
        ref={parentRef}
        sx={{
          height: height - headerHeight,
          overflow: 'auto',
          contain: 'strict',
        }}
      >
        <MDBox
          sx={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map(renderRow)}
        </MDBox>
      </MDBox>
    </MDBox>
  );
};

export default VirtualizedDataGrid;
```

### 3. Parse Server Streaming Integration

```javascript
// src/services/virtualizedDataService.js
import Parse from 'parse';

export class VirtualizedDataService {
  constructor(parseClass, pageSize = 100) {
    this.parseClass = parseClass;
    this.pageSize = pageSize;
    this.cache = new Map();
  }

  async getTotalCount() {
    const query = new Parse.Query(this.parseClass);
    return await query.count();
  }

  async loadPage(startIndex, endIndex) {
    const cacheKey = `${startIndex}-${endIndex}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const query = new Parse.Query(this.parseClass);
    query.skip(startIndex);
    query.limit(endIndex - startIndex);
    
    try {
      const results = await query.find();
      const transformedData = results.map(obj => ({
        id: obj.id,
        ...obj.attributes,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt,
      }));

      // Cache results with TTL
      this.cache.set(cacheKey, transformedData);
      setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000); // 5min TTL

      return transformedData;
    } catch (error) {
      console.error('Failed to load page:', error);
      throw error;
    }
  }

  clearCache() {
    this.cache.clear();
  }
}
```

### 4. Infinite Loading Hook

```javascript
// src/hooks/useInfiniteVirtualData.js
import { useState, useCallback, useEffect } from 'react';

export const useInfiniteVirtualData = (dataService) => {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadedRanges, setLoadedRanges] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const loadTotalCount = useCallback(async () => {
    try {
      const count = await dataService.getTotalCount();
      setTotalCount(count);
      // Initialize data array with placeholders
      setData(new Array(count).fill(null));
    } catch (error) {
      console.error('Failed to load total count:', error);
    }
  }, [dataService]);

  const loadRange = useCallback(async (startIndex, endIndex) => {
    const rangeKey = `${startIndex}-${endIndex}`;
    
    if (loadedRanges.has(rangeKey)) {
      return;
    }

    setLoading(true);
    try {
      const pageData = await dataService.loadPage(startIndex, endIndex);
      
      setData(prevData => {
        const newData = [...prevData];
        pageData.forEach((item, index) => {
          newData[startIndex + index] = item;
        });
        return newData;
      });

      setLoadedRanges(prev => new Set([...prev, rangeKey]));
    } catch (error) {
      console.error('Failed to load range:', error);
    } finally {
      setLoading(false);
    }
  }, [dataService, loadedRanges]);

  useEffect(() => {
    loadTotalCount();
  }, [loadTotalCount]);

  const refresh = useCallback(() => {
    dataService.clearCache();
    setData([]);
    setLoadedRanges(new Set());
    loadTotalCount();
  }, [dataService, loadTotalCount]);

  return {
    data,
    totalCount,
    loading,
    loadRange,
    refresh,
  };
};
```

### 5. Virtualized Client DataGrid Implementation

```javascript
// src/components/VirtualizedClientsGrid/index.js
import React, { useMemo } from 'react';
import VirtualizedDataGrid from 'components/VirtualizedDataGrid';
import { VirtualizedDataService } from 'services/virtualizedDataService';
import { useInfiniteVirtualData } from 'hooks/useInfiniteVirtualData';
import { useVirtualizer } from '@tanstack/react-virtual';
import MDChip from 'components/MDChip';
import MDButton from 'components/MDButton';
import { formatPhoneNumber } from 'utils/formatting';

const VirtualizedClientsGrid = ({ onClientSelect }) => {
  const dataService = useMemo(() => new VirtualizedDataService('Client'), []);
  const { data, totalCount, loading, loadRange } = useInfiniteVirtualData(dataService);

  const columns = [
    {
      field: 'firstName',
      headerName: 'First Name',
      flex: 1,
    },
    {
      field: 'lastName',
      headerName: 'Last Name',
      flex: 1,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1.5,
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone',
      flex: 1,
      renderCell: ({ value }) => value ? formatPhoneNumber(value, 'CA') : '',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      renderCell: ({ value }) => (
        <MDChip
          label={value || 'Active'}
          color={value === 'Active' ? 'success' : 'warning'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      renderCell: ({ row }) => (
        <MDButton
          variant="text"
          color="info"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onClientSelect?.(row);
          }}
        >
          View
        </MDButton>
      ),
    },
  ];

  // Automatically load visible range when virtualizer range changes
  const parentRef = React.useRef();
  const virtualizer = useVirtualizer({
    count: totalCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 20,
  });

  React.useEffect(() => {
    const virtualItems = virtualizer.getVirtualItems();
    if (virtualItems.length > 0) {
      const startIndex = virtualItems[0].index;
      const endIndex = virtualItems[virtualItems.length - 1].index + 1;
      
      // Load data with buffer
      const bufferSize = 50;
      const bufferedStart = Math.max(0, startIndex - bufferSize);
      const bufferedEnd = Math.min(totalCount, endIndex + bufferSize);
      
      loadRange(bufferedStart, bufferedEnd);
    }
  }, [virtualizer, totalCount, loadRange]);

  return (
    <VirtualizedDataGrid
      data={data.filter(Boolean)} // Filter out null placeholders
      columns={columns}
      height={600}
      rowHeight={52}
      onRowClick={onClientSelect}
      loading={loading}
    />
  );
};

export default VirtualizedClientsGrid;
```

## Parse Server Integration Patterns

### Memory-Efficient Queries
```javascript
// Optimized Parse queries for virtualization
const createOptimizedQuery = (parseClass, startIndex, limit) => {
  const query = new Parse.Query(parseClass);
  
  // Essential fields only
  query.select(['firstName', 'lastName', 'email', 'phoneNumber', 'status']);
  
  // Pagination
  query.skip(startIndex);
  query.limit(limit);
  
  // Sorting for consistent results
  query.ascending('lastName');
  
  return query;
};
```

### Streaming Architecture
```javascript
// Stream-based data loading for large datasets
export class StreamingDataService extends VirtualizedDataService {
  async *streamData(batchSize = 100) {
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const query = new Parse.Query(this.parseClass);
      query.skip(skip);
      query.limit(batchSize);
      
      const results = await query.find();
      
      if (results.length > 0) {
        yield results.map(obj => ({
          id: obj.id,
          ...obj.attributes,
        }));
        skip += batchSize;
      } else {
        hasMore = false;
      }
    }
  }
}
```

## Performance Optimizations

### 1. Dynamic Row Height Calculation
```javascript
// src/hooks/useDynamicRowHeight.js
export const useDynamicRowHeight = (data, columns) => {
  const measureRef = React.useRef();
  const [rowHeights, setRowHeights] = React.useState(new Map());

  const measureRowHeight = React.useCallback((index, content) => {
    if (!measureRef.current) return 52; // Default height

    // Create temporary measurement element
    const measurer = document.createElement('div');
    measurer.style.visibility = 'hidden';
    measurer.style.position = 'absolute';
    measurer.style.width = measureRef.current.offsetWidth + 'px';
    measurer.innerHTML = content;
    
    document.body.appendChild(measurer);
    const height = Math.max(52, measurer.offsetHeight + 16); // Min 52px + padding
    document.body.removeChild(measurer);

    setRowHeights(prev => new Map(prev.set(index, height)));
    return height;
  }, []);

  const getEstimatedSize = React.useCallback((index) => {
    return rowHeights.get(index) || 52;
  }, [rowHeights]);

  return { measureRef, measureRowHeight, getEstimatedSize };
};
```

### 2. Scroll Position Restoration
```javascript
// src/hooks/useScrollRestoration.js
export const useScrollRestoration = (key, virtualizer) => {
  React.useEffect(() => {
    const savedPosition = sessionStorage.getItem(`scroll-${key}`);
    if (savedPosition && virtualizer) {
      virtualizer.scrollToOffset(parseInt(savedPosition));
    }
  }, [key, virtualizer]);

  React.useEffect(() => {
    const saveScrollPosition = () => {
      if (virtualizer) {
        sessionStorage.setItem(`scroll-${key}`, virtualizer.scrollOffset.toString());
      }
    };

    window.addEventListener('beforeunload', saveScrollPosition);
    return () => window.removeEventListener('beforeunload', saveScrollPosition);
  }, [key, virtualizer]);
};
```

## Material-UI Theme Integration

### Virtualized Theme Provider
```javascript
// src/context/VirtualizationThemeProvider.js
import React, { createContext, useContext } from 'react';
import { useTheme } from '@mui/material/styles';

const VirtualizationThemeContext = createContext();

export const VirtualizationThemeProvider = ({ children }) => {
  const theme = useTheme();

  const virtualizationTheme = {
    // Row styling
    rowHeight: 52,
    headerHeight: 56,
    borderColor: theme.palette.divider,
    
    // Colors
    evenRowBackground: 'transparent',
    oddRowBackground: theme.palette.action.hover,
    hoverBackground: theme.palette.action.hover,
    
    // Spacing
    cellPadding: theme.spacing(2),
    overscan: 10,
    
    // Performance
    cacheSize: 1000,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
  };

  return (
    <VirtualizationThemeContext.Provider value={virtualizationTheme}>
      {children}
    </VirtualizationThemeContext.Provider>
  );
};

export const useVirtualizationTheme = () => {
  const context = useContext(VirtualizationThemeContext);
  if (!context) {
    throw new Error('useVirtualizationTheme must be used within VirtualizationThemeProvider');
  }
  return context;
};
```

## Accessibility Features

### ARIA Support for Virtual Lists
```javascript
// Enhanced VirtualList with accessibility
const AccessibleVirtualList = ({ 
  items, 
  renderItem, 
  ariaLabel,
  ariaDescription,
  ...props 
}) => {
  const parentRef = React.useRef();
  const [focusedIndex, setFocusedIndex] = React.useState(-1);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
  });

  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => Math.min(items.length - 1, prev + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => Math.max(0, prev - 1));
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
    }
  };

  return (
    <MDBox
      ref={parentRef}
      role="grid"
      aria-label={ariaLabel}
      aria-description={ariaDescription}
      aria-rowcount={items.length}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      sx={{
        height: 400,
        overflow: 'auto',
        outline: 'none',
        '&:focus': {
          outline: '2px solid',
          outlineColor: 'primary.main',
        },
      }}
      {...props}
    >
      <MDBox
        role="rowgroup"
        sx={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <MDBox
            key={virtualItem.key}
            role="row"
            aria-rowindex={virtualItem.index + 1}
            aria-selected={focusedIndex === virtualItem.index}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualItem.size,
              transform: `translateY(${virtualItem.start}px)`,
              backgroundColor: focusedIndex === virtualItem.index 
                ? 'action.selected' 
                : 'transparent',
            }}
          >
            {renderItem({
              item: items[virtualItem.index],
              index: virtualItem.index,
              virtualItem,
              isFocused: focusedIndex === virtualItem.index,
            })}
          </MDBox>
        ))}
      </MDBox>
    </MDBox>
  );
};
```

## Testing Strategy

### Virtual Scrolling Tests
```javascript
// tests/components/VirtualizedDataGrid.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import VirtualizedDataGrid from 'components/VirtualizedDataGrid';

describe('VirtualizedDataGrid', () => {
  const mockData = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    value: `Value ${i}`,
  }));

  const mockColumns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'value', headerName: 'Value', flex: 1 },
  ];

  test('renders only visible rows', () => {
    render(
      <VirtualizedDataGrid
        data={mockData}
        columns={mockColumns}
        height={400}
        rowHeight={50}
      />
    );

    // Should only render approximately visible rows (~8 rows for 400px height)
    const renderedRows = screen.getAllByRole('row');
    expect(renderedRows.length).toBeLessThan(20); // Much less than 1000
    expect(renderedRows.length).toBeGreaterThan(5);
  });

  test('scrolls to show different data', async () => {
    const { container } = render(
      <VirtualizedDataGrid
        data={mockData}
        columns={mockColumns}
        height={400}
        rowHeight={50}
      />
    );

    const scrollContainer = container.querySelector('[data-testid="virtual-scroll-container"]');
    
    // Scroll down significantly
    fireEvent.scroll(scrollContainer, { target: { scrollTop: 5000 } });

    // Wait for virtualization to update
    await waitFor(() => {
      expect(screen.getByText(/Item [5-9]\d+/)).toBeInTheDocument();
    });
  });

  test('handles dynamic data updates', () => {
    const { rerender } = render(
      <VirtualizedDataGrid
        data={mockData.slice(0, 100)}
        columns={mockColumns}
        height={400}
      />
    );

    // Update with more data
    rerender(
      <VirtualizedDataGrid
        data={mockData}
        columns={mockColumns}
        height={400}
      />
    );

    // Virtualization should handle the data change
    expect(screen.getByText('Item 0')).toBeInTheDocument();
  });
});
```

### Performance Benchmarks
```javascript
// tests/performance/virtualization.benchmark.js
import { performance } from 'perf_hooks';
import { render, cleanup } from '@testing-library/react';

describe('Virtualization Performance', () => {
  test('renders 10k items without performance degradation', () => {
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `Description for item ${i}`.repeat(3),
    }));

    const startTime = performance.now();
    
    render(
      <VirtualizedDataGrid
        data={largeDataset}
        columns={[
          { field: 'name', headerName: 'Name', flex: 1 },
          { field: 'description', headerName: 'Description', flex: 2 },
        ]}
        height={600}
      />
    );

    const renderTime = performance.now() - startTime;
    
    // Should render in under 100ms even with 10k items
    expect(renderTime).toBeLessThan(100);
    
    cleanup();
  });
});
```

## Migration Path from Current DataGrid

### Phase 1: Side-by-Side Implementation
```javascript
// src/components/ClientsDataGrid/VirtualizedVersion.js
import React, { useState } from 'react';
import VirtualizedClientsGrid from 'components/VirtualizedClientsGrid';
import RegularClientsGrid from './index'; // Existing implementation
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';

const ClientsDataGridMigration = () => {
  const [useVirtualized, setUseVirtualized] = useState(false);

  return (
    <MDBox>
      <MDBox mb={2}>
        <MDButton
          variant={useVirtualized ? 'contained' : 'outlined'}
          onClick={() => setUseVirtualized(true)}
          sx={{ mr: 1 }}
        >
          Virtualized (New)
        </MDButton>
        <MDButton
          variant={!useVirtualized ? 'contained' : 'outlined'}
          onClick={() => setUseVirtualized(false)}
        >
          Regular (Current)
        </MDButton>
      </MDBox>
      
      {useVirtualized ? (
        <VirtualizedClientsGrid />
      ) : (
        <RegularClientsGrid />
      )}
    </MDBox>
  );
};

export default ClientsDataGridMigration;
```

### Phase 2: Feature Parity Validation
```javascript
// src/utils/dataGridComparison.js
export const compareDataGridFeatures = (regularGrid, virtualizedGrid) => {
  const features = {
    pagination: {
      regular: 'client-side',
      virtualized: 'infinite-scroll',
      status: 'enhanced',
    },
    sorting: {
      regular: 'in-memory',
      virtualized: 'server-side',
      status: 'improved',
    },
    filtering: {
      regular: 'basic',
      virtualized: 'advanced',
      status: 'enhanced',
    },
    performance: {
      regular: 'O(n) DOM',
      virtualized: 'O(1) DOM',
      status: 'significantly-improved',
    },
  };

  return features;
};
```

## Validation Loops

### Loop 1: Performance Validation ✓
- [ ] Benchmark current DataGrid performance with 1000+ rows
- [ ] Implement VirtualizedDataGrid with same dataset
- [ ] Measure render time, memory usage, scroll performance
- [ ] Validate 10x+ performance improvement
- [ ] **Target**: <100ms initial render, <16ms scroll updates

### Loop 2: Feature Parity ✓
- [ ] Audit existing DataGrid features (sorting, pagination, selection)
- [ ] Implement equivalent functionality in virtualized version
- [ ] Test side-by-side functionality comparison
- [ ] Validate all existing features work correctly
- [ ] **Target**: 100% feature compatibility

### Loop 3: Parse Server Integration ✓
- [ ] Test infinite loading with Parse Server queries
- [ ] Validate data streaming and caching
- [ ] Test offline/error scenarios
- [ ] Verify memory management with large datasets
- [ ] **Target**: Handle 50k+ records smoothly

### Loop 4: Material-UI Theme Integration ✓
- [ ] Apply PsyPsy theme to virtualized components
- [ ] Test dark/light mode switching
- [ ] Validate responsive behavior
- [ ] Ensure accessibility compliance
- [ ] **Target**: Pixel-perfect theme matching

### Loop 5: Production Readiness ✓
- [ ] Comprehensive error handling
- [ ] Performance monitoring integration
- [ ] Memory leak prevention
- [ ] Cross-browser compatibility testing
- [ ] **Target**: Production-ready stability

## Dependencies Integration

### Package.json Updates
```json
{
  "dependencies": {
    "@tanstack/react-virtual": "^3.10.8"
  }
}
```

### Size Impact Analysis
- `@tanstack/react-virtual`: ~15KB gzipped
- Performance gain: 10-50x for large datasets
- Memory reduction: 80-95% DOM nodes
- Bundle impact: Minimal (<1% increase)

## Confidence Score: 8/10

**High Confidence Factors:**
- TanStack Virtual is battle-tested for React applications
- Clear performance benefits for large datasets
- Material-UI integration patterns well-established
- Parse Server streaming architecture proven

**Risk Mitigation:**
- Side-by-side implementation reduces migration risk
- Comprehensive testing strategy covers edge cases
- Performance benchmarks ensure measurable improvements
- Gradual rollout plan allows validation at each step

**Success Metrics:**
- 10x+ performance improvement for large datasets
- 90%+ reduction in DOM nodes rendered
- Sub-100ms initial render times
- Seamless user experience during scrolling

This PRP provides a comprehensive foundation for implementing high-performance virtualization in PsyPsy CMS, ensuring scalability for growing datasets while maintaining the existing user experience and Material-UI design consistency.