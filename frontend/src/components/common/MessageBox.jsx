// In frontend/src/components/common/MessageBox.jsx
import React from 'react';

export const MessageBox = ({ message, type = 'error' }) => {
    if (!message) return null;
    const typeClasses = {
        error: { background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--err)', color: 'var(--err)' },
        success: { background: 'rgba(74, 222, 128, 0.1)', border: '1px solid var(--ok)', color: 'var(--ok)' },
    };
    return <div style={{padding:'1rem',marginTop:'1rem',borderRadius:'0.5rem',textAlign:'center', ...typeClasses[type]}}>{message}</div>;
};