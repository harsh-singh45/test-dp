// In frontend/src/components/views/ConnectDataSource.jsx
import React, { useState } from 'react';
import { FileUploadConnector } from '../connectors/FileUploadConnector';
import { LocalDBConnector } from '../connectors/LocalDBConnector';
import { PostgresConnector } from '../connectors/PostgresConnector';
import { S3Connector } from '../connectors/S3Connector';
import { GCSConnector } from '../connectors/GCSConnector';

export function ConnectDataSource({ onBackClick, onComplete }) {
    const [connectorType, setConnectorType] = useState(null);

    const renderConnector = () => {
        switch(connectorType) {
            case 'file_upload': return <FileUploadConnector onBack={() => setConnectorType(null)} onComplete={onComplete} />;
            case 'local_database': return <LocalDBConnector onBack={() => setConnectorType(null)} onComplete={onComplete} />;
            case 'postgresql': return <PostgresConnector onBack={() => setConnectorType(null)} onComplete={onComplete} />;
            case 's3': return <S3Connector onBack={() => setConnectorType(null)} onComplete={onComplete} />;
            case 'gcs': return <GCSConnector onBack={() => setConnectorType(null)} onComplete={onComplete} />;
            default: return null;
        }
    }
    
    return (
        <section style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'16px',boxShadow:'var(--shadow)'}}>
            <button onClick={onBackClick} style={{marginBottom:'16px', color:'var(--accent)', background:'none', border:'none', cursor:'pointer', padding:0}}>&larr; Back to Datasets</button>
            <h2 style={{margin:'0 0 16px'}}>{connectorType ? `Connect via ${connectorType.replace(/_/g, ' ')}` : 'Connect New Data Source'}</h2>
            
            {connectorType ? renderConnector() : (
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'16px'}}>
                    <div className="card-hover" onClick={() => setConnectorType('file_upload')} style={{padding:'16px', background:'var(--panel-2)', borderRadius:'var(--radius-sm)', cursor:'pointer'}}>
                        <h3 style={{margin:0}}>File Upload</h3>
                        <p style={{color:'var(--muted)', fontSize:'14px'}}>Register a dataset by uploading a CSV file.</p>
                    </div>
                    <div className="card-hover" onClick={() => setConnectorType('local_database')} style={{padding:'16px', background:'var(--panel-2)', borderRadius:'var(--radius-sm)', cursor:'pointer'}}>
                        <h3 style={{margin:0}}>Database Upload</h3>
                        <p style={{color:'var(--muted)', fontSize:'14px'}}>Upload a database file like SQLite.</p>
                    </div>
                    <div className="card-hover" onClick={() => setConnectorType('postgresql')} style={{padding:'16px', background:'var(--panel-2)', borderRadius:'var(--radius-sm)', cursor:'pointer'}}>
                        <h3 style={{margin:0}}>PostgreSQL</h3>
                        <p style={{color:'var(--muted)', fontSize:'14px'}}>Connect to a remote PostgreSQL database.</p>
                    </div>
                    <div className="card-hover" onClick={() => setConnectorType('s3')} style={{padding:'16px', background:'var(--panel-2)', borderRadius:'var(--radius-sm)', cursor:'pointer'}}>
                        <h3 style={{margin:0}}>AWS S3</h3>
                        <p style={{color:'var(--muted)', fontSize:'14px'}}>Connect to a CSV file in an S3 bucket.</p>
                    </div>
                     <div className="card-hover" onClick={() => setConnectorType('gcs')} style={{padding:'16px', background:'var(--panel-2)', borderRadius:'var(--radius-sm)', cursor:'pointer'}}>
                        <h3 style={{margin:0}}>Google Cloud</h3>
                        <p style={{color:'var(--muted)', fontSize:'14px'}}>Connect to a CSV file in a GCS bucket.</p>
                    </div>
                </div>
            )}
        </section>
    );
}