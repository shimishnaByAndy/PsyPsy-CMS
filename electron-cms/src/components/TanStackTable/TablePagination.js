/**
 * TablePagination - Enhanced pagination component for TanStack Table
 * Provides flexible pagination with page size controls and navigation
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

// @mui material components
import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

// @mui icons
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

function TablePaginationActions({ 
  count, 
  page, 
  rowsPerPage, 
  onPageChange,
  showFirstLastButtons = true,
}) {
  const { t } = useTranslation();

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <MDBox sx={{ flexShrink: 0, ml: 2.5 }}>
      {showFirstLastButtons && (
        <Tooltip title={t('common.firstPage')}>
          <IconButton
            onClick={handleFirstPageButtonClick}
            disabled={page === 0}
            size="small"
          >
            <FirstPageIcon />
          </IconButton>
        </Tooltip>
      )}
      
      <Tooltip title={t('common.previousPage')}>
        <IconButton
          onClick={handleBackButtonClick}
          disabled={page === 0}
          size="small"
        >
          <KeyboardArrowLeft />
        </IconButton>
      </Tooltip>
      
      <Tooltip title={t('common.nextPage')}>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          size="small"
        >
          <KeyboardArrowRight />
        </IconButton>
      </Tooltip>
      
      {showFirstLastButtons && (
        <Tooltip title={t('common.lastPage')}>
          <IconButton
            onClick={handleLastPageButtonClick}
            disabled={page >= Math.ceil(count / rowsPerPage) - 1}
            size="small"
          >
            <LastPageIcon />
          </IconButton>
        </Tooltip>
      )}
    </MDBox>
  );
}

function CustomTablePagination({
  table,
  totalRowCount = 0,
  manualPagination = false,
  pageSizeOptions = [5, 10, 25, 50, 100],
  showFirstLastButtons = true,
  showRowsPerPageOptions = true,
  showJumpToPage = false,
  compact = false,
  labelRowsPerPage = null,
  labelDisplayedRows = null,
  onPaginationChange = () => {},
  sx = {},
}) {
  const { t } = useTranslation();
  
  const [jumpToPageValue, setJumpToPageValue] = React.useState('');
  
  // Get pagination state from table
  const pagination = table.getState().pagination;
  const pageIndex = pagination.pageIndex;
  const pageSize = pagination.pageSize;
  
  // Calculate row counts
  const totalRows = manualPagination ? totalRowCount : table.getFilteredRowModel().rows.length;
  const totalPages = Math.ceil(totalRows / pageSize);
  
  // Handle page change
  const handlePageChange = (event, newPage) => {
    if (manualPagination) {
      onPaginationChange({ pageIndex: newPage, pageSize });
    } else {
      table.setPageIndex(newPage);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (event) => {
    const newPageSize = parseInt(event.target.value, 10);
    if (manualPagination) {
      onPaginationChange({ pageIndex: 0, pageSize: newPageSize });
    } else {
      table.setPageSize(newPageSize);
      table.setPageIndex(0);
    }
  };

  // Handle jump to page
  const handleJumpToPage = () => {
    const pageNumber = parseInt(jumpToPageValue, 10);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      const newPageIndex = pageNumber - 1;
      handlePageChange(null, newPageIndex);
      setJumpToPageValue('');
    }
  };

  // Custom label for displayed rows
  const defaultLabelDisplayedRows = ({ from, to, count }) => {
    return `${from}–${to} ${t('common.of')} ${count !== -1 ? count : `${t('common.moreThan')} ${to}`}`;
  };

  // Custom label for rows per page
  const defaultLabelRowsPerPage = t('tables.pagination.rowsPerPage');

  if (compact) {
    return (
      <MDBox
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          ...sx,
        }}
      >
        {/* Page Info */}
        <MDTypography variant="body2" color="text">
          {(labelDisplayedRows || defaultLabelDisplayedRows)({
            from: pageIndex * pageSize + 1,
            to: Math.min((pageIndex + 1) * pageSize, totalRows),
            count: totalRows,
          })}
        </MDTypography>

        {/* Navigation Actions */}
        <TablePaginationActions
          count={totalRows}
          page={pageIndex}
          rowsPerPage={pageSize}
          onPageChange={handlePageChange}
          showFirstLastButtons={showFirstLastButtons}
        />
      </MDBox>
    );
  }

  return (
    <MDBox sx={sx}>
      <TablePagination
        component="div"
        count={totalRows}
        page={pageIndex}
        rowsPerPage={pageSize}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handlePageSizeChange}
        rowsPerPageOptions={showRowsPerPageOptions ? pageSizeOptions : []}
        labelRowsPerPage={labelRowsPerPage || defaultLabelRowsPerPage}
        labelDisplayedRows={labelDisplayedRows || defaultLabelDisplayedRows}
        showFirstButton={showFirstLastButtons}
        showLastButton={showFirstLastButtons}
        ActionsComponent={(props) => (
          <TablePaginationActions {...props} showFirstLastButtons={showFirstLastButtons} />
        )}
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          '& .MuiTablePagination-toolbar': {
            minHeight: 52,
          },
          '& .MuiTablePagination-selectLabel': {
            mb: 0,
          },
          '& .MuiTablePagination-displayedRows': {
            mb: 0,
          },
        }}
      />

      {/* Jump to Page */}
      {showJumpToPage && (
        <MDBox
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 2,
            py: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <MDTypography variant="body2">
            {t('tables.pagination.jumpToPage')}:
          </MDTypography>
          
          <FormControl size="small" sx={{ minWidth: 80 }}>
            <Select
              value={jumpToPageValue}
              onChange={(e) => setJumpToPageValue(e.target.value)}
              displayEmpty
              inputProps={{ 'aria-label': t('tables.pagination.pageNumber') }}
            >
              <MenuItem value="">
                <em>{t('common.select')}</em>
              </MenuItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <MenuItem key={pageNum} value={pageNum}>
                  {pageNum}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <MDButton
            size="small"
            variant="outlined"
            onClick={handleJumpToPage}
            disabled={!jumpToPageValue || jumpToPageValue < 1 || jumpToPageValue > totalPages}
          >
            {t('common.go')}
          </MDButton>
          
          <MDTypography variant="body2" color="text">
            {t('tables.pagination.totalPages', { total: totalPages })}
          </MDTypography>
        </MDBox>
      )}
    </MDBox>
  );
}

export default CustomTablePagination;