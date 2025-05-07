import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../Contexts/UserContext';

function AdminRoute({ children }) {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <p>Loading...</p>;
  }

  return user.role === "admin" ? children : <Navigate to="/" />;
}

export default AdminRoute;