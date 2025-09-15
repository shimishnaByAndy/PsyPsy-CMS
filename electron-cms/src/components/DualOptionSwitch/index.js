import React from 'react';
import PropTypes from 'prop-types';
import './styles.css';

/**
 * DualOptionSwitch - A component with two pill-shaped options with inner circles
 * that match the design in the image
 */
const DualOptionSwitch = ({ selected, onChange, label }) => {
  const handleLeftClick = () => {
    if (selected !== 'left') {
      onChange('left');
    }
  };

  const handleRightClick = () => {
    if (selected !== 'right') {
      onChange('right');
    }
  };

  return (
    <div className="dual-option-switch-container">
      {label && (
        <span className="dual-option-label">{label}</span>
      )}
      <div className="dual-option-switch">
        <div 
          className={`dual-option-circle ${selected === 'left' ? 'active' : ''}`}
          onClick={handleLeftClick}
          role="button"
          tabIndex={0}
          aria-label="Do not remember"
        />
        <div 
          className={`dual-option-circle ${selected === 'right' ? 'active' : ''}`}
          onClick={handleRightClick}
          role="button"
          tabIndex={0}
          aria-label="Remember me"
        />
      </div>
    </div>
  );
};

DualOptionSwitch.propTypes = {
  selected: PropTypes.oneOf(['left', 'right']),
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
};

DualOptionSwitch.defaultProps = {
  selected: 'left',
};

export default DualOptionSwitch; 