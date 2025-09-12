/**
 * Firebase Clients Data Grid
 * 
 * Replaces Parse-based clients data grid with Firebase/Firestore integration
 * Uses real-time subscriptions and optimistic updates
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// @mui material components
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// @mui icons
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake';
import RefreshIcon from '@mui/icons-material/Refresh';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

// Firebase hooks
import { 
  useFirebaseClientsSubscription,
  useClientFormHelpers,
  GENDER_TYPES
} from '../hooks/useFirebaseClients';

const FirebaseClientsDataGrid = ({ 
  onViewClient,
  onEditClient,
  userType = 1 
}) => {
  const { t } = useTranslation();
  const { formatClientDisplay, formatPhoneNumber, calculateAge } = useClientFormHelpers();
  
  // Filter states
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    gender: 'all',
    ageRange: 'all'
  });
  
  // Debounced search to avoid excessive API calls
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [search]);

  // Firebase subscription with real-time updates
  const { 
    clients, 
    isLoading, 
    error, 
    refetch 
  } = useFirebaseClientsSubscription({
    limit: 100,
    orderBy: 'createdAt',
    orderDirection: 'desc'
  });

  // Filter clients based on search and filters
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    
    return clients.filter(client => {
      const profile = client.clientProfile;
      
      // Search filter
      if (debouncedSearch) {
        const searchTerm = debouncedSearch.toLowerCase();
        const searchableText = [
          client.email,
          client.displayName,
          profile?.firstName,
          profile?.lastName
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }
      
      // Gender filter
      if (filters.gender !== 'all' && profile?.gender !== parseInt(filters.gender)) {
        return false;
      }
      
      // Age range filter
      if (filters.ageRange !== 'all' && profile?.dob) {
        const age = calculateAge(profile.dob.toDate());
        const ageRange = filters.ageRange;
        
        if (ageRange === '14-17' && (age < 14 || age > 17)) return false;
        if (ageRange === '18-24' && (age < 18 || age > 24)) return false;
        if (ageRange === '25-34' && (age < 25 || age > 34)) return false;
        if (ageRange === '35-44' && (age < 35 || age > 44)) return false;
        if (ageRange === '45-54' && (age < 45 || age > 54)) return false;
        if (ageRange === '55-64' && (age < 55 || age > 64)) return false;
        if (ageRange === '65+' && age < 65) return false;
      }
      
      return true;
    });
  }, [clients, debouncedSearch, filters, calculateAge]);

  // DataGrid columns definition
  const columns = [
    {
      field: 'displayName',
      headerName: t('clients.name'),
      width: 200,
      renderCell: (params) => {
        const profile = params.row.clientProfile;
        const name = profile ? 
          `${profile.firstName || ''} ${profile.lastName || ''}`.trim() :
          params.row.displayName || params.row.email;
        
        return (
          <Box display="flex" alignItems="center">
            <PersonIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
            <MDTypography variant="button" fontWeight="medium">
              {name || 'Unknown'}
            </MDTypography>
          </Box>
        );
      }
    },
    {
      field: 'email',
      headerName: t('clients.email'),
      width: 220,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <EmailIcon color="info" sx={{ mr: 1, fontSize: 18 }} />
          <MDTypography variant="caption">
            {params.value}
          </MDTypography>
        </Box>
      )
    },
    {
      field: 'phoneNb',
      headerName: t('clients.phone'),
      width: 150,
      renderCell: (params) => {
        const phone = params.row.clientProfile?.phoneNb;
        
        return phone ? (
          <Box display="flex" alignItems="center">
            <PhoneIcon color="info" sx={{ mr: 1, fontSize: 18 }} />
            <MDTypography variant="caption">
              {formatPhoneNumber(phone)}
            </MDTypography>
          </Box>
        ) : (
          <MDTypography variant="caption" color="text.secondary">
            —
          </MDTypography>
        );
      }
    },
    {
      field: 'age',
      headerName: t('clients.age'),
      width: 100,
      renderCell: (params) => {
        const dob = params.row.clientProfile?.dob;
        const age = dob ? calculateAge(dob.toDate()) : null;
        
        return age ? (
          <Box display="flex" alignItems="center">
            <CakeIcon color="secondary" sx={{ mr: 1, fontSize: 18 }} />
            <MDTypography variant="caption">
              {age}
            </MDTypography>
          </Box>
        ) : (
          <MDTypography variant="caption" color="text.secondary">
            —
          </MDTypography>
        );
      }
    },
    {
      field: 'gender',
      headerName: t('clients.gender'),
      width: 120,
      renderCell: (params) => {
        const gender = params.row.clientProfile?.gender;
        const genderName = GENDER_TYPES[gender] || 'Unknown';
        
        return (
          <Chip 
            label={genderName}
            size="small"
            color="info"
            variant="outlined"
          />
        );
      }
    },
    {
      field: 'emergencyContact',
      headerName: t('clients.emergencyContact'),
      width: 180,
      renderCell: (params) => {
        const emergency = params.row.clientProfile?.emergencyContact;
        
        return emergency?.name ? (
          <MDTypography variant="caption">
            {emergency.name}
          </MDTypography>
        ) : (
          <MDTypography variant="caption" color="text.secondary">
            —
          </MDTypography>
        );
      }
    },
    {
      field: 'status',
      headerName: t('clients.status'),
      width: 120,
      renderCell: (params) => {
        const isBlocked = params.row.isBlocked;
        const isActive = !params.row.isDeleted;
        
        if (isBlocked) {
          return <Chip label={t('clients.blocked')} size="small" color="error" />;
        }
        
        return isActive ? (
          <Chip label={t('clients.active')} size="small" color="success" />
        ) : (
          <Chip label={t('clients.inactive')} size="small" color="default" />
        );
      }
    },
    {
      field: 'createdAt',
      headerName: t('clients.joinDate'),
      width: 140,
      renderCell: (params) => {
        const date = params.value?.toDate?.() || params.value;
        return (
          <MDTypography variant="caption">
            {date ? new Date(date).toLocaleDateString() : '—'}
          </MDTypography>
        );
      }
    }
  ];

  // Handle filter changes
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  // Handle row selection/click
  const handleRowClick = useCallback((params) => {
    if (onViewClient) {
      onViewClient(params.row.id);
    }
  }, [onViewClient]);

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert 
            severity="error" 
            action={
              <MDButton size="small" onClick={refetch}>
                <RefreshIcon sx={{ mr: 1 }} />
                {t('common.retry')}
              </MDButton>
            }
          >
            {t('clients.errorLoading')}: {error.message}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <MDBox mb={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h6" fontWeight="medium">
              {t('clients.title')} ({filteredClients.length})
            </MDTypography>
            
            <MDButton
              size="small"
              color="info"
              onClick={refetch}
              startIcon={<RefreshIcon />}
            >
              {t('common.refresh')}
            </MDButton>
          </MDBox>

          {/* Search and Filters */}
          <MDBox display="flex" gap={2} mb={2} flexWrap="wrap">
            {/* Search */}
            <TextField
              placeholder={t('clients.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />

            {/* Gender Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>{t('clients.gender')}</InputLabel>
              <Select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                label={t('clients.gender')}
              >
                <MenuItem value="all">{t('common.all')}</MenuItem>
                {Object.entries(GENDER_TYPES).map(([code, name]) => (
                  <MenuItem key={code} value={code}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Age Range Filter */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>{t('clients.ageRange')}</InputLabel>
              <Select
                value={filters.ageRange}
                onChange={(e) => handleFilterChange('ageRange', e.target.value)}
                label={t('clients.ageRange')}
              >
                <MenuItem value="all">{t('common.all')}</MenuItem>
                <MenuItem value="14-17">14-17</MenuItem>
                <MenuItem value="18-24">18-24</MenuItem>
                <MenuItem value="25-34">25-34</MenuItem>
                <MenuItem value="35-44">35-44</MenuItem>
                <MenuItem value="45-54">45-54</MenuItem>
                <MenuItem value="55-64">55-64</MenuItem>
                <MenuItem value="65+">65+</MenuItem>
              </Select>
            </FormControl>
          </MDBox>
        </MDBox>

        {/* Data Grid */}
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredClients}
            columns={columns}
            loading={isLoading}
            pageSize={25}
            rowsPerPageOptions={[10, 25, 50, 100]}
            onRowClick={handleRowClick}
            disableSelectionOnClick
            autoHeight={false}
            components={{
              LoadingOverlay: () => (
                <Box 
                  display="flex" 
                  justifyContent="center" 
                  alignItems="center" 
                  height="100%"
                >
                  <CircularProgress />
                </Box>
              ),
              NoRowsOverlay: () => (
                <Box 
                  display="flex" 
                  flexDirection="column"
                  justifyContent="center" 
                  alignItems="center" 
                  height="100%"
                >
                  <PersonIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                  <MDTypography variant="h6" color="text.secondary">
                    {debouncedSearch || Object.values(filters).some(f => f !== 'all') 
                      ? t('clients.noResults')
                      : t('clients.noClients')
                    }
                  </MDTypography>
                </Box>
              )
            }}
            sx={{
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid',
                borderColor: 'divider'
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default FirebaseClientsDataGrid;