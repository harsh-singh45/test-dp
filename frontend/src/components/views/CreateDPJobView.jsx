// In frontend/src/components/views/CreateDPJobView.jsx
import React from 'react';

export function CreateDPJobView({ datasetId, onBackClick }) {
    return (
         <section style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'16px',boxShadow:'var(--shadow)'}}>
             <button onClick={onBackClick} style={{marginBottom:'16px', color:'var(--accent)', background:'none', border:'none', cursor:'pointer', padding:0}}>&larr; Back to Datasets</button>
            <h2 style={{margin:'0 0 16px'}}>Create DP Job</h2>
            <p style={{color:'var(--muted)'}}>Dataset ID: <strong>{datasetId || 'None selected'}</strong>.</p>
            <div style={{marginTop:'2rem', padding:'2rem', background:'var(--panel-2)', borderRadius:'var(--radius-sm)', textAlign:'center', border:'1px dashed var(--border)'}}>
                <p>The job creation wizard will be implemented in Phase 2.</p>
            </div>
        </section>
    );
}