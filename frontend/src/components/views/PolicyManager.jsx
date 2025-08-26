// In frontend/src/components/views/PolicyManager.jsx
import React, { useState, useEffect } from 'react';
import { Spinner } from '../common/Spinner';
import { MessageBox } from '../common/MessageBox';

const API_BASE_URL = "http://localhost:8000";

export function PolicyManager() {
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/policy/`);
                if (!response.ok) throw new Error('Failed to fetch policy.');
                setPolicy(await response.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPolicy();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch(`${API_BASE_URL}/policy/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(policy),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to update policy.');
            }
            setSuccess('Policy updated successfully!');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setPolicy({ ...policy, [e.target.name]: parseFloat(e.target.value) });
    };

    if (loading && !policy) return <Spinner text="Loading policy..." />;

    return (
        <section style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'16px',boxShadow:'var(--shadow)'}}>
            <h2 style={{margin:0, marginBottom:'16px'}}>Policy & Guardrails</h2>
            
            {error && <MessageBox message={error} />}
            {success && <MessageBox message={success} type="success" />}

            {policy && (
                <form onSubmit={handleUpdate} style={{display:'grid', gap:'16px', maxWidth: '400px'}}>
                    <div>
                        <label htmlFor="max_epsilon_per_job" style={{display:'block', marginBottom:'8px', color:'var(--muted)'}}>
                            Max Epsilon (ε) per Job
                        </label>
                        <input
                            id="max_epsilon_per_job"
                            name="max_epsilon_per_job"
                            type="number"
                            value={policy.max_epsilon_per_job}
                            onChange={handleChange}
                            className="form-input"
                            step="0.1"
                            min="0.1"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary">
                        {loading ? 'Saving...' : 'Save Policy'}
                    </button>
                </form>
            )}
        </section>
    );
}