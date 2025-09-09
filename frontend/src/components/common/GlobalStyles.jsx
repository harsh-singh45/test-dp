// In frontend/src/components/common/GlobalStyles.jsx
import React from 'react';

export const GlobalStyles = () => (
    <style>{`
    :root{
      --bg:#0f1115; --panel:#151821; --panel-2:#1b1f2a; --text:#e7eaf3; --muted:#a6adc8; --accent:#7aa2f7; --ok:#4ade80; --warn:#f59e0b; --err:#ef4444; --border:#262b3a;
      --radius:16px; --radius-sm:12px; --shadow:0 6px 22px rgba(0,0,0,.25);
    }
    body{margin:0;font-family:Inter,system-ui,sans-serif;background:linear-gradient(180deg,#0b0d12, #0f1115);color:var(--text); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;}
    .btn{display:inline-flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--border);border-radius:12px;background:var(--panel-2);color:var(--text);text-decoration:none;transition: all 0.2s ease; cursor: pointer;}
    .btn:hover{background:var(--accent);color:var(--bg);border-color:var(--accent);}
    .btn-primary{background:var(--accent);color:var(--bg);font-weight:600;}
    .btn-primary:hover{opacity:0.9;background:var(--accent);}
    .badge{padding:2px 6px;border-radius:6px;border:1px solid var(--border);font-size:12px;color:var(--muted);}
    .card-hover{transition: all 0.2s ease; border: 1px solid var(--border);}
    .card-hover:hover{border-color: var(--accent); transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,.3);}
    .form-input{padding:10px; background:var(--panel-2); border:1px solid var(--border); border-radius:12px; color:var(--text); width: 100%; box-sizing: border-box;}
    .kpi{background:var(--panel-2);border:1px dashed var(--border);border-radius:var(--radius-sm);padding:12px;}
    .status{padding:4px 8px;border-radius:999px;font-size:12px;border:1px solid var(--border);font-weight:500;}
    .status.ok{background:rgba(74,222,128,.12);color:var(--ok);border-color:var(--ok);}
    .status.warn{background:rgba(245,158,11,.12);color:var(--warn);border-color:var(--warn);}
  `}</style>
);