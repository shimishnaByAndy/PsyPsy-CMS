/**
 * TableHeader - Advanced header component for TanStack Table
 * Handles sorting, resizing, and column interactions
 */

import React from 'react';
import { flexRender } from '@tanstack/react-table';

// @mui material components
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// @mui icons
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FilterListIcon from '@mui/icons-material/FilterList';
import PinLeftIcon from '@mui/icons-material/PinLeft';
import PinRightIcon from '@mui/icons-material/PinRight';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function TableHeader({ 
  table, 
  enableSorting = true,
  enableColumnResizing = false,
  enableRowSelection = false,
  enableColumnActions = true,
  stickyHeader = true,
  onColumnHide = () => {},
  onColumnPin = () => {},
  onColumnFilter = () => {},
}) {
  const [columnMenuAnchor, setColumnMenuAnchor] = React.useState(null);
  const [selectedColumnId, setSelectedColumnId] = React.useState(null);

  const handleColumnMenuOpen = (event, columnId) => {
    event.stopPropagation();
    setColumnMenuAnchor(event.currentTarget);
    setSelectedColumnId(columnId);
  };

  const handleColumnMenuClose = () => {
    setColumnMenuAnchor(null);
    setSelectedColumnId(null);
  };

  const handleColumnAction = (action) => {
    const column = table.getColumn(selectedColumnId);
    
    switch (action) {
      case 'hide':
        column.toggleVisibility(false);
        onColumnHide(selectedColumnId);
        break;
      case 'pin-left':
        column.pin('left');
        onColumnPin(selectedColumnId, 'left');
        break;
      case 'pin-right':
        column.pin('right');
        onColumnPin(selectedColumnId, 'right');
        break;
      case 'unpin':
        column.pin(false);
        onColumnPin(selectedColumnId, false);
        break;
      case 'filter':
        onColumnFilter(selectedColumnId);
        break;
      default:
        break;
    }
    
    handleColumnMenuClose();
  };

  const renderSortIcon = (column) => {
    if (!enableSorting || !column.getCanSort()) return null;
    
    const sortDirection = column.getIsSorted();
    const iconProps = { fontSize: "small", sx: { ml: 0.5 } };
    
    if (sortDirection === 'asc') {
      return <ArrowUpwardIcon {...iconProps} color="primary" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDownwardIcon {...iconProps} color="primary" />;
    }
    return (
      <UnfoldMoreIcon 
        {...iconProps} 
        sx={{ 
          ...iconProps.sx, 
          opacity: 0.3, 
          '&:hover': { opacity: 0.7 }
        }} 
      />
    );
  };

  const renderResizeHandle = (header) => {
    if (!enableColumnResizing || !header.column.getCanResize()) return null;
    
    return (
      <MDBox
        onMouseDown={header.getResizeHandler()}
        onTouchStart={header.getResizeHandler()}
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          height: '100%',
          width: 4,
          cursor: 'col-resize',
          userSelect: 'none',
          touchAction: 'none',
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'primary.main',
          },
        }}
        className={`resizer ${
          header.column.getIsResizing() ? 'isResizing' : ''
        }`}
      />
    );
  };

  const getColumnMenu = () => {
    const column = table.getColumn(selectedColumnId);
    if (!column) return [];

    const menuItems = [];
    
    // Hide column
    if (column.getCanHide()) {
      menuItems.push({
        key: 'hide',
        label: 'Hide Column',
        icon: <VisibilityOffIcon />,
      });
    }
    
    // Pin column
    if (column.getCanPin()) {
      const pinState = column.getIsPinned();
      
      if (!pinState || pinState === 'right') {
        menuItems.push({
          key: 'pin-left',
          label: 'Pin Left',
          icon: <PinLeftIcon />,
        });
      }
      
      if (!pinState || pinState === 'left') {
        menuItems.push({
          key: 'pin-right',
          label: 'Pin Right',
          icon: <PinRightIcon />,
        });
      }
      
      if (pinState) {
        menuItems.push({
          key: 'unpin',
          label: 'Unpin',
          icon: <PinLeftIcon sx={{ transform: 'rotate(180deg)' }} />,
        });
      }
    }
    
    // Filter column
    if (column.getCanFilter()) {
      menuItems.push({
        key: 'filter',
        label: 'Filter Column',
        icon: <FilterListIcon />,
      });
    }
    
    return menuItems;
  };

  return (
    <>
      <TableHead sx={{ position: stickyHeader ? 'sticky' : 'static', top: 0, zIndex: 10 }}>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {/* Row Selection Header */}
            {enableRowSelection && (
              <TableCell
                padding="checkbox"
                sx={{
                  backgroundColor: 'grey.100',
                  borderBottom: '2px solid',
                  borderColor: 'grey.300',
                }}
              >
                <Checkbox
                  indeterminate={table.getIsSomeRowsSelected()}
                  checked={table.getIsAllRowsSelected()}
                  onChange={table.getToggleAllRowsSelectedHandler()}
                  size="small"
                />
              </TableCell>
            )}

            {/* Column Headers */}
            {headerGroup.headers.map((header) => {
              const column = header.column;
              const canSort = enableSorting && column.getCanSort();
              const isPinned = column.getIsPinned();
              
              return (
                <TableCell
                  key={header.id}
                  align="left"
                  style={{
                    width: header.getSize(),
                    minWidth: header.column.columnDef.minSize || 100,
                    maxWidth: header.column.columnDef.maxSize,
                    position: isPinned ? 'sticky' : 'relative',
                    left: isPinned === 'left' ? `${header.column.getStart('left')}px` : undefined,
                    right: isPinned === 'right' ? `${header.column.getAfter('right')}px` : undefined,
                    zIndex: isPinned ? 11 : 1,
                  }}
                  sx={{
                    backgroundColor: isPinned ? 'grey.200' : 'grey.100',
                    borderBottom: '2px solid',
                    borderColor: 'grey.300',
                    cursor: canSort ? 'pointer' : 'default',
                    userSelect: 'none',
                    position: 'relative',
                    '&:hover': {
                      backgroundColor: canSort ? 'grey.200' : isPinned ? 'grey.200' : 'grey.100',
                    },
                  }}
                  onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                >
                  <MDBox
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                  >
                    {/* Header Content */}
                    <MDBox display="flex" alignItems="center" flex={1}>
                      <MDTypography variant="button" fontWeight="bold" color="text">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </MDTypography>
                      {renderSortIcon(column)}
                    </MDBox>

                    {/* Column Actions */}
                    {enableColumnActions && !header.isPlaceholder && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleColumnMenuOpen(e, header.column.id)}
                        sx={{ 
                          ml: 0.5,
                          opacity: 0.6,
                          '&:hover': { opacity: 1 }
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    )}
                  </MDBox>

                  {/* Resize Handle */}
                  {renderResizeHandle(header)}

                  {/* Column Filter Indicator */}
                  {column.getIsFiltered() && (
                    <MDBox
                      sx={{
                        position: 'absolute',
                        bottom: 2,
                        right: 2,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                      }}
                    />
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableHead>

      {/* Column Menu */}
      <Menu
        anchorEl={columnMenuAnchor}
        open={Boolean(columnMenuAnchor)}
        onClose={handleColumnMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {getColumnMenu().map((item) => (
          <MenuItem
            key={item.key}
            onClick={() => handleColumnAction(item.key)}
            sx={{ minWidth: 160 }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default TableHeader;