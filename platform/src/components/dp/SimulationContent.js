import React, { useState, useEffect } from 'react';
import { dpApiService } from '../../services/dpApiService';
import { Spinner } from '../common/Spinner';
import { MessageBox } from '../common/MessageBox';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SimulationContent = () => {
    // Form State
    const [datasets, setDatasets] = useState([]);
    const [columns, setColumns] = useState([]);
    const [simulationConfig, setSimulationConfig] = useState({
        dataset_id: '',
        column_name: '',
        query_type: 'mean',
        mechanism: 'laplace',
        epsilon: 1.0,
        queries: 100,
        sensitivity: 1,
        delta: 0.00001
    });
    
    // App & Result State
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDatasets = async () => {
            try {
                const data = await dpApiService.getDatasets();
                setDatasets(data || []);
            } catch (err) {
                setError('Could not fetch datasets.');
            } finally {
                setLoading(false);
            }
        };
        fetchDatasets();
    }, []);

    const handleConfigChange = (field, value) => {
        setSimulationConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleDatasetChange = async (e) => {
        const datasetId = e.target.value;
        handleConfigChange('dataset_id', datasetId);
        setColumns([]);
        handleConfigChange('column_name', '');
        setResults(null);

        if (datasetId) {
            try {
                const datasetDetails = await dpApiService.getDataset(datasetId);
                const numericColumns = datasetDetails.columns.filter(c => ['int64', 'float64', 'int32', 'float32'].includes(c.dtype));
                setColumns(numericColumns || []);
            } catch (err) {
                setError(`Could not fetch columns for dataset ${datasetId}.`);
            }
        }
    };

    const runSimulation = async () => {
        if (!simulationConfig.dataset_id || !simulationConfig.column_name) {
            alert('Please select a dataset and a numerical column.');
            return;
        }
        setIsRunning(true);
        setError('');
        setResults(null);
        try {
            const apiPayload = { ...simulationConfig };
            const data = await dpApiService.runSimulation(apiPayload);
            setResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsRunning(false);
        }
    };
    
    const applyPreset = (epsilon) => {
        handleConfigChange('epsilon', epsilon);
    };

    const exportResults = () => {
        if (!results) return;
        const csvContent = "data:text/csv;charset=utf-8," 
            + "metric,value\n"
            + `totalQueries,${results.totalQueries}\n`
            + `successRate,${results.successRate}\n`
            + `avgNoise,${results.avgNoise}\n`
            + `utilityScore,${results.utilityScore}\n`
            + `privacyLoss,${results.privacyLoss}\n`
            + `executionTime,${results.executionTime}\n`
            + `trueResult,${results.trueResult}\n`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "simulation_results.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- NEW SHARING FUNCTIONS ---
    const getFormattedConfig = () => JSON.stringify(simulationConfig, null, 2);

    const shareByEmail = () => {
        const subject = "DP Simulation Configuration";
        const body = `Here is the simulation configuration I used:\n\n${getFormattedConfig()}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const saveAsJson = () => {
        const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(getFormattedConfig());
        const link = document.createElement("a");
        link.setAttribute("href", jsonContent);
        link.setAttribute("download", "simulation_config.json");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(getFormattedConfig())
            .then(() => alert('Simulation configuration copied to clipboard!'))
            .catch(() => alert('Failed to copy configuration.'));
    };
    
    const chartData = {
        labels: results?.noiseDistribution.bins.slice(0, -1).map((bin, i) => `${bin} to ${results.noiseDistribution.bins[i+1]}`),
        datasets: [{
            label: '# of Results in Noise Bin',
            data: results?.noiseDistribution.values,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };

    return (
        <div>
            {error && <MessageBox type="error" message={error} onClose={() => setError('')}/>}
            <div className="row">
                <div className="col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-header"><h6 className="mb-0"><i className="bi bi-sliders me-2"></i>Simulation Configuration</h6></div>
                        <div className="card-body">
                            {loading ? <Spinner /> : (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label">Dataset</label>
                                        <select className="form-select" value={simulationConfig.dataset_id} onChange={handleDatasetChange}>
                                            <option value="">Select a Dataset</option>
                                            {datasets.map(ds => <option key={ds.id} value={ds.id}>{ds.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Column (Numerical)</label>
                                        <select className="form-select" value={simulationConfig.column_name} onChange={(e) => handleConfigChange('column_name', e.target.value)} disabled={!simulationConfig.dataset_id}>
                                            <option value="">Select a Column</option>
                                            {columns.map(col => <option key={col.id} value={col.name}>{col.name} ({col.dtype})</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Query Type</label>
                                        <select className="form-select" value={simulationConfig.query_type} onChange={(e) => handleConfigChange('query_type', e.target.value)}>
                                            <option value="mean">Mean</option>
                                            <option value="sum">Sum</option>
                                            <option value="count">Count</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Privacy Mechanism</label>
                                        <select className="form-select" value={simulationConfig.mechanism} onChange={(e) => handleConfigChange('mechanism', e.target.value)}>
                                            <option value="laplace">Laplace</option>
                                            <option value="gaussian">Gaussian</option>
                                            <option value="exponential" disabled>Exponential (coming soon)</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Epsilon (ε)<small className="text-muted ms-2">({simulationConfig.epsilon})</small></label>
                                        <input type="range" className="form-range" min="0.1" max="10" step="0.1" value={simulationConfig.epsilon} onChange={(e) => handleConfigChange('epsilon', parseFloat(e.target.value))} />
                                        <div className="d-flex justify-content-between small text-muted"><span>More Private</span><span>Less Private</span></div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Number of Queries</label>
                                        <input type="number" className="form-control" min="1" max="1000" value={simulationConfig.queries} onChange={(e) => handleConfigChange('queries', parseInt(e.target.value))} />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label">Sensitivity</label>
                                        <input type="number" className="form-control" min="0.1" max="1000" step="0.1" value={simulationConfig.sensitivity} onChange={(e) => handleConfigChange('sensitivity', parseFloat(e.target.value))} />
                                    </div>
                                    <button className="btn btn-primary w-100" onClick={runSimulation} disabled={isRunning || !simulationConfig.column_name}>
                                        {isRunning ? <><span className="spinner-border spinner-border-sm me-2"></span>Running...</> : <><i className="bi bi-play me-2"></i>Run Simulation</>}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-lg-8">
                    {isRunning ? <div className="card shadow-sm"><div className="card-body text-center py-5"><Spinner /></div></div> : results ? (
                         <div className="card shadow-sm">
                           <div className="card-header"><h6 className="mb-0"><i className="bi bi-graph-up me-2"></i>Simulation Results</h6></div>
                           <div className="card-body">
                             <div className="row mb-4">
                               <div className="col-md-3 text-center"><h4 className="text-primary">{results.totalQueries}</h4><small className="text-muted">Total Queries</small></div>
                               <div className="col-md-3 text-center"><h4 className="text-success">{results.successRate}%</h4><small className="text-muted">Success Rate</small></div>
                               <div className="col-md-3 text-center"><h4 className="text-warning">{results.utilityScore}</h4><small className="text-muted">Utility Score</small></div>
                               <div className="col-md-3 text-center"><h4 className="text-info">{results.executionTime}s</h4><small className="text-muted">Execution Time</small></div>
                             </div>
                             <div className="row">
                               <div className="col-md-6">
                                 <h6>Privacy Analysis</h6>
                                 <div className="mb-2"><div className="d-flex justify-content-between"><span className="small">Total Privacy Loss</span><strong>{results.privacyLoss.toFixed(2)}</strong></div></div>
                                 <div className="mb-2"><div className="d-flex justify-content-between"><span className="small">Average Noise Added</span><strong>{results.avgNoise}</strong></div></div>
                                 <div className="mb-3"><div className="d-flex justify-content-between"><span className="small">True Result</span><strong>{results.trueResult}</strong></div></div>
                               </div>
                               <div className="col-md-6">
                                 <h6>Performance Metrics</h6>
                                 <div className="mb-2"><div className="d-flex justify-content-between"><span className="small">Queries per Second</span><strong>{results.executionTime > 0 ? (results.totalQueries / results.executionTime).toFixed(1) : 'N/A'}</strong></div></div>
                                 <div className="mb-2"><div className="d-flex justify-content-between"><span className="small">Memory Usage</span><strong>(Not Measured)</strong></div></div>
                                 <div className="mb-3"><div className="d-flex justify-content-between"><span className="small">CPU Utilization</span><strong>(Not Measured)</strong></div></div>
                               </div>
                             </div>
                             <div className="mt-4">
                               <h6>Noise Distribution (Difference from True Result)</h6>
                               <Bar data={chartData} options={{ scales: { x: { title: { display: true, text: 'Noise Value Bins' } }, y: { title: { display: true, text: 'Number of Results' } } } }} />
                             </div>
                             <div className="mt-3">
                                <button className="btn btn-outline-primary me-2" onClick={exportResults}>
                                  <i className="bi bi-download me-1"></i>Export Results
                                </button>
                                {/* --- THIS IS THE NEW SHARE BUTTON DROPDOWN --- */}
                                <div className="btn-group">
                                    <button type="button" className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i className="bi bi-share me-1"></i>Share Configuration
                                    </button>
                                    <ul className="dropdown-menu">
                                        <li><a className="dropdown-item" href="#" onClick={copyToClipboard}><i className="bi bi-clipboard me-2"></i>Copy to Clipboard</a></li>
                                        <li><a className="dropdown-item" href="#" onClick={saveAsJson}><i className="bi bi-file-earmark-code me-2"></i>Save as JSON</a></li>
                                        <li><a className="dropdown-item" href="#" onClick={shareByEmail}><i className="bi bi-envelope me-2"></i>Share via Email</a></li>
                                    </ul>
                                </div>
                              </div>
                           </div>
                         </div>
                    ) : (
                        <div className="card shadow-sm"><div className="card-body text-center py-5"><i className="bi bi-bar-chart" style={{ fontSize: '4rem', color: 'var(--bs-secondary)' }}></i><h5 className="mt-3 text-muted">No Simulation Results</h5><p className="text-muted mb-4">Configure and run a simulation to see results.</p></div></div>
                    )}
                </div>
            </div>
            <div className="card shadow-sm mt-4">
                <div className="card-header"><h6 className="mb-0"><i className="bi bi-bookmark me-2"></i>Preset Simulation Configurations</h6></div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4"><div className="card border"><div className="card-body"><h6 className="card-title">High Privacy</h6><p className="card-text small text-muted">ε = 0.1, Strong privacy</p><button className="btn btn-outline-primary btn-sm" onClick={() => applyPreset(0.1)}>Use This Config</button></div></div></div>
                        <div className="col-md-4"><div className="card border"><div className="card-body"><h6 className="card-title">Balanced</h6><p className="card-text small text-muted">ε = 1.0, Good balance</p><button className="btn btn-outline-primary btn-sm" onClick={() => applyPreset(1.0)}>Use This Config</button></div></div></div>
                        <div className="col-md-4"><div className="card border"><div className="card-body"><h6 className="card-title">High Utility</h6><p className="card-text small text-muted">ε = 5.0, Maximum utility</p><button className="btn btn-outline-primary btn-sm" onClick={() => applyPreset(5.0)}>Use This Config</button></div></div></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimulationContent;