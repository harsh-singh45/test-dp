// In frontend/src/components/layout/Topbar.jsx
import React from 'react';

export const Topbar = ({ activeView, setActiveView }) => (
    <header style={{position:'sticky',top:0,zIndex:50,display:'flex',alignItems:'center',gap:'16px',justifyContent:'space-between',padding:'14px 20px',background:'rgba(15,17,21,.7)',backdropFilter:'blur(10px)',borderBottom:'1px solid var(--border)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px',fontWeight:700}}>Intelation</div>
        <nav style={{display:'flex',gap:'14px',flexWrap:'wrap'}}>
            <a href="#dashboard" onClick={() => setActiveView('dashboard')} style={{color: activeView === 'dashboard' ? 'var(--text)' : 'var(--muted)', background: activeView === 'dashboard' ? 'var(--panel-2)' : 'transparent', textDecoration:'none',padding:'6px 10px',borderRadius:'10px'}}>Dashboard</a>
            <a href="#datasets" onClick={() => setActiveView('datasets')} style={{color: activeView === 'datasets' ? 'var(--text)' : 'var(--muted)', background: activeView === 'datasets' ? 'var(--panel-2)' : 'transparent', textDecoration:'none',padding:'6px 10px',borderRadius:'10px'}}>Datasets</a>
            <a href="#jobs" onClick={() => setActiveView('jobs')} style={{color: activeView === 'jobs' ? 'var(--text)' : 'var(--muted)', background: activeView === 'jobs' ? 'var(--panel-2)' : 'transparent', textDecoration:'none',padding:'6px 10px',borderRadius:'10px'}}>DP Jobs</a>
            <a href="#budget" onClick={() => setActiveView('budget')} style={{color: activeView === 'budget' ? 'var(--text)' : 'var(--muted)', background: activeView === 'budget' ? 'var(--panel-2)' : 'transparent', textDecoration:'none',padding:'6px 10px',borderRadius:'10px'}}>Budget Manager</a>
            <a href="#policy" onClick={() => setActiveView('policy')} style={{color: activeView === 'policy' ? 'var(--text)' : 'var(--muted)', background: activeView === 'policy' ? 'var(--panel-2)' : 'transparent', textDecoration:'none',padding:'6px 10px',borderRadius:'10px'}}>Policy</a>
        </nav>
    </header>
);