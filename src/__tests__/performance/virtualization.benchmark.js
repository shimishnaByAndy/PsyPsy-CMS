/**
 * Virtualization Performance Benchmarks
 * 
 * Comprehensive performance testing for virtual scrolling components
 * to validate performance improvements and memory efficiency.
 */

import { performance } from 'perf_hooks';
import { render, cleanup, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from 'assets/theme';

// Components to test
import VirtualizedDataGrid from 'components/VirtualizedDataGrid';
import VirtualTanStackTable from 'components/TanStackTable/VirtualTanStackTable';
import { VirtualizationThemeProvider } from 'context/VirtualizationThemeProvider';

// Test utilities
const generateLargeDataset = (size) => 
  Array.from({ length: size }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    email: `user${i}@example.com`,
    phone: `+1-555-${String(i).padStart(4, '0')}`,
    description: `Description for item ${i}`.repeat(Math.floor(Math.random() * 3) + 1),
    status: ['Active', 'Inactive', 'Pending'][i % 3],
    createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
  }));

const testColumns = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1.5 },
  { field: 'phone', headerName: 'Phone', flex: 1 },
  { field: 'status', headerName: 'Status', flex: 0.8 },
  { field: 'description', headerName: 'Description', flex: 2 },
];

const renderWithProviders = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      <VirtualizationThemeProvider>
        {component}
      </VirtualizationThemeProvider>
    </ThemeProvider>
  );
};

// Performance measurement utilities
const measurePerformance = async (name, fn) => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  const duration = end - start;
  
  console.log(`${name}: ${duration.toFixed(2)}ms`);
  return duration;
};

const measureMemoryUsage = () => {
  if (typeof performance.memory !== 'undefined') {
    return {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
    };
  }
  return null;
};

