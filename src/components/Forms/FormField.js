/**
 * Form Field Component
 * Provides a standardized field wrapper with validation
 */

import React, { useState, forwardRef } from 'react';
import PropTypes from 'prop-types';
import MDBox from 'components/MDBox';
import MDInput from 'components/MDInput';
import MDTypography from 'components/MDTypography';
import { 
  FormControl, 
  FormControlLabel, 
  Checkbox, 
  Select, 
  MenuItem,
  InputLabel,
  FormHelperText,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const FormField = forwardRef(({
  type = 'text',
  name,
  label,
  value,
  onChange,
  onBlur,
  onKeyDown,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  options = [],
  multiline = false,
  rows = 1,
  placeholder,
  autoFocus = false,
  tabIndex,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const fieldValue = type === 'checkbox' ? event.target.checked : event.target.value;
    onChange(event, fieldValue);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleKeyDown = (event) => {
    // Handle custom keyboard shortcuts
    if (onKeyDown) {
      onKeyDown(event);
    }
    
    // Toggle password visibility with Alt+P
    if (type === 'password' && event.altKey && event.key === 'p') {
      event.preventDefault();
      handleTogglePasswordVisibility();
    }
  };

  // Generate unique IDs for accessibility
  const fieldId = `${name}-field`;
  const errorId = error && helperText ? `${name}-error` : undefined;
  const helperId = helperText && !error ? `${name}-helper` : undefined;

  const renderField = () => {
    switch (type) {
      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                id={fieldId}
                checked={Boolean(value)}
                onChange={handleChange}
                onBlur={onBlur}
                onKeyDown={handleKeyDown}
                name={name}
                disabled={disabled}
                color="info"
                autoFocus={autoFocus}
                tabIndex={tabIndex}
                inputProps={{
                  'aria-describedby': errorId || helperId,
                  'aria-required': required,
                }}
              />
            }
            label={label}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth={fullWidth} error={error} disabled={disabled}>
            <InputLabel id={`${name}-label`} required={required}>{label}</InputLabel>
            <Select
              labelId={`${name}-label`}
              id={fieldId}
              name={name}
              value={value || ''}
              label={label}
              onChange={handleChange}
              onBlur={onBlur}
              onKeyDown={handleKeyDown}
              autoFocus={autoFocus}
              tabIndex={tabIndex}
              inputProps={{
                'aria-describedby': errorId || helperId,
                'aria-required': required,
              }}
              {...props}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {helperText && (
              <FormHelperText id={errorId || helperId}>{helperText}</FormHelperText>
            )}
          </FormControl>
        );

      case 'textarea':
        return (
          <TextField
            fullWidth={fullWidth}
            multiline
            rows={rows}
            id={fieldId}
            name={name}
            label={label}
            value={value || ''}
            onChange={handleChange}
            onBlur={onBlur}
            onKeyDown={handleKeyDown}
            error={error}
            helperText={helperText}
            disabled={disabled}
            placeholder={placeholder}
            required={required}
            autoFocus={autoFocus}
            inputProps={{
              tabIndex,
              'aria-describedby': errorId || helperId,
              'aria-required': required,
            }}
            {...props}
          />
        );

      case 'password':
        return (
          <MDInput
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            id={fieldId}
            name={name}
            label={label}
            value={value || ''}
            onChange={handleChange}
            onBlur={onBlur}
            onKeyDown={handleKeyDown}
            error={error}
            helperText={helperText}
            disabled={disabled}
            fullWidth={fullWidth}
            placeholder={placeholder}
            required={required}
            autoFocus={autoFocus}
            inputProps={{
              tabIndex,
              'aria-describedby': errorId || helperId,
              'aria-required': required,
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    title={`${showPassword ? "Hide" : "Show"} password (Alt+P)`}
                    onClick={handleTogglePasswordVisibility}
                    onMouseDown={(event) => event.preventDefault()}
                    edge="end"
                    size="small"
                    tabIndex={-1}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'info.main',
                      },
                    }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            {...props}
          />
        );

      default:
        return (
          <MDInput
            ref={ref}
            type={type}
            id={fieldId}
            name={name}
            label={label}
            value={value || ''}
            onChange={handleChange}
            onBlur={onBlur}
            onKeyDown={handleKeyDown}
            error={error}
            helperText={helperText}
            disabled={disabled}
            fullWidth={fullWidth}
            placeholder={placeholder}
            required={required}
            autoFocus={autoFocus}
            inputProps={{
              tabIndex,
              'aria-describedby': errorId || helperId,
              'aria-required': required,
            }}
            {...props}
          />
        );
    }
  };

  return (
    <MDBox mb={2}>
      {renderField()}
      {error && helperText && type !== 'select' && type !== 'textarea' && (
        <MDBox mt={0.5}>
          <MDTypography 
            id={errorId}
            variant="caption" 
            color="error"
            role="alert"
            aria-live="polite"
          >
            {helperText}
          </MDTypography>
        </MDBox>
      )}
    </MDBox>
  );
});

FormField.displayName = 'FormField';

FormField.propTypes = {
  type: PropTypes.oneOf(['text', 'password', 'email', 'number', 'tel', 'url', 'textarea', 'select', 'checkbox']),
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  onKeyDown: PropTypes.func,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
  })),
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  tabIndex: PropTypes.number,
};

export default FormField;