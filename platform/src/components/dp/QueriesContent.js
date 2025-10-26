import React, { useState, useEffect } from 'react';
import { Spinner } from '../common/Spinner';
import { MessageBox } from '../common/MessageBox';
import { dpApiService } from '../../services/dpApiService';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the components Chart.js needs
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const QueriesContent = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQueryModal, setShowQueryModal] = useState(false);

  // --- State for the modal's form fields and data ---
  const [message, setMessage] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [availableColumns, setAvailableColumns] = useState([]);
  const [queryType, setQueryType] = useState('mean');
  const [epsilon, setEpsilon] = useState('1.0');
  const [mechanism, setMechanism] = useState('Laplace');
  const [delta, setDelta] = useState('0.00001');

  // --- New state for the details modal ---
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const data = await dpApiService.getQueries();
      setQueries(data || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
    dpApiService.getDatasets()
      .then(data => {
        setDatasets(data || []);
        if (data && data.length > 0) {
          setSelectedDatasetId(data[0].id);
        }
      })
      .catch(err => {
        console.error("Failed to fetch datasets for modal:", err);
        setError("Could not load datasets for the new query form.");
      });
  }, []);

  useEffect(() => {
    if (selectedDatasetId && datasets.length > 0) {
      const selectedDS = datasets.find(ds => ds.id === parseInt(selectedDatasetId, 10));
      if (!selectedDS) return;

      let relevantCols = [];
      // If the query type is histogram, show all columns. Otherwise, show only numeric ones.
      if (queryType === 'histogram') {
        relevantCols = selectedDS.columns || [];
      } else {
        relevantCols = selectedDS.columns?.filter(col =>
          ['int64', 'float64', 'integer', 'float'].includes(col.dtype?.toLowerCase())
        ) || [];
      }

      setAvailableColumns(relevantCols);

      if (relevantCols.length > 0) {
        setSelectedColumn(relevantCols[0].name);
      } else {
        setSelectedColumn('');
      }
    }
  }, [selectedDatasetId, datasets, queryType]);

  const handleExecuteQuery = async () => {
    setMessage(null);
    if (!selectedDatasetId || !selectedColumn) {
      setMessage({ type: 'error', text: 'Please select a dataset and a column.' });
      return;
    }
    const jobData = {
      dataset_id: parseInt(selectedDatasetId, 10),
      query_type: queryType,
      epsilon: parseFloat(epsilon),
      mechanism: mechanism,
      column_name: selectedColumn,
    };
    if (mechanism === 'Gaussian') {
        jobData.delta = parseFloat(delta);
    }
    try {
      const newQuery = await dpApiService.executeQuery(jobData);
      setMessage({ type: 'success', text: `Successfully submitted job ${newQuery.id}.` });
      setShowQueryModal(false);
      fetchQueries();
    } catch (err) {
      setMessage({ type: 'error', text: `Error: ${err.message}` });
    }
  };

  const getStatusBadgeClass = (status) => {
    const lowerStatus = status?.toLowerCase();
    switch (lowerStatus) {
      case 'completed': return 'bg-success';
      case 'running': return 'bg-primary';
      case 'failed': return 'bg-danger';
      case 'queued': return 'bg-warning';
      default: return 'bg-secondary';
    }
  };

  const formatResult = (result) => {
    if (result === null || result === undefined) return 'N/A';
    try {
      const parsed = JSON.parse(result);
      if (parsed.private_histogram) {
        return `${Object.keys(parsed.private_histogram).length} categories`;
      }
      return `~ ${parsed.private_value}`;
    } catch (e) {
      return result.toString();
    }
  };

  const handleNewQuery = () => {
    setMessage(null);
    setShowQueryModal(true);
  };
  
  const handleViewDetails = (query) => {
    try {
        const parsedResult = JSON.parse(query.result);
        setSelectedQuery({ ...query, parsedResult });
        setShowDetailsModal(true);
    } catch (e) {
        setSelectedQuery({ ...query, rawResult: query.result });
        setShowDetailsModal(true);
    }
  };

  const handleRefresh = () => {
    fetchQueries();
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex gap-2 ms-auto">
          <button className="btn btn-outline-secondary btn-sm" onClick={handleRefresh} disabled={loading}><i className="bi bi-arrow-clockwise me-1"></i>Refresh</button>
          <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-file-earmark-code me-1"></i>Query Templates</button>
          <button className="btn btn-primary btn-sm" onClick={handleNewQuery}><i className="bi bi-plus-lg me-1"></i>New Query</button>
        </div>
      </div>

      {error && <MessageBox message={error} type="error" onClose={() => setError('')} />}
      {message && <MessageBox message={message.text} type={message.type} />}

      <div className="row mb-4">
        <div className="col-md-3"><div className="card border-0 bg-light"><div className="card-body text-center"><h4 className="text-primary">{queries.length}</h4><p className="mb-0 small text-muted">Total Queries</p></div></div></div>
        <div className="col-md-3"><div className="card border-0 bg-light"><div className="card-body text-center"><h4 className="text-success">{queries.filter(q => q.status?.toLowerCase() === 'completed').length}</h4><p className="mb-0 small text-muted">Completed</p></div></div></div>
        <div className="col-md-3"><div className="card border-0 bg-light"><div className="card-body text-center"><h4 className="text-warning">{queries.filter(q => q.status?.toLowerCase() === 'running').length}</h4><p className="mb-0 small text-muted">Running</p></div></div></div>
        <div className="col-md-3"><div className="card border-0 bg-light"><div className="card-body text-center"><h4 className="text-danger">{queries.filter(q => q.status?.toLowerCase() === 'failed').length}</h4><p className="mb-0 small text-muted">Failed</p></div></div></div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (<Spinner text="Loading queries..." />) :
            queries.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-3"><i className="bi bi-braces-asterisk" style={{ fontSize: '3rem', color: 'var(--bs-secondary)' }}></i></div>
                <h6 className="text-muted">No queries executed yet</h6>
                <p className="small text-muted mb-3">Run your first differential privacy query</p>
                <button className="btn btn-primary" onClick={handleNewQuery}><i className="bi bi-plus-lg me-2"></i>New Query</button>
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
                        <td><small className="text-muted font-monospace">{query.id}</small></td>
                        <td><code className="text-primary">{query.query_type}</code></td>
                        <td><small className="text-muted">{query.dataset_name}</small></td>
                        <td><span className="badge bg-light text-dark">{query.epsilon}</span></td>
                        <td><small className="text-muted">{query.mechanism || 'N/A'}</small></td>
                        <td><span className={`badge ${getStatusBadgeClass(query.status)}`}>{query.status}</span></td>
                        <td><code className="text-primary">{formatResult(query.result)}</code></td>
                        <td><small className="text-muted">{new Date(query.created_at).toLocaleString()}</small></td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-primary btn-sm" title="View Details" onClick={() => handleViewDetails(query)}>
                                <i className="bi bi-eye"></i>
                            </button>
                            <button className="btn btn-outline-secondary btn-sm" title="Copy Query"><i className="bi bi-copy"></i></button>
                            {query.status?.toLowerCase() === 'failed' && (<button className="btn btn-outline-warning btn-sm" title="Retry"><i className="bi bi-arrow-clockwise"></i></button>)}
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

      {showQueryModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">New Differential Privacy Query</h5>
                <button type="button" className="btn-close" onClick={() => setShowQueryModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Dataset</label>
                      <select className="form-select" value={selectedDatasetId} onChange={e => setSelectedDatasetId(e.target.value)}>
                        <option value="" disabled>Select dataset...</option>
                        {datasets.map(ds => (<option key={ds.id} value={ds.id}>{ds.name}</option>))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Column</label>
                      <select className="form-select" value={selectedColumn} onChange={e => setSelectedColumn(e.target.value)} disabled={availableColumns.length === 0}>
                        {availableColumns.length > 0 ? (
                          availableColumns.map(col => <option key={col.name} value={col.name}>{col.name}</option>)
                        ) : (
                          <option>No eligible columns in selected dataset</option>
                        )}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Query Type</label>
                      <select className="form-select" value={queryType} onChange={e => setQueryType(e.target.value)}>
                        <option value="count">count</option>
                        <option value="sum">sum</option>
                        <option value="mean">mean</option>
                        <option value="variance">variance</option>
                        <option value="std">std</option>
                        <option value="histogram">histogram</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Privacy Mechanism</label>
                      <select className="form-select" value={mechanism} onChange={e => setMechanism(e.target.value)}>
                        <option>Laplace</option>
                        <option>Gaussian</option>
                      </select>
                    </div>
                    {mechanism === 'Gaussian' && (
                        <div className="mb-3">
                            <label className="form-label">Delta (δ)</label>
                            <input type="number" className="form-control" step="0.00001" min="0" value={delta} onChange={e => setDelta(e.target.value)} />
                            <div className="form-text">Probability of privacy failure (required for Gaussian).</div>
                        </div>
                    )}
                    <div className="mb-3">
                      <label className="form-label">Epsilon (ε)</label>
                      <input type="number" className="form-control" step="0.1" min="0.1" max="10" value={epsilon} onChange={e => setEpsilon(e.target.value)} />
                      <div className="form-text">Privacy parameter (lower = more private)</div>
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
                                    <li>`histogram` works on both numeric and categorical columns.</li>
                                    <li>All other queries require numeric columns.</li>
                                    <li>Lower epsilon values provide stronger privacy guarantees.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowQueryModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleExecuteQuery}>
                  <i className="bi bi-play me-1"></i>
                  Execute Query
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showDetailsModal && selectedQuery && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg modal-dialog-centered">
                  <div className="modal-content">
                      <div className="modal-header">
                          <h5 className="modal-title">Query Result Details (ID: {selectedQuery.id})</h5>
                          <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
                      </div>
                      <div className="modal-body">
                          {selectedQuery.parsedResult ? (
                              selectedQuery.parsedResult.private_histogram ? (
                                  <div>
                                      <h6>Differentially Private Histogram</h6>
                                      <Bar
                                          options={{
                                              responsive: true,
                                              plugins: { legend: { display: false }, title: { display: true, text: `Histogram for column: ${selectedQuery.query_type.split(' on ')[1]}` } }
                                          }}
                                          data={{
                                              labels: Object.keys(selectedQuery.parsedResult.private_histogram),
                                              datasets: [{
                                                  label: 'Noisy Count',
                                                  data: Object.values(selectedQuery.parsedResult.private_histogram),
                                                  backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                              }]
                                          }}
                                      />
                                  </div>
                              ) : (
                                  <div>
                                      <h6>Differentially Private Result</h6>
                                      <h3 className="text-primary">{selectedQuery.parsedResult.private_value}</h3>
                                      <p className="small text-muted mb-0">Actual Value (non-private): {selectedQuery.parsedResult.actual_value}</p>
                                  </div>
                              )
                          ) : (
                              <div>
                                  <h6>Raw Result</h6>
                                  <pre><code>{selectedQuery.rawResult || 'No result available.'}</code></pre>
                              </div>
                          )}
                      </div>
                      <div className="modal-footer">
                          <button type="button" className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default QueriesContent;