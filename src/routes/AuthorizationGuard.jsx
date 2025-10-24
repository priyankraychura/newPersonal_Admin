import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

/**
 * This component checks if a user has the required role to access a route.
 * @param {{ children: React.ReactNode, allowedRoles: string[] }} props
 */
const AuthorizationGuard = ({ children, allowedRoles }) => {
  const user = useSelector(state => state?.userReducer?.userData);

  // If there are no specific roles required, we only check if the user is logged in.
  // This makes it a simple protected route for any authenticated user.
  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  // Check if the user's role is included in the allowed roles for this route.
  const hasRequiredRole = user && allowedRoles.includes(user.role);

  if (hasRequiredRole) {
    return children; // User has the role, so render the component.
  }

  // If the user does not have the required role, redirect them.
  // You can redirect to the dashboard or a dedicated "403 Access Denied" page.
  return <Navigate to="/dashboard" replace />;
};

export default AuthorizationGuard;