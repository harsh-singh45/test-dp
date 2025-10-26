import React, { useState } from 'react';
import { MessageBox } from '../common/MessageBox';
import { dpApiService } from '../../services/dpApiService';
import Modal from '../common/Modal';

const SchemaImportModal = ({ isOpen, onClose, onComplete }) => {
    const [schemaJson, setSchemaJson] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!schemaJson) {
            setError('Please paste a JSON schema.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const schema = JSON.parse(schemaJson);
            
            let columns = schema.columns;
            if (Array.isArray(schema.tables) && schema.tables.length > 0 && schema.tables[0].columns) {
                columns = schema.tables[0].columns;
            }

            if (!Array.isArray(columns) || columns.length === 0) {
                throw new Error('The JSON must contain a "columns" array with at least one column.');
            }
            
            const payload = {
                dataset_name: schema.dataset_name,
                columns: columns.map(c => ({ name: c.name, type: c.type })),
                meta: schema.meta
            };

            await dpApiService.importSchema(payload);
            onComplete();
        } catch (err) {
            const errorMessage = err.message || 'An unexpected error occurred.';
            setError(`Invalid JSON or schema format: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const placeholderJson = JSON.stringify({
      "dataset_name": "your_dataset_name",
      "columns": [
        {"name": "column_1", "type": "integer"},
        {"name": "column_2", "type": "string"}
      ],
      "meta": {
        "description": "Optional description."
      }
    }, null, 2);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Import Dataset Schema">
            <div className="mb-3">
                <label htmlFor="schemaJson" className="form-label">JSON Schema</label>
                <textarea 
                    id="schemaJson"
                    className="form-control"
                    rows="12"
                    value={schemaJson} 
                    onChange={(e) => setSchemaJson(e.target.value)} 
                    placeholder={placeholderJson}
                    required
                />
                <div className="form-text">
                    Paste a JSON object with "dataset_name" and "columns" keys. The "columns" array can be top-level or nested inside the first object of a "tables" array.
                </div>
            </div>
            {error && <MessageBox message={error} type="error" />}
            <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                <button type="button" onClick={handleSubmit} disabled={loading} className="btn btn-primary">
                    {loading ? 'Importing...' : 'Import Schema'}
                </button>
            </div>
        </Modal>
    );
};

export default SchemaImportModal;