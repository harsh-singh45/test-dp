// In frontend/src/components/views/DatasetDetailView.jsx
import React, { useState, useEffect } from 'react';
import { Spinner } from '../common/Spinner';
import { MessageBox } from '../common/MessageBox';

const API_BASE_URL = "http://localhost:8000";

export function DatasetDetailView({ datasetId, onBackClick }) {
    const [dataset, setDataset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDataset = async () => {
            if (!datasetId) return;
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/datasets/${datasetId}`);
                if (!response.ok) throw new Error(`Failed to fetch dataset ${datasetId}.`);
                const data = await response.json();
                setDataset(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDataset();
    }, [datasetId]);

    if (loading) return <Spinner text={`Loading dataset ${datasetId}...`} />;
    if (error) return <MessageBox message={error} />;
    if (!dataset) return null;

    return (
        <section style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'16px',boxShadow:'var(--shadow)'}}>
            <button onClick={onBackClick} style={{marginBottom:'16px', color:'var(--accent)', background:'none', border:'none', cursor:'pointer', padding:0}}>&larr; Back to Datasets</button>
            <h2 style={{margin:'0 0 16px'}}>Dataset Details: {dataset.name}</h2>
            
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'16px', marginBottom:'16px'}}>
                <div className="kpi">
                    <h4 style={{margin:'0 0 4px',fontSize:'14px',color:'var(--muted)'}}>Privacy Unit & Identity</h4>
                    <div style={{color:'var(--muted)'}}>privacy_unit_key: <strong>{dataset.privacy_unit_key}</strong></div>
                </div>
                <div className="kpi">
                    <h4 style={{margin:'0 0 4px',fontSize:'14px',color:'var(--muted)'}}>Contribution Limits</h4>
                    <div style={{color:'var(--muted)'}}>l0 (partitions per user): <strong>{dataset.l0_sensitivity}</strong></div>
                    <div style={{color:'var(--muted)'}}>linf (rows per partition): <strong>{dataset.linf_sensitivity}</strong></div>
                </div>
            </div>

            <h3 style={{color:'var(--muted)', marginTop:'24px'}}>Detailed Column Schema</h3>
            <table style={{width:'100%',borderCollapse:'collapse',background:'var(--panel-2)',border:'1px solid var(--border)',borderRadius:'12px',overflow:'hidden'}}>
                <thead>
                    <tr>
                        <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Column</th>
                        <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Type</th>
                        <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Min</th>
                        <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Max</th>
                        <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Clamp</th>
                        <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Categorical</th>
                        <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>PII</th>
                    </tr>
                </thead>
                <tbody>
                    {dataset.columns.map(col => (
                        <tr key={col.name}>
                            <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{col.name}</td>
                            <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{col.dtype}</td>
                            <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{col.min_val ?? '—'}</td>
                            <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{col.max_val ?? '—'}</td>
                            <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{col.clamp ? '✓' : '✗'}</td>
                            <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{col.is_categorical ? '✓' : '✗'}</td>
                            <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{col.is_pii ? <span className="status warn">PII</span> : 'No'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}