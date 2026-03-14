import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/Layout/DashboardLayout';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Admins trying user routes → admin portal; users trying admin routes → dashboard
    const fallback = user.role === 'ADMIN' ? '/admin/accounts' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  // Wrap all protected routes in the layout
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default ProtectedRoute;

