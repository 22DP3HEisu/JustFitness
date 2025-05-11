import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../Contexts/UserContext';

function PrivateRoute({ children }) {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <p>Loading...</p>;
  }

  return user ? children : <Navigate to="/" />;
}

export default PrivateRoute;