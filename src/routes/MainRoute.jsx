import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
// import LoanQueries from '../components/LoanQueries';
import Users from '../components/Users';
import Analytics from '../components/Analytics';
import Settings from '../components/Settings';
import AuthForm from '../components/AuthForm.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicRoute from './PublicRoute.jsx';
import DashboardLayout from '../components/DashboardLayout.jsx';
import VerifyEmail from '../components/verifyEmail.jsx';
import ClientRegistration from '../pages/ClientRegistration.jsx';
import AdminInvitationPanel from '../pages/AdminInvitationPanel.jsx';
import UserManagementPage from '../pages/UserManagementPage.jsx';
import ClientRegistrationPage from '../pages/ClientRegistrationPage.jsx';
import Notes from '../pages/Notes.jsx';
import ContactFormTable from '../pages/ContactFormTable.jsx';
import TodoApp from '../pages/TodoApp.jsx';
import AboutPage from '../pages/AboutPage.jsx';
import AuthorizationGuard from './AuthorizationGuard.jsx';

// Define your roles somewhere for consistency
const ROLES = {
  SUPERADMIN: 'superadmin',
  USER: 'user',
};

// Define protected routes configuration
const protectedRoutes = [
  { path: 'dashboard', element: <Dashboard />, isDefault: true },
  { path: 'notes', element: <Notes /> },
  { path: 'todo', element: <TodoApp /> },
  // { path: 'loan-queries', element: <LoanQueries /> },
  { path: 'management/users', element: <Users /> },
  { path: 'management/invitations', element: <AdminInvitationPanel /> },
  { path: 'management/user-management', element: <UserManagementPage /> },
  { path: 'contact-form', element: <ContactFormTable />, allowedRoles: [ROLES.SUPERADMIN] },
  { path: 'analytics', element: <Analytics /> },
  { path: 'settings', element: <Settings /> },
  { path: 'about', element: <AboutPage /> },
];

const MainRoute = () => {
  return (
    <Routes>
      {/* Public Route - Login */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <AuthForm />
          </PublicRoute>
        }
      />
      <Route
        path="/verify-email/:token"
        element={
          <VerifyEmail />
        }
      />
      <Route
        path="/client-register"
        element={
          <ClientRegistrationPage
          />
        }
      />

      {/* Protected Routes - Single DashboardLayout with nested routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Redirect root protected route to dashboard */}
        <Route path="" element={<Navigate to="/dashboard" replace />} />

        {/* Generate nested routes */}
        {protectedRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <AuthorizationGuard allowedRoles={route.allowedRoles}>
                {route.element}
              </AuthorizationGuard>
            }
          />
        ))}
      </Route>

      {/* Fallback route - 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-4">Page Not Found</p>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default MainRoute;