/**
 * TableToolbar - Reusable toolbar component for TanStack Table
 * Provides search, filtering, and action controls
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

// @mui material components
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';

// @mui icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

function TableToolbar({
  // Search props
  searchValue = '',
  onSearchChange = () => {},
  searchPlaceholder = 'Search...',
  enableSearch = true,
  
  // Filter props
  filters = {},
  onFilterChange = () => {},
  availableFilters = [],
  enableFilters = true,
  
  // Action props
  onRefresh = () => {},
  onExport = null,
  onColumnsToggle = null,
  customActions = [],
  
  // Selection props
  selectedRowsCount = 0,
  onBulkAction = () => {},
  bulkActions = [],
  
  // Style props
  title = '',
  subtitle = '',
  dense = false,
  sx = {},
}) {
  const { t } = useTranslation();
  
  const [filterMenuAnchor, setFilterMenuAnchor] = React.useState(null);
  const [columnMenuAnchor, setColumnMenuAnchor] = React.useState(null);
  
  const hasActiveFilters = Object.values(filters).some(
    value => value !== '' && value !== 'all' && value !== null && value !== undefined
  );

  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleColumnMenuOpen = (event) => {
    setColumnMenuAnchor(event.currentTarget);
  };

  const handleColumnMenuClose = () => {
    setColumnMenuAnchor(null);
  };

  const handleFilterSelect = (filterKey, value) => {
    onFilterChange({
      ...filters,
      [filterKey]: value
    });
  };

  const handleClearFilters = () => {
    const clearedFilters = {};
    Object.keys(filters).forEach(key => {
      clearedFilters[key] = '';
    });
    onFilterChange(clearedFilters);
    onSearchChange('');
  };

  const renderFilterChips = () => {
    const activeFilters = [];
    
    // Add search as a chip if active
    if (searchValue.trim()) {
      activeFilters.push({
        key: 'search',
        label: `Search: "${searchValue}"`,
        onDelete: () => onSearchChange('')
      });
    }
    
    // Add filter values as chips
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        const filter = availableFilters.find(f => f.key === key);
        const displayValue = filter?.options?.find(opt => opt.value === value)?.label || value;
        
        activeFilters.push({
          key,
          label: `${filter?.label || key}: ${displayValue}`,
          onDelete: () => handleFilterSelect(key, '')
        });
      }
    });

    if (activeFilters.length === 0) return null;

    return (
      <MDBox display="flex" flexWrap="wrap" gap={1} mb={1}>
        {activeFilters.map(({ key, label, onDelete }) => (
          <Chip
            key={key}
            label={label}
            size="small"
            onDelete={onDelete}
            color="primary"
            variant="outlined"
          />
        ))}
        <Chip
          label={t('common.clearAll')}
          size="small"
          onClick={handleClearFilters}
          color="secondary"
          variant="outlined"
          icon={<ClearIcon />}
        />
      </MDBox>
    );
  };

  return (
    <MDBox sx={sx}>
      {/* Title and Subtitle */}
      {(title || subtitle) && (
        <MDBox mb={2}>
          {title && (
            <MDTypography variant="h6" fontWeight="medium">
              {title}
            </MDTypography>
          )}
          {subtitle && (
            <MDTypography variant="body2" color="text" fontWeight="regular">
              {subtitle}
            </MDTypography>
          )}
        </MDBox>
      )}

      {/* Filter Chips */}
      {renderFilterChips()}

      {/* Main Toolbar */}
      <Toolbar
        variant={dense ? 'dense' : 'regular'}
        sx={{
          px: { sm: 0 },
          minHeight: dense ? '48px' : '64px',
          '& .MuiToolbar-root': {
            paddingLeft: 0,
            paddingRight: 0,
          },
        }}
      >
        <MDBox
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          gap={2}
        >
          {/* Left Section - Search and Selection Info */}
          <MDBox display="flex" alignItems="center" flex={1} gap={2}>
            {/* Search Field */}
            {enableSearch && (
              <TextField
                size="small"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchValue && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => onSearchChange('')}
                        edge="end"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250, maxWidth: 400 }}
              />
            )}

            {/* Selection Info */}
            {selectedRowsCount > 0 && (
              <MDTypography variant="body2" color="primary">
                {selectedRowsCount} {selectedRowsCount === 1 ? 'row' : 'rows'} selected
              </MDTypography>
            )}
          </MDBox>

          {/* Right Section - Actions */}
          <MDBox display="flex" alignItems="center" gap={1}>
            {/* Bulk Actions */}
            {selectedRowsCount > 0 && bulkActions.length > 0 && (
              <MDBox display="flex" gap={1}>
                {bulkActions.map((action, index) => (
                  <Tooltip key={index} title={action.tooltip || action.label}>
                    <MDButton
                      variant="outlined"
                      color={action.color || 'secondary'}
                      size="small"
                      startIcon={action.icon}
                      onClick={() => onBulkAction(action.key)}
                    >
                      {action.label}
                    </MDButton>
                  </Tooltip>
                ))}
              </MDBox>
            )}

            {/* Custom Actions */}
            {customActions.map((action, index) => (
              <Tooltip key={index} title={action.tooltip || action.label}>
                <IconButton
                  size="small"
                  onClick={action.onClick}
                  color={action.color || 'default'}
                >
                  {action.icon}
                </IconButton>
              </Tooltip>
            ))}

            {/* Filter Button */}
            {enableFilters && availableFilters.length > 0 && (
              <Tooltip title={t('common.filters')}>
                <IconButton 
                  size="small" 
                  onClick={handleFilterMenuOpen}
                  color={hasActiveFilters ? 'primary' : 'default'}
                >
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* Column Toggle Button */}
            {onColumnsToggle && (
              <Tooltip title={t('common.toggleColumns')}>
                <IconButton size="small" onClick={handleColumnMenuOpen}>
                  <ViewColumnIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* Export Button */}
            {onExport && (
              <Tooltip title={t('common.export')}>
                <IconButton size="small" onClick={onExport}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* Refresh Button */}
            <Tooltip title={t('common.refresh')}>
              <IconButton size="small" onClick={onRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </MDBox>
        </MDBox>
      </Toolbar>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleFilterMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {availableFilters.map((filter) => (
          <MenuItem key={filter.key} disableRipple>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>{filter.label}</InputLabel>
              <Select
                value={filters[filter.key] || ''}
                label={filter.label}
                onChange={(e) => handleFilterSelect(filter.key, e.target.value)}
              >
                <MenuItem value="">
                  <em>{t('common.all')}</em>
                </MenuItem>
                {filter.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </MenuItem>
        ))}
      </Menu>

      {/* Column Toggle Menu */}
      {onColumnsToggle && (
        <Menu
          anchorEl={columnMenuAnchor}
          open={Boolean(columnMenuAnchor)}
          onClose={handleColumnMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => onColumnsToggle()}>
            {t('common.toggleColumns')}
          </MenuItem>
        </Menu>
      )}
    </MDBox>
  );
}

export default TableToolbar;