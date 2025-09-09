// In frontend/src/components/views/DPJobDetailView.jsx
import React, { useState, useEffect } from 'react';
import { Spinner } from '../common/Spinner';
import { MessageBox } from '../common/MessageBox';

const API_BASE_URL = "http://localhost:8000";

export function DPJobDetailView({ jobId, onBackClick }) {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [vizError, setVizError] = useState('');
    
    // State to manage which histogram chart to show in a modal
    const [showHistogramFor, setShowHistogramFor] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            if (!jobId) return;
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.detail || `Failed to fetch job ${jobId}.`);
                }
                setJob(await response.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [jobId]);

    if (loading) return <Spinner text={`Loading job ${jobId.substring(0,8)}...`} />;
    if (error) return <MessageBox message={error} />;
    if (!job) return null;

    const visualizationUrl = `${API_BASE_URL}/jobs/${jobId}/visualize`;

    const formatResult = (res) => {
        // Check if the result is a histogram to add the chart button
        if (res.analysis_type === "DP Histogram") {
            try {
                const parsed = JSON.parse(res.result);
                return (
                    <div>
                        <pre style={{ margin: 0, background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px' }}>{JSON.stringify(parsed, null, 2)}</pre>
                        <button onClick={() => setShowHistogramFor(res.column_name)} className="btn" style={{padding: '4px 8px', fontSize: '12px', marginTop: '8px'}}>View Chart</button>
                    </div>
                );
            } catch (e) {
                return res.result; // Fallback if JSON is invalid
            }
        }
        return res.result;
    };

    return (
        <section className="card">
            <button onClick={onBackClick} style={{marginBottom:'16px', color:'var(--accent)', background:'none', border:'none', cursor:'pointer', padding:0}}>&larr; Back to Jobs List</button>
            <h2 style={{margin:'0 0 16px'}}>Job Details</h2>
            
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'12px'}}>
                <div className="kpi">
                    <h4>Job ID</h4>
                    <div className="value" style={{fontSize: '16px', color: 'var(--muted)'}}>{job.id}</div>
                </div>
                <div className="kpi">
                    <h4>Status</h4>
                    <div className="value"><span className={`status ${job.status === 'completed' ? 'ok' : 'err'}`}>{job.status}</span></div>
                </div>
                <div className="kpi">
                    <h4>Epsilon (ε)</h4>
                    <div className="value">{job.epsilon}</div>
                </div>
                <div className="kpi">
                    <h4>Created At</h4>
                    <div className="value" style={{fontSize: '16px'}}>{new Date(job.created_at).toLocaleString()}</div>
                </div>
            </div>

            <h3 style={{color:'var(--muted)', marginTop:'24px'}}>Differentially Private Results</h3>
            {job.results.length > 0 ? (
                 <table style={{width:'100%',borderCollapse:'collapse',background:'var(--panel-2)',border:'1px solid var(--border)',borderRadius:'12px',overflow:'hidden'}}>
                    <thead>
                        <tr>
                            <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Analysis Type</th>
                            <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Column</th>
                            <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {job.results.map((res, index) => (
                            <tr key={index}>
                                <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{res.analysis_type}</td>
                                <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{res.column_name}</td>
                                <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px', color:'var(--accent)', fontWeight: 600}}>
                                    {formatResult(res)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={{color:'var(--muted)'}}>No results were generated for this job.</p>
            )}

            {/* --- MODAL FOR HISTOGRAM --- */}
            {showHistogramFor && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100}} onClick={() => setShowHistogramFor(null)}>
                    <div style={{background: 'var(--panel)', padding: '20px', borderRadius: 'var(--radius)', maxWidth: '80vw', border: '1px solid var(--border)'}} onClick={e => e.stopPropagation()}>
                        <img 
                            src={`${API_BASE_URL}/jobs/${jobId}/histogram/${showHistogramFor}`} 
                            alt={`Histogram for ${showHistogramFor}`} 
                            style={{maxWidth: '100%', height: 'auto'}}
                        />
                    </div>
                </div>
            )}

            <h3 style={{color:'var(--muted)', marginTop:'24px'}}>Aggregate Results Visualization (True vs. Private)</h3>
            <div style={{background: 'var(--panel-2)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)'}}>
                {vizError ? (
                    <MessageBox message={vizError} />
                ) : (
                    <img 
                        src={visualizationUrl} 
                        alt="Job results visualization" 
                        style={{maxWidth: '100%', height: 'auto'}}
                        onError={() => setVizError('No numeric data available to visualize for this job.')}
                    />
                )}
            </div>
        </section>
    );
}
