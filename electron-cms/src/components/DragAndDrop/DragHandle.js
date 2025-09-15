/**
 * Drag Handle Component
 * Accessible drag handle with Material-UI styling
 */

import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useTranslation } from 'react-i18next';

const DragHandle = ({
  'aria-label': ariaLabel,
  onMouseDown,
  onKeyDown,
  disabled = false,
  size = 'small',
  tooltipTitle,
  color = 'default',
  className,
  style,
  ...props
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const handleMouseDown = (event) => {
    if (disabled) return;
    
    // Prevent text selection during drag
    event.preventDefault();
    onMouseDown?.(event);
  };

  const handleKeyDown = (event) => {
    if (disabled) return;
    
    // Handle keyboard activation
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      onKeyDown?.(event);
    }
  };

  const defaultAriaLabel = ariaLabel || t('accessibility.dragHandle');
  const defaultTooltip = tooltipTitle || t('accessibility.dragHandleTooltip');

  return (
    <Tooltip title={defaultTooltip} placement="top">
      <span>
        <IconButton
          {...props}
          size={size}
          disabled={disabled}
          onMouseDown={handleMouseDown}
          onKeyDown={handleKeyDown}
          aria-label={defaultAriaLabel}
          aria-describedby="drag-instructions"
          className={className}
          style={style}
          sx={{
            cursor: disabled ? 'default' : 'grab',
            color: disabled ? theme.palette.action.disabled : theme.palette.action.active,
            '&:hover': {
              backgroundColor: disabled ? 'transparent' : theme.palette.action.hover,
            },
            '&:active': {
              cursor: disabled ? 'default' : 'grabbing',
            },
            '&:focus': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: '2px',
            },
            padding: theme.spacing(0.5),
            ...props.sx,
          }}
        >
          <DragIndicatorIcon 
            fontSize={size === 'large' ? 'medium' : 'small'}
            sx={{
              opacity: disabled ? 0.3 : 0.7,
              transition: 'opacity 0.2s ease',
            }}
          />
        </IconButton>
      </span>
    </Tooltip>
  );
};

DragHandle.propTypes = {
  'aria-label': PropTypes.string,
  onMouseDown: PropTypes.func,
  onKeyDown: PropTypes.func,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  tooltipTitle: PropTypes.string,
  color: PropTypes.oneOf(['default', 'primary', 'secondary']),
  className: PropTypes.string,
  style: PropTypes.object,
};

export default DragHandle;