// In frontend/src/components/connectors/S3Connector.jsx
import React, { useState } from 'react';
import { MessageBox } from '../common/MessageBox';

const API_BASE_URL = "http://localhost:8000";

export function S3Connector({ onBack, onComplete }) {
    const [formState, setFormState] = useState({
        dataset_name: '', aws_access_key_id: '', aws_secret_access_key: '', bucket_name: '', file_key: '', endpoint_url: ''
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
            const response = await fetch(`${API_BASE_URL}/connect/s3`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formState)
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to register S3 dataset.');
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
            <input name="bucket_name" value={formState.bucket_name} onChange={handleChange} placeholder="S3 Bucket Name" className="form-input"/>
            <input name="file_key" value={formState.file_key} onChange={handleChange} placeholder="File Key (path/to/your/file.csv)" className="form-input"/>
            <input name="aws_access_key_id" value={formState.aws_access_key_id} onChange={handleChange} placeholder="AWS Access Key ID" className="form-input"/>
            <input name="aws_secret_access_key" value={formState.aws_secret_access_key} onChange={handleChange} placeholder="AWS Secret Access Key" type="password" className="form-input"/>
            <input name="endpoint_url" value={formState.endpoint_url} onChange={handleChange} placeholder="Endpoint URL (Optional, for MinIO)" className="form-input"/>
            <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', alignItems:'center'}}>
                <button type="button" onClick={onBack} className="btn">Back</button>
                <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Connecting...' : 'Connect and Register'}</button>
            </div>
            <MessageBox message={error} />
        </form>
    );
}