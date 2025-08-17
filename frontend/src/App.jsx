import React, { useState } from 'react';

// Import Layout and Common Components
import { GlobalStyles } from './components/common/GlobalStyles';
import { Topbar } from './components/layout/Topbar';
import { Sidebar } from './components/layout/Sidebar';

// Import View Components
import { DatasetRegistry } from './components/views/DatasetRegistry';
import { DatasetDetailView } from './components/views/DatasetDetailView';
import { ConnectDataSource } from './components/views/ConnectDataSource';
import { SchemaImporter } from './components/views/SchemaImporter';
import { CreateDPJobView } from './components/views/CreateDPJobView';

export default function App() {
    const [view, setView] = useState('datasets');
    const [currentDatasetId, setCurrentDatasetId] = useState(null);
    const [key, setKey] = useState(Date.now()); // Used to force re-fetch in child components

    const handleDatasetRegistered = () => {
        setKey(Date.now()); // Change key to force DatasetRegistry to re-fetch
        setView('datasets');
    };

    const handleCreateJobClick = (dataset = null) => {
        setCurrentDatasetId(dataset ? dataset.id : null);
        setView('create_job');
    };

    const handleDatasetClick = (datasetId) => {
        setCurrentDatasetId(datasetId);
        setView('dataset_detail');
    };
    
    const renderView = () => {
        switch (view) {
            case 'register':
                return <ConnectDataSource onBackClick={() => setView('datasets')} onComplete={handleDatasetRegistered} />;
            case 'import_schema':
                return <SchemaImporter onBackClick={() => setView('datasets')} onComplete={handleDatasetRegistered} />;
            case 'dataset_detail':
                return <DatasetDetailView datasetId={currentDatasetId} onBackClick={() => setView('datasets')} />;
            case 'create_job':
                return <CreateDPJobView datasetId={currentDatasetId} onBackClick={() => setView('datasets')} />;
            case 'datasets':
            default:
                return <DatasetRegistry key={key} onDatasetClick={handleDatasetClick} onRegisterClick={() => setView('register')} onImportSchemaClick={() => setView('import_schema')} />;
        }
    };

    return (
        <>
            <GlobalStyles />
            <Topbar activeView={view} setActiveView={setView} />
            <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:'18px',maxWidth:'1240px',margin:'20px auto',padding:'0 16px'}}>
                <Sidebar onRegisterClick={() => setView('register')} onCreateJobClick={() => handleCreateJobClick(null)} />
                <main style={{display:'grid',gap:'20px'}}>
                    {renderView()}
                </main>
            </div>
        </>
    );
}












//--------------------------------------------------------------------------------------------------------------------------------------------------

// import React, { useState, useEffect } from 'react';

// // --- Configuration ---
// const API_BASE_URL = "http://localhost:8000";

// // --- Helper & Style Components ---

// const GlobalStyles = () => (
//     <style>{`
//     :root{
//       --bg:#0f1115; --panel:#151821; --panel-2:#1b1f2a; --text:#e7eaf3; --muted:#a6adc8; --accent:#7aa2f7; --ok:#4ade80; --warn:#f59e0b; --err:#ef4444; --border:#262b3a;
//       --radius:16px; --radius-sm:12px; --shadow:0 6px 22px rgba(0,0,0,.25);
//     }
//     body{margin:0;font-family:Inter,system-ui,sans-serif;background:linear-gradient(180deg,#0b0d12, #0f1115);color:var(--text); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;}
//     .btn{display:inline-flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--border);border-radius:12px;background:var(--panel-2);color:var(--text);text-decoration:none;transition: all 0.2s ease; cursor: pointer;}
//     .btn:hover{background:var(--accent);color:var(--bg);border-color:var(--accent);}
//     .btn-primary{background:var(--accent);color:var(--bg);font-weight:600;}
//     .btn-primary:hover{opacity:0.9;background:var(--accent);}
//     .badge{padding:2px 6px;border-radius:6px;border:1px solid var(--border);font-size:12px;color:var(--muted);}
//     .card-hover{transition: all 0.2s ease; border: 1px solid var(--border);}
//     .card-hover:hover{border-color: var(--accent); transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,.3);}
//     .form-input{padding:10px; background:var(--panel-2); border:1px solid var(--border); border-radius:12px; color:var(--text); width: 100%; box-sizing: border-box;}
//     .kpi{background:var(--panel-2);border:1px dashed var(--border);border-radius:var(--radius-sm);padding:12px;}
//     .status{padding:4px 8px;border-radius:999px;font-size:12px;border:1px solid var(--border);font-weight:500;}
//     .status.ok{background:rgba(74,222,128,.12);color:var(--ok);border-color:var(--ok);}
//     .status.warn{background:rgba(245,158,11,.12);color:var(--warn);border-color:var(--warn);}
//   `}</style>
// );

