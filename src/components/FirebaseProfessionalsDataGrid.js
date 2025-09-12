/**
 * Firebase Professionals Data Grid
 * 
 * Replaces Parse-based professionals data grid with Firebase/Firestore integration
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
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedIcon from '@mui/icons-material/Verified';
import RefreshIcon from '@mui/icons-material/Refresh';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

// Firebase hooks
import { 
  useFirebaseProfessionalsSubscription,
  useProfessionalFormHelpers,
  PROFESSIONAL_TYPES,
  GENDER_TYPES,
  MEETING_TYPES
} from '../hooks/useFirebaseProfessionals';

const FirebaseProfessionalsDataGrid = ({ 
  onViewProfessional,
  onEditProfessional,
  userType = 1 
}) => {
  const { t } = useTranslation();
  const { formatProfessionalDisplay, formatPhoneNumber } = useProfessionalFormHelpers();
  
  // Filter states
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    profType: 'all',
    gender: 'all', 
    meetType: 'all'
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
    professionals, 
    isLoading, 
    error, 
    refetch 
  } = useFirebaseProfessionalsSubscription({
    limit: 100,
    orderBy: 'createdAt',
    orderDirection: 'desc'
  });

  // Filter professionals based on search and filters
  const filteredProfessionals = useMemo(() => {
    if (!professionals) return [];
    
    return professionals.filter(prof => {
      const profile = prof.professionalProfile;
      
      // Search filter
      if (debouncedSearch) {
        const searchTerm = debouncedSearch.toLowerCase();
        const searchableText = [
          prof.email,
          prof.displayName,
          profile?.firstName,
          profile?.lastName,
          profile?.businessName
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }
      
      // Professional type filter
      if (filters.profType !== 'all' && profile?.profType !== parseInt(filters.profType)) {
        return false;
      }
      
      // Gender filter
      if (filters.gender !== 'all' && profile?.gender !== parseInt(filters.gender)) {
        return false;
      }
      
      // Meeting type filter
      if (filters.meetType !== 'all' && profile?.meetType !== parseInt(filters.meetType)) {
        return false;
      }
      
      return true;
    });
  }, [professionals, debouncedSearch, filters]);

  // DataGrid columns definition
  const columns = [
    {
      field: 'displayName',
      headerName: t('professionals.name'),
      width: 200,
      renderCell: (params) => {
        const profile = params.row.professionalProfile;
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
      headerName: t('professionals.email'),
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
      field: 'professionalType',
      headerName: t('professionals.type'),
      width: 180,
      renderCell: (params) => {
        const profType = params.row.professionalProfile?.profType;
        const typeName = PROFESSIONAL_TYPES[profType] || 'Unknown';
        
        return (
          <Chip 
            label={typeName}
            size="small"
            color="primary"
            variant="outlined"
          />
        );
      }
    },
    {
      field: 'businessName',
      headerName: t('professionals.business'),
      width: 180,
      renderCell: (params) => {
        const businessName = params.row.professionalProfile?.businessName;
        
        return businessName ? (
          <Box display="flex" alignItems="center">
            <BusinessIcon color="success" sx={{ mr: 1, fontSize: 18 }} />
            <MDTypography variant="caption">
              {businessName}
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
      field: 'phoneNb',
      headerName: t('professionals.phone'),
      width: 150,
      renderCell: (params) => {
        const phone = params.row.professionalProfile?.phoneNb;
        
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
      field: 'gender',
      headerName: t('professionals.gender'),
      width: 120,
      renderCell: (params) => {
        const gender = params.row.professionalProfile?.gender;
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
      field: 'meetType',
      headerName: t('professionals.meetType'),
      width: 160,
      renderCell: (params) => {
        const meetType = params.row.professionalProfile?.meetType;
        const meetTypeName = MEETING_TYPES[meetType] || 'Unknown';
        
        return (
          <Chip 
            label={meetTypeName}
            size="small"
            color="secondary"
            variant="outlined"
          />
        );
      }
    },
    {
      field: 'isVerified',
      headerName: t('professionals.verified'),
      width: 120,
      renderCell: (params) => {
        const isVerified = params.row.professionalProfile?.isVerified;
        
        return isVerified ? (
          <Tooltip title={t('professionals.verified')}>
            <VerifiedIcon color="success" />
          </Tooltip>
        ) : (
          <Tooltip title={t('professionals.notVerified')}>
            <PersonIcon color="disabled" />
          </Tooltip>
        );
      }
    },
    {
      field: 'createdAt',
      headerName: t('professionals.joinDate'),
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
    if (onViewProfessional) {
      onViewProfessional(params.row.id);
    }
  }, [onViewProfessional]);

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
            {t('professionals.errorLoading')}: {error.message}
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
              {t('professionals.title')} ({filteredProfessionals.length})
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
              placeholder={t('professionals.searchPlaceholder')}
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

            {/* Professional Type Filter */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>{t('professionals.type')}</InputLabel>
              <Select
                value={filters.profType}
                onChange={(e) => handleFilterChange('profType', e.target.value)}
                label={t('professionals.type')}
              >
                <MenuItem value="all">{t('common.all')}</MenuItem>
                {Object.entries(PROFESSIONAL_TYPES).map(([code, name]) => (
                  <MenuItem key={code} value={code}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Gender Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>{t('professionals.gender')}</InputLabel>
              <Select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                label={t('professionals.gender')}
              >
                <MenuItem value="all">{t('common.all')}</MenuItem>
                {Object.entries(GENDER_TYPES).map(([code, name]) => (
                  <MenuItem key={code} value={code}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Meeting Type Filter */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>{t('professionals.meetType')}</InputLabel>
              <Select
                value={filters.meetType}
                onChange={(e) => handleFilterChange('meetType', e.target.value)}
                label={t('professionals.meetType')}
              >
                <MenuItem value="all">{t('common.all')}</MenuItem>
                {Object.entries(MEETING_TYPES).map(([code, name]) => (
                  <MenuItem key={code} value={code}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </MDBox>
        </MDBox>

        {/* Data Grid */}
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredProfessionals}
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
                      ? t('professionals.noResults')
                      : t('professionals.noProfessionals')
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

export default FirebaseProfessionalsDataGrid;