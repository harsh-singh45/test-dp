import React from 'react';

// Mock ProtectedRoute component for standalone prototype
const ProtectedRoute = ({ children }) => {
  // In the standalone version, we simply render the children without authentication
  // This simulates being authenticated
  const mockUser = {
    id: 'prototype-user',
    name: 'Prototype User',
    email: 'prototype@example.com'
  };

  return children(mockUser);
};

export default ProtectedRoute;
