import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
      <div className="container-fluid">
        <Link href="/" className="navbar-brand d-flex align-items-center">
          <i className="bi bi-shield-lock me-2"></i>
          <span>DP Platform</span>
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link href="/dp" className="nav-link">
                <i className="bi bi-house-door me-1"></i>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/dp/dataset" className="nav-link">
                <i className="bi bi-database me-1"></i>
                Datasets
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/dp/queries" className="nav-link">
                <i className="bi bi-braces-asterisk me-1"></i>
                Queries
              </Link>
            </li>
          </ul>
          
          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                <i className="bi bi-person-circle me-1"></i>
                User
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#">Profile</a></li>
                <li><a className="dropdown-item" href="#">Settings</a></li>
                <li><hr className="dropdown-divider"/></li>
                <li><a className="dropdown-item" href="#">Logout</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
