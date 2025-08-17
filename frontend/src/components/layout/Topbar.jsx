// In frontend/src/components/layout/Topbar.jsx
import React from 'react';

export const Topbar = ({ activeView, setActiveView }) => (
    <header style={{position:'sticky',top:0,zIndex:50,display:'flex',alignItems:'center',gap:'16px',justifyContent:'space-between',padding:'14px 20px',background:'rgba(15,17,21,.7)',backdropFilter:'blur(10px)',borderBottom:'1px solid var(--border)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px',fontWeight:700}}>Intelation</div>
        <nav style={{display:'flex',gap:'14px',flexWrap:'wrap'}}>
            <a href="#datasets" onClick={() => setActiveView('datasets')} style={{color: activeView === 'datasets' ? 'var(--text)' : 'var(--muted)', background: activeView === 'datasets' ? 'var(--panel-2)' : 'transparent', textDecoration:'none',padding:'6px 10px',borderRadius:'10px'}}>Datasets</a>
            <a href="#jobs" onClick={() => setActiveView('jobs')} style={{color: activeView === 'jobs' ? 'var(--text)' : 'var(--muted)', background: activeView === 'jobs' ? 'var(--panel-2)' : 'transparent', textDecoration:'none',padding:'6px 10px',borderRadius:'10px'}}>DP Jobs</a>
        </nav>
    </header>
);