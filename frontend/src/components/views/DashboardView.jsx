// In frontend/src/components/views/DashboardView.jsx
import React, { useState, useEffect } from 'react';
import { Spinner } from '../common/Spinner';
import { MessageBox } from '../common/MessageBox';

const API_BASE_URL = "http://localhost:8000";

// Add onJobClick to the props
export function DashboardView({ onCreateJobClick, onJobClick }) {
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchKpis = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/dashboard/kpis`);
                if (!response.ok) throw new Error('Failed to fetch dashboard KPIs.');
                setKpis(await response.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchKpis();
    }, []);

    if (loading) return <Spinner text="Loading dashboard..." />;
    if (error) return <MessageBox message={error} />;
    if (!kpis) return null;

    return (
        <section className="card">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h2>Dashboard Overview</h2>
                <button className="btn btn-primary" onClick={onCreateJobClick}>Create DP Job</button>
            </div>
            
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'12px', marginTop:'16px'}}>
                <div className="kpi">
                    <h4>Privacy Budget (This month)</h4>
                    <div className="value">ε used: {kpis.total_epsilon_spent_monthly.toFixed(2)}</div>
                </div>
                <div className="kpi">
                    <h4>Average ε per Job</h4>
                    <div className="value">{kpis.avg_epsilon_per_job.toFixed(2)}</div>
                </div>
                <div className="kpi">
                    <h4>Jobs (24h)</h4>
                    <div className="value">
                        <span style={{color: 'var(--ok)'}}>{kpis.jobs_completed_24h}✓</span> • 
                        <span style={{color: 'var(--err)'}}>{kpis.jobs_failed_24h}✖︎</span>
                    </div>
                </div>
                 <div className="kpi">
                    <h4>Total Jobs (24h)</h4>
                    <div className="value">{kpis.jobs_total_24h}</div>
                </div>
            </div>

            <h3 style={{color:'var(--muted)', marginTop:'24px'}}>Recent DP Jobs</h3>
            {kpis.recent_jobs.length > 0 ? (
                 <table style={{width:'100%',borderCollapse:'collapse',background:'var(--panel-2)',border:'1px solid var(--border)',borderRadius:'12px',overflow:'hidden'}}>
                    <thead>
                        <tr>
                            <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Job ID</th>
                            <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Epsilon</th>
                            <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Status</th>
                            <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kpis.recent_jobs.map(job => (
                            <tr key={job.id}>
                                {/* UPDATED: Make the Job ID a clickable link */}
                                <td onClick={() => onJobClick(job.id)} style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px', color:'var(--accent)', cursor: 'pointer'}}>{job.id.substring(0,8)}...</td>
                                <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{job.epsilon}</td>
                                <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}><span className={`status ${job.status === 'completed' ? 'ok' : 'err'}`}>{job.status}</span></td>
                                <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{new Date(job.created_at).toLocaleTimeString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div style={{textAlign:'center',padding:'2.5rem 0',background:'var(--panel-2)', borderRadius:'var(--radius-sm)'}}>
                    <p style={{color:'var(--muted)'}}>No jobs have been run recently.</p>
                </div>
            )}
        </section>
    );
}