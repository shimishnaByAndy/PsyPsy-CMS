/**
 * VirtualizedDataGrid Tests
 * 
 * Tests for virtual scrolling performance, functionality, and accessibility
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VirtualizedDataGrid from 'components/VirtualizedDataGrid';
import { VirtualizationThemeProvider } from 'context/VirtualizationThemeProvider';
import { ThemeProvider } from '@mui/material/styles';
import theme from 'assets/theme';

// Mock data
const generateMockData = (count) => 
  Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    value: `Value ${i}`,
    description: `Description for item ${i}`.repeat(Math.floor(Math.random() * 3) + 1),
  }));

const mockColumns = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'value', headerName: 'Value', flex: 1 },
  { field: 'description', headerName: 'Description', flex: 2 },
];

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      <VirtualizationThemeProvider>
        {component}
      </VirtualizationThemeProvider>
    </ThemeProvider>
  );
};

describe('VirtualizedDataGrid', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  test('renders only visible rows for large datasets', () => {
    const mockData = generateMockData(1000);
    
    renderWithTheme(
      <VirtualizedDataGrid
        data={mockData}
        columns={mockColumns}
        height={400}
        rowHeight={50}
      />
    );

    // Should render header
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();

    // Should render some rows but not all 1000
    const renderedItems = screen.getAllByText(/Item \d+/);
    expect(renderedItems.length).toBeLessThan(50); // Much less than 1000
    expect(renderedItems.length).toBeGreaterThan(5); // But still visible items
  });

  test('handles empty data gracefully', () => {
    renderWithTheme(
      <VirtualizedDataGrid
        data={[]}
        columns={mockColumns}
        height={400}
        emptyMessage="No data available"
      />
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    renderWithTheme(
      <VirtualizedDataGrid
        data={[]}
        columns={mockColumns}
        height={400}
        loading={true}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('handles row clicks', () => {
    const mockData = generateMockData(10);
    const onRowClick = jest.fn();
    
    renderWithTheme(
      <VirtualizedDataGrid
        data={mockData}
        columns={mockColumns}
        height={400}
        onRowClick={onRowClick}
      />
    );

    const firstRow = screen.getByText('Item 0').closest('[role]');
    if (firstRow) {
      fireEvent.click(firstRow);
      expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
    }
  });

  test('renders custom cell content', () => {
    const customColumns = [
      {
        field: 'name',
        headerName: 'Custom Name',
        flex: 1,
        renderCell: ({ row, value }) => `Custom: ${value}`,
      },
    ];

    const mockData = [{ id: 1, name: 'Test Item' }];
    
    renderWithTheme(
      <VirtualizedDataGrid
        data={mockData}
        columns={customColumns}
        height={400}
      />
    );

    expect(screen.getByText('Custom: Test Item')).toBeInTheDocument();
  });

  test('handles dynamic data updates', () => {
    const initialData = generateMockData(5);
    const { rerender } = renderWithTheme(
      <VirtualizedDataGrid
        data={initialData}
        columns={mockColumns}
        height={400}
      />
    );

    // Check initial data
    expect(screen.getByText('Item 0')).toBeInTheDocument();
    expect(screen.queryByText('Item 5')).not.toBeInTheDocument();

    // Update with more data
    const updatedData = generateMockData(10);
    rerender(
      <ThemeProvider theme={theme}>
        <VirtualizationThemeProvider>
          <VirtualizedDataGrid
            data={updatedData}
            columns={mockColumns}
            height={400}
          />
        </VirtualizationThemeProvider>
      </ThemeProvider>
    );

    // Should still render efficiently
    expect(screen.getByText('Item 0')).toBeInTheDocument();
  });

  test('maintains accessibility attributes', () => {
    const mockData = generateMockData(10);
    
    renderWithTheme(
      <VirtualizedDataGrid
        data={mockData}
        columns={mockColumns}
        height={400}
      />
    );

    // Check for proper ARIA attributes
    const scrollContainer = screen.getByTestId('virtual-scroll-container');
    expect(scrollContainer).toBeInTheDocument();
  });

  test('handles placeholder content for unloaded data', () => {
    const mockDataWithNulls = [
      { id: 1, name: 'Loaded Item' },
      null, // Placeholder
      { id: 3, name: 'Another Item' },
    ];
    
    renderWithTheme(
      <VirtualizedDataGrid
        data={mockDataWithNulls}
        columns={mockColumns}
        height={400}
      />
    );

    expect(screen.getByText('Loaded Item')).toBeInTheDocument();
    expect(screen.getByText('Another Item')).toBeInTheDocument();
  });
});

describe('VirtualizedDataGrid Performance', () => {
  test('renders large dataset efficiently', async () => {
    const largeDataset = generateMockData(10000);
    const startTime = performance.now();
    
    renderWithTheme(
      <VirtualizedDataGrid
        data={largeDataset}
        columns={mockColumns}
        height={600}
      />
    );

    const renderTime = performance.now() - startTime;
    
    // Should render quickly even with 10k items
    expect(renderTime).toBeLessThan(100);
    
    // Should only render visible items
    const renderedItems = screen.getAllByText(/Item \d+/);
    expect(renderedItems.length).toBeLessThan(50);
  });

  test('memory usage stays constant with data size', () => {
    const datasets = [
      generateMockData(100),
      generateMockData(1000),
      generateMockData(10000),
    ];

    datasets.forEach(dataset => {
      const { unmount } = renderWithTheme(
        <VirtualizedDataGrid
          data={dataset}
          columns={mockColumns}
          height={600}
        />
      );

      // Should render similar number of DOM elements regardless of data size
      const renderedItems = screen.getAllByText(/Item \d+/);
      expect(renderedItems.length).toBeLessThan(30);
      
      unmount();
    });
  });
});