// const Spinner = ({ text = 'Loading...' }) => (
//     <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:'5rem 0',color:'var(--muted)'}}>
//         <div style={{animation:'spin 1s linear infinite',borderRadius:'50%',width:'3rem',height:'3rem',borderBottom:'2px solid var(--accent)'}}></div>
//         <p style={{marginTop:'1rem'}}>{text}</p>
//     </div>
// );

// const MessageBox = ({ message, type = 'error' }) => {
//     if (!message) return null;
//     const typeClasses = {
//         error: { background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--err)', color: 'var(--err)' },
//         success: { background: 'rgba(74, 222, 128, 0.1)', border: '1px solid var(--ok)', color: 'var(--ok)' },
//     };
//     return <div style={{padding:'1rem',marginTop:'1rem',borderRadius:'0.5rem',textAlign:'center', ...typeClasses[type]}}>{message}</div>;
// };


// // --- Layout Components ---

// const Topbar = ({ activeView, setActiveView }) => (
//     <header style={{position:'sticky',top:0,zIndex:50,display:'flex',alignItems:'center',gap:'16px',justifyContent:'space-between',padding:'14px 20px',background:'rgba(15,17,21,.7)',backdropFilter:'blur(10px)',borderBottom:'1px solid var(--border)'}}>
//         <div style={{display:'flex',alignItems:'center',gap:'10px',fontWeight:700}}>Intelation</div>
//         <nav style={{display:'flex',gap:'14px',flexWrap:'wrap'}}>
//             <a href="#datasets" onClick={() => setActiveView('datasets')} style={{color: activeView === 'datasets' ? 'var(--text)' : 'var(--muted)', background: activeView === 'datasets' ? 'var(--panel-2)' : 'transparent', textDecoration:'none',padding:'6px 10px',borderRadius:'10px'}}>Datasets</a>
//             <a href="#jobs" onClick={() => setActiveView('jobs')} style={{color: activeView === 'jobs' ? 'var(--text)' : 'var(--muted)', background: activeView === 'jobs' ? 'var(--panel-2)' : 'transparent', textDecoration:'none',padding:'6px 10px',borderRadius:'10px'}}>DP Jobs</a>
//         </nav>
//     </header>
// );

// const Sidebar = ({ onRegisterClick, onCreateJobClick }) => (
//     <aside style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'14px',position:'sticky',top:'88px',height:'fit-content'}}>
//         <h3 style={{margin:'6px 0 10px',fontSize:'14px',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.08em'}}>Actions</h3>
//         <div style={{display:'grid',gap:'8px',marginBottom:'14px'}}>
//             <button className="btn" onClick={onRegisterClick}>Register Dataset</button>
//             <button className="btn" onClick={onCreateJobClick}>Create DP Job</button>
//         </div>
//     </aside>
// );


// // --- Page & Connector Components ---

// function DatasetRegistry({ onDatasetClick, onRegisterClick, onImportSchemaClick }) {
//     const [datasets, setDatasets] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         const fetchDatasets = async () => {
//             setLoading(true);
//             try {
//                 const response = await fetch(`${API_BASE_URL}/datasets/`);
//                 if (!response.ok) throw new Error('Failed to fetch datasets from the backend.');
//                 const data = await response.json();
//                 setDatasets(data);
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchDatasets();
//     }, []);