describe('Virtualization Performance Benchmarks', () => {
  beforeEach(() => {
    // Clean up any existing renders
    cleanup();
    
    // Mock performance.memory if not available
    if (typeof performance.memory === 'undefined') {
      performance.memory = {
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 4000000,
      };
    }
  });

  afterEach(() => {
    cleanup();
  });

  describe('VirtualizedDataGrid Performance', () => {
    test('renders 1K items efficiently', async () => {
      const dataset = generateLargeDataset(1000);
      
      const renderTime = await measurePerformance('VirtualizedDataGrid 1K render', () => {
        renderWithProviders(
          <VirtualizedDataGrid
            data={dataset}
            columns={testColumns}
            height={600}
            rowHeight={52}
          />
        );
      });

      // Should render in under 100ms
      expect(renderTime).toBeLessThan(100);
      
      // Should only render visible items
      const renderedItems = screen.getAllByText(/Item \d+/);
      expect(renderedItems.length).toBeLessThan(30);
    });

    test('renders 10K items without performance degradation', async () => {
      const largeDataset = generateLargeDataset(10000);
      
      const memoryBefore = measureMemoryUsage();
      
      const renderTime = await measurePerformance('VirtualizedDataGrid 10K render', () => {
        renderWithProviders(
          <VirtualizedDataGrid
            data={largeDataset}
            columns={testColumns}
            height={600}
            rowHeight={52}
          />
        );
      });

      const memoryAfter = measureMemoryUsage();
      
      // Should render quickly even with 10K items
      expect(renderTime).toBeLessThan(150);
      
      // Should only render visible items regardless of data size
      const renderedItems = screen.getAllByText(/Item \d+/);
      expect(renderedItems.length).toBeLessThan(30);
      
      // Memory usage should be reasonable
      if (memoryBefore && memoryAfter) {
        const memoryDiff = memoryAfter.used - memoryBefore.used;
        expect(memoryDiff).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
      }
    });

    test('maintains performance during scrolling', async () => {
      const dataset = generateLargeDataset(5000);
      
      const { container } = renderWithProviders(
        <VirtualizedDataGrid
          data={dataset}
          columns={testColumns}
          height={600}
          rowHeight={52}
        />
      );

      const scrollContainer = container.querySelector('[data-testid="virtual-scroll-container"]');
      expect(scrollContainer).toBeTruthy();

      // Measure scroll performance
      const scrollTime = await measurePerformance('VirtualizedDataGrid scroll', async () => {
        // Simulate multiple scroll events
        for (let i = 0; i < 10; i++) {
          fireEvent.scroll(scrollContainer, { 
            target: { scrollTop: i * 500 } 
          });
          // Small delay to simulate real scrolling
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      });

      // Scrolling should be smooth (total time for 10 scrolls)
      expect(scrollTime).toBeLessThan(200);
    });
  });

  describe('VirtualTanStackTable Performance', () => {
    test('TanStack integration performs efficiently', async () => {
      const dataset = generateLargeDataset(2000);
      
      const renderTime = await measurePerformance('VirtualTanStackTable render', () => {
        renderWithProviders(
          <VirtualTanStackTable
            data={dataset}
            columns={testColumns}
            enableVirtualization={true}
            virtualHeight={600}
            rowHeight={52}
            enableSorting={true}
          />
        );
      });

      expect(renderTime).toBeLessThan(120);
      
      // Verify TanStack features work
      const sortButton = screen.getByRole('button', { name: /name/i });
      expect(sortButton).toBeInTheDocument();
    });

    test('sorting performance with virtualization', async () => {
      const dataset = generateLargeDataset(3000);
      
      const { container } = renderWithProviders(
        <VirtualTanStackTable
          data={dataset}
          columns={testColumns}
          enableVirtualization={true}
          virtualHeight={600}
          enableSorting={true}
        />
      );

      // Find and click sort button
      const nameHeader = screen.getByText('Name').closest('div');
      
      const sortTime = await measurePerformance('VirtualTanStackTable sort', () => {
        fireEvent.click(nameHeader);
      });

      // Sorting should be fast even with large dataset
      expect(sortTime).toBeLessThan(50);
    });
  });

  describe('Memory Efficiency Tests', () => {
    test('memory usage stays constant with increasing data size', () => {
      const dataSizes = [100, 500, 1000, 5000];
      const memoryUsages = [];

      dataSizes.forEach(size => {
        cleanup(); // Clean between tests
        
        const dataset = generateLargeDataset(size);
        const memoryBefore = measureMemoryUsage();
        
        renderWithProviders(
          <VirtualizedDataGrid
            data={dataset}
            columns={testColumns}
            height={600}
          />
        );

        const memoryAfter = measureMemoryUsage();
        
        if (memoryBefore && memoryAfter) {
          memoryUsages.push(memoryAfter.used - memoryBefore.used);
        }

        // DOM should have similar number of elements regardless of data size
        const renderedItems = screen.getAllByText(/Item \d+/);
        expect(renderedItems.length).toBeLessThan(30);
      });

      // Memory usage should not grow linearly with data size
      if (memoryUsages.length >= 2) {
        const firstHalf = memoryUsages.slice(0, 2);
        const secondHalf = memoryUsages.slice(2);
        
        const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        
        // Memory usage should not increase dramatically
        const growthFactor = avgSecond / avgFirst;
        expect(growthFactor).toBeLessThan(3); // Should not triple
      }
    });

    test('DOM node count stays constant', () => {
      const datasets = [
        generateLargeDataset(100),
        generateLargeDataset(1000),
        generateLargeDataset(10000),
      ];

      const domNodeCounts = [];

      datasets.forEach(dataset => {
        cleanup();
        
        const { container } = renderWithProviders(
          <VirtualizedDataGrid
            data={dataset}
            columns={testColumns}
            height={600}
          />
        );

        // Count DOM nodes in the virtualized area
        const virtualizedNodes = container.querySelectorAll('[data-index]');
        domNodeCounts.push(virtualizedNodes.length);
      });

      // All datasets should render similar number of DOM nodes
      const maxNodes = Math.max(...domNodeCounts);
      const minNodes = Math.min(...domNodeCounts);
      
      expect(maxNodes - minNodes).toBeLessThan(10); // Within 10 nodes difference
    });
  });

  describe('Comparative Performance', () => {
    test('virtualized vs non-virtualized rendering', async () => {
      const dataset = generateLargeDataset(1000);

      // Test virtualized version
      const virtualizedTime = await measurePerformance('Virtualized render', () => {
        cleanup();
        renderWithProviders(
          <VirtualTanStackTable
            data={dataset}
            columns={testColumns}
            enableVirtualization={true}
            virtualHeight={600}
          />
        );
      });

      // Test non-virtualized version
      const nonVirtualizedTime = await measurePerformance('Non-virtualized render', () => {
        cleanup();
        renderWithProviders(
          <VirtualTanStackTable
            data={dataset}
            columns={testColumns}
            enableVirtualization={false}
            virtualHeight={600}
          />
        );
      });

      console.log(`Performance improvement: ${((nonVirtualizedTime - virtualizedTime) / nonVirtualizedTime * 100).toFixed(1)}%`);

      // Virtualized should be faster for large datasets
      expect(virtualizedTime).toBeLessThanOrEqual(nonVirtualizedTime);
    });
  });
});

describe('Real-world Performance Scenarios', () => {
  test('client data grid performance simulation', async () => {
    // Simulate real client data
    const clientData = generateLargeDataset(2000).map(item => ({
      ...item,
      clientPtr: {
        firstName: item.name.split(' ')[1],
        lastName: 'User',
        dob: new Date(1990, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        gender: Math.floor(Math.random() * 4) + 1,
        phoneNb: item.phone,
        spokenLangArr: ['English', 'French'].slice(0, Math.floor(Math.random() * 2) + 1),
        addressObj: { city: 'Toronto', province: 'ON' },
      },
    }));

    const renderTime = await measurePerformance('Client data simulation', () => {
      renderWithProviders(
        <VirtualizedDataGrid
          data={clientData}
          columns={[
            { field: 'name', headerName: 'Client', flex: 2 },
            { field: 'email', headerName: 'Email', flex: 1.5 },
            { field: 'clientPtr.phoneNb', headerName: 'Phone', flex: 1 },
            { field: 'status', headerName: 'Status', flex: 0.8 },
          ]}
          height={600}
        />
      );
    });

    expect(renderTime).toBeLessThan(100);
  });
});