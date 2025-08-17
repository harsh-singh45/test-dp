// In frontend/src/components/views/DatasetRegistry.jsx
import React, { useState, useEffect } from 'react';
import { Spinner } from '../common/Spinner';
import { MessageBox } from '../common/MessageBox';

const API_BASE_URL = "http://localhost:8000";

export function DatasetRegistry({ onDatasetClick, onRegisterClick, onImportSchemaClick }) {
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDatasets = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/datasets/`);
                if (!response.ok) throw new Error('Failed to fetch datasets from the backend.');
                const data = await response.json();
                setDatasets(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDatasets();
    }, []);

    return (
        <section style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'16px',boxShadow:'var(--shadow)'}}>
            <div style={{display:'flex',gap:'8px',alignItems:'center',justifyContent:'space-between', marginBottom:'16px'}}>
                <h2 style={{margin:0}}>Datasets</h2>
                <div style={{display:'flex', gap:'10px'}}>
                    <button className="btn" onClick={onImportSchemaClick}>Import Schema</button>
                    <button className="btn btn-primary" onClick={onRegisterClick}>Register Dataset</button>
                </div>
            </div>
            {loading ? <Spinner text="Loading datasets..." /> : error ? <MessageBox message={error} /> :
                datasets.length === 0 ? (
                    <div style={{textAlign:'center',padding:'2.5rem 0',background:'var(--panel-2)', borderRadius:'var(--radius-sm)'}}>
                        <p style={{color:'var(--muted)'}}>No datasets registered yet.</p>
                    </div>
                ) : (
                    <table style={{width:'100%',borderCollapse:'collapse',background:'var(--panel-2)',border:'1px solid var(--border)',borderRadius:'12px',overflow:'hidden'}}>
                        <thead>
                            <tr>
                                <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Name</th>
                                <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Source</th>
                                <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Records</th>
                                <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Schema</th>
                                <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Tags</th>
                                <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datasets.map(ds => (
                                <tr key={ds.id}>
                                    <td onClick={() => onDatasetClick(ds.id)} style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px', color:'var(--accent)', cursor:'pointer'}}>{ds.name}</td>
                                    <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}><span className="badge">{ds.source_type.replace(/_/g, ' ')}</span></td>
                                    <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{ds.row_count}</td>
                                    <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}><span className="badge ok">OK</span></td>
                                    <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{ds.connection_details.tags || 'N/A'}</td>
                                    <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>
                                        <a href="#edit" onClick={(e) => { e.preventDefault(); onDatasetClick(ds.id); }} style={{color:'var(--accent)', textDecoration:'none'}}>Edit</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            }
        </section>
    );
}