//     return (
//         <section style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'16px',boxShadow:'var(--shadow)'}}>
//             <div style={{display:'flex',gap:'8px',alignItems:'center',justifyContent:'space-between', marginBottom:'16px'}}>
//                 <h2 style={{margin:0}}>Datasets</h2>
//                 <div style={{display:'flex', gap:'10px'}}>
//                     <button className="btn" onClick={onImportSchemaClick}>Import Schema</button>
//                     <button className="btn btn-primary" onClick={onRegisterClick}>Register Dataset</button>
//                 </div>
//             </div>
//             {loading ? <Spinner text="Loading datasets..." /> : error ? <MessageBox message={error} /> :
//                 datasets.length === 0 ? (
//                     <div style={{textAlign:'center',padding:'2.5rem 0',background:'var(--panel-2)', borderRadius:'var(--radius-sm)'}}>
//                         <p style={{color:'var(--muted)'}}>No datasets registered yet.</p>
//                     </div>
//                 ) : (
//                     <table style={{width:'100%',borderCollapse:'collapse',background:'var(--panel-2)',border:'1px solid var(--border)',borderRadius:'12px',overflow:'hidden'}}>
//                         <thead>
//                             <tr>
//                                 <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Name</th>
//                                 <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Source</th>
//                                 <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Records</th>
//                                 <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Last Scanned</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {datasets.map(ds => (
//                                 <tr key={ds.id} onClick={() => onDatasetClick(ds.id)} style={{cursor:'pointer'}}>
//                                     <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px', color:'var(--accent)'}}>{ds.name}</td>
//                                     <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}><span className="badge">{ds.source_type.replace(/_/g, ' ')}</span></td>
//                                     <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{ds.row_count}</td>
//                                     <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{new Date(ds.created_at).toLocaleDateString()}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 )
//             }
//         </section>
//     );
// }

// function DatasetDetailView({ datasetId, onBackClick }) {
//     const [dataset, setDataset] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         const fetchDataset = async () => {
//             if (!datasetId) return;
//             setLoading(true);
//             try {
//                 const response = await fetch(`${API_BASE_URL}/datasets/${datasetId}`);
//                 if (!response.ok) throw new Error(`Failed to fetch dataset ${datasetId}.`);
//                 const data = await response.json();
//                 setDataset(data);
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchDataset();
//     }, [datasetId]);

//     if (loading) return <Spinner text={`Loading dataset ${datasetId}...`} />;
//     if (error) return <MessageBox message={error} />;
//     if (!dataset) return null;

//     return (
//         <section style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'16px',boxShadow:'var(--shadow)'}}>
//             <button onClick={onBackClick} style={{marginBottom:'16px', color:'var(--accent)', background:'none', border:'none', cursor:'pointer', padding:0}}>&larr; Back to Datasets</button>
//             <h2 style={{margin:'0 0 16px'}}>Dataset Details: {dataset.name}</h2>
            
//             <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'16px', marginBottom:'16px'}}>
//                 <div className="kpi">
//                     <h4 style={{margin:'0 0 4px',fontSize:'14px',color:'var(--muted)'}}>Privacy Unit & Identity</h4>
//                     <div style={{color:'var(--muted)'}}>privacy_unit_key: <strong>{dataset.privacy_unit_key}</strong></div>
//                 </div>
//                 <div className="kpi">
//                     <h4 style={{margin:'0 0 4px',fontSize:'14px',color:'var(--muted)'}}>Contribution Limits</h4>
//                     <div style={{color:'var(--muted)'}}>l0 (partitions per user): <strong>{dataset.l0_sensitivity}</strong></div>
//                     <div style={{color:'var(--muted)'}}>linf (rows per partition): <strong>{dataset.linf_sensitivity}</strong></div>
//                 </div>
//             </div>

//             <h3 style={{color:'var(--muted)', marginTop:'24px'}}>Detailed Column Schema</h3>
//             <table style={{width:'100%',borderCollapse:'collapse',background:'var(--panel-2)',border:'1px solid var(--border)',borderRadius:'12px',overflow:'hidden'}}>
//                 <thead>
//                     <tr>
//                         <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Column</th>
//                         <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Type</th>
//                         <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Min</th>
//                         <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Max</th>
//                         <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Clamp</th>
//                         <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>Categorical</th>
//                         <th style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px',color:'var(--muted)',fontWeight:600}}>PII</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {dataset.columns.map(col => (
//                         <tr key={col.name}>
//                             <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{col.name}</td>
//                             <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{col.dtype}</td>
//                             <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{col.min_val ?? '—'}</td>
//                             <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{col.max_val ?? '—'}</td>
//                             <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{col.clamp ? '✓' : '✗'}</td>
//                             <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{col.is_categorical ? '✓' : '✗'}</td>
//                             <td style={{padding:'10px',borderBottom:'1px solid var(--border)',textAlign:'left',fontSize:'14px'}}>{col.is_pii ? <span className="status warn">PII</span> : 'No'}</td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </section>
//     );
// }

