/**
 * ProfessionalsDataGrid Component
 * 
 * A comprehensive data grid for displaying and managing professional data using MUI-X DataGrid.
 * Features server-side pagination, sorting, filtering, and professional-specific actions.
 * Based on ClassStructDocs Professional schema.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Box, 
  Chip, 
  Avatar, 
  IconButton, 
  Tooltip,
  Typography,
  Stack
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';

// Import the professional service
import { ProfessionalService } from '../../services/professionalService';

const ProfessionalsDataGrid = ({ 
  searchTerm = '', 
  filters = {}, 
  onViewProfessional,
  height = 600 
}) => {
  const [loading, setLoading] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState([
    { field: 'createdAt', sort: 'desc' }
  ]);

  // Define columns for the DataGrid
  const columns = [
    {
      field: 'name',
      headerName: 'Professional',
      width: 250,
      sortable: true,
      renderCell: (params) => {
        const prof = params.row.professionalPtr;
        const fullName = `Dr. ${prof.firstName} ${prof.lastName}`;
        const initials = `${prof.firstName.charAt(0)}${prof.lastName.charAt(0)}`;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
              {initials}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {params.row.email}
              </Typography>
            </Box>
          </Box>
        );
      }
    },
    {
      field: 'profType',
      headerName: 'Profession',
      width: 200,
      sortable: true,
      renderCell: (params) => {
        const prof = params.row.professionalPtr;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="body2">
              {prof.profTypeName}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'businessName',
      headerName: 'Business',
      width: 220,
      sortable: true,
      renderCell: (params) => {
        const prof = params.row.professionalPtr;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
            <Typography variant="body2" noWrap>
              {prof.businessName}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'age',
      headerName: 'Age',
      width: 80,
      sortable: false,
      renderCell: (params) => {
        const age = ProfessionalService.calculateAge(params.row.professionalPtr.dob);
        return (
          <Typography variant="body2">
            {age || 'N/A'}
          </Typography>
        );
      }
    },
    {
      field: 'gender',
      headerName: 'Gender',
      width: 100,
      sortable: false,
      renderCell: (params) => {
        const genderName = ProfessionalService.getGenderName(params.row.professionalPtr.gender);
        const genderColors = {
          'Woman': 'secondary',
          'Man': 'primary',
          'Other': 'info',
          'Not disclosed': 'default'
        };
        
        return (
          <Chip 
            label={genderName} 
            size="small" 
            color={genderColors[genderName] || 'default'}
            variant="outlined"
          />
        );
      }
    },
    {
      field: 'meetType',
      headerName: 'Consultation',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const meetTypeName = params.row.professionalPtr.meetTypeName;
        const meetTypeColors = {
          'In-person only': 'success',
          'Online only': 'info',
          'Both in-person and online': 'primary'
        };
        
        return (
          <Chip 
            label={meetTypeName} 
            size="small" 
            color={meetTypeColors[meetTypeName] || 'default'}
            variant="filled"
          />
        );
      }
    },
    {
      field: 'languages',
      headerName: 'Languages',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const languages = params.row.professionalPtr.offeredLangArr;
        return (
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {languages.slice(0, 2).map((lang, index) => (
              <Chip 
                key={index}
                label={lang} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
            ))}
            {languages.length > 2 && (
              <Chip 
                label={`+${languages.length - 2}`} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
            )}
          </Stack>
        );
      }
    },
    {
      field: 'expertises',
      headerName: 'Specializations',
      width: 180,
      sortable: false,
      renderCell: (params) => {
        const expertises = params.row.professionalPtr.expertises;
        return (
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {expertises.slice(0, 2).map((expertise, index) => (
              <Chip 
                key={index}
                label={expertise} 
                size="small" 
                color="primary"
                variant="outlined"
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
            ))}
            {expertises.length > 2 && (
              <Chip 
                label={`+${expertises.length - 2}`} 
                size="small" 
                color="primary"
                variant="outlined"
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
            )}
          </Stack>
        );
      }
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const address = params.row.professionalPtr.addressObj;
        return (
          <Typography variant="body2" noWrap>
            {address.city}, {address.province}
          </Typography>
        );
      }
    },
    {
      field: 'phone',
      headerName: 'Contact',
      width: 140,
      sortable: false,
      renderCell: (params) => {
        const prof = params.row.professionalPtr;
        const phoneNumber = prof.phoneNb?.number || prof.bussPhoneNb;
        const formattedPhone = ProfessionalService.formatPhoneNumber(phoneNumber);
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="body2" noWrap>
              {formattedPhone}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      sortable: false,
      renderCell: (params) => {
        const isBlocked = params.row.isBlocked;
        const isVerified = params.row.emailVerified;
        
        let status = 'Active';
        let color = 'success';
        
        if (isBlocked) {
          status = 'Blocked';
          color = 'error';
        } else if (!isVerified) {
          status = 'Pending';
          color = 'warning';
        }
        
        return (
          <Chip 
            label={status} 
            size="small" 
            color={color}
            variant="filled"
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => {
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="View Details">
              <IconButton 
                size="small" 
                onClick={() => onViewProfessional && onViewProfessional(params.row.id)}
                sx={{ color: 'primary.main' }}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Send Email">
              <IconButton 
                size="small"
                onClick={() => window.open(`mailto:${params.row.email}`, '_blank')}
                sx={{ color: 'secondary.main' }}
              >
                <EmailIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      }
    }
  ];

  // Fetch professionals data
  const fetchProfessionals = useCallback(async () => {
    setLoading(true);
    try {
      const sortBy = sortModel.length > 0 ? sortModel[0].field : 'createdAt';
      const sortDirection = sortModel.length > 0 ? sortModel[0].sort : 'desc';
      
      const response = await ProfessionalService.getProfessionals({
        page: paginationModel.page,
        limit: paginationModel.pageSize,
        search: searchTerm,
        sortBy,
        sortDirection,
        filters
      });

      setProfessionals(response.results || []);
      setTotalCount(response.total || 0);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      setProfessionals([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, sortModel, searchTerm, filters]);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  // Handle pagination change
  const handlePaginationModelChange = (newModel) => {
    setPaginationModel(newModel);
  };

  // Handle sort change
  const handleSortModelChange = (newModel) => {
    setSortModel(newModel);
  };

  return (
    <Box sx={{ height, width: '100%' }}>
      <DataGrid
        rows={professionals}
        columns={columns}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        pageSizeOptions={[5, 10, 25, 50]}
        rowCount={totalCount}
        paginationMode="server"
        sortingMode="server"
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            borderBottom: '2px solid rgba(224, 224, 224, 0.8)',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '2px solid rgba(224, 224, 224, 0.8)',
          }
        }}
      />
    </Box>
  );
};

export default ProfessionalsDataGrid; 