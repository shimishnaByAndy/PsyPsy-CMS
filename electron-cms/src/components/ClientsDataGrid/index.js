/**
 * ClientsDataGrid - TanStack Table component for displaying client data
 * Updated to use TanStack Table with TanStack Query for modern table functionality
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import TanStackTable from 'components/TanStackTable';
import TableToolbar from 'components/TanStackTable/TableToolbar';
import { useClientsTableData } from 'hooks/useTableData';
import { useUpdateClientStatus } from 'hooks/mutations/useClientMutations';
import { createCommonColumns, createFilterOptions, TABLE_PRESETS } from 'utils/tableHelpers';

// @mui icons
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';

// Export functionality
import { ExportButton } from 'components/Export';
import { getTemplatesByType } from 'utils/exportTemplates';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

function ClientsDataGrid({ 
  onViewClient, 
  searchTerm = '', 
  filters = {},
  height = '100%' 
}) {
  const { t } = useTranslation();

  // Use table data hook with initial filters
  const tableData = useClientsTableData({
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

  // Status update mutation
  const updateClientStatusMutation = useUpdateClientStatus();

  // Handle client status change with optimistic updates
  const handleStatusChange = (clientId, newStatus) => {
    updateClientStatusMutation.mutate({
      clientId,
      status: newStatus,
      reason: `Status changed to ${newStatus} via CMS`
    });
  };

  // Gender mapping with translations
  const genderMap = useMemo(() => ({
    1: t("statistics.distributions.gender.woman"),
    2: t("statistics.distributions.gender.man"),
    3: t("statistics.distributions.gender.other"),
    4: t("statistics.distributions.gender.notDisclosed"),
  }), [t]);

  // Create columns using reusable column helpers
  const commonColumns = useMemo(() => createCommonColumns(t), [t]);
  
  // Define columns for clients table
  const columns = useMemo(() => [
    commonColumns.nameWithEmail('name', 'email'),
    commonColumns.age('clientPtr.dob'),
    commonColumns.gender('clientPtr.gender', genderMap),
    commonColumns.phone('clientPtr.phoneNb'),
    commonColumns.location('clientPtr.addressObj'),
    commonColumns.languages('clientPtr.spokenLangArr'),
    commonColumns.lastSeen('updatedAt'),
    commonColumns.status('status', handleStatusChange),
    commonColumns.actions(onViewClient, null, null, true),
  ], [commonColumns, genderMap, onViewClient]);

  // Filter options
  const filterOptions = useMemo(() => createFilterOptions(t), [t]);
  
  // Available filters for toolbar
  const availableFilters = useMemo(() => [
    {
      key: 'status',
      label: t('tables.filters.status'),
      options: filterOptions.status,
    },
    {
      key: 'gender',
      label: t('tables.filters.gender'),
      options: filterOptions.gender,
    },
  ], [filterOptions, t]);

  // Export templates for clients
  const exportTemplates = useMemo(() => getTemplatesByType('clients'), []);

  // Handle export completion
  const handleExportComplete = (result) => {
    console.log('Client export completed:', result);
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
        title={t('tables.titles.clients')}
        subtitle={`${totalRowCount} ${t('tables.subtitles.totalClients')}`}
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        searchPlaceholder={t('tables.search.clients')}
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
        pageSizeOptions={TABLE_PRESETS.clients.pageSizeOptions}
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
        stickyHeader={TABLE_PRESETS.clients.stickyHeader}
        
        // Empty/error state
        emptyStateType="clients"
        emptyStateSize="medium"
        onRefresh={refetch}
      />
    </MDBox>
  );
}

export default ClientsDataGrid; 