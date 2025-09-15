/**
 * LoadingState Component - Beautiful loading states for data fetching
 * Used while Parse Server operations are in progress
 */

import React from 'react';
import { Box, CircularProgress, Skeleton, useTheme, alpha } from '@mui/material';
import { 
  Psychology as PsychologyIcon,
  AccountCircle as AccountCircleIcon,
  EventNote as EventNoteIcon,
  Dashboard as DashboardIcon,
  CloudDownload as CloudDownloadIcon
} from '@mui/icons-material';

import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';

const LoadingState = ({ 
  type = 'default',
  size = 'medium',
  showText = true,
  text,
  variant = 'spinner', // 'spinner', 'skeleton', 'pulse'
  rows = 5,
  ...props 
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Loading configurations for different data types
  const loadingConfigs = {
    'clients': {
      icon: AccountCircleIcon,
      text: 'Loading clients...',
      subtext: 'Fetching client profiles from database',
      gradient: ['#6a11cb', '#2575fc']
    },
    'professionals': {
      icon: PsychologyIcon,
      text: 'Loading professionals...',
      subtext: 'Retrieving professional profiles',
      gradient: ['#667eea', '#764ba2']
    },
    'appointments': {
      icon: EventNoteIcon,
      text: 'Loading appointments...',
      subtext: 'Gathering appointment data',
      gradient: ['#f093fb', '#f5576c']
    },
    'dashboard': {
      icon: DashboardIcon,
      text: 'Loading dashboard...',
      subtext: 'Calculating statistics and metrics',
      gradient: ['#a8edea', '#fed6e3']
    },
    'default': {
      icon: CloudDownloadIcon,
      text: 'Loading...',
      subtext: 'Please wait while we fetch your data',
      gradient: ['#667eea', '#764ba2']
    }
  };

  const config = loadingConfigs[type] || loadingConfigs['default'];
  const IconComponent = config.icon;

  // Size configurations
  const sizeConfigs = {
    small: {
      iconSize: 32,
      progressSize: 40,
      titleVariant: 'body1',
      subtextVariant: 'caption',
      spacing: 2,
      skeletonHeight: 40
    },
    medium: {
      iconSize: 48,
      progressSize: 56,
      titleVariant: 'h6',
      subtextVariant: 'body2',
      spacing: 3,
      skeletonHeight: 48
    },
    large: {
      iconSize: 64,
      progressSize: 72,
      titleVariant: 'h5',
      subtextVariant: 'body1',
      spacing: 4,
      skeletonHeight: 56
    }
  };

  const sizeConfig = sizeConfigs[size];

  // Spinner Variant
  if (variant === 'spinner') {
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
          minHeight: size === 'large' ? 300 : size === 'medium' ? 200 : 150,
          ...props.sx
        }}
        {...props}
      >
        {/* Animated Icon Container */}
        <MDBox
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb={sizeConfig.spacing}
        >
          {/* Background Circle with Animation */}
          <Box
            sx={{
              position: 'absolute',
              width: sizeConfig.progressSize + 16,
              height: sizeConfig.progressSize + 16,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${config.gradient[0]}, ${config.gradient[1]})`,
              opacity: 0.1,
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', opacity: 0.1 },
                '50%': { transform: 'scale(1.1)', opacity: 0.2 },
                '100%': { transform: 'scale(1)', opacity: 0.1 }
              }
            }}
          />
          
          {/* Spinning Progress Ring */}
          <CircularProgress
            size={sizeConfig.progressSize}
            thickness={3}
            sx={{
              color: config.gradient[0],
              position: 'absolute',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
                strokeDasharray: '80px, 200px',
                strokeDashoffset: '0px',
                animation: 'rotate 2s linear infinite',
                '@keyframes rotate': {
                  '0%': { strokeDasharray: '1px, 200px', strokeDashoffset: '0px' },
                  '50%': { strokeDasharray: '100px, 200px', strokeDashoffset: '-15px' },
                  '100%': { strokeDasharray: '100px, 200px', strokeDashoffset: '-125px' }
                }
              }
            }}
          />
          
          {/* Center Icon */}
          <IconComponent
            sx={{
              fontSize: sizeConfig.iconSize,
              color: config.gradient[0],
              zIndex: 2,
              animation: 'iconFloat 3s ease-in-out infinite',
              '@keyframes iconFloat': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-4px)' }
              }
            }}
          />
        </MDBox>

        {/* Loading Text */}
        {showText && (
          <>
            <MDTypography
              variant={sizeConfig.titleVariant}
              fontWeight="medium"
              color={isDarkMode ? 'white' : 'dark'}
              mb={0.5}
              sx={{
                background: `linear-gradient(135deg, ${config.gradient[0]}, ${config.gradient[1]})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {text || config.text}
            </MDTypography>
            
            <MDTypography
              variant={sizeConfig.subtextVariant}
              color="text"
              sx={{ opacity: 0.6 }}
            >
              {config.subtext}
            </MDTypography>
          </>
        )}
      </MDBox>
    );
  }

  // Skeleton Variant
  if (variant === 'skeleton') {
    return (
      <MDBox p={3} {...props}>
        {Array.from({ length: rows }).map((_, index) => (
          <MDBox key={index} mb={2} display="flex" alignItems="center">
            <Skeleton
              variant="circular"
              width={sizeConfig.skeletonHeight}
              height={sizeConfig.skeletonHeight}
              sx={{
                mr: 2,
                background: isDarkMode 
                  ? alpha(config.gradient[0], 0.1)
                  : alpha(config.gradient[0], 0.05)
              }}
            />
            <MDBox flex={1}>
              <Skeleton
                variant="rectangular"
                height={sizeConfig.skeletonHeight * 0.4}
                sx={{
                  mb: 1,
                  background: isDarkMode 
                    ? alpha(config.gradient[0], 0.1)
                    : alpha(config.gradient[0], 0.05)
                }}
              />
              <Skeleton
                variant="rectangular"
                height={sizeConfig.skeletonHeight * 0.3}
                width="60%"
                sx={{
                  background: isDarkMode 
                    ? alpha(config.gradient[0], 0.05)
                    : alpha(config.gradient[0], 0.03)
                }}
              />
            </MDBox>
          </MDBox>
        ))}
      </MDBox>
    );
  }

  // Pulse Variant
  if (variant === 'pulse') {
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
          minHeight: size === 'large' ? 300 : size === 'medium' ? 200 : 150,
          ...props.sx
        }}
        {...props}
      >
        {/* Pulsing Dots */}
        <MDBox
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={1}
          mb={sizeConfig.spacing}
        >
          {[0, 1, 2].map((index) => (
            <Box
              key={index}
              sx={{
                width: size === 'small' ? 8 : size === 'medium' ? 12 : 16,
                height: size === 'small' ? 8 : size === 'medium' ? 12 : 16,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${config.gradient[0]}, ${config.gradient[1]})`,
                animation: `pulse-dot 1.4s ease-in-out infinite both`,
                animationDelay: `${index * 0.16}s`,
                '@keyframes pulse-dot': {
                  '0%, 80%, 100%': {
                    transform: 'scale(0)',
                    opacity: 0.5
                  },
                  '40%': {
                    transform: 'scale(1)',
                    opacity: 1
                  }
                }
              }}
            />
          ))}
        </MDBox>

        {/* Loading Text */}
        {showText && (
          <MDTypography
            variant={sizeConfig.titleVariant}
            color={isDarkMode ? 'white' : 'dark'}
            sx={{
              background: `linear-gradient(135deg, ${config.gradient[0]}, ${config.gradient[1]})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {text || config.text}
          </MDTypography>
        )}
      </MDBox>
    );
  }

  return null;
};

export default LoadingState; 