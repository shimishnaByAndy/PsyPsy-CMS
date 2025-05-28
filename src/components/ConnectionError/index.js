import React from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button, 
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import {
  WifiOff as WifiOffIcon,
  Refresh as RefreshIcon,
  CloudOff as CloudOffIcon,
  SignalWifiOff as SignalWifiOffIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

const ConnectionError = ({ 
  title = "Connection Lost", 
  message = "Unable to connect to the server. Please check your internet connection and try again.",
  onRetry,
  type = "network", // "network", "server", "parse"
  showRetry = true,
  variant = "card" // "card", "inline", "fullscreen"
}) => {
  const theme = useTheme();

  // Icon selection based on error type
  const getIcon = () => {
    switch (type) {
      case "server":
        return CloudOffIcon;
      case "parse":
        return SignalWifiOffIcon;
      case "network":
      default:
        return WifiOffIcon;
    }
  };

  const IconComponent = getIcon();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        delay: 0.2
      }
    },
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "server":
        return theme.palette.warning.main;
      case "parse":
        return theme.palette.error.main;
      case "network":
      default:
        return theme.palette.info.main;
    }
  };

  const getTypeMessage = () => {
    switch (type) {
      case "server":
        return "Server connection failed. The service may be temporarily unavailable.";
      case "parse":
        return "Parse Server connection failed. Unable to connect to the database.";
      case "network":
      default:
        return "Network connection lost. Please check your internet connection.";
    }
  };

  const content = (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Stack 
        spacing={3} 
        alignItems="center" 
        textAlign="center"
        sx={{ 
          py: variant === "fullscreen" ? 8 : 4,
          px: variant === "fullscreen" ? 4 : 3
        }}
      >
        {/* Animated Icon */}
        <motion.div
          variants={iconVariants}
          initial="hidden"
          animate={["visible", "pulse"]}
        >
          <Box
            sx={{
              width: variant === "fullscreen" ? 120 : 80,
              height: variant === "fullscreen" ? 120 : 80,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${alpha(getTypeColor(), 0.1)}, ${alpha(getTypeColor(), 0.2)})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${alpha(getTypeColor(), 0.3)}`,
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `conic-gradient(from 0deg, transparent, ${alpha(getTypeColor(), 0.1)}, transparent)`,
                borderRadius: "50%",
                animation: "spin 3s linear infinite",
              },
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" }
              }
            }}
          >
            <IconComponent 
              sx={{ 
                fontSize: variant === "fullscreen" ? 48 : 32,
                color: getTypeColor(),
                zIndex: 1
              }} 
            />
          </Box>
        </motion.div>

        {/* Title */}
        <MDTypography 
          variant={variant === "fullscreen" ? "h3" : "h5"} 
          fontWeight="bold"
          color="text"
          sx={{ 
            background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${getTypeColor()})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center"
          }}
        >
          {title}
        </MDTypography>

        {/* Message */}
        <MDTypography 
          variant="body1" 
          color="text"
          sx={{ 
            opacity: 0.8,
            maxWidth: variant === "fullscreen" ? 500 : 400,
            lineHeight: 1.6
          }}
        >
          {message || getTypeMessage()}
        </MDTypography>

        {/* Status Indicators */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: theme.palette.error.main,
              animation: "blink 1.5s infinite",
              "@keyframes blink": {
                "0%, 50%": { opacity: 1 },
                "51%, 100%": { opacity: 0.3 }
              }
            }}
          />
          <MDTypography variant="caption" color="text" sx={{ opacity: 0.6 }}>
            Connection Status: Offline
          </MDTypography>
        </Stack>

        {/* Retry Button */}
        {showRetry && onRetry && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MDButton
              variant="gradient"
              color="info"
              onClick={onRetry}
              startIcon={<RefreshIcon />}
              sx={{
                minWidth: 160,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: "medium",
                boxShadow: `0 8px 32px ${alpha(theme.palette.info.main, 0.3)}`,
                "&:hover": {
                  boxShadow: `0 12px 40px ${alpha(theme.palette.info.main, 0.4)}`,
                }
              }}
            >
              Try Again
            </MDButton>
          </motion.div>
        )}

        {/* Additional Help */}
        <MDBox sx={{ mt: 2 }}>
          <MDTypography variant="caption" color="text" sx={{ opacity: 0.5 }}>
            If the problem persists, please contact support
          </MDTypography>
        </MDBox>
      </Stack>
    </motion.div>
  );

  // Render based on variant
  switch (variant) {
    case "fullscreen":
      return (
        <MDBox
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)}, ${alpha(getTypeColor(), 0.05)})`,
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `radial-gradient(circle at 25% 25%, ${alpha(getTypeColor(), 0.1)} 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, ${alpha(getTypeColor(), 0.1)} 0%, transparent 50%)`,
              pointerEvents: "none"
            }
          }}
        >
          <Card
            sx={{
              maxWidth: 600,
              width: "90%",
              borderRadius: 4,
              boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.1)}`,
              border: `1px solid ${alpha(getTypeColor(), 0.1)}`,
              position: "relative",
              zIndex: 1
            }}
          >
            {content}
          </Card>
        </MDBox>
      );

    case "inline":
      return (
        <MDBox sx={{ py: 2 }}>
          {content}
        </MDBox>
      );

    case "card":
    default:
      return (
        <Card
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(getTypeColor(), 0.2)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(getTypeColor(), 0.02)})`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`
          }}
        >
          {content}
        </Card>
      );
  }
};

export default ConnectionError; 