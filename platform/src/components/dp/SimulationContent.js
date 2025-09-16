import React, { useState } from 'react';
import { MessageBox } from '../common/MessageBox';

const SimulationContent = () => {
  const [simulationConfig, setSimulationConfig] = useState({
    dataset: 'customer_events',
    mechanism: 'laplace',
    epsilon: 1.0,
    queries: 100,
    sensitivity: 1
  });
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleConfigChange = (field, value) => {
    setSimulationConfig(prev => ({ ...prev, [field]: value }));
  };

  const runSimulation = async () => {
    setIsRunning(true);
    // Simulate running time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock simulation results
    setResults({
      totalQueries: simulationConfig.queries,
      successRate: 98.5,
      avgNoise: 2.3,
      utilityScore: 85.2,
      privacyLoss: simulationConfig.epsilon * simulationConfig.queries,
      executionTime: 1.8,
      noiseDistribution: Array.from({ length: 10 }, () => Math.random() * 100)
    });
    setIsRunning(false);
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-sliders me-2"></i>
                Simulation Configuration
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Dataset</label>
                <select 
                  className="form-select"
                  value={simulationConfig.dataset}
                  onChange={(e) => handleConfigChange('dataset', e.target.value)}
                >
                  <option value="customer_events">Customer Events</option>
                  <option value="user_profiles">User Profiles</option>
                  <option value="sales_data">Sales Data</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Privacy Mechanism</label>
                <select 
                  className="form-select"
                  value={simulationConfig.mechanism}
                  onChange={(e) => handleConfigChange('mechanism', e.target.value)}
                >
                  <option value="laplace">Laplace</option>
                  <option value="gaussian">Gaussian</option>
                  <option value="exponential">Exponential</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Epsilon (ε)
                  <small className="text-muted ms-2">({simulationConfig.epsilon})</small>
                </label>
                <input 
                  type="range"
                  className="form-range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={simulationConfig.epsilon}
                  onChange={(e) => handleConfigChange('epsilon', parseFloat(e.target.value))}
                />
                <div className="d-flex justify-content-between small text-muted">
                  <span>More Private</span>
                  <span>Less Private</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Number of Queries</label>
                <input 
                  type="number"
                  className="form-control"
                  min="1"
                  max="1000"
                  value={simulationConfig.queries}
                  onChange={(e) => handleConfigChange('queries', parseInt(e.target.value))}
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Sensitivity</label>
                <input 
                  type="number"
                  className="form-control"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={simulationConfig.sensitivity}
                  onChange={(e) => handleConfigChange('sensitivity', parseFloat(e.target.value))}
                />
              </div>

              <button 
                className="btn btn-primary w-100"
                onClick={runSimulation}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <i className="bi bi-play me-2"></i>
                    Run Simulation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          {results ? (
            <div className="card shadow-sm">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="bi bi-graph-up me-2"></i>
                  Simulation Results
                </h6>
              </div>
              <div className="card-body">
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="text-center">
                      <h4 className="text-primary">{results.totalQueries}</h4>
                      <small className="text-muted">Total Queries</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <h4 className="text-success">{results.successRate}%</h4>
                      <small className="text-muted">Success Rate</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <h4 className="text-warning">{results.utilityScore}</h4>
                      <small className="text-muted">Utility Score</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <h4 className="text-info">{results.executionTime}s</h4>
                      <small className="text-muted">Execution Time</small>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <h6>Privacy Analysis</h6>
                    <div className="mb-2">
                      <div className="d-flex justify-content-between">
                        <span className="small">Total Privacy Loss</span>
                        <strong>{results.privacyLoss.toFixed(2)}</strong>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="d-flex justify-content-between">
                        <span className="small">Average Noise Added</span>
                        <strong>{results.avgNoise}</strong>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between">
                        <span className="small">Privacy-Utility Trade-off</span>
                        <span className="badge bg-success">Optimal</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6>Performance Metrics</h6>
                    <div className="mb-2">
                      <div className="d-flex justify-content-between">
                        <span className="small">Queries per Second</span>
                        <strong>{(results.totalQueries / results.executionTime).toFixed(1)}</strong>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="d-flex justify-content-between">
                        <span className="small">Memory Usage</span>
                        <strong>234 MB</strong>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between">
                        <span className="small">CPU Utilization</span>
                        <strong>45%</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h6>Noise Distribution Visualization</h6>
                  <div className="bg-light p-3 rounded">
                    <div className="d-flex align-items-end justify-content-around" style={{ height: '100px' }}>
                      {results.noiseDistribution.map((value, index) => (
                        <div
                          key={index}
                          className="bg-primary"
                          style={{
                            width: '20px',
                            height: `${value}%`,
                            minHeight: '5px'
                          }}
                          title={`Bin ${index + 1}: ${value.toFixed(1)}`}
                        ></div>
                      ))}
                    </div>
                    <div className="d-flex justify-content-between small text-muted mt-2">
                      <span>Low Noise</span>
                      <span>High Noise</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="alert alert-info">
                    <h6><i className="bi bi-lightbulb me-2"></i>Simulation Insights</h6>
                    <ul className="mb-0">
                      <li>The chosen epsilon value provides good privacy-utility balance</li>
                      <li>Success rate of {results.successRate}% indicates reliable mechanism performance</li>
                      <li>Consider reducing epsilon for stronger privacy if utility allows</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-3">
                  <button className="btn btn-outline-primary me-2">
                    <i className="bi bi-download me-1"></i>Export Results
                  </button>
                  <button className="btn btn-outline-secondary">
                    <i className="bi bi-share me-1"></i>Share Configuration
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <i className="bi bi-bar-chart" style={{ fontSize: '4rem', color: 'var(--bs-secondary)' }}></i>
                <h5 className="mt-3 text-muted">No Simulation Results</h5>
                <p className="text-muted mb-4">Configure your simulation parameters and click "Run Simulation" to see results</p>
                
                <div className="row text-start">
                  <div className="col-md-6">
                    <h6>What You Can Simulate:</h6>
                    <ul className="list-unstyled small">
                      <li><i className="bi bi-check text-success me-2"></i>Privacy mechanism performance</li>
                      <li><i className="bi bi-check text-success me-2"></i>Noise distribution analysis</li>
                      <li><i className="bi bi-check text-success me-2"></i>Privacy-utility trade-offs</li>
                      <li><i className="bi bi-check text-success me-2"></i>System performance metrics</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6>Simulation Benefits:</h6>
                    <ul className="list-unstyled small">
                      <li><i className="bi bi-check text-success me-2"></i>Test before production queries</li>
                      <li><i className="bi bi-check text-success me-2"></i>Optimize privacy parameters</li>
                      <li><i className="bi bi-check text-success me-2"></i>Understand mechanism behavior</li>
                      <li><i className="bi bi-check text-success me-2"></i>Performance benchmarking</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preset Configurations */}
      <div className="card shadow-sm mt-4">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="bi bi-bookmark me-2"></i>
            Preset Simulation Configurations
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <div className="card border">
                <div className="card-body">
                  <h6 className="card-title">High Privacy</h6>
                  <p className="card-text small text-muted">ε = 0.1, Strong privacy guarantees</p>
                  <button className="btn btn-outline-primary btn-sm">Use This Config</button>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border">
                <div className="card-body">
                  <h6 className="card-title">Balanced</h6>
                  <p className="card-text small text-muted">ε = 1.0, Privacy-utility balance</p>
                  <button className="btn btn-outline-primary btn-sm">Use This Config</button>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border">
                <div className="card-body">
                  <h6 className="card-title">High Utility</h6>
                  <p className="card-text small text-muted">ε = 5.0, Maximum data utility</p>
                  <button className="btn btn-outline-primary btn-sm">Use This Config</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationContent;
