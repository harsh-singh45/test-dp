// In frontend/src/components/connectors/PostgresConnector.jsx
import React, { useState } from 'react';
import { MessageBox } from '../common/MessageBox';

const API_BASE_URL = "http://localhost:8000";

export function PostgresConnector({ onBack, onComplete }) {
    const [formState, setFormState] = useState({
        dataset_name: '', host: '', port: 5432, user: '', password: '', dbname: '', table_name: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/connect/postgresql`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formState)
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to register PostgreSQL dataset.');
            }
            onComplete();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{display:'grid', gap:'16px'}}>
            <input name="dataset_name" value={formState.dataset_name} onChange={handleChange} placeholder="Dataset Name" className="form-input"/>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                <input name="host" value={formState.host} onChange={handleChange} placeholder="Host" className="form-input"/>
                <input name="port" value={formState.port} onChange={handleChange} placeholder="Port" type="number" className="form-input"/>
            </div>
            <input name="dbname" value={formState.dbname} onChange={handleChange} placeholder="Database Name" className="form-input"/>
            <input name="table_name" value={formState.table_name} onChange={handleChange} placeholder="Table Name" className="form-input"/>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                <input name="user" value={formState.user} onChange={handleChange} placeholder="User" className="form-input"/>
                <input name="password" value={formState.password} onChange={handleChange} placeholder="Password" type="password" className="form-input"/>
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', alignItems:'center'}}>
                <button type="button" onClick={onBack} className="btn">Back</button>
                <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Connecting...' : 'Connect and Register'}</button>
            </div>
            <MessageBox message={error} />
        </form>
    );
}