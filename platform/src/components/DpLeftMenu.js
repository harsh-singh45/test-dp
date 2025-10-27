import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const DpLeftMenu = ({ activeMenu }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeout = useRef(null);
  const router = useRouter();

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setIsHovered(false);
    }, 500);
  };

  const menuItems = [
    {
      id: 'home',
      label: 'Home',
      icon: 'bi-house-door',
      href: '/dp'
    },
    {
      id: 'datasets',
      label: 'Datasets',
      icon: 'bi-database',
      href: '/dp/dataset'
    },
    {
      id: 'mechanisms',
      label: 'Mechanisms',
      icon: 'bi-diagram-3',
      href: '/dp/mechanisms'
    },
    {
      id: 'queries',
      label: 'Queries',
      icon: 'bi-braces-asterisk',
      href: '/dp/queries'
    },
    {
      id: 'accounting',
      label: 'Privacy Accounting',
      icon: 'bi-calculator',
      href: '/dp/accounting'
    },
    {
      id: 'simulation',
      label: 'Simulation',
      icon: 'bi-bar-chart',
      href: '/dp/simulation'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'bi-file-earmark-text',
      href: '/dp/reports'
    },
    {
      id: 'audit',
      label: 'Audit Log',
      icon: 'bi-clipboard-data',
      href: '/dp/audit'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'bi-gear',
      href: '/dp/settings'
    }
  ];

  const isActiveRoute = (href) => {
    return router.pathname === href;
  };

  return (
    <div
      className={`sidebar sidebar-dp hover-expand ${isHovered ? "expanded" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: isHovered ? '200px' : '60px',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #dee2e6',
        transition: 'width 0.3s ease',
        position: 'sticky',
        top: '76px',
        zIndex: 100
      }}
    >
      <div className="sidebar-header p-3">
        <i className="bi bi-list"></i>
        {isHovered && <span className="ms-2">Menu</span>}
      </div>

      <ul className="nav flex-column">
        {menuItems.map((item) => (
          <li key={item.id} className="nav-item">
            <Link 
              href={item.href}
              className={`nav-link d-flex align-items-center px-3 py-2 ${
                isActiveRoute(item.href) || activeMenu === item.id ? 'active bg-primary text-white' : 'text-dark'
              }`}
              style={{
                borderRadius: isHovered ? '0.375rem' : '0',
                margin: isHovered ? '0 0.5rem' : '0'
              }}
            >
              <i className={`bi ${item.icon}`}></i>
              {isHovered && <span className="ms-2">{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DpLeftMenu;