// function FileUploadConnector({ onBack, onComplete }) {
//     const [file, setFile] = useState(null);
//     const [datasetName, setDatasetName] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!file || !datasetName) {
//             setError('Please provide a dataset name and select a file.');
//             return;
//         }
//         setLoading(true);
//         setError('');
//         const formData = new FormData();
//         formData.append('file', file);
//         formData.append('dataset_name', datasetName);
//         try {
//             const response = await fetch(`${API_BASE_URL}/connect/file-upload`, { method: 'POST', body: formData });
//             if (!response.ok) {
//                 const errData = await response.json();
//                 throw new Error(errData.detail || 'Failed to register dataset.');
//             }
//             onComplete();
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };
    
//     return (
//         <form onSubmit={handleSubmit} style={{display:'grid', gap:'16px'}}>
//             <input type="text" value={datasetName} onChange={(e) => setDatasetName(e.target.value)} placeholder="Dataset Name (e.g., Employee Salaries)" className="form-input"/>
//             <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
//             <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', alignItems:'center'}}>
//                 <button type="button" onClick={onBack} className="btn">Back</button>
//                 <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Registering...' : 'Register'}</button>
//             </div>
//             <MessageBox message={error} />
//         </form>
//     );
// }

// function LocalDBConnector({ onBack, onComplete }) {
//     const [file, setFile] = useState(null);
//     const [datasetName, setDatasetName] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!file || !datasetName) {
//             setError('Please provide a dataset name and select a database file.');
//             return;
//         }
//         setLoading(true);
//         setError('');
//         const formData = new FormData();
//         formData.append('file', file);
//         formData.append('dataset_name', datasetName);
//         try {
//             const response = await fetch(`${API_BASE_URL}/connect/local-database`, {
//                 method: 'POST',
//                 body: formData
//             });
//             if (!response.ok) {
//                 const errData = await response.json();
//                 throw new Error(errData.detail || 'Failed to register dataset.');
//             }
//             onComplete();
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };
    
//     return (
//         <form onSubmit={handleSubmit} style={{display:'grid', gap:'16px'}}>
//             <input type="text" value={datasetName} onChange={(e) => setDatasetName(e.target.value)} placeholder="Dataset Name (e.g., Legacy Inventory)" className="form-input"/>
//             <input type="file" accept=".db,.sqlite,.sqlite3" onChange={(e) => setFile(e.target.files[0])} />
//             <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', alignItems:'center'}}>
//                 <button type="button" onClick={onBack} className="btn">Back</button>
//                 <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Registering...' : 'Register'}</button>
//             </div>
//             <MessageBox message={error} />
//         </form>
//     );
// }

// function PostgresConnector({ onBack, onComplete }) {
//     const [formState, setFormState] = useState({
//         dataset_name: '', host: '', port: 5432, user: '', password: '', dbname: '', table_name: ''
//     });
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');

//     const handleChange = (e) => {
//         setFormState({ ...formState, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');
//         try {
//             const response = await fetch(`${API_BASE_URL}/connect/postgresql`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(formState)
//             });
//             if (!response.ok) {
//                 const errData = await response.json();
//                 throw new Error(errData.detail || 'Failed to register PostgreSQL dataset.');
//             }
//             onComplete();
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit} style={{display:'grid', gap:'16px'}}>
//             <input name="dataset_name" value={formState.dataset_name} onChange={handleChange} placeholder="Dataset Name" className="form-input"/>
//             <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
//                 <input name="host" value={formState.host} onChange={handleChange} placeholder="Host" className="form-input"/>
//                 <input name="port" value={formState.port} onChange={handleChange} placeholder="Port" type="number" className="form-input"/>
//             </div>
//             <input name="dbname" value={formState.dbname} onChange={handleChange} placeholder="Database Name" className="form-input"/>
//             <input name="table_name" value={formState.table_name} onChange={handleChange} placeholder="Table Name" className="form-input"/>
//             <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
//                 <input name="user" value={formState.user} onChange={handleChange} placeholder="User" className="form-input"/>
//                 <input name="password" value={formState.password} onChange={handleChange} placeholder="Password" type="password" className="form-input"/>
//             </div>
//             <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', alignItems:'center'}}>
//                 <button type="button" onClick={onBack} className="btn">Back</button>
//                 <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Connecting...' : 'Connect and Register'}</button>
//             </div>
//             <MessageBox message={error} />
//         </form>
//     );
// }

