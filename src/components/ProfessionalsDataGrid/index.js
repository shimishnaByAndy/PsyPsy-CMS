/**
 * ProfessionalsDataGrid Component
 * 
 * A comprehensive data grid for displaying and managing professional data using TanStack Table.
 * Features server-side pagination, sorting, filtering, and professional-specific actions.
 * Based on ClassStructDocs Professional schema.
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import TanStackTable from 'components/TanStackTable';
import TableToolbar from 'components/TanStackTable/TableToolbar';
import { useProfessionalsTableData } from 'hooks/useTableData';
import { createCommonColumns, createFilterOptions, TABLE_PRESETS } from 'utils/tableHelpers';

// @mui material components
import { 
  Chip, 
  Avatar, 
  IconButton, 
  Tooltip,
  Typography,
  Stack,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Psychology as PsychologyIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

// Export functionality
import { ExportButton } from 'components/Export';
import { getTemplatesByType } from 'utils/exportTemplates';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const ProfessionalsDataGrid = ({ 
  searchTerm = '', 
  filters = {}, 
  onViewProfessional,
  height = '100%' 
}) => {
  const { t } = useTranslation();

  // Use table data hook with initial filters
  const tableData = useProfessionalsTableData({
    ...filters,
    search: searchTerm,
  });

  const {
    rows,
    totalRowCount,
    isLoading,
    isFetching,
    error,
    pagination,
    sorting,
    globalFilter,
    setPagination,
    setSorting,
    setGlobalFilter,
    setFilters,
    refetch,
    manualPagination,
    manualSorting,
    manualFiltering,
  } = tableData;

  // Create custom columns for professionals
  const commonColumns = useMemo(() => createCommonColumns(t), [t]);
  
  // Define columns for professionals table
  const columns = useMemo(() => [
    // Professional name with avatar
    {
      accessorKey: 'name',
      header: t('tables.columns.professional'),
      size: 250,
      cell: ({ row }) => {
        const prof = row.original.professionalPtr || {};
        const fullName = `Dr. ${prof.firstName || 'N/A'} ${prof.lastName || ''}`;
        const initials = `${(prof.firstName || '').charAt(0)}${(prof.lastName || '').charAt(0)}`;
        
        return (
          <MDBox display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
              {initials}
            </Avatar>
            <MDBox>
              <MDTypography variant="button" fontWeight="medium">
                {fullName}
              </MDTypography>
              <MDTypography variant="caption" color="text" fontWeight="regular">
                {row.original.email}
              </MDTypography>
            </MDBox>
          </MDBox>
        );
      },
    },
    
    // Profession type
    {
      accessorKey: 'professionalPtr.profTypeName',
      header: t('tables.columns.profession'),
      size: 200,
      cell: ({ getValue }) => (
        <MDBox display="flex" alignItems="center" gap={1}>
          <PsychologyIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          <MDTypography variant="caption" fontWeight="medium">
            {getValue() || 'N/A'}
          </MDTypography>
        </MDBox>
      ),
    },
    
    // Business name
    {
      accessorKey: 'professionalPtr.businessName',
      header: t('tables.columns.business'),
      size: 220,
      cell: ({ getValue }) => (
        <MDBox display="flex" alignItems="center" gap={1}>
          <BusinessIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
          <MDTypography variant="caption" fontWeight="medium" noWrap>
            {getValue() || 'N/A'}
          </MDTypography>
        </MDBox>
      ),
    },
    
    // Age
    commonColumns.age('professionalPtr.dob'),
    
    // Gender
    {
      accessorKey: 'professionalPtr.gender',
      header: t('tables.columns.gender'),
      size: 100,
      cell: ({ getValue }) => {
        const gender = getValue();
        const genderMap = {
          1: t("statistics.distributions.gender.woman"),
          2: t("statistics.distributions.gender.man"),
          3: t("statistics.distributions.gender.other"),
          4: t("statistics.distributions.gender.notDisclosed"),
        };
        const genderLabel = gender && genderMap[gender] ? genderMap[gender] : "Unknown";
        const genderColors = {
          [t("statistics.distributions.gender.woman")]: 'secondary',
          [t("statistics.distributions.gender.man")]: 'primary',
          [t("statistics.distributions.gender.other")]: 'info',
          [t("statistics.distributions.gender.notDisclosed")]: 'default'
        };
        
        return (
          <Chip 
            label={genderLabel} 
            size="small" 
            color={genderColors[genderLabel] || 'default'}
            variant="outlined"
          />
        );
      },
    },
    
    // Consultation type
    {
      accessorKey: 'professionalPtr.meetTypeName',
      header: t('tables.columns.consultationType'),
      size: 150,
      cell: ({ getValue }) => {
        const meetTypeName = getValue() || 'N/A';
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
      },
    },
    
    // Languages
    {
      accessorKey: 'professionalPtr.offeredLangArr',
      header: t('tables.columns.languages'),
      size: 150,
      cell: ({ getValue }) => {
        const languages = getValue() || [];
        
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
      },
    },
    
    // Specializations
    {
      accessorKey: 'professionalPtr.expertises',
      header: t('tables.columns.specializations'),
      size: 180,
      cell: ({ getValue }) => {
        const expertises = getValue() || [];
        
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
      },
    },
    
    // Location
    commonColumns.location('professionalPtr.addressObj'),
    
    // Phone
    commonColumns.phone('professionalPtr.phoneNb'),
    
    // Status
    commonColumns.status('status'),
    
    // Actions
    commonColumns.actions(onViewProfessional, null, null, true),
  ], [commonColumns, onViewProfessional, t]);

  // Filter options
  const filterOptions = useMemo(() => createFilterOptions(t), [t]);
  
  // Available filters for toolbar
  const availableFilters = useMemo(() => [
    {
      key: 'status',
      label: t('tables.filters.status'),
      options: filterOptions.verification,
    },
    {
      key: 'profType',
      label: t('tables.filters.profession'),
      options: [
        { value: 'psychologist', label: t('professions.psychologist') },
        { value: 'psychiatrist', label: t('professions.psychiatrist') },
        { value: 'therapist', label: t('professions.therapist') },
        { value: 'counselor', label: t('professions.counselor') },
      ],
    },
  ], [filterOptions, t]);

  // Export templates for professionals
  const exportTemplates = useMemo(() => getTemplatesByType('professionals'), []);

  // Handle export completion
  const handleExportComplete = (result) => {
    console.log('Professional export completed:', result);
    // Could show success notification here
  };

  // Custom actions for toolbar
  const customActions = useMemo(() => [
    {
      component: (
        <ExportButton
          data={rows}
          templates={exportTemplates}
          onExportComplete={handleExportComplete}
          size="medium"
          variant="outlined"
          defaultPrivacyLevel="basic"
          userRole="admin"
        />
      ),
    },
  ], [rows, exportTemplates, handleExportComplete]);

  return (
    <MDBox>
      <TableToolbar
        title={t('tables.titles.professionals')}
        subtitle={`${totalRowCount} ${t('tables.subtitles.totalProfessionals')}`}
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        searchPlaceholder={t('tables.search.professionals')}
        filters={filters}
        onFilterChange={setFilters}
        availableFilters={availableFilters}
        onRefresh={refetch}
        customActions={customActions}
        enableSearch={true}
        enableFilters={true}
      />
      
      <TanStackTable
        data={rows}
        columns={columns}
        loading={isLoading}
        error={error}
        
        // Pagination
        totalRowCount={totalRowCount}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={setPagination}
        pageSizeOptions={TABLE_PRESETS.professionals.pageSizeOptions}
        manualPagination={manualPagination}
        
        // Sorting
        sorting={sorting}
        onSortingChange={setSorting}
        enableSorting={manualSorting}
        manualSorting={manualSorting}
        
        // Filtering
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        enableGlobalFilter={manualFiltering}
        manualFiltering={manualFiltering}
        
        // Styling
        height={height}
        maxHeight="600px"
        stickyHeader={TABLE_PRESETS.professionals.stickyHeader}
        
        // Empty/error state
        emptyStateType="professionals"
        emptyStateSize="medium"
        onRefresh={refetch}
      />
    </MDBox>
  );
};

export default ProfessionalsDataGrid; 