import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import './styles.css';

/**
 * FormSwitch component based on Darkone template's form switch styling
 */
const FormSwitch = ({ checked, onChange, label, id, className, ...rest }) => {
  const switchId = id || `form-switch-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <Form.Group className={`form-switch-wrapper ${className || ''}`}>
      <div className="form-check form-switch">
        <Form.Check 
          type="switch"
          id={switchId}
          className="form-check-input"
          checked={checked}
          onChange={onChange}
          {...rest}
        />
        {label && (
          <Form.Label 
            className="form-check-label" 
            htmlFor={switchId}
            onClick={onChange}
          >
            {label}
          </Form.Label>
        )}
      </div>
    </Form.Group>
  );
};

FormSwitch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
};

export default FormSwitch; 