import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';

// Exact styling to match the image with corrected positioning
const StyledSwitch = styled(Switch)(() => ({
  width: 60,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 3,
    '&.Mui-checked': {
      transform: 'translateX(34px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#899581',
        opacity: 1,
        border: 0,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    width: 20,
    height: 20,
    boxShadow: 'none',
  },
  '& .MuiSwitch-track': {
    borderRadius: 13,
    backgroundColor: '#E9E9EA',
    opacity: 1,
  },
}));

// Custom switch component that wraps the styled switch
const CustomSwitch = (props) => {
  return <StyledSwitch {...props} />;
};

CustomSwitch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
};

export default CustomSwitch; 