// In frontend/src/components/views/CreateDPJobView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Spinner } from '../common/Spinner';
import { MessageBox } from '../common/MessageBox';

// Corrected, self-contained debounce hook
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set up a timer to update the debounced value after the delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up the timer if the value changes before the delay has passed
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Only re-run if value or delay changes

    return debouncedValue;
};


const API_BASE_URL = "http://localhost:8000";
const AVAILABLE_METRICS = ["count", "sum", "mean", "median", "variance", "std", "min", "max","histogram"];

export function CreateDPJobView({ datasetId, onBackClick, onComplete }) {
    const [step, setStep] = useState(1);
    
    // Form state
    const [selectedDatasetId, setSelectedDatasetId] = useState(datasetId || '');
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [selectedMetrics, setSelectedMetrics] = useState(['mean', 'count']);
    const [epsilon, setEpsilon] = useState(1.0);
    const [budgets, setBudgets] = useState([]); // NEW: For budget list
    const [selectedBudgetId, setSelectedBudgetId] = useState(''); // NEW: For selected budget

    // Data fetching state
    const [datasets, setDatasets] = useState([]);
    const [selectedDatasetSchema, setSelectedDatasetSchema] = useState(null);
    
    // Utility Preview State
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [previewError, setPreviewError] = useState('');
    const [previewColumn, setPreviewColumn] = useState('');
    const [previewMetric, setPreviewMetric] = useState('mean');

    // API submission state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [jobResult, setJobResult] = useState(null);

    // Use the debounced epsilon value for the API call
    const debouncedEpsilon = useDebounce(epsilon, 500);

    // Fetch all datasets for the dropdown
    useEffect(() => {
        const fetchDatasets = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/datasets/`);
                if (!response.ok) throw new Error('Failed to fetch datasets.');
                const data = await response.json();
                setDatasets(data);
                if (datasetId) {
                    const preselected = data.find(d => d.id === datasetId);
                    setSelectedDatasetSchema(preselected);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDatasets();
    }, [datasetId]);

    // NEW: Fetch available budgets
    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/budgets/`);
                if (!response.ok) throw new Error('Failed to fetch budgets.');
                setBudgets(await response.json());
            } catch (err) {
                console.error(err.message);
            }
        };
        fetchBudgets();
    }, []);

    // --- UTILITY PREVIEW LOGIC ---
    useEffect(() => {
        const fetchPreview = async () => {
            if (!selectedDatasetId || !previewColumn || !previewMetric || debouncedEpsilon <= 0) {
                setPreviewData(null);
                return;
            }
            setPreviewLoading(true);
            setPreviewError('');
            try {
                const payload = {
                    dataset_id: selectedDatasetId,
                    metric: previewMetric,
                    epsilon: parseFloat(debouncedEpsilon),
                    column: previewColumn,
                };
                const response = await fetch(`${API_BASE_URL}/jobs/preview`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.detail);
                setPreviewData(data);
            } catch (err) {
                setPreviewError(err.message);
                setPreviewData(null);
            } finally {
                setPreviewLoading(false);
            }
        };
        
        fetchPreview();
    }, [debouncedEpsilon, previewColumn, previewMetric, selectedDatasetId]); // Effect now depends on the debounced value


    // Handler for selecting the first numeric column for preview
    useEffect(() => {
        if (selectedDatasetSchema) {
            const firstNumericColumn = selectedDatasetSchema.columns.find(c => c.dtype === 'int64' || c.dtype === 'float64');
            if (firstNumericColumn) {
                setPreviewColumn(firstNumericColumn.name);
            } else {
                setPreviewColumn(''); // Reset if no numeric columns
            }
        }
    }, [selectedDatasetSchema]);
    
    const handleDatasetChange = (e) => {
        const newDatasetId = e.target.value;
        setSelectedDatasetId(newDatasetId);
        const newDataset = datasets.find(d => d.id === newDatasetId);
        setSelectedDatasetSchema(newDataset);
        setSelectedColumns([]); // Reset columns on dataset change
    };
    
    const handleColumnToggle = (columnName) => {
        setSelectedColumns(prev => 
            prev.includes(columnName) 
                ? prev.filter(c => c !== columnName) 
                : [...prev, columnName]
        );
    };

    const handleMetricToggle = (metricName) => {
        setSelectedMetrics(prev =>
            prev.includes(metricName)
                ? prev.filter(m => m !== metricName)
                : [...prev, metricName]
        );
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setJobResult(null);

        const payload = {
            dataset_id: selectedDatasetId,
            metrics: selectedMetrics,
            epsilon: parseFloat(epsilon),
            columns: selectedColumns.length > 0 ? selectedColumns : null,
            budget_id: selectedBudgetId || null, // Include selected budget
        };

        try {
            const response = await fetch(`${API_BASE_URL}/jobs/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to create DP job.');
            }
            setJobResult(data);
            setStep(4); // Move to success step
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    const renderStep = () => {
        const numericColumns = selectedDatasetSchema?.columns.filter(c => ['int64', 'float64'].includes(c.dtype)) || [];
        switch (step) {
            case 1:
                return (
                    <div>
                        <h3 style={{ margin: '0 0 16px' }}>Step 1: Select Dataset & Columns</h3>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <select value={selectedDatasetId} onChange={handleDatasetChange} className="form-input">
                                <option value="">-- Select a Dataset --</option>
                                {datasets.map(ds => <option key={ds.id} value={ds.id}>{ds.name}</option>)}
                            </select>
                            {selectedDatasetId && (
                                <div>
                                    <p style={{color:'var(--muted)', marginTop:0}}>Select columns to analyze (or leave blank to analyze all numeric columns):</p>
                                    <div style={{display:'flex', flexWrap:'wrap', gap:'10px'}}>
                                        {numericColumns.map(col => (
                                            <label key={col.name} style={{display:'flex', alignItems:'center', gap:'8px', background:'var(--panel-2)', padding:'8px 12px', borderRadius:'10px', cursor: 'pointer'}}>
                                                <input type="checkbox" checked={selectedColumns.includes(col.name)} onChange={() => handleColumnToggle(col.name)} />
                                                {col.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h3 style={{ margin: '0 0 16px' }}>Step 2: Configure DP Parameters</h3>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            {/* Left Side: Configuration */}
                            <div style={{ display: 'grid', gap: '16px', alignContent: 'start' }}>
                                <div>
                                    <label htmlFor="epsilon" style={{display:'block', marginBottom:'8px', color:'var(--muted)'}}>Privacy Budget (Epsilon, ε) - Lower is more private</label>
                                    <input id="epsilon" type="range" value={epsilon} onChange={e => setEpsilon(e.target.value)} min="0.1" max="10.0" step="0.1" />
                                    <input type="number" value={epsilon} onChange={e => setEpsilon(e.target.value)} min="0.1" step="0.1" className="form-input" style={{marginTop:'8px', maxWidth:'100px'}}/>
                                </div>
                                <div>
                                    <label htmlFor="budget" style={{display:'block', marginBottom:'8px', color:'var(--muted)'}}>Budget Ledger (Optional)</label>
                                    <select id="budget" value={selectedBudgetId} onChange={e => setSelectedBudgetId(e.target.value)} className="form-input">
                                        <option value="">-- No Budget / Track Manually --</option>
                                        {budgets.map(b => <option key={b.id} value={b.id}>{b.name} (Remaining: {(b.epsilon_allocated - b.epsilon_spent).toFixed(2)})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <p style={{color:'var(--muted)', marginTop:0}}>Select DP metrics to compute for the job:</p>
                                    <div style={{display:'flex', flexWrap:'wrap', gap:'10px'}}>
                                        {AVAILABLE_METRICS.map(metric => (
                                            <label key={metric} style={{display:'flex', alignItems:'center', gap:'8px', background:'var(--panel-2)', padding:'8px 12px', borderRadius:'10px', cursor: 'pointer'}}>
                                                <input type="checkbox" checked={selectedMetrics.includes(metric)} onChange={() => handleMetricToggle(metric)} />
                                                {metric}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* Right Side: Utility Preview */}
                            <div className="kpi" style={{ borderStyle: 'solid', minHeight: '200px' }}>
                                <h4>Utility Preview</h4>
                                {numericColumns.length > 0 ? (
                                    <>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                            <select value={previewColumn} onChange={e => setPreviewColumn(e.target.value)} className="form-input">
                                                {numericColumns.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                            </select>
                                            <select value={previewMetric} onChange={e => setPreviewMetric(e.target.value)} className="form-input">
                                                <option value="mean">mean</option>
                                                <option value="sum">sum</option>
                                                <option value="count">count</option>
                                            </select>
                                        </div>
                                        {previewLoading ? <Spinner text="Loading preview..." /> : previewError ? <MessageBox message={previewError} /> : previewData ? (
                                            <div style={{marginTop: '16px'}}>
                                                <div style={{color:'var(--muted)'}}>Actual Value (approx.): <strong style={{color:'var(--text)'}}>{previewData.actual_value.toFixed(2)}</strong></div>
                                                <div style={{color:'var(--accent)', fontSize:'24px', fontWeight:600}}>Private Value: {previewData.private_value.toFixed(2)}</div>
                                                <div style={{color:'var(--muted)'}}>Noise Added: <strong style={{color: Math.abs(previewData.private_value - previewData.actual_value) > previewData.actual_value * 0.5 ? 'var(--warn)' : 'var(--ok)'}}>{(previewData.private_value - previewData.actual_value).toFixed(2)}</strong></div>
                                            </div>
                                        ) : <div style={{marginTop:'16px', color:'var(--muted)'}}>Adjust epsilon to see a preview.</div>}
                                    </>
                                ) : (
                                    <p style={{ color: 'var(--muted)', marginTop: '16px' }}>No numeric columns available in this dataset for a preview.</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 3:
                const payload = {
                    dataset_id: selectedDatasetId,
                    metrics: selectedMetrics,
                    epsilon: parseFloat(epsilon),
                    columns: selectedColumns.length > 0 ? selectedColumns : ["All Numeric"],
                };
                return (
                    <div>
                        <h3 style={{ margin: '0 0 16px' }}>Step 3: Review & Submit</h3>
                        <p>Please review your job configuration before submitting.</p>
                        <pre style={{padding:'1rem', background:'var(--panel-2)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)'}}>
                            {JSON.stringify(payload, null, 2)}
                        </pre>
                        {error && <MessageBox message={error} />}
                    </div>
                );
            case 4:
                return (
                     <div>
                        <h3 style={{ margin: '0 0 16px', color:'var(--ok)' }}>✓ Job Completed Successfully</h3>
                        <p>Job ID: <strong>{jobResult.id}</strong></p>
                        <p>Differentially Private Results:</p>
                        <pre style={{padding:'1rem', background:'var(--panel-2)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)'}}>
                            {JSON.stringify(jobResult.results, null, 2)}
                        </pre>
                        {/* NEW: Buttons for download and navigation */}
                        <div style={{marginTop: '16px', display: 'flex', gap: '10px'}}>
                            <button onClick={onComplete} className="btn">Back to Jobs List</button>
                            <a href={`${API_BASE_URL}/jobs/${jobResult.id}/results.csv`} className="btn btn-primary">
                                Download CSV
                            </a>
                        </div>
                    </div>
                );
            default: return null;
        }
    };
    
    return (
        <section style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'16px',boxShadow:'var(--shadow)'}}>
            <button onClick={onBackClick} style={{marginBottom:'16px', color:'var(--accent)', background:'none', border:'none', cursor:'pointer', padding:0}}>&larr; Back to Datasets</button>
            <h2 style={{margin:'0 0 16px'}}>Create DP Job</h2>
            
            {loading && step < 4 ? <Spinner text="Loading..." /> : renderStep()}

            <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', alignItems:'center', marginTop:'24px'}}>
                {step > 1 && step < 4 && (
                    <button type="button" onClick={() => setStep(step - 1)} className="btn">Back</button>
                )}
                
                {step < 3 && (
                    <button type="button" onClick={() => setStep(step + 1)} disabled={!selectedDatasetId} className="btn btn-primary" style={{marginLeft: 'auto'}}>Next</button>
                )}
                {step === 3 && (
                    <button type="button" onClick={handleSubmit} disabled={loading} className="btn btn-primary" style={{marginLeft: 'auto'}}>{loading ? 'Submitting...' : 'Submit Job'}</button>
                )}
            </div>
        </section>
    );
}