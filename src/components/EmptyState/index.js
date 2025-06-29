/**
 * EmptyState Component - Beautiful empty states for when there's no data
 * Used across DataGrids and dashboard components
 */

import React from 'react';
import { useTheme, alpha } from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Psychology as PsychologyIcon,
  EventNote as EventNoteIcon,
  AccountCircle as AccountCircleIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  LocalHospital as LocalHospitalIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

const EmptyState = ({ 
  type = 'default',
  title,
  description,
  icon: CustomIcon,
  actionLabel,
  onActionClick,
  showRefresh = false,
  onRefresh,
  size = 'medium',
  showIcon = true,
  ...props 
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Predefined empty state configurations
  const emptyStateConfigs = {
    // Data Management
    'clients': {
      icon: AccountCircleIcon,
      title: 'No clients found',
      description: 'There are no clients in the system yet. Clients will appear here once they register for services.',
      actionLabel: 'View All Users',
      gradient: ['#899581', '#a4b695'], // PsyPsy main colors
      showIcon: false, // Hide icon for clients by default
      showOnlyRefresh: true // Only show refresh button
    },
    'professionals': {
      icon: PsychologyIcon,
      title: 'No professionals found',
      description: 'There are no professionals in the system yet. Licensed professionals will appear here once they complete their registration.',
      actionLabel: 'View All Users',
      gradient: ['#5d1c33', '#7d2a47'] // PsyPsy secondary colors
    },
    'appointments': {
      icon: EventNoteIcon,
      title: 'No appointments found',
      description: 'There are no appointments scheduled yet. Appointments will appear here as clients request services.',
      actionLabel: 'Refresh Data',
      gradient: ['#11BA73', '#4dd796'] // PsyPsy success colors
    },
    
    // Search Results
    'search-clients': {
      icon: SearchIcon,
      title: 'No clients match your search',
      description: 'Try adjusting your search terms or filters to find the clients you\'re looking for.',
      actionLabel: 'Clear Filters',
      gradient: ['#899581', '#a4b695'] // PsyPsy main colors
    },
    'search-professionals': {
      icon: SearchIcon,
      title: 'No professionals match your search',
      description: 'Try adjusting your search terms or filters to find the professionals you\'re looking for.',
      actionLabel: 'Clear Filters',
      gradient: ['#5d1c33', '#7d2a47'] // PsyPsy secondary colors
    },
    'search-appointments': {
      icon: SearchIcon,
      title: 'No appointments match your search',
      description: 'Try adjusting your search terms or date range to find the appointments you\'re looking for.',
      actionLabel: 'Clear Filters',
      gradient: ['#11BA73', '#4dd796'] // PsyPsy success colors
    },
    
    // Dashboard States
    'dashboard-stats': {
      icon: DashboardIcon,
      title: 'Dashboard loading',
      description: 'Gathering system statistics and metrics from the database.',
      gradient: ['#899581', '#a4b695'] // PsyPsy main colors
    },
    'recent-activity': {
      icon: TrendingUpIcon,
      title: 'No recent activity',
      description: 'There hasn\'t been any recent activity in the system. Check back later for updates.',
      gradient: ['#5d1c33', '#7d2a47'] // PsyPsy secondary colors
    },
    'upcoming-appointments': {
      icon: ScheduleIcon,
      title: 'No upcoming appointments',
      description: 'There are no appointments scheduled for the near future.',
      gradient: ['#11BA73', '#4dd796'] // PsyPsy success colors
    },
    
    // Error States
    'connection-error': {
      icon: RefreshIcon,
      title: 'Connection issue',
      description: 'Unable to connect to the server. Please check your connection and try again.',
      actionLabel: 'Retry',
      gradient: ['#D00000', '#d93333'] // PsyPsy error colors
    },
    'loading': {
      icon: RefreshIcon,
      title: 'Loading data...',
      description: 'Please wait while we fetch the latest information from the server.',
      gradient: ['#899581', '#a4b695'] // PsyPsy main colors
    },
    
    // System Health
    'system-health': {
      icon: LocalHospitalIcon,
      title: 'System monitoring',
      description: 'Checking system health and performance metrics.',
      gradient: ['#11BA73', '#4dd796'] // PsyPsy success colors
    },
    
    // Filters
    'filtered-results': {
      icon: FilterListIcon,
      title: 'No results with current filters',
      description: 'Try adjusting or removing some filters to see more results.',
      actionLabel: 'Clear All Filters',
      gradient: ['#899581', '#a4b695'] // PsyPsy main colors
    },
    
    // Default
    'default': {
      icon: AssignmentIcon,
      title: 'No data available',
      description: 'There is no data to display at the moment.',
      gradient: ['#899581', '#a4b695'] // PsyPsy main colors
    }
  };

  const config = emptyStateConfigs[type] || emptyStateConfigs['default'];
  const IconComponent = CustomIcon || config.icon;
  const shouldShowIcon = showIcon && (config.showIcon !== false);
  const shouldShowOnlyRefresh = config.showOnlyRefresh || false;
  
  // Size configurations
  const sizeConfigs = {
    small: {
      iconSize: 40,
      titleVariant: 'h6',
      descVariant: 'caption',
      spacing: 2,
      maxWidth: 280
    },
    medium: {
      iconSize: 56,
      titleVariant: 'h5',
      descVariant: 'body2',
      spacing: 3,
      maxWidth: 360
    },
    large: {
      iconSize: 72,
      titleVariant: 'h4',
      descVariant: 'body1',
      spacing: 4,
      maxWidth: 480
    }
  };

  const sizeConfig = sizeConfigs[size];

  return (
    <MDBox
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      py={sizeConfig.spacing * 2}
      px={3}
      sx={{
        minHeight: size === 'large' ? 400 : size === 'medium' ? 300 : 200,
        maxWidth: sizeConfig.maxWidth,
        mx: 'auto',
        width: '100%',
        ...props.sx
      }}
      {...props}
    >
      {/* Icon with gradient background */}
      {shouldShowIcon && (
        <MDBox
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{
            width: sizeConfig.iconSize + 24,
            height: sizeConfig.iconSize + 24,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${config.gradient[0]}, ${config.gradient[1]})`,
            mb: sizeConfig.spacing,
            boxShadow: `0 8px 24px ${alpha(config.gradient[0], 0.3)}`,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 2,
              borderRadius: '50%',
              background: isDarkMode 
                ? 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
                : 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
              zIndex: 1
            }
          }}
        >
          <IconComponent
            sx={{
              fontSize: sizeConfig.iconSize,
              color: 'white',
              position: 'relative',
              zIndex: 2,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }}
          />
        </MDBox>
      )}

      {/* Title */}
      <MDTypography
        variant={sizeConfig.titleVariant}
        fontWeight="bold"
        color={isDarkMode ? 'white' : 'dark'}
        mb={1}
        sx={{
          background: `linear-gradient(135deg, ${config.gradient[0]}, ${config.gradient[1]})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundSize: '200% 200%',
          animation: 'gradient 3s ease infinite',
          '@keyframes gradient': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' }
          }
        }}
      >
        {title || config.title}
      </MDTypography>

      {/* Description */}
      <MDTypography
        variant={sizeConfig.descVariant}
        color="text"
        mb={sizeConfig.spacing}
        sx={{
          opacity: 0.8,
          lineHeight: 1.6,
          maxWidth: '100%'
        }}
      >
        {description || config.description}
      </MDTypography>

      {/* Action Buttons */}
      <MDBox display="flex" gap={2} flexWrap="wrap" justifyContent="center">
        {!shouldShowOnlyRefresh && (actionLabel || config.actionLabel) && onActionClick && (
          <MDButton
            variant="gradient"
            color="info"
            size={size === 'small' ? 'small' : 'medium'}
            onClick={onActionClick}
            sx={{
              background: `linear-gradient(135deg, ${config.gradient[0]}, ${config.gradient[1]})`,
              boxShadow: `0 4px 16px ${alpha(config.gradient[0], 0.3)}`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${alpha(config.gradient[0], 0.4)}`,
              }
            }}
          >
            {actionLabel || config.actionLabel}
          </MDButton>
        )}

        {(showRefresh || shouldShowOnlyRefresh) && onRefresh && (
          <MDButton
            variant="outlined"
            color="secondary"
            size={size === 'small' ? 'small' : 'medium'}
            onClick={onRefresh}
            startIcon={<RefreshIcon />}
            sx={{
              borderColor: alpha(config.gradient[0], 0.3),
              color: config.gradient[0],
              '&:hover': {
                borderColor: config.gradient[0],
                backgroundColor: alpha(config.gradient[0], 0.1),
                transform: 'translateY(-1px)'
              }
            }}
          >
            Refresh
          </MDButton>
        )}
      </MDBox>
    </MDBox>
  );
};

export default EmptyState; 