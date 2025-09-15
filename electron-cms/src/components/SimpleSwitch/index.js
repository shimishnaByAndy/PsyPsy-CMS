import React from 'react';
import PropTypes from 'prop-types';
import './styles.css';

/**
 * SimpleSwitch - A simple toggle switch with a pill shape and circle toggle
 */
const SimpleSwitch = ({ checked, onChange, label }) => {
  const handleToggle = () => {
    onChange(!checked);
  };

  return (
    <div className="simple-switch-container">
      {label && (
        <span className="simple-switch-label" onClick={handleToggle}>{label}</span>
      )}
      <div 
        className={`simple-switch ${checked ? 'checked' : ''}`}
        onClick={handleToggle}
        role="switch"
        tabIndex={0}
        aria-checked={checked}
        aria-label={label}
      >
        <div className="simple-switch-toggle" />
      </div>
    </div>
  );
};

SimpleSwitch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
};

SimpleSwitch.defaultProps = {
  checked: false,
};

export default SimpleSwitch; 