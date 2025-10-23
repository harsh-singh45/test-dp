import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useEffect } from 'react';

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Import Bootstrap JS on client side only
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style jsx global>{`
        :root {
          --bs-primary: #6610f2;
          --bs-primary-rgb: 102, 16, 242;
        }

        .ribbon-item {
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s ease;
          color: inherit;
          text-decoration: none;
        }

        .ribbon-item:hover {
          transform: translateY(-2px);
        }

        .ribbon-item a {
          color: inherit;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .ribbon-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--bs-primary), var(--bs-primary));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          box-shadow: 0 2px 8px rgba(102, 16, 242, 0.2);
        }

        .ribbon-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--bs-gray-700);
        }

        .info-card {
          background: linear-gradient(135deg, rgba(102, 16, 242, 0.02), rgba(102, 16, 242, 0.05));
          border: 1px solid rgba(102, 16, 242, 0.1);
          border-radius: 0.5rem;
        }

        .info-card h1 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--bs-primary);
          margin-bottom: 1rem;
        }

        .api-request li {
          padding: 0.25rem 0;
          font-size: 0.875rem;
        }

        .api-request li::before {
          margin-right: 0.5rem;
          color: var(--bs-primary);
        }

        .sidebar {
          background-color: #f8f9fa;
          border-right: 1px solid #dee2e6;
          overflow: hidden;
        }

        .sidebar .nav-link {
          color: #495057;
          border-radius: 0.375rem;
          margin: 0.125rem 0.5rem;
          padding: 0.75rem 1rem;
          transition: all 0.15s ease-in-out;
        }

        .sidebar .nav-link:hover {
          background-color: #e9ecef;
          color: #0d6efd;
        }

        .sidebar .nav-link.active {
          background-color: #0d6efd;
          color: white;
        }

        .topRibbon {
          background: rgba(102, 16, 242, 0.03);
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .progress {
          background-color: #e9ecef;
        }

        .badge {
          font-size: 0.75em;
        }

        .table th {
          border-top: none;
          font-weight: 600;
          font-size: 0.875rem;
          color: #495057;
        }

        .table-hover tbody tr:hover {
          background-color: rgba(102, 16, 242, 0.04);
        }

        .form-control:focus,
        .form-select:focus {
          border-color: rgba(102, 16, 242, 0.5);
          box-shadow: 0 0 0 0.25rem rgba(102, 16, 242, 0.1);
        }

        .btn-primary {
          background-color: var(--bs-primary);
          border-color: var(--bs-primary);
        }

        .btn-primary:hover {
          background-color: #5a0ecf;
          border-color: #5a0ecf;
        }

        .btn-outline-primary {
          color: var(--bs-primary);
          border-color: var(--bs-primary);
        }

        .btn-outline-primary:hover {
          background-color: var(--bs-primary);
          border-color: var(--bs-primary);
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
