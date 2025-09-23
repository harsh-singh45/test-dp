import React, { useState, useEffect } from 'react';
import { dpApiService } from '../../services/dpApiService';
import { MessageBox } from '../common/MessageBox';
import { Spinner } from '../common/Spinner';
import Modal from '../common/Modal'; // Import the new Modal component

const AuditContent = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- NEW STATE FOR MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
        const fetchAuditLogs = async () => {
            try {
                const data = await dpApiService.getAuditLogs();
                setAuditLogs(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAuditLogs();
    }, []);
    
    // --- NEW HANDLER FOR THE EYE BUTTON ---
    const handleViewDetails = (log) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedLog(null);
    };

    const getStatusBadge = (status) => {
        return status === 'SUCCESS' ? 'bg-success' : 'bg-danger';
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'QUERY_EXECUTED': return 'bi-play-circle';
            case 'DATASET_REGISTERED': return 'bi-database-add';
            case 'BUDGET_RESET': return 'bi-arrow-clockwise';
            case 'QUERY_FAILED': return 'bi-exclamation-triangle';
            default: return 'bi-info-circle';
        }
    };
    
    const totalEvents = auditLogs.length;
    const successfulEvents = auditLogs.filter(log => log.status === 'SUCCESS').length;
    const failedEvents = totalEvents - successfulEvents;
    const uniqueUsers = new Set(auditLogs.map(log => log.user)).size;

    if (loading) return <Spinner />;
    if (error) return <MessageBox type="error" message={error} />;

    return (
        <div>
            {/* ... (Your existing JSX for header buttons and KPI cards) ... */}
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex gap-2 ms-auto">
                    <button className="btn btn-outline-secondary btn-sm">
                        <i className="bi bi-funnel me-1"></i>Filter
                    </button>
                    <button className="btn btn-outline-primary btn-sm">
                        <i className="bi bi-download me-1"></i>Export Logs
                    </button>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card border-0 bg-light">
                        <div className="card-body text-center">
                            <h4 className="text-primary">{totalEvents}</h4>
                            <p className="mb-0 small text-muted">Total Events</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 bg-light">
                        <div className="card-body text-center">
                            <h4 className="text-success">{successfulEvents}</h4>
                            <p className="mb-0 small text-muted">Successful</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 bg-light">
                        <div className="card-body text-center">
                            <h4 className="text-danger">{failedEvents}</h4>
                            <p className="mb-0 small text-muted">Failed</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 bg-light">
                        <div className="card-body text-center">
                            <h4 className="text-info">{uniqueUsers}</h4>
                            <p className="mb-0 small text-muted">Unique Users</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover table-sm mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Timestamp</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Details</th>
                                    <th>Status</th>
                                    <th>IP Address</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.map(log => (
                                    <tr key={log.id}>
                                        <td>
                                            <small className="text-muted">{new Date(log.timestamp).toLocaleString()}</small>
                                        </td>
                                        <td>
                                            <small>{log.user}</small>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <i className={`bi ${getActionIcon(log.action)} me-2`}></i>
                                                <small>{log.action.replace(/_/g, ' ')}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <small className="text-muted">{log.details}</small>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(log.status)}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td>
                                            <small className="text-muted font-monospace">{log.ip_address}</small>
                                        </td>
                                        <td>
                                            {/* --- UPDATED BUTTON --- */}
                                            <button className="btn btn-outline-primary btn-sm" onClick={() => handleViewDetails(log)}>
                                                <i className="bi bi-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ... (Your existing JSX for the alert box) ... */}
            <div className="mt-4">
                <div className="alert alert-info">
                    <h6><i className="bi bi-shield-check me-2"></i>Audit Trail Information</h6>
                    <p className="mb-0 small">
                        All differential privacy operations are logged for compliance and security purposes. 
                        Logs include query execution, dataset management, and privacy budget operations.
                    </p>
                </div>
            </div>

            {/* --- RENDER THE MODAL --- */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Audit Log Details">
                {selectedLog && (
                    <div>
                        <p><strong>Log ID:</strong> {selectedLog.id}</p>
                        <p><strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}</p>
                        <p><strong>User:</strong> {selectedLog.user}</p>
                        <p><strong>Action:</strong> {selectedLog.action}</p>
                        <p><strong>Details:</strong> {selectedLog.details}</p>
                        <p><strong>Status:</strong> {selectedLog.status}</p>
                        <p><strong>IP Address:</strong> {selectedLog.ip_address}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AuditContent;