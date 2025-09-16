import React, { useState } from 'react';
import { MessageBox } from '../common/MessageBox';

const API_BASE_URL = 'http://127.0.0.1:8000';

export const LocalDBConnector = ({ onComplete }) => {
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
            const response = await fetch(`${API_BASE_URL}/api/connect/local-database`, {
                method: 'POST',
                body: formData,
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
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="dbDatasetName" className="form-label">Dataset Name</label>
                <input 
                    type="text" 
                    id="dbDatasetName"
                    className="form-control"
                    value={datasetName} 
                    onChange={(e) => setDatasetName(e.target.value)} 
                    placeholder="e.g., User Subscriptions"
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="dbFileUpload" className="form-label">Database File</label>
                <input 
                    type="file" 
                    id="dbFileUpload"
                    className="form-control"
                    accept=".db,.sqlite,.sqlite3" 
                    onChange={(e) => setFile(e.target.files[0])} 
                    required
                />
            </div>
            <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? 'Uploading...' : 'Register Dataset'}
                </button>
            </div>
            {error && <MessageBox message={error} type="error" />}
        </form>
    );
};