// function S3Connector({ onBack, onComplete }) {
//     const [formState, setFormState] = useState({
//         dataset_name: '', aws_access_key_id: '', aws_secret_access_key: '', bucket_name: '', file_key: '', endpoint_url: ''
//     });
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');

//     const handleChange = (e) => {
//         setFormState({ ...formState, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');
//         try {
//             const response = await fetch(`${API_BASE_URL}/connect/s3`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(formState)
//             });
//             if (!response.ok) {
//                 const errData = await response.json();
//                 throw new Error(errData.detail || 'Failed to register S3 dataset.');
//             }
//             onComplete();
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit} style={{display:'grid', gap:'16px'}}>
//             <input name="dataset_name" value={formState.dataset_name} onChange={handleChange} placeholder="Dataset Name" className="form-input"/>
//             <input name="bucket_name" value={formState.bucket_name} onChange={handleChange} placeholder="S3 Bucket Name" className="form-input"/>
//             <input name="file_key" value={formState.file_key} onChange={handleChange} placeholder="File Key (path/to/your/file.csv)" className="form-input"/>
//             <input name="aws_access_key_id" value={formState.aws_access_key_id} onChange={handleChange} placeholder="AWS Access Key ID" className="form-input"/>
//             <input name="aws_secret_access_key" value={formState.aws_secret_access_key} onChange={handleChange} placeholder="AWS Secret Access Key" type="password" className="form-input"/>
//             <input name="endpoint_url" value={formState.endpoint_url} onChange={handleChange} placeholder="Endpoint URL (Optional, for MinIO)" className="form-input"/>
//             <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', alignItems:'center'}}>
//                 <button type="button" onClick={onBack} className="btn">Back</button>
//                 <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Connecting...' : 'Connect and Register'}</button>
//             </div>
//             <MessageBox message={error} />
//         </form>
//     );
// }

// function GCSConnector({ onBack, onComplete }) {
//     const [formState, setFormState] = useState({
//         dataset_name: '', bucket_name: '', file_key: '', service_account_json: ''
//     });
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');

//     const handleChange = (e) => {
//         setFormState({ ...formState, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');
//         try {
//             const response = await fetch(`${API_BASE_URL}/connect/gcs`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(formState)
//             });
//             if (!response.ok) {
//                 const errData = await response.json();
//                 throw new Error(errData.detail || 'Failed to register GCS dataset.');
//             }
//             onComplete();
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit} style={{display:'grid', gap:'16px'}}>
//             <input name="dataset_name" value={formState.dataset_name} onChange={handleChange} placeholder="Dataset Name" className="form-input"/>
//             <input name="bucket_name" value={formState.bucket_name} onChange={handleChange} placeholder="GCS Bucket Name" className="form-input"/>
//             <input name="file_key" value={formState.file_key} onChange={handleChange} placeholder="File Key (path/to/your/file.csv)" className="form-input"/>
//             <textarea name="service_account_json" value={formState.service_account_json} onChange={handleChange} placeholder="Paste your Service Account JSON here" rows="5" className="form-input"></textarea>
//             <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', alignItems:'center'}}>
//                 <button type="button" onClick={onBack} className="btn">Back</button>
//                 <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Connecting...' : 'Connect and Register'}</button>
//             </div>
//             <MessageBox message={error} />
//         </form>
//     );
// }

