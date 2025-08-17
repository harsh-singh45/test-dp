// In frontend/src/components/connectors/LocalDBConnector.jsx
import React, { useState } from 'react';
import { MessageBox } from '../common/MessageBox';

const API_BASE_URL = "http://localhost:8000";

export function LocalDBConnector({ onBack, onComplete }) {
    const [file, setFile] = useState(null);
    const [datasetName, setDatasetName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !datasetName) {
            setError('Please provide a dataset name and select a database file.');
            return;
        }
        setLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('dataset_name', datasetName);
        try {
            const response = await fetch(`${API_BASE_URL}/connect/local-database`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to register dataset.');
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
            <input type="text" value={datasetName} onChange={(e) => setDatasetName(e.target.value)} placeholder="Dataset Name (e.g., Legacy Inventory)" className="form-input"/>
            <input type="file" accept=".db,.sqlite,.sqlite3" onChange={(e) => setFile(e.target.files[0])} />
            <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', alignItems:'center'}}>
                <button type="button" onClick={onBack} className="btn">Back</button>
                <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Registering...' : 'Register'}</button>
            </div>
            <MessageBox message={error} />
        </form>
    );
}