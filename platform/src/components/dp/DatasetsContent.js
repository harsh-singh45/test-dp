import React, { useState, useEffect } from 'react';
// Link is no longer needed for the action buttons, but might be used elsewhere. Keeping it for now.
import Link from 'next/link'; 
import { useRouter } from 'next/router';
import { Spinner } from '../common/Spinner';
import { MessageBox } from '../common/MessageBox';
import { dpApiService } from '../../services/dpApiService';
import { ConnectDataSource } from './ConnectDataSource';

// Using the inline modal pattern from your AccountingContent.js for reliability.

const DatasetsContent = () => {
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [view, setView] = useState('list');
    const router = useRouter(); // Initialize router

    // State for the INLINE delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [datasetToDelete, setDatasetToDelete] = useState(null);

    const fetchDatasets = async () => {
        setLoading(true);
        try {
            const data = await dpApiService.getDatasets();
            setDatasets(data || []);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'list') {
            fetchDatasets();
        }
    }, [view]);

    // All your original handlers and formatters are preserved
    const handleDatasetRegistered = () => {
        setView('list');
    };

    const formatNumber = (num) => {
        if (num === null || num === undefined) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
        return num.toString();
    };

    const formatSourceType = (sourceType) => {
        return sourceType ? sourceType.replace(/_/g, ' ').toUpperCase() : 'N/A';
    };
    
    const handleAddDataset = () => {
        setView('connect');
    };

    const handleRefresh = () => {
        fetchDatasets();
    };

    // Handler to make the entire row clickable for navigation
    const handleDatasetClick = (datasetId) => {
        router.push(`/dp/dataset/${datasetId}`);
    };

    // Handlers for the delete functionality
    const handleDeleteClick = (dataset) => {
        setDatasetToDelete(dataset);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!datasetToDelete) return;
        try {
            await dpApiService.deleteDataset(datasetToDelete.id);
            setShowDeleteModal(false);
            setDatasetToDelete(null);
            fetchDatasets(); // Refresh the list
        } catch (err) {
            setError(`Failed to delete dataset: ${datasetToDelete.name}. Please try again.`);
            setShowDeleteModal(false);
        }
    };

    // Your functional sub-components for rendering cells
    const BudgetProgressBar = ({ budget }) => {
        if (!budget || !budget.total_epsilon || budget.total_epsilon === 0) {
            return (
                <div className="d-flex align-items-center"><div className="progress me-2" style={{ width: '60px', height: '6px' }}><div className="progress-bar bg-secondary" style={{ width: '0%' }}></div></div><small>N/A</small></div>
            );
        }
        const percentage = (budget.consumed_epsilon / budget.total_epsilon) * 100;
        const barColor = percentage > 80 ? 'bg-danger' : percentage > 50 ? 'bg-warning' : 'bg-primary';
        return (
            <div className="d-flex align-items-center"><div className="progress me-2" style={{ width: '60px', height: '6px' }}><div className={`progress-bar ${barColor}`} style={{ width: `${percentage}%` }}></div></div><small>{percentage.toFixed(1)}%</small></div>
        );
    };

    const StatusBadge = ({ status }) => {
        const badgeClass = status === 'Available' ? 'bg-success' : 'bg-secondary';
        return <span className={`badge ${badgeClass}`}>{status || 'Unknown'}</span>;
    };
    
    if (view === 'connect') {
        return <ConnectDataSource onBackClick={() => setView('list')} onComplete={handleDatasetRegistered} />;
    }

    return (
        <div>
            {/* Your original header is preserved */}
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex gap-2 ms-auto">
                    <button className="btn btn-outline-secondary btn-sm" onClick={handleRefresh} disabled={loading}><i className="bi bi-arrow-clockwise me-1"></i>Rescan </button>
                    <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-file-earmark-arrow-down me-1"></i>Import Schema</button>
                    <button className="btn btn-primary btn-sm" onClick={handleAddDataset}><i className="bi bi-database-add me-1"></i>Add Dataset</button>
                </div>
            </div>

            {error && <MessageBox message={error} type="error" onClose={() => setError('')} />}

            <div className="card shadow-sm mb-4">
                <div className="card-body p-0">
                    {loading ? <Spinner text="Loading datasets..." /> : datasets.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="mb-3"><i className="bi bi-database" style={{ fontSize: '3rem', color: 'var(--bs-secondary)' }}></i></div>
                            <h6 className="text-muted">No datasets registered yet</h6>
                            <p className="small text-muted mb-3">Add your first dataset to start differential privacy analysis</p>
                            <button className="btn btn-primary" onClick={handleAddDataset}><i className="bi bi-database-add me-2"></i>Add Dataset</button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover table-sm mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Dataset</th><th>Source Type</th><th>Records</th><th>Columns</th><th>Privacy Budget Used</th><th>Status</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {datasets.map(dataset => (
                                        <tr key={dataset.id} onClick={() => handleDatasetClick(dataset.id)} style={{ cursor: 'pointer' }}>
                                            <td>
                                                <strong>{dataset.name}</strong><br /><small className="text-muted">{dataset.description}</small>
                                            </td>
                                            <td><span className="badge bg-light text-dark">{formatSourceType(dataset.source_type)}</span></td>
                                            <td><strong>{formatNumber(dataset.total_records)}</strong></td>
                                            <td><small className="text-muted">{dataset.columns ? dataset.columns.length : 0} columns</small></td>
                                            <td><BudgetProgressBar budget={dataset.budget} /></td>
                                            <td><StatusBadge status={dataset.status} /></td>
                                            {/* This cell stops the row click from firing when clicking the buttons */}
                                            <td onClick={(e) => e.stopPropagation()}>
                                                <div className="btn-group btn-group-sm">
                                                    <button 
                                                        className="btn btn-outline-primary" 
                                                        title="View Details" 
                                                        onClick={() => handleDatasetClick(dataset.id)}
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                    <button className="btn btn-outline-secondary" title="Edit" disabled><i className="bi bi-pencil"></i></button>
                                                    <button className="btn btn-outline-danger" title="Delete" onClick={() => handleDeleteClick(dataset)}>
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

            {/* Your original stats cards are preserved */}
            <div className="row">
                <div className="col-md-4"><div className="card border-0 bg-light"><div className="card-body text-center"><h3 className="text-primary">{datasets.length}</h3><p className="mb-0 small text-muted">Total Datasets</p></div></div></div>
                <div className="col-md-4"><div className="card border-0 bg-light"><div className="card-body text-center"><h3 className="text-success">{formatNumber(datasets.reduce((sum, ds) => sum + (ds.total_records || 0), 0))}</h3><p className="mb-0 small text-muted">Total Records</p></div></div></div>
                <div className="col-md-4"><div className="card border-0 bg-light"><div className="card-body text-center"><h3 className="text-warning">{datasets.filter(ds => ds.status === 'Available').length}</h3><p className="mb-0 small text-muted">Active Datasets</p></div></div></div>
            </div>

            {/* The working inline modal for delete confirmation */}
            {showDeleteModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Deletion</h5>
                                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete the dataset "<strong>{datasetToDelete?.name}</strong>"?</p>
                                <p className="text-danger">This action cannot be undone and will delete all associated queries and budget information.</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatasetsContent;

