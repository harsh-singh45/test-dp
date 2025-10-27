import React, { useState, useEffect } from 'react';
import { dpApiService } from '../../services/dpApiService';
import { MessageBox } from '../common/MessageBox';
import { Spinner } from '../common/Spinner';
import Modal from '../common/Modal';

const AuditContent = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    // --- STATE FOR FILTERS AND VISIBILITY ---
    const [showFilters, setShowFilters] = useState(false); // New state to toggle filter visibility
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        user: '',
        action: '',
        status: ''
    });
    const [isExporting, setIsExporting] = useState(false);

    const fetchAuditLogs = async (currentFilters) => {
        setLoading(true);
        try {
            // Use passed filters or state, ensuring empty strings are not sent
            const activeFilters = Object.fromEntries(
                Object.entries(currentFilters || filters).filter(([_, v]) => v)
            );
            const data = await dpApiService.getAuditLogs(activeFilters);
            setAuditLogs(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs();
    }, []); // Initial fetch

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyFilters = () => {
        fetchAuditLogs(filters);
    };

    const handleClearFilters = () => {
        const clearedFilters = { startDate: '', endDate: '', user: '', action: '', status: '' };
        setFilters(clearedFilters);
        fetchAuditLogs(clearedFilters); // Immediately refetch with cleared filters
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
             const activeFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v)
            );
            // Assuming getReport is updated in dpApiService as per previous discussion
            const blob = await dpApiService.getReport('audit-logs', activeFilters);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit_report_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Failed to export report: ' + err.message);
        } finally {
            setIsExporting(false);
        }
    };

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

    return (
        <div>
            {/* --- Main Action Buttons --- */}
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex gap-2 ms-auto">
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowFilters(!showFilters)}>
                        <i className="bi bi-funnel me-1"></i>
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handleExport} disabled={isExporting}>
                        {isExporting ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : <i className="bi bi-download me-1"></i>}
                        Export PDF
                    </button>
                </div>
            </div>

            {/* --- COLLAPSIBLE FILTER PANEL --- */}
            {showFilters && (
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                         <div className="row g-3 align-items-end">
                            <div className="col-md-2">
                                <label className="form-label form-label-sm">Start Date</label>
                                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="form-control form-control-sm" />
                            </div>
                             <div className="col-md-2">
                                <label className="form-label form-label-sm">End Date</label>
                                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="form-control form-control-sm" />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label form-label-sm">User</label>
                                <input type="text" name="user" value={filters.user} onChange={handleFilterChange} className="form-control form-control-sm" placeholder="e.g., system"/>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label form-label-sm">Action</label>
                                <input type="text" name="action" value={filters.action} onChange={handleFilterChange} className="form-control form-control-sm" placeholder="e.g., CREATE_JOB"/>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label form-label-sm">Status</label>
                                <select name="status" value={filters.status} onChange={handleFilterChange} className="form-select form-select-sm">
                                    <option value="">All</option>
                                    <option value="SUCCESS">SUCCESS</option>
                                    <option value="FAILED">FAILED</option>
                                </select>
                            </div>
                            <div className="col-md-2 d-flex gap-2">
                               <button className="btn btn-primary btn-sm w-100" onClick={handleApplyFilters}>Filter</button>
                               <button className="btn btn-outline-secondary btn-sm w-100" onClick={handleClearFilters}>Clear</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {error && <MessageBox type="error" message={error} onClose={() => setError(null)} />}
            {loading ? <Spinner /> : (
                <>
                    {/* --- KPI cards --- */}
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
                    
                    {/* --- Audit Logs Table --- */}
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
                                                <td><small className="text-muted">{new Date(log.timestamp).toLocaleString()}</small></td>
                                                <td><small>{log.user}</small></td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <i className={`bi ${getActionIcon(log.action)} me-2`}></i>
                                                        <small>{log.action.replace(/_/g, ' ')}</small>
                                                    </div>
                                                </td>
                                                <td><small className="text-muted">{log.details}</small></td>
                                                <td><span className={`badge ${getStatusBadge(log.status)}`}>{log.status}</span></td>
                                                <td><small className="text-muted font-monospace">{log.ip_address}</small></td>
                                                <td>
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

                    {/* --- Information Box --- */}
                    <div className="mt-4">
                        <div className="alert alert-info">
                            <h6><i className="bi bi-shield-check me-2"></i>Audit Trail Information</h6>
                            <p className="mb-0 small">
                                All differential privacy operations are logged for compliance and security purposes. 
                                Logs include query execution, dataset management, and privacy budget operations.
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* --- Details Modal --- */}
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