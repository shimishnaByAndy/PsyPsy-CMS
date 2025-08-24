/**
 * Form Field Component
 * Provides a standardized field wrapper with validation
 */

import React from 'react';
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
  TextField
} from '@mui/material';

const FormField = ({
  type = 'text',
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  options = [],
  multiline = false,
  rows = 1,
  placeholder,
  ...props
}) => {
  const handleChange = (event) => {
    const fieldValue = type === 'checkbox' ? event.target.checked : event.target.value;
    onChange(event, fieldValue);
  };

  const renderField = () => {
    switch (type) {
      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(value)}
                onChange={handleChange}
                onBlur={onBlur}
                name={name}
                disabled={disabled}
                color="info"
              />
            }
            label={label}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth={fullWidth} error={error} disabled={disabled}>
            <InputLabel id={`${name}-label`}>{label}</InputLabel>
            <Select
              labelId={`${name}-label`}
              id={name}
              name={name}
              value={value || ''}
              label={label}
              onChange={handleChange}
              onBlur={onBlur}
              {...props}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {helperText && (
              <FormHelperText>{helperText}</FormHelperText>
            )}
          </FormControl>
        );

      case 'textarea':
        return (
          <TextField
            fullWidth={fullWidth}
            multiline
            rows={rows}
            id={name}
            name={name}
            label={label}
            value={value || ''}
            onChange={handleChange}
            onBlur={onBlur}
            error={error}
            helperText={helperText}
            disabled={disabled}
            placeholder={placeholder}
            required={required}
            {...props}
          />
        );

      default:
        return (
          <MDInput
            type={type}
            name={name}
            label={label}
            value={value || ''}
            onChange={handleChange}
            onBlur={onBlur}
            error={error}
            helperText={helperText}
            disabled={disabled}
            fullWidth={fullWidth}
            placeholder={placeholder}
            required={required}
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
          <MDTypography variant="caption" color="error">
            {helperText}
          </MDTypography>
        </MDBox>
      )}
    </MDBox>
  );
};

FormField.propTypes = {
  type: PropTypes.oneOf(['text', 'password', 'email', 'number', 'tel', 'url', 'textarea', 'select', 'checkbox']),
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
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
};

export default FormField;