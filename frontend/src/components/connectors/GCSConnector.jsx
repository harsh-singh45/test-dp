// In frontend/src/components/connectors/GCSConnector.jsx
import React, { useState } from 'react';
import { MessageBox } from '../common/MessageBox';

const API_BASE_URL = "http://localhost:8000";

export function GCSConnector({ onBack, onComplete }) {
    const [formState, setFormState] = useState({
        dataset_name: '', bucket_name: '', file_key: '', service_account_json: ''
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
            const response = await fetch(`${API_BASE_URL}/connect/gcs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formState)
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to register GCS dataset.');
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
            <input name="bucket_name" value={formState.bucket_name} onChange={handleChange} placeholder="GCS Bucket Name" className="form-input"/>
            <input name="file_key" value={formState.file_key} onChange={handleChange} placeholder="File Key (path/to/your/file.csv)" className="form-input"/>
            <textarea name="service_account_json" value={formState.service_account_json} onChange={handleChange} placeholder="Paste your Service Account JSON here" rows="5" className="form-input"></textarea>
            <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', alignItems:'center'}}>
                <button type="button" onClick={onBack} className="btn">Back</button>
                <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Connecting...' : 'Connect and Register'}</button>
            </div>
            <MessageBox message={error} />
        </form>
    );
}