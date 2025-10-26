import React, { useState } from 'react';
import { MessageBox } from '../common/MessageBox';

const API_BASE_URL = 'http://127.0.0.1:8000'; // Ensure this is correct

export const FileUploadConnector = ({ onBack, onComplete }) => {
    const [file, setFile] = useState(null);
    const [datasetName, setDatasetName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !datasetName) {
            setError('Please provide a dataset name and select a file.');
            return;
        }
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('dataset_name', datasetName);

        try {
            const response = await fetch(`${API_BASE_URL}/api/connect/file-upload`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to register dataset.');
            }
            onComplete(); // This tells the parent component the upload was successful
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="datasetName" className="form-label">Dataset Name</label>
                <input 
                    type="text" 
                    id="datasetName"
                    className="form-control"
                    value={datasetName} 
                    onChange={(e) => setDatasetName(e.target.value)} 
                    placeholder="e.g., Employee Salaries"
                />
            </div>
            <div className="mb-3">
                <label htmlFor="fileUpload" className="form-label">CSV File</label>
                <input 
                    type="file" 
                    id="fileUpload"
                    className="form-control"
                    accept=".csv" 
                    onChange={(e) => setFile(e.target.files[0])} 
                />
            </div>
            <div className="d-flex justify-content-end gap-2">
                <button type="button" onClick={onBack} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? 'Uploading...' : 'Register Dataset'}
                </button>
            </div>
            {error && <MessageBox message={error} type="error" />}
        </form>
    );
};