/**
 * AppointmentsDataGrid - MUI-X DataGrid component for displaying appointment data
 * Uses the Appointment schema from ClassStructDocs
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DataGrid } from '@mui/x-data-grid';

// @mui material components
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';

// @mui icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import PsychologyIcon from '@mui/icons-material/Psychology';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";

// Appointment service
import { AppointmentService } from "services/appointmentService";

function AppointmentsDataGrid({ 
  onViewAppointment, 
  searchTerm = '', 
  filters = {},
  height = 600 
}) {
  const { t } = useTranslation();
  
  // State for data grid
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowCount, setRowCount] = useState(0);
  
  // State for pagination and sorting
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState([
    { field: 'createdAt', sort: 'desc' }
  ]);

  // Load appointment data using AppointmentService
  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await AppointmentService.getAppointments({
        page: paginationModel.page,
        limit: paginationModel.pageSize,
        search: searchTerm,
        sortBy: sortModel.length > 0 ? sortModel[0].field : 'createdAt',
        sortDirection: sortModel.length > 0 ? sortModel[0].sort : 'desc',
        filters: filters
      });

      console.log('AppointmentsDataGrid: Loaded appointments:', result);

      // Transform data for DataGrid (ensure each row has an id)
      const transformedRows = result.results.map(appointment => ({
        ...appointment,
        id: appointment.objectId || appointment.id, // DataGrid requires an 'id' field
      }));

      setRows(transformedRows);
      setRowCount(result.total);
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [paginationModel, sortModel, searchTerm, filters]);

  // Load data when dependencies change
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Handle pagination changes
  const handlePaginationModelChange = (newPaginationModel) => {
    setPaginationModel(newPaginationModel);
  };

  // Handle sorting changes
  const handleSortModelChange = (newSortModel) => {
    setSortModel(newSortModel);
  };

  // Helper functions moved to service, but keep local ones for table display
  
  // Status mapping with colors
  const statusMap = {
    'requested': { label: 'Requested', color: 'warning' },
    'matched': { label: 'Matched', color: 'info' },
    'confirmed': { label: 'Confirmed', color: 'success' },
    'completed': { label: 'Completed', color: 'primary' },
    'cancelled': { label: 'Cancelled', color: 'error' },
    'no_show': { label: 'No Show', color: 'error' }
  };

  // Service type mapping
  const serviceTypeMap = {
    0: 'Individual Therapy',
    1: 'Group Therapy',
    2: 'Couples Therapy',
    3: 'Family Therapy',
    4: 'Psychological Assessment',
    5: 'Neuropsychological Assessment',
    6: 'Career Counseling',
    7: 'Addiction Counseling'
  };

  // Meeting preference mapping
  const meetPrefMap = {
    0: 'In-Person',
    1: 'Online',
    2: 'Either'
  };

  // Helper function to format date and time
  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Not scheduled';
    const date = new Date(timestamp);
    return date.toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  // Helper function to get relative time
  const getRelativeTime = (date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.round(diffHours)}h ago`;
    if (diffDays < 7) return `${Math.round(diffDays)}d ago`;
    return new Date(date).toLocaleDateString('en-CA');
  };

  // Define columns for the data grid
  const columns = [
    {
      field: 'client',
      headerName: 'Client',
      width: 200,
      renderCell: (params) => {
        const clientName = params.row.clientName || 'Unknown Client';
        const clientEmail = params.row.clientEmail || '';

        return (
          <MDBox lineHeight={1} py={1}>
            <MDTypography display="block" variant="button" fontWeight="medium">
              {clientName}
            </MDTypography>
            <MDTypography variant="caption" color="text" fontWeight="regular">
              {clientEmail}
            </MDTypography>
          </MDBox>
        );
      },
      sortable: true,
    },
    {
      field: 'title',
      headerName: 'Title',
      width: 200,
      renderCell: (params) => {
        const title = params.row.title || `${serviceTypeMap[params.row.serviceType]} Request`;
        return (
          <MDTypography variant="caption" fontWeight="medium">
            {title}
          </MDTypography>
        );
      },
      sortable: true,
    },
    {
      field: 'serviceType',
      headerName: 'Service',
      width: 150,
      renderCell: (params) => {
        const serviceLabel = serviceTypeMap[params.row.serviceType] || 'Unknown';
        return (
          <Chip 
            label={serviceLabel} 
            size="small" 
            variant="outlined"
            color="primary"
            icon={<PsychologyIcon />}
          />
        );
      },
      sortable: true,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const status = params.row.status || 'requested';
        const statusInfo = statusMap[status] || { label: status, color: 'default' };
        
        return (
          <Chip 
            label={statusInfo.label} 
            size="small" 
            color={statusInfo.color}
            variant="filled"
          />
        );
      },
      sortable: true,
    },
    {
      field: 'meetPref',
      headerName: 'Meeting Type',
      width: 120,
      renderCell: (params) => {
        const meetPref = meetPrefMap[params.row.meetPref] || 'Not specified';
        const icon = params.row.meetPref === 1 ? '💻' : params.row.meetPref === 0 ? '🏢' : '🔄';
        
        return (
          <MDBox display="flex" alignItems="center">
            <span style={{ marginRight: 4 }}>{icon}</span>
            <MDTypography variant="caption" fontWeight="medium">
              {meetPref}
            </MDTypography>
          </MDBox>
        );
      },
      sortable: true,
    },
    {
      field: 'scheduledTimestamp',
      headerName: 'Scheduled Time',
      width: 160,
      renderCell: (params) => {
        const timestamp = params.row.scheduledTimestamp;
        const dateTime = formatDateTime(timestamp);
        const isScheduled = !!timestamp;
        
        return (
          <MDBox display="flex" alignItems="center">
            <AccessTimeIcon 
              fontSize="small" 
              sx={{ mr: 1, color: isScheduled ? 'success.main' : 'text.secondary' }} 
            />
            <MDTypography 
              variant="caption" 
              fontWeight="medium"
              color={isScheduled ? 'text' : 'text.secondary'}
            >
              {dateTime}
            </MDTypography>
          </MDBox>
        );
      },
      sortable: true,
    },
    {
      field: 'maxBudget',
      headerName: 'Budget',
      width: 100,
      renderCell: (params) => {
        const budget = formatCurrency(params.row.maxBudget);
        
        return (
          <MDBox display="flex" alignItems="center">
            <AttachMoneyIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <MDTypography variant="caption" fontWeight="medium">
              {budget}
            </MDTypography>
          </MDBox>
        );
      },
      sortable: true,
    },
    {
      field: 'applicationCount',
      headerName: 'Applications',
      width: 110,
      renderCell: (params) => {
        const count = params.row.applicationCount || 0;
        const color = count > 0 ? 'success' : 'warning';
        
        return (
          <Chip 
            label={`${count} apps`} 
            size="small" 
            color={color}
            variant="outlined"
          />
        );
      },
      sortable: true,
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      renderCell: (params) => {
        const relativeTime = getRelativeTime(params.row.createdAt);
        
        return (
          <MDTypography variant="caption" color="text" fontWeight="regular">
            {relativeTime}
          </MDTypography>
        );
      },
      sortable: true,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <MDBox>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => onViewAppointment && onViewAppointment(params.row)}
              color="info"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
      ),
    },
  ];

  return (
    <MDBox>
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ height: height, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          rowCount={rowCount}
          
          // Pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[5, 10, 25, 50]}
          
          // Sorting
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          
          // Styling
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f8f9fa',
              borderBottom: '2px solid #dee2e6',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f8f9fa',
            },
          }}
          
          // Loading overlay
          slots={{
            loadingOverlay: LinearProgress,
          }}
          
          // Initial state
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
            sorting: {
              sortModel: [{ field: 'createdAt', sort: 'desc' }],
            },
          }}
        />
      </Box>
    </MDBox>
  );
}

export default AppointmentsDataGrid; 