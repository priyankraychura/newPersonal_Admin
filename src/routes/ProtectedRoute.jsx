import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // If there's no token, redirect to the login page
  if (!token || token.length === 0) {
    return <Navigate to="/" replace />;
  }
  // Otherwise, render the child components
  return children;
};

export default ProtectedRoute;