// In frontend/src/components/views/SchemaImporter.jsx
import React, { useState } from 'react';
import { MessageBox } from '../common/MessageBox';

const API_BASE_URL = "http://localhost:8000";

export function SchemaImporter({ onBackClick, onComplete }) {
    const [datasetName, setDatasetName] = useState('');
    const [schemaJson, setSchemaJson] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        let parsedSchema;
        try {
            parsedSchema = JSON.parse(schemaJson);
        } catch (err) {
            setError('Invalid JSON format. Please check your schema.');
            return;
        }

        if (!datasetName || !parsedSchema.columns) {
            setError('Please provide a dataset name and a valid schema with a "columns" array.');
            return;
        }

        setLoading(true);
        setError('');
        
        const payload = {
            dataset_name: datasetName,
            columns: parsedSchema.columns
        };

        try {
            const response = await fetch(`${API_BASE_URL}/datasets/import-schema`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to import schema.');
            }
            onComplete();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
         <section style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'16px',boxShadow:'var(--shadow)'}}>
            <button onClick={onBackClick} style={{marginBottom:'16px', color:'var(--accent)', background:'none', border:'none', cursor:'pointer', padding:0}}>&larr; Back to Datasets</button>
            <h2 style={{margin:'0 0 16px'}}>Import Schema</h2>
            <form onSubmit={handleSubmit} style={{display:'grid', gap:'16px'}}>
                <input type="text" value={datasetName} onChange={(e) => setDatasetName(e.target.value)} placeholder="Dataset Name (e.g., Production Users)" className="form-input"/>
                <textarea value={schemaJson} onChange={(e) => setSchemaJson(e.target.value)} placeholder='Paste your JSON schema here. e.g., { "columns": [...] }' rows="8" className="form-input"></textarea>
                <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', alignItems:'center'}}>
                    <button type="button" onClick={onBackClick} className="btn">Back</button>
                    <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Importing...' : 'Import Schema'}</button>
                </div>
                <MessageBox message={error} />
            </form>
        </section>
    );
}