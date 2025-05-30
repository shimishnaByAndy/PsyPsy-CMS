/**
 * ClientsDataGrid - MUI-X DataGrid component for displaying client data
 * Uses the new ClientService for data fetching and follows ClassStructDocs schema
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DataGrid } from '@mui/x-data-grid';
import { ClientService } from 'services/clientService';

// @mui material components
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';

// @mui icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDButton from "components/MDButton";

// Custom components
import EmptyState from 'components/EmptyState';
import LoadingState from 'components/LoadingState';

function ClientsDataGrid({ 
  onViewClient, 
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

  // Check if there are active filters or search
  const hasActiveFilters = searchTerm.trim() !== '' || Object.values(filters).some(value => value !== 'all' && value !== '');

  // Gender mapping with translations
  const genderMap = {
    1: t("statistics.distributions.gender.woman"),
    2: t("statistics.distributions.gender.man"),
    3: t("statistics.distributions.gender.other"),
    4: t("statistics.distributions.gender.notDisclosed"),
  };

  // Helper function to format Canadian phone numbers
  const formatCanadianPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return 'N/A';
    
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Check if we have a valid number of digits
    if (digits.length < 10) return phoneNumber;
    
    // Remove leading 1 if present (country code)
    const tenDigits = digits.length === 11 && digits.charAt(0) === '1' 
      ? digits.substring(1) 
      : digits.substring(0, 10); 
    
    // Format as (XXX) XXX-XXXX
    return `(${tenDigits.substring(0, 3)}) ${tenDigits.substring(3, 6)}-${tenDigits.substring(6, 10)}`;
  };

  // Helper function to calculate age
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const dobDate = new Date(dob);
    if (dobDate instanceof Date && !isNaN(dobDate)) {
      return new Date().getFullYear() - dobDate.getFullYear();
    }
    return 'N/A';
  };

  // Helper function to format last seen date with color
  const formatLastSeen = (lastSeenDate) => {
    if (!lastSeenDate) return { text: t("tables.timeIndicators.never"), color: 'error' };
    
    const now = new Date();
    const lastSeen = new Date(lastSeenDate); 
    const diffMs = now - lastSeen;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;
    const diffMonths = diffDays / 30;
    
    if (diffHours < 24) {
      return { 
        text: t("tables.timeIndicators.hoursAgo", { count: Math.round(diffHours) }),
        color: 'success' 
      };
    } else if (diffDays < 7) {
      return { 
        text: t("tables.timeIndicators.daysAgo", { count: Math.round(diffDays) }),
        color: 'success' 
      };
    } else if (diffDays < 30) {
      return { 
        text: t("tables.timeIndicators.daysAgo", { count: Math.round(diffDays) }),
        color: 'warning' 
      };
    } else if (diffMonths < 3) {
      return { 
        text: t("tables.timeIndicators.monthsAgo", { count: Math.round(diffMonths) }),
        color: 'warning' 
      };
    } else {
      return { 
        text: t("tables.timeIndicators.inactive"),
        color: 'error' 
      };
    }
  };

  // Define columns for the data grid
  const columns = [
    {
      field: 'name',
      headerName: t("tables.columns.name"),
      width: 250,
      renderCell: (params) => {
        const client = params.row.clientPtr || {};
        const firstName = client.firstName || 'N/A';
        const lastName = client.lastName || '';
        const email = params.row.email || 'N/A';

        return (
          <MDBox lineHeight={1} py={1}>
            <MDTypography display="block" variant="button" fontWeight="medium">
              {firstName} {lastName}
            </MDTypography>
            <MDTypography variant="caption" color="text" fontWeight="regular">
              {email}
            </MDTypography>
          </MDBox>
        );
      },
      sortable: true,
    },
    {
      field: 'age',
      headerName: t("tables.columns.age"),
      width: 100,
      renderCell: (params) => {
        const client = params.row.clientPtr || {};
        const age = calculateAge(client.dob);
        return (
          <MDTypography variant="caption" fontWeight="medium">
            {age}
          </MDTypography>
        );
      },
      sortable: true,
    },
    {
      field: 'gender',
      headerName: t("tables.columns.gender"),
      width: 120,
      renderCell: (params) => {
        const client = params.row.clientPtr || {};
        const genderLabel = client.gender !== undefined && genderMap[client.gender] 
                           ? genderMap[client.gender] 
                           : "Unknown";
        return (
          <Chip 
            label={genderLabel} 
            size="small" 
            variant="outlined"
            color={client.gender ? 'primary' : 'default'}
          />
        );
      },
      sortable: true,
    },
    {
      field: 'phone',
      headerName: t("tables.columns.phone"),
      width: 160,
      renderCell: (params) => {
        const client = params.row.clientPtr || {};
        const formattedPhone = formatCanadianPhoneNumber(client.phoneNb);
        return (
          <MDBox display="flex" alignItems="center">
            <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <MDTypography variant="caption" fontWeight="medium">
              {formattedPhone}
            </MDTypography>
          </MDBox>
        );
      },
      sortable: false,
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 150,
      renderCell: (params) => {
        const client = params.row.clientPtr || {};
        const address = client.addressObj;
        const locationText = address ? `${address.city}, ${address.province}` : 'N/A';
        
        return (
          <MDBox display="flex" alignItems="center">
            <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <MDTypography variant="caption" fontWeight="medium">
              {locationText}
            </MDTypography>
          </MDBox>
        );
      },
      sortable: false,
    },
    {
      field: 'languages',
      headerName: 'Languages',
      width: 150,
      renderCell: (params) => {
        const client = params.row.clientPtr || {};
        const languages = client.spokenLangArr || [];
        
        return (
          <MDBox>
            {languages.slice(0, 2).map((lang, index) => (
              <Chip 
                key={index}
                label={lang} 
                size="small" 
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
            {languages.length > 2 && (
              <Chip 
                label={`+${languages.length - 2}`} 
                size="small" 
                variant="outlined"
                color="secondary"
              />
            )}
          </MDBox>
        );
      },
      sortable: false,
    },
    {
      field: 'lastSeen',
      headerName: t("tables.columns.lastSeen"),
      width: 130,
      renderCell: (params) => {
        const lastSeenDate = params.row.updatedAt || params.row.createdAt;
        const { text, color } = formatLastSeen(lastSeenDate);
        
        return (
          <Chip 
            label={text}
            size="small"
            color={color}
            variant="filled"
          />
        );
      },
      sortable: true,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => {
        const isBlocked = params.row.isBlocked;
        const isVerified = params.row.emailVerified;
        
        if (isBlocked) {
          return <Chip label="Blocked" size="small" color="error" />;
        } else if (isVerified) {
          return <Chip label="Active" size="small" color="success" />;
        } else {
          return <Chip label="Pending" size="small" color="warning" />;
        }
      },
      sortable: true,
    },
    {
      field: 'actions',
      headerName: t("tables.columns.actions"),
      width: 120,
      renderCell: (params) => (
        <MDBox>
          <Tooltip title={t("tables.actions.view")}>
            <IconButton 
              size="small"
              onClick={() => onViewClient && onViewClient(params.row.objectId || params.row.id)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Email">
            <IconButton 
              size="small"
              onClick={() => window.open(`mailto:${params.row.email}`)}
            >
              <EmailIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
      ),
      sortable: false,
    },
  ];

  // Load clients data
  const loadClients = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await ClientService.getClients({
        page: paginationModel.page,
        limit: paginationModel.pageSize,
        search: searchTerm,
        sortBy: sortModel.length > 0 ? sortModel[0].field : 'createdAt',
        sortDirection: sortModel.length > 0 ? sortModel[0].sort : 'desc',
        filters: filters
      });

      console.log('ClientsDataGrid: Loaded clients:', result);

      // Transform data for DataGrid (ensure each row has an id)
      const transformedRows = result.results.map(client => ({
        ...client,
        id: client.objectId || client.id, // DataGrid requires an 'id' field
      }));

      setRows(transformedRows);
      setRowCount(result.total);
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading clients:', err);
      setError(err.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, [paginationModel, sortModel, searchTerm, filters]);

  // Load data when dependencies change
  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Handle pagination change
  const handlePaginationModelChange = (newPaginationModel) => {
    setPaginationModel(newPaginationModel);
  };

  // Handle sort change
  const handleSortModelChange = (newSortModel) => {
    setSortModel(newSortModel);
  };

  const handleRefresh = () => {
    loadClients();
  };

  const handleClearFilters = () => {
    // This would need to be passed down from parent component
    if (onViewClient) {
      onViewClient(null); // Signal to clear filters
    }
  };

  return (
    <MDBox>
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <MDButton size="small" onClick={handleRefresh}>
              Retry
            </MDButton>
          }
        >
          {error}
        </Alert>
      )}
      
      {/* Loading State */}
      {loading && (
        <LoadingState 
          type="clients" 
          size="medium"
          variant="skeleton"
          rows={paginationModel.pageSize}
        />
      )}

      {/* Empty States */}
      {!loading && !error && rows.length === 0 && (
        <EmptyState
          type={hasActiveFilters ? 'search-clients' : 'clients'}
          size="medium"
          actionLabel={hasActiveFilters ? 'Clear Filters' : 'Refresh Data'}
          onActionClick={hasActiveFilters ? handleClearFilters : handleRefresh}
          showRefresh={!hasActiveFilters}
          onRefresh={handleRefresh}
        />
      )}
      
      {/* Data Grid */}
      {!loading && !error && rows.length > 0 && (
        <Box sx={{ height: height, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={false} // We handle loading state manually
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
      )}
    </MDBox>
  );
}

export default ClientsDataGrid; 