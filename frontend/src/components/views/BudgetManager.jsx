// In frontend/src/components/views/BudgetManager.jsx
import React, { useState, useEffect } from 'react';
import { Spinner } from '../common/Spinner';
import { MessageBox } from '../common/MessageBox';

const API_BASE_URL = "http://localhost:8000";

export function BudgetManager() {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for the creation form
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEpsilon, setNewEpsilon] = useState(10.0);

    const fetchBudgets = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/budgets/`);
            if (!response.ok) throw new Error('Failed to fetch budgets.');
            const data = await response.json();
            setBudgets(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = { name: newName, epsilon_allocated: parseFloat(newEpsilon) };
            const response = await fetch(`${API_BASE_URL}/budgets/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to create budget.');
            }
            // Reset form and refresh list
            setNewName('');
            setNewEpsilon(10.0);
            setShowForm(false);
            fetchBudgets();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- NEW: Handler for resetting a budget ---
    const handleReset = async (budgetId) => {
        if (!window.confirm("Are you sure you want to reset this budget's spent epsilon to zero?")) {
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/budgets/${budgetId}/reset`, {
                method: 'PUT',
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to reset budget.');
            }
            fetchBudgets(); // Refresh the list to show the change
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'16px',boxShadow:'var(--shadow)'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                <h2 style={{margin:0}}>Privacy Budget Manager</h2>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Create Budget'}</button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} style={{display:'grid', gap:'16px', padding:'16px', background:'var(--panel-2)', borderRadius:'var(--radius-sm)', marginBottom:'16px'}}>
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Budget Name (e.g., Marketing-Q3)" className="form-input" required />
                    <input type="number" value={newEpsilon} onChange={e => setNewEpsilon(e.target.value)} placeholder="Total Epsilon" className="form-input" step="0.1" min="0" required />
                    <button type="submit" disabled={loading} className="btn">{loading ? 'Creating...' : 'Save Budget'}</button>
                </form>
            )}

            {loading ? <Spinner text="Loading budgets..." /> : error ? <MessageBox message={error} /> :
                budgets.length === 0 ? (
                    <div style={{textAlign:'center',padding:'2.5rem 0',background:'var(--panel-2)', borderRadius:'var(--radius-sm)'}}>
                        <p style={{color:'var(--muted)'}}>No budgets created yet.</p>
                    </div>
                ) : (
                    <table style={{width:'100%',borderCollapse:'collapse',background:'var(--panel-2)',border:'1px solid var(--border)',borderRadius:'12px',overflow:'hidden'}}>
                        <thead>
                            <tr>
                                <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Ledger Name</th>
                                <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Budget Usage (ε)</th>
                                <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Period</th>
                                {/* NEW: Actions column */}
                                <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgets.map(budget => {
                                const usagePercent = (budget.epsilon_spent / budget.epsilon_allocated) * 100;
                                return (
                                <tr key={budget.id}>
                                    <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{budget.name}</td>
                                    <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                            <span style={{whiteSpace: 'nowrap'}}>{budget.epsilon_spent.toFixed(2)} / {budget.epsilon_allocated}</span>
                                            <div style={{flexGrow: 1, background: 'var(--border)', borderRadius: '99px', height: '8px', overflow: 'hidden'}}>
                                                <div style={{width: `${usagePercent}%`, background: 'var(--accent)', height: '100%'}}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}><span className="badge">{budget.period}</span></td>
                                    {/* NEW: Reset button */}
                                    <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>
                                        <button onClick={() => handleReset(budget.id)} className="btn" style={{padding: '4px 8px', fontSize: '12px'}}>Reset</button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                )
            }
        </section>
    );
}