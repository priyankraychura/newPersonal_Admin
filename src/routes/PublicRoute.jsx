import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  // If a token exists, redirect the user to the dashboard.
  if (token && token.length > 0) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the children (the login page).
  return children;
};

export default PublicRoute;