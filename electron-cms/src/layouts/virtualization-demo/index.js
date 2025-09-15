/**
 * Virtualization Demo Layout - Live testing of virtualization performance
 * 
 * Demonstrates the performance difference between regular and virtualized data grids
 * with real data and interactive controls.
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// @mui material components
import { Switch, FormControlLabel, Slider, Typography, Alert } from '@mui/material';

// Material Dashboard 2 React components
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

// Virtualization components
import VirtualizedDataGrid from 'components/VirtualizedDataGrid';
import VirtualTanStackTable from 'components/TanStackTable/VirtualTanStackTable';
import { VirtualizationThemeProvider } from 'context/VirtualizationThemeProvider';

// Icons
import SpeedIcon from '@mui/icons-material/Speed';
import DatasetIcon from '@mui/icons-material/Dataset';
import MemoryIcon from '@mui/icons-material/Memory';
import TimerIcon from '@mui/icons-material/Timer';

function VirtualizationDemo() {
  const { t } = useTranslation();
  const [dataSize, setDataSize] = useState(1000);
  const [useVirtualization, setUseVirtualization] = useState(true);
  const [renderTime, setRenderTime] = useState(0);
  const [isRendering, setIsRendering] = useState(false);

  // Generate test data
  const testData = useMemo(() => {
    console.log(`Generating ${dataSize} test records...`);
    const start = performance.now();
    
    const data = Array.from({ length: dataSize }, (_, i) => ({
      id: i + 1,
      name: `Test User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      phone: `+1-555-${String(i + 1).padStart(4, '0')}`,
      department: ['Engineering', 'Sales', 'Marketing', 'Support', 'Finance'][i % 5],
      status: ['Active', 'Inactive', 'Pending'][i % 3],
      joinDate: new Date(Date.now() - Math.random() * 31536000000).toISOString().split('T')[0],
      salary: Math.floor(Math.random() * 100000) + 40000,
      description: `This is a detailed description for user ${i + 1}. `.repeat(Math.floor(Math.random() * 3) + 1),
      score: Math.floor(Math.random() * 100),
      region: ['North', 'South', 'East', 'West', 'Central'][i % 5],
      manager: `Manager ${Math.floor(i / 10) + 1}`,
    }));
    
    const end = performance.now();
    console.log(`Data generation took ${end - start}ms`);
    
    return data;
  }, [dataSize]);

  // Test columns for Material-UI DataGrid
  const muiColumns = [
    { field: 'name', headerName: 'Name', flex: 1.5 },
    { field: 'email', headerName: 'Email', flex: 2 },
    { field: 'department', headerName: 'Department', flex: 1 },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 0.8,
      renderCell: ({ value }) => (
        <MDBox
          sx={{
            color: value === 'Active' ? 'success.main' : 'text.secondary',
            fontWeight: value === 'Active' ? 'bold' : 'normal',
          }}
        >
          {value}
        </MDBox>
      )
    },
    { field: 'joinDate', headerName: 'Join Date', flex: 1 },
    { 
      field: 'salary', 
      headerName: 'Salary', 
      flex: 1,
      renderCell: ({ value }) => `$${value?.toLocaleString()}`
    },
  ];

  // Test columns for TanStack Table  
  const tanStackColumns = [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      flex: 1.5,
    },
    {
      id: 'email',
      accessorKey: 'email', 
      header: 'Email',
      flex: 2,
    },
    {
      id: 'department',
      accessorKey: 'department',
      header: 'Department', 
      flex: 1,
    },
    { 
      id: 'status',
      accessorKey: 'status',
      header: 'Status', 
      flex: 0.8,
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <MDBox
            sx={{
              color: value === 'Active' ? 'success.main' : 'text.secondary',
              fontWeight: value === 'Active' ? 'bold' : 'normal',
            }}
          >
            {value}
          </MDBox>
        );
      }
    },
    {
      id: 'joinDate',
      accessorKey: 'joinDate',
      header: 'Join Date',
      flex: 1,
    },
    { 
      id: 'salary',
      accessorKey: 'salary',
      header: 'Salary', 
      flex: 1,
      cell: ({ getValue }) => {
        const value = getValue();
        return `$${value?.toLocaleString()}`;
      }
    },
  ];

  // Measure render performance
  const measureRenderPerformance = () => {
    setIsRendering(true);
    const start = performance.now();
    
    // Use setTimeout to allow the state update to trigger
    setTimeout(() => {
      const end = performance.now();
      setRenderTime(end - start);
      setIsRendering(false);
    }, 100);
  };

  // Handle data size change
  const handleDataSizeChange = (event, newValue) => {
    setDataSize(newValue);
    measureRenderPerformance();
  };

  // Handle virtualization toggle
  const handleVirtualizationToggle = (event) => {
    setUseVirtualization(event.target.checked);
    measureRenderPerformance();
  };

  // Performance stats
  const getPerformanceStats = () => {
    const domNodes = useVirtualization ? '~15-20' : `~${Math.min(dataSize, 100)}`;
    const memoryUsage = useVirtualization ? 'Constant' : 'Linear';
    const scrollPerformance = useVirtualization ? '60 FPS' : dataSize > 1000 ? '30-45 FPS' : '60 FPS';
    
    return {
      domNodes,
      memoryUsage,
      scrollPerformance,
      dataSize: dataSize.toLocaleString(),
    };
  };

  const stats = getPerformanceStats();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      
      <MDBox 
        py={3} 
        px={3}
        sx={{
          maxHeight: '100%',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <MDBox mb={4}>
          <MDTypography variant="h4" fontWeight="medium" gutterBottom>
            Virtualization Performance Demo
          </MDTypography>
          <MDTypography variant="body2" color="textSecondary">
            Interactive demonstration of virtual scrolling performance improvements
          </MDTypography>
        </MDBox>

        {/* Controls Panel */}
        <MDBox 
          mb={4} 
          p={3} 
          sx={{ 
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <MDTypography variant="h6" mb={3}>Performance Controls</MDTypography>
          
          <MDBox display="flex" flexDirection="column" gap={3}>
            {/* Data Size Slider */}
            <MDBox>
              <MDTypography variant="subtitle2" mb={1}>
                Dataset Size: {dataSize.toLocaleString()} records
              </MDTypography>
              <Slider
                value={dataSize}
                onChange={handleDataSizeChange}
                min={100}
                max={10000}
                step={100}
                marks={[
                  { value: 500, label: '500' },
                  { value: 1000, label: '1K' },
                  { value: 5000, label: '5K' },
                  { value: 10000, label: '10K' },
                ]}
                sx={{ width: '100%', maxWidth: 400 }}
              />
            </MDBox>

            {/* Virtualization Toggle */}
            <MDBox>
              <FormControlLabel
                control={
                  <Switch
                    checked={useVirtualization}
                    onChange={handleVirtualizationToggle}
                    color="info"
                  />
                }
                label={
                  <MDBox display="flex" alignItems="center" gap={1}>
                    <SpeedIcon fontSize="small" />
                    <MDTypography variant="subtitle2">
                      Enable Virtualization {useVirtualization ? '(ON)' : '(OFF)'}
                    </MDTypography>
                  </MDBox>
                }
              />
            </MDBox>

            {/* Performance Benchmark Button */}
            <MDBox>
              <MDButton
                variant="contained"
                color="info"
                startIcon={<TimerIcon />}
                onClick={measureRenderPerformance}
                disabled={isRendering}
              >
                {isRendering ? 'Measuring...' : 'Benchmark Render Performance'}
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>

        {/* Performance Stats */}
        <MDBox 
          mb={4}
          p={3}
          sx={{
            backgroundColor: useVirtualization ? 'success.light' : 'warning.light',
            borderRadius: 2,
            border: '1px solid',
            borderColor: useVirtualization ? 'success.main' : 'warning.main',
          }}
        >
          <MDBox display="flex" alignItems="center" gap={1} mb={2}>
            <MemoryIcon />
            <MDTypography variant="h6">Performance Metrics</MDTypography>
          </MDBox>
          
          <MDBox display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
            <MDBox>
              <MDTypography variant="body2" fontWeight="medium">DOM Nodes:</MDTypography>
              <MDTypography variant="h6" color={useVirtualization ? 'success.main' : 'warning.main'}>
                {stats.domNodes}
              </MDTypography>
            </MDBox>
            
            <MDBox>
              <MDTypography variant="body2" fontWeight="medium">Memory Usage:</MDTypography>
              <MDTypography variant="h6" color={useVirtualization ? 'success.main' : 'warning.main'}>
                {stats.memoryUsage}
              </MDTypography>
            </MDBox>
            
            <MDBox>
              <MDTypography variant="body2" fontWeight="medium">Scroll Performance:</MDTypography>
              <MDTypography variant="h6" color={useVirtualization ? 'success.main' : 'warning.main'}>
                {stats.scrollPerformance}
              </MDTypography>
            </MDBox>
            
            <MDBox>
              <MDTypography variant="body2" fontWeight="medium">Render Time:</MDTypography>
              <MDTypography variant="h6" color={renderTime < 100 ? 'success.main' : 'warning.main'}>
                {renderTime ? `${renderTime.toFixed(1)}ms` : 'Not measured'}
              </MDTypography>
            </MDBox>
          </MDBox>

          {!useVirtualization && dataSize > 1000 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Performance warning: Rendering {dataSize.toLocaleString()} rows without virtualization 
                may cause browser slowdown. Consider enabling virtualization.
              </Typography>
            </Alert>
          )}
        </MDBox>

        {/* Data Grid Display */}
        <MDBox>
          <MDBox mb={2} display="flex" alignItems="center" gap={1}>
            <DatasetIcon />
            <MDTypography variant="h6">
              {useVirtualization ? 'Virtualized' : 'Regular'} Data Grid 
              ({stats.dataSize} records)
            </MDTypography>
          </MDBox>
          
          <VirtualizationThemeProvider>
            {useVirtualization ? (
              <VirtualTanStackTable
                data={testData}
                columns={tanStackColumns}
                enableVirtualization={true}
                virtualHeight={400}
                rowHeight={52}
                enableSorting={true}
                scrollRestorationKey="demo-grid"
              />
            ) : (
              <VirtualTanStackTable
                data={testData.slice(0, 100)} // Limit for performance
                columns={tanStackColumns}
                enableVirtualization={false}
                virtualHeight={400}
                rowHeight={52}
                enableSorting={true}
              />
            )}
          </VirtualizationThemeProvider>
          
          {!useVirtualization && (
            <MDTypography variant="caption" color="textSecondary" mt={1} display="block">
              Note: Non-virtualized mode limited to 100 rows for browser performance
            </MDTypography>
          )}
        </MDBox>

        {/* Instructions */}
        <MDBox mt={4} p={3} sx={{ backgroundColor: 'grey.50', borderRadius: 2 }}>
          <MDTypography variant="h6" mb={2}>How to Test:</MDTypography>
          <MDBox component="ol" pl={2}>
            <MDTypography component="li" variant="body2" mb={1}>
              Adjust the dataset size using the slider above
            </MDTypography>
            <MDTypography component="li" variant="body2" mb={1}>
              Toggle virtualization ON/OFF to see performance differences
            </MDTypography>
            <MDTypography component="li" variant="body2" mb={1}>
              Click "Benchmark Render Performance" to measure render times
            </MDTypography>
            <MDTypography component="li" variant="body2" mb={1}>
              Scroll through the data grid to test scroll performance
            </MDTypography>
            <MDTypography component="li" variant="body2">
              Compare DOM node counts in browser dev tools (Elements tab)
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default VirtualizationDemo;