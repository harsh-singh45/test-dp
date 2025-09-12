import React, { useState, useEffect } from 'react';
import { Spinner } from '../common/Spinner';
import { MessageBox } from '../common/MessageBox';
import { dpApiService } from '../../services/dpApiService';

const QueriesContent = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQueryModal, setShowQueryModal] = useState(false);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const data = await dpApiService.getQueries();
      setQueries(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed': return 'bg-success';
      case 'Running': return 'bg-primary';
      case 'Failed': return 'bg-danger';
      case 'Queued': return 'bg-warning';
      default: return 'bg-secondary';
    }
  };

  const formatResult = (result) => {
    if (result === null) return 'N/A';
    if (typeof result === 'object') return JSON.stringify(result, null, 1);
    return result.toString();
  };

  const handleNewQuery = () => {
    setShowQueryModal(true);
  };

  const handleRefresh = () => {
    fetchQueries();
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex gap-2 ms-auto">
          <button className="btn btn-outline-secondary btn-sm" onClick={handleRefresh} disabled={loading}>
            <i className="bi bi-arrow-clockwise me-1"></i>Refresh
          </button>
          <button className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-file-earmark-code me-1"></i>Query Templates
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleNewQuery}>
            <i className="bi bi-plus-lg me-1"></i>New Query
          </button>
        </div>
      </div>

      {error && <MessageBox message={error} type="error" onClose={() => setError('')} />}

      {/* Query Statistics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h4 className="text-primary">{queries.length}</h4>
              <p className="mb-0 small text-muted">Total Queries</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h4 className="text-success">{queries.filter(q => q.status === 'Completed').length}</h4>
              <p className="mb-0 small text-muted">Completed</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h4 className="text-warning">{queries.filter(q => q.status === 'Running').length}</h4>
              <p className="mb-0 small text-muted">Running</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h4 className="text-danger">{queries.filter(q => q.status === 'Failed').length}</h4>
              <p className="mb-0 small text-muted">Failed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Query Table */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <Spinner text="Loading queries..." />
          ) : queries.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <i className="bi bi-braces-asterisk" style={{ fontSize: '3rem', color: 'var(--bs-secondary)' }}></i>
              </div>
              <h6 className="text-muted">No queries executed yet</h6>
              <p className="small text-muted mb-3">Run your first differential privacy query</p>
              <button className="btn btn-primary" onClick={handleNewQuery}>
                <i className="bi bi-plus-lg me-2"></i>New Query
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-sm mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Query ID</th>
                    <th>Query</th>
                    <th>Dataset</th>
                    <th>ε (Epsilon)</th>
                    <th>Mechanism</th>
                    <th>Status</th>
                    <th>Result</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queries.map(query => (
                    <tr key={query.id}>
                      <td>
                        <small className="text-muted font-monospace">{query.id}</small>
                      </td>
                      <td>
                        <code className="text-primary">{query.query}</code>
                      </td>
                      <td>
                        <small className="text-muted">{query.dataset}</small>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">{query.epsilon}</span>
                      </td>
                      <td>
                        <small className="text-muted">{query.mechanism}</small>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(query.status)}`}>
                          {query.status}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">
                          {query.status === 'Running' ? (
                            <span>
                              <i className="bi bi-hourglass-split me-1"></i>
                              Processing...
                            </span>
                          ) : (
                            formatResult(query.result)
                          )}
                        </small>
                      </td>
                      <td>
                        <small className="text-muted">{query.time}</small>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary btn-sm" title="View Details">
                            <i className="bi bi-eye"></i>
                          </button>
                          <button className="btn btn-outline-secondary btn-sm" title="Copy Query">
                            <i className="bi bi-copy"></i>
                          </button>
                          {query.status === 'Failed' && (
                            <button className="btn btn-outline-warning btn-sm" title="Retry">
                              <i className="bi bi-arrow-clockwise"></i>
                            </button>
                          )}
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

      {/* New Query Modal */}
      {showQueryModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">New Differential Privacy Query</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowQueryModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Dataset</label>
                      <select className="form-select">
                        <option>Select dataset...</option>
                        <option>customer_events</option>
                        <option>user_profiles</option>
                        <option>sales_data</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Privacy Mechanism</label>
                      <select className="form-select">
                        <option>Select mechanism...</option>
                        <option>Laplace</option>
                        <option>Gaussian</option>
                        <option>Exponential</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Epsilon (ε)</label>
                      <input type="number" className="form-control" step="0.1" min="0.1" max="10" defaultValue="1.0" />
                      <div className="form-text">Privacy parameter (lower = more private)</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Query</label>
                      <textarea 
                        className="form-control font-monospace" 
                        rows="8" 
                        placeholder="SELECT COUNT(*) FROM dataset_name"
                        style={{ fontSize: '14px' }}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <div className="alert alert-info d-flex align-items-start">
                      <i className="bi bi-info-circle me-2"></i>
                      <div>
                        <strong>Query Guidelines:</strong>
                        <ul className="mb-0 mt-1">
                          <li>Use aggregate functions: COUNT, SUM, AVG</li>
                          <li>Ensure queries are compatible with chosen mechanism</li>
                          <li>Consider sensitivity requirements for your data</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowQueryModal(false)}
                >
                  Cancel
                </button>
                <button type="button" className="btn btn-primary">
                  <i className="bi bi-play me-1"></i>
                  Execute Query
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueriesContent;
