import React from 'react';

export const MessageBox = ({ message, type = 'info', onClose }) => {
  const getAlertClass = () => {
    switch (type) {
      case 'error': return 'alert-danger';
      case 'success': return 'alert-success';
      case 'warning': return 'alert-warning';
      default: return 'alert-info';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error': return 'bi-exclamation-triangle';
      case 'success': return 'bi-check-circle';
      case 'warning': return 'bi-exclamation-circle';
      default: return 'bi-info-circle';
    }
  };

  return (
    <div className={`alert ${getAlertClass()} d-flex align-items-center ${onClose ? 'alert-dismissible' : ''}`} role="alert">
      <i className={`bi ${getIcon()} me-2`}></i>
      <div className="flex-grow-1">{message}</div>
      {onClose && (
        <button 
          type="button" 
          className="btn-close" 
          onClick={onClose}
          aria-label="Close"
        ></button>
      )}
    </div>
  );
};
