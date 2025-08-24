/**
 * Table utilities and column definition helpers for TanStack Table
 * Provides reusable column definitions and formatting functions
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

// @mui material components
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';

// @mui icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";

/**
 * Format Canadian phone numbers
 */
export const formatCanadianPhoneNumber = (phoneNumber) => {
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

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dob) => {
  if (!dob) return 'N/A';
  const dobDate = new Date(dob);
  if (dobDate instanceof Date && !isNaN(dobDate)) {
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    
    return age;
  }
  return 'N/A';
};

/**
 * Format date for display
 */
export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return dateObj.toLocaleDateString(undefined, defaultOptions);
};

/**
 * Format last seen date with color coding
 */
export const formatLastSeen = (lastSeenDate, t) => {
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

/**
 * Common column definitions
 */
export const createCommonColumns = (t) => ({
  // User name column with email
  nameWithEmail: (accessorKey = 'name', emailKey = 'email') => ({
    accessorKey,
    header: t("tables.columns.name"),
    size: 250,
    cell: ({ row }) => {
      const firstName = row.original.clientPtr?.firstName || row.original.firstName || 'N/A';
      const lastName = row.original.clientPtr?.lastName || row.original.lastName || '';
      const email = row.original[emailKey] || 'N/A';
      
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
  }),

  // Avatar with name
  avatarWithName: (accessorKey = 'name', avatarKey = 'avatar') => ({
    accessorKey,
    header: t("tables.columns.name"),
    size: 200,
    cell: ({ row }) => {
      const firstName = row.original.clientPtr?.firstName || row.original.firstName || 'N/A';
      const lastName = row.original.clientPtr?.lastName || row.original.lastName || '';
      const avatar = row.original[avatarKey];
      
      return (
        <MDBox display="flex" alignItems="center" py={1}>
          <MDAvatar 
            src={avatar} 
            alt={`${firstName} ${lastName}`}
            size="sm"
            sx={{ mr: 2 }}
          >
            {!avatar && `${firstName[0] || ''}${lastName[0] || ''}`}
          </MDAvatar>
          <MDBox>
            <MDTypography variant="button" fontWeight="medium">
              {firstName} {lastName}
            </MDTypography>
          </MDBox>
        </MDBox>
      );
    },
  }),

  // Age column
  age: (accessorKey = 'dob') => ({
    accessorKey,
    header: t("tables.columns.age"),
    size: 80,
    cell: ({ getValue }) => {
      const age = calculateAge(getValue());
      return (
        <MDTypography variant="caption" fontWeight="medium">
          {age}
        </MDTypography>
      );
    },
  }),

  // Gender column with chips
  gender: (accessorKey = 'gender', genderMap = {}) => ({
    accessorKey,
    header: t("tables.columns.gender"),
    size: 120,
    cell: ({ getValue }) => {
      const gender = getValue();
      const genderLabel = gender !== undefined && genderMap[gender] 
                         ? genderMap[gender] 
                         : "Unknown";
      return (
        <Chip 
          label={genderLabel} 
          size="small" 
          variant="outlined"
          color={gender ? 'primary' : 'default'}
        />
      );
    },
  }),

  // Phone number column
  phone: (accessorKey = 'phoneNb') => ({
    accessorKey,
    header: t("tables.columns.phone"),
    size: 160,
    cell: ({ getValue }) => {
      const formattedPhone = formatCanadianPhoneNumber(getValue());
      return (
        <MDBox display="flex" alignItems="center">
          <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <MDTypography variant="caption" fontWeight="medium">
            {formattedPhone}
          </MDTypography>
        </MDBox>
      );
    },
  }),

  // Location column
  location: (accessorKey = 'addressObj') => ({
    accessorKey,
    header: t("tables.columns.location"),
    size: 150,
    cell: ({ getValue }) => {
      const address = getValue();
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
  }),

  // Languages column with chips
  languages: (accessorKey = 'spokenLangArr') => ({
    accessorKey,
    header: t("tables.columns.languages"),
    size: 150,
    cell: ({ getValue }) => {
      const languages = getValue() || [];
      
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
  }),

  // Last seen column with color coding
  lastSeen: (accessorKey = 'updatedAt') => ({
    accessorKey,
    header: t("tables.columns.lastSeen"),
    size: 130,
    cell: ({ getValue, row }) => {
      const lastSeenDate = getValue() || row.original.createdAt;
      const { text, color } = formatLastSeen(lastSeenDate, t);
      
      return (
        <Chip 
          label={text}
          size="small"
          color={color}
          variant="filled"
        />
      );
    },
  }),

  // Status column with interactive chips
  status: (accessorKey = 'status', onStatusChange) => ({
    accessorKey,
    header: t("tables.columns.status"),
    size: 120,
    cell: ({ row }) => {
      const isBlocked = row.original.isBlocked;
      const isVerified = row.original.emailVerified || row.original.isVerified;
      const clientId = row.original.objectId || row.original.id;
      
      const getStatusColor = () => {
        if (isBlocked) return 'error';
        if (isVerified) return 'success';
        return 'warning';
      };
      
      const getStatusLabel = () => {
        if (isBlocked) return 'Blocked';
        if (isVerified) return 'Active';
        return 'Pending';
      };

      const getStatusIcon = () => {
        if (isBlocked) return <CancelIcon fontSize="small" />;
        if (isVerified) return <CheckCircleIcon fontSize="small" />;
        return <PendingIcon fontSize="small" />;
      };

      return (
        <Chip 
          label={getStatusLabel()} 
          size="small" 
          color={getStatusColor()}
          icon={getStatusIcon()}
          onClick={onStatusChange ? () => {
            const newStatus = isBlocked ? 'active' : 'blocked';
            onStatusChange(clientId, newStatus);
          } : undefined}
          sx={{ cursor: onStatusChange ? 'pointer' : 'default' }}
        />
      );
    },
  }),

  // Date column
  date: (accessorKey, headerKey = "tables.columns.date", options = {}) => ({
    accessorKey,
    header: t(headerKey),
    size: 120,
    cell: ({ getValue }) => (
      <MDTypography variant="caption" fontWeight="medium">
        {formatDate(getValue(), options)}
      </MDTypography>
    ),
  }),

  // Actions column
  actions: (onView, onEdit, onDelete, onEmail) => ({
    id: 'actions',
    header: t("tables.columns.actions"),
    size: 120,
    cell: ({ row }) => (
      <MDBox display="flex" alignItems="center" gap={0.5}>
        {onView && (
          <Tooltip title={t("tables.actions.view")}>
            <IconButton 
              size="small"
              onClick={() => onView(row.original.objectId || row.original.id)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        
        {onEdit && (
          <Tooltip title={t("tables.actions.edit")}>
            <IconButton 
              size="small"
              onClick={() => onEdit(row.original.objectId || row.original.id)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        
        {onEmail && (
          <Tooltip title={t("tables.actions.email")}>
            <IconButton 
              size="small"
              onClick={() => window.open(`mailto:${row.original.email}`)}
            >
              <EmailIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        
        {onDelete && (
          <Tooltip title={t("tables.actions.delete")}>
            <IconButton 
              size="small"
              color="error"
              onClick={() => onDelete(row.original.objectId || row.original.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </MDBox>
    ),
  }),
});

/**
 * Create filter options for dropdowns
 */
export const createFilterOptions = (t) => ({
  status: [
    { value: 'active', label: t('common.active') },
    { value: 'pending', label: t('common.pending') },
    { value: 'blocked', label: t('common.blocked') },
  ],
  gender: [
    { value: '1', label: t("statistics.distributions.gender.woman") },
    { value: '2', label: t("statistics.distributions.gender.man") },
    { value: '3', label: t("statistics.distributions.gender.other") },
    { value: '4', label: t("statistics.distributions.gender.notDisclosed") },
  ],
  verification: [
    { value: 'verified', label: t('common.verified') },
    { value: 'pending', label: t('common.pending') },
    { value: 'rejected', label: t('common.rejected') },
  ],
});

/**
 * Create bulk actions for selected rows
 */
export const createBulkActions = (t) => ({
  delete: {
    key: 'delete',
    label: t('tables.actions.deleteSelected'),
    color: 'error',
    icon: <DeleteIcon />,
    tooltip: t('tables.actions.deleteSelectedTooltip'),
  },
  activate: {
    key: 'activate',
    label: t('tables.actions.activateSelected'),
    color: 'success',
    icon: <CheckCircleIcon />,
    tooltip: t('tables.actions.activateSelectedTooltip'),
  },
  block: {
    key: 'block',
    label: t('tables.actions.blockSelected'),
    color: 'error',
    icon: <CancelIcon />,
    tooltip: t('tables.actions.blockSelectedTooltip'),
  },
});

/**
 * Table configuration presets
 */
export const TABLE_PRESETS = {
  clients: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    enableSorting: true,
    enableGlobalFilter: true,
    enableRowSelection: false,
    stickyHeader: true,
    dense: false,
  },
  professionals: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    enableSorting: true,
    enableGlobalFilter: true,
    enableRowSelection: false,
    stickyHeader: true,
    dense: false,
  },
  appointments: {
    defaultPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
    enableSorting: true,
    enableGlobalFilter: true,
    enableRowSelection: true,
    stickyHeader: true,
    dense: true,
  },
  strings: {
    defaultPageSize: 50,
    pageSizeOptions: [25, 50, 100, 200],
    enableSorting: true,
    enableGlobalFilter: true,
    enableRowSelection: true,
    stickyHeader: true,
    dense: true,
  },
};

export default {
  formatCanadianPhoneNumber,
  calculateAge,
  formatDate,
  formatLastSeen,
  createCommonColumns,
  createFilterOptions,
  createBulkActions,
  TABLE_PRESETS,
};