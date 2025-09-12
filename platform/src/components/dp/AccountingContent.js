import React, { useState, useEffect } from 'react';
import { Spinner } from '../common/Spinner';
import { MessageBox } from '../common/MessageBox';
import { dpApiService } from '../../services/dpApiService';

const AccountingContent = () => {
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBudgetData = async () => {
    setLoading(true);
    try {
      const data = await dpApiService.getPrivacyBudget();
      setBudgetData(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const getBudgetStatusClass = (percentage) => {
    if (percentage >= 80) return 'bg-danger';
    if (percentage >= 60) return 'bg-warning';
    if (percentage >= 40) return 'bg-info';
    return 'bg-success';
  };

  const getBudgetStatusText = (percentage) => {
    if (percentage >= 80) return 'Critical';
    if (percentage >= 60) return 'High Usage';
    if (percentage >= 40) return 'Moderate';
    return 'Healthy';
  };

  if (loading) {
    return <Spinner text="Loading privacy budget data..." />;
  }

  if (error) {
    return <MessageBox message={error} type="error" />;
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex gap-2 ms-auto">
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchBudgetData}>
            <i className="bi bi-arrow-clockwise me-1"></i>Refresh
          </button>
          <button className="btn btn-outline-primary btn-sm">
            <i className="bi bi-download me-1"></i>Export Report
          </button>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="row mb-4">
        <div className="col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title d-flex align-items-center">
                <i className="bi bi-calculator me-2"></i>
                Privacy Budget Overview
              </h5>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Total Budget</span>
                    <strong className="fs-5">{budgetData.total_budget.toFixed(1)}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Used Budget</span>
                    <strong className="fs-5 text-primary">{budgetData.used_budget.toFixed(1)}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">Remaining</span>
                    <strong className="fs-5 text-success">{budgetData.remaining_budget.toFixed(1)}</strong>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="text-center">
                    <div 
                      className="progress mx-auto mb-3" 
                      style={{ width: '150px', height: '150px', borderRadius: '50%', position: 'relative' }}
                    >
                      <svg width="150" height="150" className="position-absolute">
                        <circle
                          cx="75"
                          cy="75"
                          r="60"
                          stroke="#e9ecef"
                          strokeWidth="12"
                          fill="transparent"
                        />
                        <circle
                          cx="75"
                          cy="75"
                          r="60"
                          stroke="#0d6efd"
                          strokeWidth="12"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 60}`}
                          strokeDashoffset={`${2 * Math.PI * 60 * (1 - budgetData.percentage_used / 100)}`}
                          transform="rotate(-90 75 75)"
                          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                        />
                      </svg>
                      <div 
                        className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center flex-column"
                      >
                        <strong className="fs-3">{budgetData.percentage_used}%</strong>
                        <small className="text-muted">Used</small>
                      </div>
                    </div>
                    <div>
                      <span className={`badge ${getBudgetStatusClass(budgetData.percentage_used)} fs-6`}>
                        {getBudgetStatusText(budgetData.percentage_used)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="card-title">
                <i className="bi bi-shield-check me-2"></i>
                Budget Health
              </h6>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <small>Current Usage</small>
                  <small>{budgetData.percentage_used}%</small>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className={`progress-bar ${getBudgetStatusClass(budgetData.percentage_used)}`}
                    style={{ width: `${budgetData.percentage_used}%` }}
                  ></div>
                </div>
              </div>

              <div className="small">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-circle-fill text-success me-2" style={{ fontSize: '0.5rem' }}></i>
                  <span>0-40%: Healthy</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-circle-fill text-info me-2" style={{ fontSize: '0.5rem' }}></i>
                  <span>40-60%: Moderate</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-circle-fill text-warning me-2" style={{ fontSize: '0.5rem' }}></i>
                  <span>60-80%: High Usage</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-circle-fill text-danger me-2" style={{ fontSize: '0.5rem' }}></i>
                  <span>80%+: Critical</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Budget Breakdown */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="bi bi-pie-chart me-2"></i>
            Budget Usage by Dataset
          </h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th>Dataset</th>
                  <th>Budget Used</th>
                  <th>Percentage of Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgetData.datasets.map((dataset, index) => {
                  const percentageOfTotal = (dataset.budget_used / budgetData.total_budget) * 100;
                  return (
                    <tr key={index}>
                      <td>
                        <strong>{dataset.name}</strong>
                      </td>
                      <td>
                        <strong>{dataset.budget_used.toFixed(2)}</strong>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress me-2" style={{ width: '100px', height: '6px' }}>
                            <div 
                              className="progress-bar bg-primary" 
                              style={{ width: `${percentageOfTotal}%` }}
                            ></div>
                          </div>
                          <small>{percentageOfTotal.toFixed(1)}%</small>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getBudgetStatusClass(percentageOfTotal * 2.5)}`}>
                          {getBudgetStatusText(percentageOfTotal * 2.5)}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary btn-sm" title="View Details">
                            <i className="bi bi-eye"></i>
                          </button>
                          <button className="btn btn-outline-secondary btn-sm" title="Reset Budget">
                            <i className="bi bi-arrow-clockwise"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Budget Management Actions */}
      <div className="row">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="card-title">
                <i className="bi bi-gear me-2"></i>
                Budget Management
              </h6>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-plus-lg me-1"></i>
                  Allocate Additional Budget
                </button>
                <button className="btn btn-outline-warning btn-sm">
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Reset Dataset Budget
                </button>
                <button className="btn btn-outline-danger btn-sm">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Set Budget Alerts
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="card-title">
                <i className="bi bi-info-circle me-2"></i>
                Privacy Budget Guide
              </h6>
              <ul className="small list-unstyled">
                <li className="mb-2">
                  <i className="bi bi-check2 text-success me-2"></i>
                  Lower epsilon values provide stronger privacy
                </li>
                <li className="mb-2">
                  <i className="bi bi-check2 text-success me-2"></i>
                  Budget is consumed with each query execution
                </li>
                <li className="mb-2">
                  <i className="bi bi-check2 text-success me-2"></i>
                  Monitor usage to maintain privacy guarantees
                </li>
                <li>
                  <i className="bi bi-check2 text-success me-2"></i>
                  Reset budgets periodically for ongoing analysis
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingContent;
