// In frontend/src/components/common/Spinner.jsx
import React from 'react';

export const Spinner = ({ text = 'Loading...' }) => (
    <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:'5rem 0',color:'var(--muted)'}}>
        <div style={{animation:'spin 1s linear infinite',borderRadius:'50%',width:'3rem',height:'3rem',borderBottom:'2px solid var(--accent)'}}></div>
        <p style={{marginTop:'1rem'}}>{text}</p>
    </div>
);