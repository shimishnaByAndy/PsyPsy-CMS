import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Styled switch to exactly match the design in the image
const StyledSwitch = styled(Switch)(() => ({
  width: 44,
  height: 24,
  padding: 0,
  display: 'flex',
  '&.MuiSwitch-root': {
    overflow: 'visible',
  },
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(20px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#899581', // Gray-green color from the image
        opacity: 1,
        border: 0,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    width: 20,
    height: 20,
    boxShadow: 'none',
    backgroundColor: '#fff',
  },
  '& .MuiSwitch-track': {
    borderRadius: 24 / 2,
    backgroundColor: '#E0E0E0',
    opacity: 1,
    transition: 'background-color 300ms ease',
  },
}));

// Minimal switch component matching the image
const MinimalSwitch = ({ checked, onChange, label, sx, ...props }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx
      }}
    >
      {label && (
        <Typography
          sx={{
            color: '#a8a8a8',
            fontSize: '0.875rem',
            fontWeight: 400,
            marginRight: 1.5,
            letterSpacing: '0.15px',
            cursor: 'pointer',
          }}
          onClick={onChange}
        >
          {label}
        </Typography>
      )}
      <StyledSwitch checked={checked} onChange={onChange} inputProps={{ 'aria-label': label }} {...props} />
    </Box>
  );
};

MinimalSwitch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  label: PropTypes.string,
  sx: PropTypes.object,
};

export default MinimalSwitch; 