// function SchemaImporter({ onBack, onComplete }) {
//     const [datasetName, setDatasetName] = useState('');
//     const [schemaJson, setSchemaJson] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         let parsedSchema;
//         try {
//             parsedSchema = JSON.parse(schemaJson);
//         } catch (err) {
//             setError('Invalid JSON format. Please check your schema.');
//             return;
//         }

//         if (!datasetName || !parsedSchema.columns) {
//             setError('Please provide a dataset name and a valid schema with a "columns" array.');
//             return;
//         }

//         setLoading(true);
//         setError('');
        
//         const payload = {
//             dataset_name: datasetName,
//             columns: parsedSchema.columns
//         };

//         try {
//             const response = await fetch(`${API_BASE_URL}/datasets/import-schema`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload)
//             });
//             if (!response.ok) {
//                 const errData = await response.json();
//                 throw new Error(errData.detail || 'Failed to import schema.');
//             }
//             onComplete();
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//          <section style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'16px',boxShadow:'var(--shadow)'}}>
//             <button onClick={onBack} style={{marginBottom:'16px', color:'var(--accent)', background:'none', border:'none', cursor:'pointer', padding:0}}>&larr; Back to Datasets</button>
//             <h2 style={{margin:'0 0 16px'}}>Import Schema</h2>
//             <form onSubmit={handleSubmit} style={{display:'grid', gap:'16px'}}>
//                 <input type="text" value={datasetName} onChange={(e) => setDatasetName(e.target.value)} placeholder="Dataset Name (e.g., Production Users)" className="form-input"/>
//                 <textarea value={schemaJson} onChange={(e) => setSchemaJson(e.target.value)} placeholder='Paste your JSON schema here. e.g., { "columns": [...] }' rows="8" className="form-input"></textarea>
//                 <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', alignItems:'center'}}>
//                     <button type="button" onClick={onBack} className="btn">Back</button>
//                     <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Importing...' : 'Import Schema'}</button>
//                 </div>
//                 <MessageBox message={error} />
//             </form>
//         </section>
//     );
// }

// function ConnectDataSource({ onBackClick, onComplete }) {
//     const [connectorType, setConnectorType] = useState(null);

//     const renderConnector = () => {
//         switch(connectorType) {
//             case 'file_upload': return <FileUploadConnector onBack={() => setConnectorType(null)} onComplete={onComplete} />;
//             case 'local_database': return <LocalDBConnector onBack={() => setConnectorType(null)} onComplete={onComplete} />;
//             case 'postgresql': return <PostgresConnector onBack={() => setConnectorType(null)} onComplete={onComplete} />;
//             case 's3': return <S3Connector onBack={() => setConnectorType(null)} onComplete={onComplete} />;
//             case 'gcs': return <GCSConnector onBack={() => setConnectorType(null)} onComplete={onComplete} />;
//             default: return null;
//         }
//     }
    
//     return (
//         <section style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'16px',boxShadow:'var(--shadow)'}}>
//             <button onClick={onBackClick} style={{marginBottom:'16px', color:'var(--accent)', background:'none', border:'none', cursor:'pointer', padding:0}}>&larr; Back to Datasets</button>
//             <h2 style={{margin:'0 0 16px'}}>{connectorType ? `Connect via ${connectorType.replace(/_/g, ' ')}` : 'Connect New Data Source'}</h2>
            
