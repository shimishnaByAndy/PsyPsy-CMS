/**
 * Simple VirtualizedDataGrid Tests
 * 
 * Basic functionality tests without complex theme setup
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the hooks and dependencies
jest.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [
      { key: 0, index: 0, start: 0, size: 52 },
      { key: 1, index: 1, start: 52, size: 52 },
      { key: 2, index: 2, start: 104, size: 52 },
    ],
    getTotalSize: () => 1000,
    scrollOffset: 0,
  }),
}));

// Mock Material-UI theme
jest.mock('@mui/material/styles', () => ({
  useTheme: () => ({
    palette: {
      divider: '#e0e0e0',
      grey: { 50: '#f5f5f5' },
      text: { primary: '#000', secondary: '#666' },
      action: { hover: '#f5f5f5' },
    },
  }),
}));

// Import component after mocks
import VirtualizedDataGrid from '../index';

const mockData = [
  { id: 1, name: 'Item 1', value: 'Value 1' },
  { id: 2, name: 'Item 2', value: 'Value 2' },
  { id: 3, name: 'Item 3', value: 'Value 3' },
];

const mockColumns = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'value', headerName: 'Value', flex: 1 },
];

describe('VirtualizedDataGrid Basic Tests', () => {
  test('renders without crashing', () => {
    render(
      <VirtualizedDataGrid
        data={mockData}
        columns={mockColumns}
        height={400}
      />
    );
  });

  test('displays column headers', () => {
    render(
      <VirtualizedDataGrid
        data={mockData}
        columns={mockColumns}
        height={400}
      />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  test('handles empty data', () => {
    render(
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
    render(
      <VirtualizedDataGrid
        data={[]}
        columns={mockColumns}
        height={400}
        loading={true}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders with minimal data', () => {
    render(
      <VirtualizedDataGrid
        data={mockData}
        columns={mockColumns}
        height={400}
      />
    );

    // Should render headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });
});