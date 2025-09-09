import React, { useState } from 'react';
import { MessageBox } from '../common/MessageBox';

const API_BASE_URL = "http://localhost:8000";

export function AirbyteApplicationConnector({ onBack, onComplete }) {
    const [formState, setFormState] = useState({
        dataset_name: '', airbyte_client_id: '', airbyte_client_secret: '', airbyte_connection_id: '',
        db_host: '', db_port: 5432, db_user: '', db_password: '', db_name: '', db_table: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setFormState({ ...formState, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/connect/airbyte-application`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formState)
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail);
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
            <input name="dataset_name" value={formState.dataset_name} onChange={handleChange} placeholder="New Dataset Name" className="form-input" required/>
            <hr style={{border: '1px solid var(--border)'}} />
            <h4 style={{margin: 0, color: 'var(--muted)'}}>Airbyte Cloud Application</h4>
            <input name="airbyte_connection_id" value={formState.airbyte_connection_id} onChange={handleChange} placeholder="Airbyte Connection ID" className="form-input" required/>
            <input name="airbyte_client_id" value={formState.airbyte_client_id} onChange={handleChange} placeholder="Application Client ID" className="form-input" required/>
            <input name="airbyte_client_secret" type="password" value={formState.airbyte_client_secret} onChange={handleChange} placeholder="Application Client Secret" className="form-input" required/>
            <hr style={{border: '1px solid var(--border)'}} />
            <h4 style={{margin: 0, color: 'var(--muted)'}}>Destination DB Credentials</h4>
            <input name="db_host" value={formState.db_host} onChange={handleChange} placeholder="DB Host" className="form-input" required/>
            <input name="db_port" type="number" value={formState.db_port} onChange={handleChange} placeholder="DB Port" className="form-input" required/>
            <input name="db_name" value={formState.db_name} onChange={handleChange} placeholder="DB Name" className="form-input" required/>
            <input name="db_table" value={formState.db_table} onChange={handleChange} placeholder="Table Name (synced by Airbyte)" className="form-input" required/>
            <input name="db_user" value={formState.db_user} onChange={handleChange} placeholder="DB User" className="form-input" required/>
            <input name="db_password" type="password" value={formState.db_password} onChange={handleChange} placeholder="DB Password" className="form-input" required/>

            <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', alignItems:'center'}}>
                <button type="button" onClick={onBack} className="btn">Back</button>
                <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Syncing...' : 'Run Sync and Register'}</button>
            </div>
            <MessageBox message={error} />
        </form>
    );
}