//             {connectorType ? renderConnector() : (
//                 <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'16px'}}>
//                     <div className="card-hover" onClick={() => setConnectorType('file_upload')} style={{padding:'16px', background:'var(--panel-2)', borderRadius:'var(--radius-sm)', cursor:'pointer'}}>
//                         <h3 style={{margin:0}}>File Upload</h3>
//                         <p style={{color:'var(--muted)', fontSize:'14px'}}>Register a dataset by uploading a CSV file.</p>
//                     </div>
//                     <div className="card-hover" onClick={() => setConnectorType('local_database')} style={{padding:'16px', background:'var(--panel-2)', borderRadius:'var(--radius-sm)', cursor:'pointer'}}>
//                         <h3 style={{margin:0}}>Database Upload</h3>
//                         <p style={{color:'var(--muted)', fontSize:'14px'}}>Upload a database file like SQLite.</p>
//                     </div>
//                     <div className="card-hover" onClick={() => setConnectorType('postgresql')} style={{padding:'16px', background:'var(--panel-2)', borderRadius:'var(--radius-sm)', cursor:'pointer'}}>
//                         <h3 style={{margin:0}}>PostgreSQL</h3>
//                         <p style={{color:'var(--muted)', fontSize:'14px'}}>Connect to a remote PostgreSQL database.</p>
//                     </div>
//                     <div className="card-hover" onClick={() => setConnectorType('s3')} style={{padding:'16px', background:'var(--panel-2)', borderRadius:'var(--radius-sm)', cursor:'pointer'}}>
//                         <h3 style={{margin:0}}>AWS S3</h3>
//                         <p style={{color:'var(--muted)', fontSize:'14px'}}>Connect to a CSV file in an S3 bucket.</p>
//                     </div>
//                      <div className="card-hover" onClick={() => setConnectorType('gcs')} style={{padding:'16px', background:'var(--panel-2)', borderRadius:'var(--radius-sm)', cursor:'pointer'}}>
//                         <h3 style={{margin:0}}>Google Cloud</h3>
//                         <p style={{color:'var(--muted)', fontSize:'14px'}}>Connect to a CSV file in a GCS bucket.</p>
//                     </div>
//                 </div>
//             )}
//         </section>
//     );
// }

// function CreateDPJobView({ datasetId, onBackClick }) {
//     // This is a placeholder for now
//     return (
//          <section style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'16px',boxShadow:'var(--shadow)'}}>
//              <button onClick={onBackClick} style={{marginBottom:'16px', color:'var(--accent)', background:'none', border:'none', cursor:'pointer', padding:0}}>&larr; Back to Datasets</button>
//             <h2 style={{margin:'0 0 16px'}}>Create DP Job</h2>
//             <p style={{color:'var(--muted)'}}>Dataset ID: <strong>{datasetId || 'None selected'}</strong>.</p>
//             <div style={{marginTop:'2rem', padding:'2rem', background:'var(--panel-2)', borderRadius:'var(--radius-sm)', textAlign:'center', border:'1px dashed var(--border)'}}>
//                 <p>The job creation wizard will be implemented in Phase 2.</p>
//             </div>
//         </section>
//     );
// }


// // --- Main App Component ---

// export default function App() {
//     const [view, setView] = useState('datasets');
//     const [currentDatasetId, setCurrentDatasetId] = useState(null);
//     const [key, setKey] = useState(Date.now());

//     const handleDatasetRegistered = () => {
//         setKey(Date.now());
//         setView('datasets');
//     };

//     const handleCreateJobClick = (dataset = null) => {
//         setCurrentDatasetId(dataset ? dataset.id : null);
//         setView('create_job');
//     };

//     const handleDatasetClick = (datasetId) => {
//         setCurrentDatasetId(datasetId);
//         setView('dataset_detail');
//     };
    
//     const renderView = () => {
//         switch (view) {
//             case 'register':
//                 return <ConnectDataSource onBackClick={() => setView('datasets')} onComplete={handleDatasetRegistered} />;
//             case 'import_schema':
//                 return <SchemaImporter onBack={() => setView('datasets')} onComplete={handleDatasetRegistered} />;
//             case 'dataset_detail':
//                 return <DatasetDetailView datasetId={currentDatasetId} onBackClick={() => setView('datasets')} />;
//             case 'create_job':
//                 return <CreateDPJobView datasetId={currentDatasetId} onBackClick={() => setView('datasets')} />;
//             case 'datasets':
//             default:
//                 return <DatasetRegistry key={key} onDatasetClick={handleDatasetClick} onRegisterClick={() => setView('register')} onImportSchemaClick={() => setView('import_schema')} onCreateJobClick={handleCreateJobClick} />;
//         }
//     };

//     return (
//         <>
//             <GlobalStyles />
//             <Topbar activeView={view} setActiveView={setView} />
//             <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:'18px',maxWidth:'1240px',margin:'20px auto',padding:'0 16px'}}>
//                 <Sidebar onRegisterClick={() => setView('register')} onCreateJobClick={() => handleCreateJobClick(null)} />
//                 <main style={{display:'grid',gap:'20px'}}>
//                     {renderView()}
//                 </main>
//             </div>
//         </>
//     );
// }
