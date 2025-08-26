// In frontend/src/components/layout/Sidebar.jsx
import React from 'react';

export const Sidebar = ({ onRegisterClick, onCreateJobClick }) => (
    <aside style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'14px',position:'sticky',top:'88px',height:'fit-content'}}>
        <h3 style={{margin:'6px 0 10px',fontSize:'14px',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.08em'}}>Actions</h3>
        <div style={{display:'grid',gap:'8px',marginBottom:'14px'}}>
            <button className="btn" onClick={onRegisterClick}>Register Dataset</button>
            <button className="btn" onClick={onCreateJobClick}>Create DP Job</button>
        </div>
    </aside>
);