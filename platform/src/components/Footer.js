import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h6 className="mb-3">
              <i className="bi bi-shield-lock me-2"></i>
              DP Platform
            </h6>
            <p className="small text-muted">
              Standalone Differential Privacy Platform - Prototype Environment
            </p>
          </div>
          <div className="col-md-3">
            <h6 className="mb-3">Resources</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="text-muted text-decoration-none small">Documentation</a></li>
              <li><a href="#" className="text-muted text-decoration-none small">API Reference</a></li>
              <li><a href="#" className="text-muted text-decoration-none small">Examples</a></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h6 className="mb-3">Support</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="text-muted text-decoration-none small">Help Center</a></li>
              <li><a href="#" className="text-muted text-decoration-none small">Contact</a></li>
              <li><a href="#" className="text-muted text-decoration-none small">Status</a></li>
            </ul>
          </div>
        </div>
        <hr className="my-4"/>
        <div className="row">
          <div className="col-md-8">
            <p className="small text-muted mb-0">
              © 2024 DP Platform. Prototype Version. All rights reserved.
            </p>
          </div>
          <div className="col-md-4 text-md-end">
            <div className="d-flex justify-content-md-end gap-3">
              <a href="#" className="text-muted"><i className="bi bi-github"></i></a>
              <a href="#" className="text-muted"><i className="bi bi-twitter"></i></a>
              <a href="#" className="text-muted"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
