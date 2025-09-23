import React, { useState } from 'react';
import { MessageBox } from '../common/MessageBox';

const SettingsContent = () => {
  const [settings, setSettings] = useState({
    globalEpsilon: 10.0,
    defaultMechanism: 'laplace',
    autoBackup: true,
    budgetAlerts: true,
    alertThreshold: 80,
    logRetention: 90,
    maxConcurrentQueries: 10
  });
  const [message, setMessage] = useState('');

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Mock save operation
    setMessage('Settings saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div>
      {message && <MessageBox message={message} type="success" onClose={() => setMessage('')} />}
      
      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-gear me-2"></i>
                General Settings
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Global Privacy Budget (ε)</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={settings.globalEpsilon}
                      onChange={(e) => handleSettingChange('globalEpsilon', parseFloat(e.target.value))}
                      step="0.1"
                      min="0.1"
                      max="100"
                    />
                    <div className="form-text">Total privacy budget across all datasets</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Default Privacy Mechanism</label>
                    <select 
                      className="form-select"
                      value={settings.defaultMechanism}
                      onChange={(e) => handleSettingChange('defaultMechanism', e.target.value)}
                    >
                      <option value="laplace">Laplace</option>
                      <option value="gaussian">Gaussian</option>
                      <option value="exponential">Exponential</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Budget Alert Threshold (%)</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={settings.alertThreshold}
                      onChange={(e) => handleSettingChange('alertThreshold', parseInt(e.target.value))}
                      min="1"
                      max="100"
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Log Retention (days)</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={settings.logRetention}
                      onChange={(e) => handleSettingChange('logRetention', parseInt(e.target.value))}
                      min="1"
                      max="365"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Max Concurrent Queries</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={settings.maxConcurrentQueries}
                      onChange={(e) => handleSettingChange('maxConcurrentQueries', parseInt(e.target.value))}
                      min="1"
                      max="100"
                    />
                  </div>

                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.autoBackup}
                        onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                      />
                      <label className="form-check-label">
                        Enable Automatic Backups
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.budgetAlerts}
                        onChange={(e) => handleSettingChange('budgetAlerts', e.target.checked)}
                      />
                      <label className="form-check-label">
                        Enable Budget Alerts
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button className="btn btn-primary me-2" onClick={handleSave}>
                  <i className="bi bi-check2 me-1"></i>
                  Save Settings
                </button>
                <button className="btn btn-outline-secondary">
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>

          <div className="card shadow-sm mt-4">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-shield-lock me-2"></i>
                Security Settings
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Access Control</h6>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" defaultChecked />
                    <label className="form-check-label">Require authentication for all operations</label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" defaultChecked />
                    <label className="form-check-label">Enable audit logging</label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label">Require approval for high-risk queries</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6>Data Protection</h6>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" defaultChecked />
                    <label className="form-check-label">Encrypt data at rest</label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" defaultChecked />
                    <label className="form-check-label">Encrypt data in transit</label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label">Enable data anonymization preview</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                System Information
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <small className="text-muted">Platform Version</small>
                <div><strong>v1.0.0-prototype</strong></div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Last Update</small>
                <div>September 8, 2024</div>
              </div>
              <div className="mb-3">
                <small className="text-muted">System Status</small>
                <div><span className="badge bg-success">Operational</span></div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Active Users</small>
                <div><strong>3</strong></div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Storage Used</small>
                <div>2.1 GB / 100 GB</div>
                <div className="progress mt-1" style={{ height: '4px' }}>
                  <div className="progress-bar" style={{ width: '2.1%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm mt-4">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-tools me-2"></i>
                System Tools
              </h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-download me-1"></i>
                  Export Configuration
                </button>
                <button className="btn btn-outline-secondary btn-sm">
                  <i className="bi bi-upload me-1"></i>
                  Import Configuration
                </button>
                <button className="btn btn-outline-info btn-sm">
                  <i className="bi bi-journal-text me-1"></i>
                  View System Logs
                </button>
                <button className="btn btn-outline-warning btn-sm">
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Restart Services
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsContent;
