import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { dpApiService } from '../../../services/dpApiService';

export default function DatasetDetail() {
    const router = useRouter();
    const { id } = router.query;

    const [dataset, setDataset] = useState(null);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        dpApiService.getDatasetPreview(id)
            .then(data => {
                setDataset(data.metadata);
                setRows(data.previewRows || []);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    // --- START OF FIX ---
    // Helper function to render the main content based on the dataset type
    const renderContent = () => {
        if (loading) {
            return <div className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></div>;
        }
        if (error) {
            return <div className="alert alert-danger">{error}</div>;
        }
        if (!dataset) {
            return <div className="alert alert-info">No dataset details found.</div>;
        }

        // Case 1: Schema-only dataset (no data rows)
        if (dataset.sourceType === 'schema_import' && rows.length === 0) {
            return (
                <div>
                    <h5 className="mt-4 mb-3">Schema Definition</h5>
                    <div className="table-responsive">
                        <table className="table table-bordered table-sm bg-white">
                            <thead className="table-light">
                                <tr>
                                    <th>Column Name</th>
                                    <th>Data Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataset.columns.map(col => (
                                    <tr key={col.name}>
                                        <td><code>{col.name}</code></td>
                                        <td><span className="badge bg-secondary">{col.dtype}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="alert alert-info mt-3">
                        <i className="bi bi-info-circle me-2"></i>
                        This dataset was registered from a schema. To begin querying, please upload the corresponding data file.
                    </div>
                </div>
            );
        }

        // Case 2: Dataset with data preview
        return (
            <div>
                <h5 className="mt-4 mb-3">Data Preview (First 10 Rows)</h5>
                {rows.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover table-sm bg-white">
                            <thead className="table-light">
                                <tr>
                                    {Object.keys(rows[0]).map(col => <th key={col}>{col}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    <tr key={idx}>
                                        {Object.values(row).map((val, i) => (
                                            <td key={i} className={val === null ? "text-muted" : ""}>
                                                {val === null ? <em>NULL</em> : String(val)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="alert alert-warning">Data is connected, but no preview rows could be loaded.</div>
                )}
            </div>
        );
    };
    // --- END OF FIX ---

    return (
        <>
            <Header />
            <div className="container py-5">
                <div className="row mb-4">
                    <div className="col-lg-8 mx-auto">
                        <div className="card shadow-sm border-0">
                            <div className="card-body">
                                <div className="d-flex align-items-center mb-3">
                                    <i className="bi bi-database text-primary me-3" style={{ fontSize: '2rem' }}></i>
                                    <div>
                                        <h3 className="mb-0">{dataset?.name || 'Loading...'}</h3>
                                        <small className="text-muted">ID: {id}</small>
                                    </div>
                                </div>
                                {dataset && (
                                    <div className="mb-3">
                                        <span className="badge bg-light text-dark me-2">{dataset.sourceType}</span>
                                        <span className="badge bg-info text-dark">{dataset.columns?.length || 0} columns</span>
                                        {dataset.sourceType === 'schema_import' && <span className="badge bg-warning text-dark">No Data Connected</span>}
                                    </div>
                                )}
                                <p className="mb-2 text-muted">{dataset?.description}</p>
                                
                                {renderContent()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}