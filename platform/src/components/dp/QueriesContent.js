import React, { useState, useEffect } from 'react';
import { Spinner } from '../common/Spinner';
import { MessageBox } from '../common/MessageBox';
import { dpApiService } from '../../services/dpApiService';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Modal from '../common/Modal';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// *** MODIFICATION START ***
// --- Component for the Template Create/Edit Form ---
const TemplateFormModal = ({ isOpen, onClose, onSave, template }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        query_type: 'mean',
        mechanism: 'Laplace',
        epsilon: 1.0,
        delta: 0.00001,
    });

    useEffect(() => {
        if (template) {
            setFormData({
                name: template.name || '',
                description: template.description || '',
                query_type: template.query_type || 'mean',
                mechanism: template.mechanism || 'Laplace',
                epsilon: template.epsilon || 1.0,
                delta: template.delta || 0.00001,
            });
        } else {
            setFormData({
                name: '', description: '', query_type: 'mean', 
                mechanism: 'Laplace', epsilon: 1.0, delta: 0.00001
            });
        }
    }, [template, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={template ? 'Edit Query Template' : 'Create New Query Template'}>
            <div className="mb-3">
                <label className="form-label">Template Name</label>
                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} rows="2"></textarea>
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Query Type</label>
                    <select className="form-select" name="query_type" value={formData.query_type} onChange={handleChange}>
                        <option value="count">count</option>
                        <option value="sum">sum</option>
                        <option value="mean">mean</option>
                        <option value="variance">variance</option>
                        <option value="std">std</option>
                        <option value="histogram">histogram</option>
                    </select>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Mechanism</label>
                    <select className="form-select" name="mechanism" value={formData.mechanism} onChange={handleChange}>
                        <option>Laplace</option>
                        <option>Gaussian</option>
                    </select>
                </div>
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Epsilon (ε)</label>
                    <input type="number" className="form-control" name="epsilon" value={formData.epsilon} onChange={handleChange} step="0.1" />
                </div>
                {formData.mechanism === 'Gaussian' && (
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Delta (δ)</label>
                        <input type="number" className="form-control" name="delta" value={formData.delta} onChange={handleChange} step="0.00001" />
                    </div>
                )}
            </div>
            <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleSubmit}>Save Template</button>
            </div>
        </Modal>
    );
};
// *** MODIFICATION END ***


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
  
  // *** MODIFICATION START ***
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [templateInUse, setTemplateInUse] = useState(null);

  // State for template management
  const [showTemplateFormModal, setShowTemplateFormModal] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState(null);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  const fetchTemplates = async () => {
    try {
      const data = await dpApiService.getTemplates();
      setTemplates(data);
    } catch (err) {
      setError('Could not fetch templates. Please try again.');
    }
  };
  // *** MODIFICATION END ***

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
    // *** MODIFICATION START ***
    fetchTemplates();
    // *** MODIFICATION END ***
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
          if (!relevantCols.find(c => c.name === selectedColumn)) {
              setSelectedColumn(relevantCols[0].name);
          }
      } else {
        setSelectedColumn('');
      }
    }
  }, [selectedDatasetId, datasets, queryType, selectedColumn]);

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
    // *** MODIFICATION START ***
    setTemplateInUse(null); // Clear any template in use
    // *** MODIFICATION END ***
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
    // *** MODIFICATION START ***
    fetchTemplates();
    // *** MODIFICATION END ***
  };

  const handleCopyResult = (query) => {
    if (!query || !query.result) {
        alert('No result available to copy.');
        return;
    }

    let textToCopy = '';
    try {
        // Try to parse and pretty-print if it's a JSON string
        const parsedResult = JSON.parse(query.result);
        textToCopy = JSON.stringify(parsedResult, null, 2);
    } catch (e) {
        // If it's not JSON, copy the raw text
        textToCopy = query.result;
    }

    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            alert('Query result copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy result to clipboard:', err);
            alert('Could not copy result. Please check console for errors.');
        });
  };

  // *** MODIFICATION START ***
  const handleUseTemplate = (template) => {
    setQueryType(template.query_type);
    setMechanism(template.mechanism);
    setEpsilon(String(template.epsilon)); // Use String() to ensure it works in the input
    setDelta(String(template.delta || '0.00001'));
    setTemplateInUse(template.name); // Set the name of the template being used
    
    setShowTemplatesModal(false);
    setShowQueryModal(true);
  };
  
  const handleSaveTemplate = async (templateData) => {
      try {
          if (templateToEdit) {
              await dpApiService.updateTemplate(templateToEdit.id, templateData);
          } else {
              await dpApiService.createTemplate(templateData);
          }
          setShowTemplateFormModal(false);
          setTemplateToEdit(null);
          fetchTemplates(); // Refresh the list
      } catch (err) {
          setError(`Failed to save template: ${err.message}`);
      }
  };

  const handleDeleteTemplate = async () => {
      if (!templateToDelete) return;
      try {
          await dpApiService.deleteTemplate(templateToDelete.id);
          setTemplateToDelete(null); // This also closes the confirmation modal
          fetchTemplates();
      } catch (err) {
          setError(`Failed to delete template: ${err.message}`);
      }
  };
  // *** MODIFICATION END ***

  const handleRetryQuery = async (query) => {
    if (!query) return;
    
    // Find the original dataset to get its ID
    const originalDataset = datasets.find(ds => ds.name === query.dataset_name);
    if (!originalDataset) {
        setMessage({ type: 'error', text: `Dataset '${query.dataset_name}' not found for retry.`});
        return;
    }

    // The backend stores query_type as "TYPE on COLUMN", so we parse it.
    const parts = query.query_type.split(' on ');
    const queryType = parts[0].toLowerCase();
    const columnName = parts.length > 1 ? parts[1] : '';

    if (!columnName) {
        setMessage({ type: 'error', text: 'Could not determine column name for retry.' });
        return;
    }
    
    const jobData = {
      dataset_id: originalDataset.id,
      query_type: queryType,
      epsilon: query.epsilon,
      mechanism: query.mechanism,
      column_name: columnName,
      delta: query.delta
    };

    setMessage({ type: 'info', text: `Retrying job ${query.id}...` });

    try {
      const newQuery = await dpApiService.executeQuery(jobData);
      setMessage({ type: 'success', text: `Successfully retried job. New job ID is ${newQuery.id}.` });
      fetchQueries(); // Refresh the list to show the new job
    } catch (err) {
      setMessage({ type: 'error', text: `Retry failed: ${err.message}` });
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex gap-2 ms-auto">
          <button className="btn btn-outline-secondary btn-sm" onClick={handleRefresh} disabled={loading}><i className="bi bi-arrow-clockwise me-1"></i>Refresh</button>
          {/* MODIFIED BUTTON */}
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowTemplatesModal(true)}><i className="bi bi-file-earmark-code me-1"></i>Query Templates</button>
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
                            <button className="btn btn-outline-secondary btn-sm" title="Copy Result" onClick={() => handleCopyResult(query)}>
                                <i className="bi bi-copy"></i>
                            </button>
                            {query.status?.toLowerCase() === 'failed' && (
                                <button 
                                    className="btn btn-outline-warning btn-sm" 
                                    title="Retry" 
                                    onClick={() => handleRetryQuery(query)}
                                >
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

      {showQueryModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">New Differential Privacy Query</h5>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-secondary ms-auto me-2" 
                  onClick={() => { setShowQueryModal(false); setShowTemplatesModal(true); }}
                >
                  <i className="bi bi-file-earmark-code me-1"></i> Load from Template
                </button>
                <button type="button" className="btn-close" onClick={() => setShowQueryModal(false)}></button>
              </div>
              <div className="modal-body">
                {/* *** MODIFICATION START *** */}
                {templateInUse && (
                    <div className="alert alert-info d-flex justify-content-between align-items-center">
                        <span>
                            <i className="bi bi-info-circle-fill me-2"></i>
                            Processing using the '<strong>{templateInUse}</strong>' template.
                        </span>
                        <button className="btn btn-sm btn-link text-decoration-none" onClick={() => setTemplateInUse(null)}>Clear</button>
                    </div>
                )}
                {/* *** MODIFICATION END *** */}
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

      {/* *** MODIFICATION START: Full Template Management Modals *** */}
      <Modal isOpen={showTemplatesModal} onClose={() => setShowTemplatesModal(false)} title="Query Templates">
        <div className="list-group">
          {templates.map((template) => (
            <div key={template.id} className="list-group-item list-group-item-action">
              <div className="d-flex w-100 justify-content-between">
                <h6 className="mb-1">{template.name}</h6>
                <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-secondary" onClick={() => { setTemplateToEdit(template); setShowTemplateFormModal(true); }}>
                        <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-outline-danger" onClick={() => setTemplateToDelete(template)}>
                        <i className="bi bi-trash"></i>
                    </button>
                </div>
              </div>
              <p className="mb-1 small text-muted">{template.description}</p>
              <button 
                className="btn btn-sm btn-primary mt-2" 
                onClick={() => handleUseTemplate(template)}
              >
                <i className="bi bi-arrow-right-circle me-1"></i> Use Template
              </button>
            </div>
          ))}
          {templates.length === 0 && <p className="text-muted text-center my-3">No custom templates saved yet.</p>}
        </div>
        <div className="modal-footer">
            <button className="btn btn-success" onClick={() => { setTemplateToEdit(null); setShowTemplateFormModal(true); }}>
                <i className="bi bi-plus-lg me-1"></i> Create New Template
            </button>
        </div>
      </Modal>

      <TemplateFormModal 
        isOpen={showTemplateFormModal}
        onClose={() => setShowTemplateFormModal(false)}
        onSave={handleSaveTemplate}
        template={templateToEdit}
      />

      {templateToDelete && (
          <Modal isOpen={true} onClose={() => setTemplateToDelete(null)} title="Confirm Deletion">
              <p>Are you sure you want to delete the template "<strong>{templateToDelete.name}</strong>"?</p>
              <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setTemplateToDelete(null)}>Cancel</button>
                  <button className="btn btn-danger" onClick={handleDeleteTemplate}>Delete</button>
              </div>
          </Modal>
      )}
      {/* *** MODIFICATION END *** */}
    </div>
  );
};

export default QueriesContent;