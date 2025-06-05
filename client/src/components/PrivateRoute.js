import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermission, PERMISSIONS } from '../utils/permissions';

function PrivateRoute({ children, permission = PERMISSIONS.AUTHENTICATED }) {
  const { hasPermission, isLoading } = usePermission();
  const location = useLocation();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!hasPermission(permission)) {
    // Redirect to login if not authenticated, or home if authenticated but not authorized
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default PrivateRoute;