import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Head>
        <title>DP Platform - Standalone Differential Privacy Prototype</title>
        <meta name="description" content="Standalone Differential Privacy Platform for Development and Testing" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main style={{ paddingTop: '76px', minHeight: 'calc(100vh - 200px)' }}>
        <div className="container">
          {/* Hero Section */}
          <div className="row align-items-center py-5">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold text-primary">
                <i className="bi bi-shield-lock me-3"></i>
                DP Platform
              </h1>
              <h2 className="h4 text-muted mb-4">
                Standalone Differential Privacy Prototype
              </h2>
              <p className="lead mb-4">
                A complete wireframe implementation of differential privacy functionality, 
                designed for independent development and testing without external dependencies.
              </p>
              <div className="d-flex gap-3">
                <Link href="/dp" className="btn btn-primary btn-lg">
                  <i className="bi bi-rocket me-2"></i>
                  Launch DP Dashboard
                </Link>
                <Link href="/dp/operations" className="btn btn-outline-primary btn-lg">
                  <i className="bi bi-gear me-2"></i>
                  Operations Center
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="text-center">
                <i className="bi bi-diagram-3-fill text-primary" style={{ fontSize: '12rem', opacity: 0.1 }}></i>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="row py-5">
            <div className="col-12">
              <h3 className="text-center mb-5">Platform Features</h3>
            </div>
            
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <i className="bi bi-database text-primary mb-3" style={{ fontSize: '2.5rem' }}></i>
                  <h5>Dataset Management</h5>
                  <p className="text-muted">
                    Register, configure, and manage datasets for differential privacy analysis
                  </p>
                  <Link href="/dp/dataset" className="btn btn-outline-primary btn-sm">
                    Explore <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <i className="bi bi-braces-asterisk text-primary mb-3" style={{ fontSize: '2.5rem' }}></i>
                  <h5>Query Engine</h5>
                  <p className="text-muted">
                    Execute differential privacy queries with configurable mechanisms
                  </p>
                  <Link href="/dp/queries" className="btn btn-outline-primary btn-sm">
                    Explore <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <i className="bi bi-calculator text-primary mb-3" style={{ fontSize: '2.5rem' }}></i>
                  <h5>Privacy Accounting</h5>
                  <p className="text-muted">
                    Monitor and manage privacy budget consumption across datasets
                  </p>
                  <Link href="/dp/accounting" className="btn btn-outline-primary btn-sm">
                    Explore <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <i className="bi bi-diagram-3 text-primary mb-3" style={{ fontSize: '2.5rem' }}></i>
                  <h5>Privacy Mechanisms</h5>
                  <p className="text-muted">
                    Configure Laplace, Gaussian, and other differential privacy mechanisms
                  </p>
                  <Link href="/dp/mechanisms" className="btn btn-outline-primary btn-sm">
                    Explore <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <i className="bi bi-bar-chart text-primary mb-3" style={{ fontSize: '2.5rem' }}></i>
                  <h5>Simulation Tools</h5>
                  <p className="text-muted">
                    Test privacy mechanisms and analyze performance before deployment
                  </p>
                  <Link href="/dp/simulation" className="btn btn-outline-primary btn-sm">
                    Explore <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <i className="bi bi-clipboard-data text-primary mb-3" style={{ fontSize: '2.5rem' }}></i>
                  <h5>Audit & Reports</h5>
                  <p className="text-muted">
                    Comprehensive logging and reporting for compliance and analysis
                  </p>
                  <Link href="/dp/audit" className="btn btn-outline-primary btn-sm">
                    Explore <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Info */}
          <div className="row py-5 bg-light rounded">
            <div className="col-12">
              <h3 className="text-center mb-4">Technical Specifications</h3>
              <div className="row">
                <div className="col-md-6">
                  <h6><i className="bi bi-check-circle text-success me-2"></i>Self-Contained</h6>
                  <p className="small text-muted mb-3">
                    No external dependencies - all components are standalone and mock backend services
                  </p>
                  
                  <h6><i className="bi bi-check-circle text-success me-2"></i>Full UI/UX</h6>
                  <p className="small text-muted mb-3">
                    Complete differential privacy interface with interactive charts and forms
                  </p>
                  
                  <h6><i className="bi bi-check-circle text-success me-2"></i>Developer Ready</h6>
                  <p className="small text-muted mb-3">
                    Clean, modular structure perfect for development and customization
                  </p>
                </div>
                <div className="col-md-6">
                  <h6><i className="bi bi-gear text-primary me-2"></i>Technology Stack</h6>
                  <ul className="list-unstyled small">
                    <li>• Next.js 15+ (React Framework)</li>
                    <li>• Bootstrap 5.3 (UI Components)</li>
                    <li>• Chart.js (Data Visualization)</li>
                    <li>• Bootstrap Icons (Icon Library)</li>
                    <li>• Mock API Services (Backend Simulation)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
