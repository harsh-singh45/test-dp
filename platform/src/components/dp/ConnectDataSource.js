import React, { useState } from 'react';
import { FileUploadConnector } from './FileUploadConnector';
import { LocalDBConnector } from './LocalDBConnector';

export const ConnectDataSource = ({ onBackClick, onComplete }) => {
  // State to track which connector is selected from the dropdown
  const [selectedConnector, setSelectedConnector] = useState('file_upload');

  // A simple function to render the correct connector component
  const renderConnector = () => {
    switch (selectedConnector) {
      case 'file_upload':
        return <FileUploadConnector onComplete={onComplete} />;
      case 'local_database':
        return <LocalDBConnector onComplete={onComplete} />;
      default:
        return null;
    }
  };

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Connect New Data Source</h2>
        <button onClick={onBackClick} className="btn btn-secondary btn-sm">
          &larr; Back to Datasets
        </button>
      </div>
      <p className="text-muted">Select a connection method and provide the necessary details to register a new dataset.</p>
      
      <div className="card">
        <div className="card-body">
          <div className="mb-4">
            <label htmlFor="connectorType" className="form-label">Connection Type</label>
            <select 
              id="connectorType" 
              className="form-select" 
              value={selectedConnector} 
              onChange={e => setSelectedConnector(e.target.value)}
            >
              <option value="file_upload">CSV File Upload</option>
              <option value="local_database">SQLite Database Upload</option>
              {/* Future connectors like PostgreSQL, S3, etc., can be added here */}
            </select>
          </div>

          {/* This will now render the selected connector's form */}
          {renderConnector()}
        </div>
      </div>
    </section>
  );
};