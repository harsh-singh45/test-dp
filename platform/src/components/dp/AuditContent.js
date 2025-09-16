import React, { useState } from 'react';

const AuditContent = () => {
  const [auditLogs] = useState([
    {
      id: 'audit_001',
      timestamp: '2024-09-08 10:45:23',
      user: 'admin@dp-platform.com',
      action: 'QUERY_EXECUTED',
      details: 'COUNT(*) on customer_events with ε=0.1',
      status: 'SUCCESS',
      ip: '192.168.1.100'
    },
    {
      id: 'audit_002', 
      timestamp: '2024-09-08 10:42:17',
      user: 'analyst@dp-platform.com',
      action: 'DATASET_REGISTERED',
      details: 'New dataset: sales_data_q3',
      status: 'SUCCESS',
      ip: '192.168.1.101'
    },
    {
      id: 'audit_003',
      timestamp: '2024-09-08 10:38:45',
      user: 'admin@dp-platform.com', 
      action: 'BUDGET_RESET',
      details: 'Privacy budget reset for user_profiles',
      status: 'SUCCESS',
      ip: '192.168.1.100'
    },
    {
      id: 'audit_004',
      timestamp: '2024-09-08 10:35:12',
      user: 'user@dp-platform.com',
      action: 'QUERY_FAILED',
      details: 'SUM(revenue) failed: insufficient budget',
      status: 'FAILED',
      ip: '192.168.1.102'
    }
  ]);

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

  return (
    <div>
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
              <h4 className="text-primary">{auditLogs.length}</h4>
              <p className="mb-0 small text-muted">Total Events</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h4 className="text-success">{auditLogs.filter(log => log.status === 'SUCCESS').length}</h4>
              <p className="mb-0 small text-muted">Successful</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h4 className="text-danger">{auditLogs.filter(log => log.status === 'FAILED').length}</h4>
              <p className="mb-0 small text-muted">Failed</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h4 className="text-info">3</h4>
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
                      <small className="text-muted">{log.timestamp}</small>
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
                      <small className="text-muted font-monospace">{log.ip}</small>
                    </td>
                    <td>
                      <button className="btn btn-outline-primary btn-sm">
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

      <div className="mt-4">
        <div className="alert alert-info">
          <h6><i className="bi bi-shield-check me-2"></i>Audit Trail Information</h6>
          <p className="mb-0 small">
            All differential privacy operations are logged for compliance and security purposes. 
            Logs include query execution, dataset management, and privacy budget operations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuditContent;
