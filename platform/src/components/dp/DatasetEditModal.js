import React, { useState, useEffect } from 'react';
import { MessageBox } from '../common/MessageBox';
import { dpApiService } from '../../services/dpApiService';
import Modal from '../common/Modal';

const DatasetEditModal = ({ isOpen, onClose, onComplete, dataset }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (dataset) {
            setName(dataset.name || '');
            setDescription(dataset.description || '');
        }
    }, [dataset]);

    const handleSubmit = async () => {
        if (!name) {
            setError('Dataset name cannot be empty.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            await dpApiService.updateDataset(dataset.id, { name, description });
            onComplete();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Dataset: ${dataset?.name}`}>
            <div className="mb-3">
                <label htmlFor="editDatasetName" className="form-label">Dataset Name</label>
                <input 
                    type="text" 
                    id="editDatasetName"
                    className="form-control"
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="editDatasetDescription" className="form-label">Description</label>
                <textarea 
                    id="editDatasetDescription"
                    className="form-control"
                    rows="3"
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                />
            </div>
            {error && <MessageBox message={error} type="error" onClose={() => setError('')} />}
            <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                <button type="button" onClick={handleSubmit} disabled={loading} className="btn btn-primary">
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </Modal>
    );
};

export default DatasetEditModal;