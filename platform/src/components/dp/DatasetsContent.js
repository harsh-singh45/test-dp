import React, { useState, useEffect } from 'react';
import { Spinner } from '../common/Spinner';
import { MessageBox } from '../common/MessageBox';
import { dpApiService } from '../../services/dpApiService';
// --- ADDITION: Import the component that will be shown when adding data ---
import { ConnectDataSource } from './ConnectDataSource';


const DatasetsContent = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // --- ADDITION: State to manage which view is shown ('list' or 'connect') ---
  const [view, setView] = useState('list');

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const data = await dpApiService.getDatasets();
      setDatasets(data || []); // Ensure data is always an array to prevent errors
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  // --- ADDITION: This function handles returning to the list and refreshing it ---
  const handleDatasetRegistered = () => {
    setView('list'); // Switch back to the list view
    fetchDatasets(); // Refresh the dataset list to show the new one
  };

  const formatNumber = (num) => {
    // MODIFICATION: Added a check for null/undefined to prevent crashes
    if (num === null || num === undefined) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
    return num.toString();
  };

  const formatSourceType = (sourceType) => {
    return sourceType.replace(/_/g, ' ').toUpperCase();
  };

  const getColumnsDisplay = (columns) => {
    if (!columns || columns.length === 0) return 'No columns';
    return columns.map(col => col.name).join(', ');
  };

  const handleDatasetClick = (datasetId) => {
    console.log('View dataset:', datasetId);
  };

  const handleAddDataset = () => {
    // MODIFICATION: This now switches the view instead of showing a modal
    setView('connect');
  };

  const handleRefresh = () => {
    fetchDatasets();
  };
  
  // --- ADDITION: If the view is 'connect', render the data source connector page ---
  if (view === 'connect') {
    return <ConnectDataSource onBackClick={() => setView('list')} onComplete={handleDatasetRegistered} />;
  }

  // --- This is your original return statement, completely preserved ---
  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex gap-2 ms-auto">
          <button className="btn btn-outline-secondary btn-sm" onClick={handleRefresh} disabled={loading}>
            <i className="bi bi-arrow-clockwise me-1"></i>Rescan Schemas
          </button>
          <button className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-file-earmark-arrow-down me-1"></i>Import Schema
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleAddDataset}>
            <i className="bi bi-database-add me-1"></i>Add Dataset
          </button>
        </div>
      </div>

      {error && <MessageBox message={error} type="error" onClose={() => setError('')} />}

      {/* Dataset Table */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-0">
          {loading ? (
            <Spinner text="Loading datasets..." />
          ) : datasets.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <i className="bi bi-database" style={{ fontSize: '3rem', color: 'var(--bs-secondary)' }}></i>
              </div>
              <h6 className="text-muted">No datasets registered yet</h6>
              <p className="small text-muted mb-3">Add your first dataset to start differential privacy analysis</p>
              <button className="btn btn-primary" onClick={handleAddDataset}>
                <i className="bi bi-database-add me-2"></i>Add Dataset
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-sm mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Dataset</th>
                    <th>Source Type</th>
                    <th>Records</th>
                    <th>Columns</th>
                    <th>Privacy Budget Used</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map(dataset => (
                    <tr key={dataset.id} style={{ cursor: 'pointer' }}>
                      <td onClick={() => handleDatasetClick(dataset.id)}>
                        <div>
                          <strong>{dataset.name}</strong>
                          <br />
                          <small className="text-muted">{dataset.description}</small>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {formatSourceType(dataset.source_type)}
                        </span>
                      </td>
                      <td>
                        <strong>{formatNumber(dataset.total_records)}</strong>
                      </td>
                      <td>
                        <small className="text-muted">
                          {dataset.columns ? dataset.columns.length : 0} columns
                        </small>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress me-2" style={{ width: '60px', height: '6px' }}>
                            <div 
                              className="progress-bar bg-primary" 
                              style={{ width: `${(dataset.privacy_budget_used || 0) * 100}%` }}
                            ></div>
                          </div>
                          <small>{((dataset.privacy_budget_used || 0) * 100).toFixed(1)}%</small>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${dataset.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                          {dataset.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary btn-sm" title="View Details">
                            <i className="bi bi-eye"></i>
                          </button>
                          <button className="btn btn-outline-secondary btn-sm" title="Edit">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-outline-danger btn-sm" title="Delete">
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Dataset Stats */}
      <div className="row">
        <div className="col-md-4">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h3 className="text-primary">{datasets.length}</h3>
              <p className="mb-0 small text-muted">Total Datasets</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h3 className="text-success">
                {formatNumber(datasets.reduce((sum, ds) => sum + (ds.total_records || 0), 0))}
              </h3>
              <p className="mb-0 small text-muted">Total Records</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h3 className="text-warning">
                {datasets.filter(ds => ds.status === 'active').length}
              </h3>
              <p className="mb-0 small text-muted">Active Datasets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Dataset Modal Placeholder */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Dataset</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-muted">Dataset registration form would be here in the full implementation.</p>
                <div className="mb-3">
                  <label className="form-label">Dataset Name</label>
                  <input type="text" className="form-control" placeholder="Enter dataset name" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="3" placeholder="Describe your dataset"></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="button" className="btn btn-primary">
                  Add Dataset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetsContent;