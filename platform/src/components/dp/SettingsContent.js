import React, { useState, useEffect } from 'react';
import { MessageBox } from '../common/MessageBox';
import { dpApiService } from '../../services/dpApiService';
import { Spinner } from '../common/Spinner';

const SettingsContent = () => {
  const [settings, setSettings] = useState(null);
  const [initialSettings, setInitialSettings] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch settings when the component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await dpApiService.getSettings();
        setSettings(data);
        setInitialSettings(data); // Store the initial state for the reset functionality
      } catch (err) {
        setError('Failed to load settings. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setError('');
      const updatedSettings = await dpApiService.updateSettings(settings);
      setSettings(updatedSettings);
      setInitialSettings(updatedSettings); // Update the reset state to the new saved state
      setMessage('Settings saved successfully!');
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setMessage('');
        setError('');
      }, 3000);
    }
  };

  // Resets the form to the last saved state
  const handleReset = () => {
    setSettings(initialSettings);
  };

  if (isLoading && !settings) {
    return <Spinner />;
  }

  if (error && !settings) {
    return <MessageBox message={error} type="error" onClose={() => setError('')} />;
  }

  return (
    <div>
      {message && <MessageBox message={message} type="success" onClose={() => setMessage('')} />}
      {error && <MessageBox message={error} type="error" onClose={() => setError('')} />}
      
      <div className="row">
        <div className="col-lg-8">
          {settings && (
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
                        value={settings.global_epsilon}
                        onChange={(e) => handleSettingChange('global_epsilon', parseFloat(e.target.value))}
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
                        value={settings.default_mechanism}
                        onChange={(e) => handleSettingChange('default_mechanism', e.target.value)}
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
                        value={settings.alert_threshold}
                        onChange={(e) => handleSettingChange('alert_threshold', parseInt(e.target.value))}
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
                        value={settings.log_retention}
                        onChange={(e) => handleSettingChange('log_retention', parseInt(e.target.value))}
                        min="1"
                        max="365"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Max Concurrent Queries</label>
                      <input 
                        type="number"
                        className="form-control"
                        value={settings.max_concurrent_queries}
                        onChange={(e) => handleSettingChange('max_concurrent_queries', parseInt(e.target.value))}
                        min="1"
                        max="100"
                      />
                    </div>

                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.auto_backup}
                          onChange={(e) => handleSettingChange('auto_backup', e.target.checked)}
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
                          checked={settings.budget_alerts}
                          onChange={(e) => handleSettingChange('budget_alerts', e.target.checked)}
                        />
                        <label className="form-check-label">
                          Enable Budget Alerts
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button className="btn btn-primary me-2" onClick={handleSave} disabled={isLoading}>
                    {isLoading ? <Spinner small={true} /> : <i className="bi bi-check2 me-1"></i>}
                    Save Settings
                  </button>
                  <button className="btn btn-outline-secondary" onClick={handleReset} disabled={isLoading}>
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Reset to Defaults
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="card shadow-sm mt-4">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-shield-lock me-2"></i>
                Security Settings
              </h6>
            </div>
            <div className="card-body">
              <div className="alert alert-info mb-0">
                Security settings are managed by the system administrator and will be available in a future update.
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
                <div>September 23, 2025</div>
              </div>
              <div className="mb-3">
                <small className="text-muted">System Status</small>
                <div><span className="badge bg-success">Operational</span></div>
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
