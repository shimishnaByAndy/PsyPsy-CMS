/**
 * AppointmentsDataGrid - TanStack Table component for displaying appointment data
 * Uses the Appointment schema from ClassStructDocs with modern table functionality
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import TanStackTable from 'components/TanStackTable';
import TableToolbar from 'components/TanStackTable/TableToolbar';
import { useAppointmentsTableData } from 'hooks/useTableData';
import { createCommonColumns, createFilterOptions, TABLE_PRESETS } from 'utils/tableHelpers';

// @mui material components
import Chip from '@mui/material/Chip';

// @mui icons
import PsychologyIcon from '@mui/icons-material/Psychology';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DownloadIcon from '@mui/icons-material/Download';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function AppointmentsDataGrid({ 
  onViewAppointment, 
  searchTerm = '', 
  filters = {},
  height = 600 
}) {
  const { t } = useTranslation();

  // Use table data hook with initial filters
  const tableData = useAppointmentsTableData({
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
  // Appointment-specific mappings
  const statusMap = useMemo(() => ({
    'requested': { label: t('appointments.status.requested'), color: 'warning' },
    'matched': { label: t('appointments.status.matched'), color: 'info' },
    'confirmed': { label: t('appointments.status.confirmed'), color: 'success' },
    'completed': { label: t('appointments.status.completed'), color: 'primary' },
    'cancelled': { label: t('appointments.status.cancelled'), color: 'error' },
    'no_show': { label: t('appointments.status.noShow'), color: 'error' }
  }), [t]);

  const serviceTypeMap = useMemo(() => ({
    0: t('appointments.services.individual'),
    1: t('appointments.services.group'),
    2: t('appointments.services.couples'),
    3: t('appointments.services.family'),
    4: t('appointments.services.psychological'),
    5: t('appointments.services.neuropsychological'),
    6: t('appointments.services.career'),
    7: t('appointments.services.addiction')
  }), [t]);

  const meetPrefMap = useMemo(() => ({
    0: t('appointments.meetType.inPerson'),
    1: t('appointments.meetType.online'),
    2: t('appointments.meetType.either')
  }), [t]);

  // Helper functions
  const formatDateTime = (timestamp) => {
    if (!timestamp) return t('appointments.notScheduled');
    return new Date(timestamp).toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return t('appointments.notSpecified');
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  // Create columns using reusable helpers and custom appointment columns
  const commonColumns = useMemo(() => createCommonColumns(t), [t]);
  
  const columns = useMemo(() => [
    // Client info
    {
      accessorKey: 'clientName',
      header: t('tables.columns.client'),
      size: 200,
      cell: ({ row }) => {
        const clientName = row.original.clientName || t('appointments.unknownClient');
        const clientEmail = row.original.clientEmail || '';

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
    },
    
    // Title
    {
      accessorKey: 'title',
      header: t('tables.columns.title'),
      size: 200,
      cell: ({ row }) => {
        const title = row.original.title || `${serviceTypeMap[row.original.serviceType]} Request`;
        return (
          <MDTypography variant="caption" fontWeight="medium">
            {title}
          </MDTypography>
        );
      },
    },
    
    // Service type
    {
      accessorKey: 'serviceType',
      header: t('tables.columns.service'),
      size: 150,
      cell: ({ getValue }) => {
        const serviceLabel = serviceTypeMap[getValue()] || t('appointments.unknown');
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
    },
    
    // Status
    {
      accessorKey: 'status',
      header: t('tables.columns.status'),
      size: 120,
      cell: ({ getValue }) => {
        const status = getValue() || 'requested';
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
    },
    
    // Meeting preference
    {
      accessorKey: 'meetPref',
      header: t('tables.columns.meetingType'),
      size: 120,
      cell: ({ getValue }) => {
        const meetPref = meetPrefMap[getValue()] || t('appointments.notSpecified');
        const icons = { 0: '🏢', 1: '💻', 2: '🔄' };
        const icon = icons[getValue()] || '❓';
        
        return (
          <MDBox display="flex" alignItems="center">
            <span style={{ marginRight: 4 }}>{icon}</span>
            <MDTypography variant="caption" fontWeight="medium">
              {meetPref}
            </MDTypography>
          </MDBox>
        );
      },
    },
    
    // Scheduled time
    {
      accessorKey: 'scheduledTimestamp',
      header: t('tables.columns.scheduledTime'),
      size: 160,
      cell: ({ getValue }) => {
        const timestamp = getValue();
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
    },
    
    // Budget
    {
      accessorKey: 'maxBudget',
      header: t('tables.columns.budget'),
      size: 100,
      cell: ({ getValue }) => {
        const budget = formatCurrency(getValue());
        
        return (
          <MDBox display="flex" alignItems="center">
            <AttachMoneyIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <MDTypography variant="caption" fontWeight="medium">
              {budget}
            </MDTypography>
          </MDBox>
        );
      },
    },
    
    // Application count
    {
      accessorKey: 'applicationCount',
      header: t('tables.columns.applications'),
      size: 110,
      cell: ({ getValue }) => {
        const count = getValue() || 0;
        const color = count > 0 ? 'success' : 'warning';
        
        return (
          <Chip 
            label={`${count} ${t('appointments.apps')}`} 
            size="small" 
            color={color}
            variant="outlined"
          />
        );
      },
    },
    
    // Created date
    commonColumns.date('createdAt', 'tables.columns.created'),
    
    // Actions
    commonColumns.actions(onViewAppointment, null, null, false),
  ], [commonColumns, statusMap, serviceTypeMap, meetPrefMap, onViewAppointment, t]);

  // Filter options
  const filterOptions = useMemo(() => createFilterOptions(t), [t]);
  
  // Available filters for toolbar
  const availableFilters = useMemo(() => [
    {
      key: 'status',
      label: t('tables.filters.status'),
      options: Object.keys(statusMap).map(key => ({
        value: key,
        label: statusMap[key].label,
      })),
    },
    {
      key: 'serviceType',
      label: t('tables.filters.serviceType'),
      options: Object.keys(serviceTypeMap).map(key => ({
        value: key,
        label: serviceTypeMap[key],
      })),
    },
    {
      key: 'meetPref',
      label: t('tables.filters.meetingType'),
      options: Object.keys(meetPrefMap).map(key => ({
        value: key,
        label: meetPrefMap[key],
      })),
    },
  ], [statusMap, serviceTypeMap, meetPrefMap, t]);

  // Custom actions for toolbar
  const customActions = useMemo(() => [
    {
      icon: <DownloadIcon />,
      label: 'Export',
      tooltip: 'Export appointments data',
      onClick: () => {
        // Handle export functionality
        console.log('Export appointments data');
      },
    },
  ], []);

  return (
    <MDBox>
      <TableToolbar
        title={t('tables.titles.appointments')}
        subtitle={`${totalRowCount} ${t('tables.subtitles.totalAppointments')}`}
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        searchPlaceholder={t('tables.search.appointments')}
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
        pageSizeOptions={TABLE_PRESETS.appointments.pageSizeOptions}
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
        
        // Selection (enabled for appointments)
        enableRowSelection={TABLE_PRESETS.appointments.enableRowSelection}
        
        // Styling
        height={height}
        maxHeight="600px"
        stickyHeader={TABLE_PRESETS.appointments.stickyHeader}
        
        // Empty/error state
        emptyStateType="appointments"
        emptyStateSize="medium"
        onRefresh={refetch}
      />
    </MDBox>
  );
}

export default AppointmentsDataGrid; 