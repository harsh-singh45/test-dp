import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import Link from "next/link";
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DpLandingPage() {
  const recentQueries = [
    { id: 'dp_001', query: 'COUNT(*)', status: 'Completed', dataset: 'customer_events', epsilon: 0.1, mechanism: 'Laplace', time: '2 mins ago' },
    { id: 'dp_002', query: 'AVG(age)', status: 'Running', dataset: 'user_profiles', epsilon: 0.5, mechanism: 'Gaussian', time: '5 mins ago' },
    { id: 'dp_003', query: 'HISTOGRAM(region)', status: 'Completed', dataset: 'sales_data', epsilon: 0.2, mechanism: 'Exponential', time: '12 mins ago' },
    { id: 'dp_004', query: 'SUM(revenue)', status: 'Failed', dataset: 'financial_q3', epsilon: 1.0, mechanism: 'Laplace', time: '20 mins ago' },
    { id: 'dp_005', query: 'COUNT DISTINCT', status: 'Completed', dataset: 'user_sessions', epsilon: 0.3, mechanism: 'Gaussian', time: '25 mins ago' }
  ];

  // Chart data
  const privacyBudgetOverTime = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Privacy Budget Consumed',
        data: [0.8, 1.2, 0.9, 1.5, 1.1, 0.7, 1.3],
        fill: true,
        backgroundColor: 'rgba(102, 16, 242, 0.1)',
        borderColor: '#6610f2',
        tension: 0.4
      },
      {
        label: 'Budget Limit',
        data: [10, 10, 10, 10, 10, 10, 10],
        borderColor: '#401884',
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0
      }
    ]
  };

  const mechanismDistribution = {
    labels: ['Laplace', 'Gaussian', 'Exponential', 'Geometric'],
    datasets: [
      {
        data: [45, 30, 15, 10],
        backgroundColor: [
          '#6610f2',
          '#401884',
          '#8b5dba',
          '#6c757d'
        ],
        borderColor: [
          '#6610f2',
          '#401884',
          '#8b5dba',
          '#6c757d'
        ],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  return (
    <ProtectedRoute>
      {() => (
        <>
          <Head>
            <title>DP Dashboard - Differential Privacy Analytics</title>
          </Head>
          <Header />
          
          <div className="container mt-5" style={{ paddingTop: '76px' }}>
            {/* Page Header */}
            <div className="row mt-4">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h1 className="mb-2">
                      Differential Privacy
                    </h1>
                  </div>
                </div>
              </div>
              
              {/* DP Navigation Ribbon */}
              <div className="col-lg-12 mb-4 topRibbon mt-4">
                <ul className="list-unstyled d-flex flex-wrap gap-4 justify-content-start">
                  <li className="ribbon-item">
                    <Link href="/dp/dataset">
                      <div className="ribbon-icon">
                        <i className="bi bi-database"></i>
                      </div>
                      <span className="ribbon-label">Datasets</span>
                    </Link>
                  </li>
                  <li className="ribbon-item">
                    <Link href="/dp/mechanisms">
                      <div className="ribbon-icon">
                        <i className="bi bi-diagram-3"></i>
                      </div>
                      <span className="ribbon-label">Mechanisms</span>
                    </Link>
                  </li>
                  <li className="ribbon-item">
                    <Link href="/dp/queries">
                      <div className="ribbon-icon">
                        <i className="bi bi-braces-asterisk"></i>
                      </div>
                      <span className="ribbon-label">Queries</span>
                    </Link>
                  </li>
                  <li className="ribbon-item">
                    <Link href="/dp/accounting">
                      <div className="ribbon-icon">
                        <i className="bi bi-calculator"></i>
                      </div>
                      <span className="ribbon-label">Privacy Accounting</span>
                    </Link>
                  </li>
                  <li className="ribbon-item">
                    <Link href="/dp/simulation">
                      <div className="ribbon-icon">
                        <i className="bi bi-bar-chart"></i>
                      </div>
                      <span className="ribbon-label">Simulation</span>
                    </Link>
                  </li>
                  <li className="ribbon-item">
                    <Link href="/dp/reports">
                      <div className="ribbon-icon">
                        <i className="bi bi-file-earmark-text"></i>
                      </div>
                      <span className="ribbon-label">Reports</span>
                    </Link>
                  </li>
                  <li className="ribbon-item">
                    <Link href="/dp/audit">
                      <div className="ribbon-icon">
                        <i className="bi bi-clipboard-data"></i>
                      </div>
                      <span className="ribbon-label">Audit Log</span>
                    </Link>
                  </li>
                  <li className="ribbon-item">
                    <Link href="/dp/settings">
                      <div className="ribbon-icon">
                        <i className="bi bi-gear"></i>
                      </div>
                      <span className="ribbon-label">Settings</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Metrics Overview */}
            <div className="row mb-4">
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="card border-1 info-card h-100 d-flex flex-column">
                  <div className="card-body flex-grow-1">
                    <h1>Query Analytics & Performance</h1>
                    <p>Track your differential privacy queries, success rates, and system performance metrics in real-time.</p>
                    <ul className="list-unstyled api-request">
                      <li className="bi bi-clipboard2-check">Total Queries: <strong>1,247</strong></li>
                      <li className="bi bi-clipboard2-check-fill">Success Rate: <strong>99.2%</strong></li>
                      <li className="bi bi-speedometer2">Avg Query Time: <strong>1.2s</strong></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-lg-6 col-md-6 mb-4">
                <div className="card border-1 info-card h-100 d-flex flex-column">
                  <div className="card-body flex-grow-1">
                    <h1>Privacy Budget & Data Status</h1>
                    <p>Monitor privacy budget consumption, dataset activity, and data volume across your differential privacy operations.</p>
                    <ul className="list-unstyled api-request">
                      <li className="bi bi-clipboard2-check">Active Datasets: <strong>23</strong></li>
                      <li className="bi bi-shield-check">Privacy Budget Used: <strong>35%</strong></li>
                      <li className="bi bi-hdd">Data Volume: <strong>2.1TB</strong></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="row mb-4">
              <div className="col-lg-8 mb-4">
                <div className="card border-1 info-card h-100">
                  <div className="card-body d-flex flex-column flex-grow-1">
                    <h1>Privacy Budget & Mechanism Insights</h1>
                    <div className="row">
                      <div className="col-md-8">
                        <h6 className="mb-3">Privacy Budget Consumption Over Time</h6>
                        <Line data={privacyBudgetOverTime} options={chartOptions} />
                      </div>
                      <div className="col-md-4">
                        <h6 className="mb-3">Mechanism Distribution</h6>
                        <Doughnut data={mechanismDistribution} options={pieOptions} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-4 mb-4">
                {/* Empty space */}
              </div>
            </div>

            {/* Recent Queries and System Status */}
            <div className="row mb-4">
              <div className="col-lg-8 mb-4">
                <div className="card border-1 info-card h-100 d-flex flex-column">
                  <div className="card-body d-flex flex-column flex-grow-1">
                    <h1>Recent DP Queries</h1>
                    <div className="table-responsive">
                      <table className="table table-hover table-sm">
                        <thead>
                          <tr>
                            <th>Query ID</th>
                            <th>Query</th>
                            <th>Dataset</th>
                            <th>ε</th>
                            <th>Mechanism</th>
                            <th>Status</th>
                            <th>Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentQueries.map(query => (
                            <tr key={query.id}>
                              <td><small className="text-muted">{query.id}</small></td>
                              <td><strong>{query.query}</strong></td>
                              <td><small className="text-muted">{query.dataset}</small></td>
                              <td><small className="text-muted">{query.epsilon}</small></td>
                              <td>
                                <small className="text-muted">
                                  {query.mechanism}
                                </small>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {query.status}
                                </small>
                              </td>
                              <td><small className="text-muted">{query.time}</small></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-auto">
                      <Link className="btn btn-primary" href="/dp/queries">View All Queries</Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 mb-4">
                <div className="card border-1 info-card h-100 d-flex flex-column">
                  <div className="card-body flex-grow-1">
                    <h1>System Status</h1>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small text-muted">Privacy Engine</span>
                        <span className="badge bg-success">Online</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small text-muted">Query Processor</span>
                        <span className="badge bg-success">Active</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small text-muted">Budget Accountant</span>
                        <span className="badge bg-success">Healthy</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small text-muted">Data Storage</span>
                        <span className="badge bg-warning">78% Used</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info Cards */}
            <div className="row mb-5">
              <div className="col-lg-4 mb-4">
                <div className="card border-1 info-card h-100 d-flex flex-column">
                  <div className="card-body flex-grow-1 d-flex flex-column">
                    <h1>Privacy Guarantees</h1>
                    <p>Rigorous privacy protection with mathematical guarantees for all differential privacy operations.</p>
                    <ul className="list-unstyled api-request">
                      <li className="bi bi-shield-check">Formal Privacy Bounds</li>
                      <li className="bi bi-shield-check">Composition Tracking</li>
                      <li className="bi bi-shield-check">Budget Management</li>
                      <li className="bi bi-shield-check">Audit Compliance</li>
                    </ul>
                    <div className="mt-auto">
                      <Link href="/dp/accounting" className="btn btn-primary">View Budget Status</Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 mb-4">
                <div className="card border-1 info-card h-100 d-flex flex-column">
                  <div className="card-body flex-grow-1 d-flex flex-column">
                    <h1>Performance Insights</h1>
                    <p>Current system performance and optimization metrics for differential privacy operations.</p>
                    <ul className="list-unstyled api-request">
                      <li className="bi bi-speedometer2">Avg Query Time: <strong>1.2s</strong></li>
                      <li className="bi bi-cpu">CPU Utilization: <strong>45%</strong></li>
                      <li className="bi bi-memory">Memory Usage: <strong>2.1GB</strong></li>
                      <li className="bi bi-hdd">Throughput: <strong>250 queries/min</strong></li>
                    </ul>
                    <div className="mt-auto">
                      <Link href="/dp/simulation" className="btn btn-primary">Run Performance Test</Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 mb-4">
                <div className="card border-1 info-card h-100 d-flex flex-column">
                  <div className="card-body d-flex flex-column flex-grow-1">
                    <h1>Resources & Documentation</h1>
                    <p>Access guides, examples, and support for differential privacy implementation and best practices.</p>
                    <ul className="list-unstyled api-request">
                      <li className="bi bi-arrow-right-short">
                        <a href="#">DP Developer Guide</a>
                      </li>
                      <li className="bi bi-arrow-right-short">
                        <a href="#">Privacy Budget Guide</a>
                      </li>
                      <li className="bi bi-arrow-right-short">
                        <a href="#">Mechanism Selection</a>
                      </li>
                      <li className="bi bi-arrow-right-short">
                        <a href="#">API Reference</a>
                      </li>
                    </ul>
                    <div className="mt-auto">
                      <Link href="/dp/settings" className="btn btn-primary">View Documentation</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Footer />
        </>
      )}
    </ProtectedRoute>
  );
}
