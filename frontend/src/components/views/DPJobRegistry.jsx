// In frontend/src/components/views/DPJobRegistry.jsx
import React, { useState, useEffect } from 'react';
import { Spinner } from '../common/Spinner';
import { MessageBox } from '../common/MessageBox';

const API_BASE_URL = "http://localhost:8000";

// Make onJobClick a prop
export function DPJobRegistry({ onJobClick }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/jobs/`);
                if (!response.ok) throw new Error('Failed to fetch jobs from the backend.');
                const data = await response.json();
                setJobs(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const getStatusClass = (status) => {
        if (status === 'completed') return 'ok';
        if (status === 'failed') return 'err';
        return 'warn';
    };

    return (
        <section style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'16px',boxShadow:'var(--shadow)'}}>
            <h2 style={{margin:0}}>DP Jobs History</h2>
            {loading ? <Spinner text="Loading jobs..." /> : error ? <MessageBox message={error} /> :
                jobs.length === 0 ? (
                    <div style={{textAlign:'center',padding:'2.5rem 0',background:'var(--panel-2)', borderRadius:'var(--radius-sm)'}}>
                        <p style={{color:'var(--muted)'}}>No jobs have been run yet.</p>
                    </div>
                ) : (
                    <table style={{width:'100%',borderCollapse:'collapse',background:'var(--panel-2)',border:'1px solid var(--border)',borderRadius:'12px',overflow:'hidden', marginTop:'16px'}}>
                        <thead>
                            <tr>
                                <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Job ID</th>
                                <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Dataset ID</th>
                                <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Epsilon</th>
                                <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Status</th>
                                <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Created At</th>
                                <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map(job => (
                                <tr key={job.id}>
                                    {/* Make the Job ID a clickable link */}
                                    <td onClick={() => onJobClick(job.id)} style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px', color:'var(--accent)', cursor: 'pointer'}}>{job.id.substring(0,8)}...</td>
                                    <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{job.dataset_id.substring(0,8)}...</td>
                                    <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{job.epsilon}</td>
                                    <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}><span className={`status ${getStatusClass(job.status)}`}>{job.status}</span></td>
                                    <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{new Date(job.created_at).toLocaleString()}</td>
                                    <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>
                                        {job.status === 'completed' && (
                                            <a href={`${API_BASE_URL}/jobs/${job.id}/results.csv`} className="btn" style={{padding: '4px 8px', fontSize: '12px'}}>
                                                Download CSV
                                            </a>
                                        )}
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