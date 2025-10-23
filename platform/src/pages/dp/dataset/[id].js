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
                                        <h3 className="mb-0">{dataset?.name || 'Dataset Details'}</h3>
                                        <small className="text-muted">ID: {id}</small>
                                    </div>
                                </div>
                                {loading && <div className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></div>}
                                {error && <div className="alert alert-danger">{error}</div>}
                                {dataset && (
                                    <div>
                                        <div className="mb-3">
                                            <span className="badge bg-light text-dark me-2">{dataset.sourceType}</span>
                                            <span className="badge bg-info text-dark">{dataset.columns?.length || 0} columns</span>
                                        </div>
                                        <p className="mb-2 text-muted">{dataset.description}</p>
                                        <div className="row mb-4">
                                            <div className="col-md-6">
                                                <div className="card bg-light border-0 mb-2">
                                                    <div className="card-body py-2">
                                                        <strong>Source Type:</strong> <span className="text-primary">{dataset.sourceType}</span>
                                                    </div>
                                                </div>
                                                <div className="card bg-light border-0 mb-2">
                                                    <div className="card-body py-2">
                                                        <strong>Columns:</strong> {dataset.columns?.join(', ')}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="card bg-light border-0 mb-2">
                                                    <div className="card-body py-2">
                                                        <strong>Total Records (Preview):</strong> {rows.length}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <h5 className="mt-4 mb-2">Preview (First 10 Rows)</h5>
                                        {rows.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table table-bordered table-hover table-sm bg-white">
                                                    <thead className="table-light">
                                                        <tr>
                                                            {Object.keys(rows[0]).map(col => (
                                                                <th key={col}>{col}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {rows.map((row, idx) => (
                                                            <tr key={idx}>
                                                                {Object.values(row).map((val, i) => (
                                                                    <td key={i} className={val === null ? "text-muted" : ""}>
                                                                        {val === null ? <em>NULL</em> : val}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="alert alert-info">No preview data available.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}