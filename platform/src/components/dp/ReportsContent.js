import React, { useState } from 'react';

const ReportsContent = () => {
  const [reports] = useState([
    {
      id: 1,
      name: 'Daily Privacy Budget Report',
      type: 'Budget Analysis',
      lastGenerated: '2024-09-08 09:30',
      status: 'Available',
      size: '2.3 MB'
    },
    {
      id: 2,
      name: 'Query Performance Analytics',
      type: 'Performance',
      lastGenerated: '2024-09-07 18:45',
      status: 'Available', 
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'Mechanism Usage Summary',
      type: 'Usage Analytics',
      lastGenerated: '2024-09-06 14:20',
      status: 'Available',
      size: '945 KB'
    }
  ]);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex gap-2 ms-auto">
          <button className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-gear me-1"></i>Schedule Reports
          </button>
          <button className="btn btn-primary btn-sm">
            <i className="bi bi-plus-lg me-1"></i>Generate Report
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h4 className="text-primary">{reports.length}</h4>
              <p className="mb-0 small text-muted">Available Reports</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h4 className="text-success">12</h4>
              <p className="mb-0 small text-muted">Scheduled Reports</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h4 className="text-info">45</h4>
              <p className="mb-0 small text-muted">Reports This Month</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Report Name</th>
                  <th>Type</th>
                  <th>Last Generated</th>
                  <th>Status</th>
                  <th>Size</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id}>
                    <td>
                      <strong>{report.name}</strong>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">{report.type}</span>
                    </td>
                    <td>
                      <small className="text-muted">{report.lastGenerated}</small>
                    </td>
                    <td>
                      <span className="badge bg-success">{report.status}</span>
                    </td>
                    <td>
                      <small>{report.size}</small>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary btn-sm">
                          <i className="bi bi-download"></i>
                        </button>
                        <button className="btn btn-outline-secondary btn-sm">
                          <i className="bi bi-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsContent;
