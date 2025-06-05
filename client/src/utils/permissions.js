// Authentication and permission utilities
import { UserContext } from '../Contexts/UserContext';
import { useContext } from 'react';

// Permission levels
export const PERMISSIONS = {
  PUBLIC: 'public',           // Available to everyone
  AUTHENTICATED: 'authenticated', // Requires login
  ADMIN: 'admin'              // Requires admin role
};

/**
 * Custom hook to check if a user has the required permission
 */
export const usePermission = () => {
  const { user, loading } = useContext(UserContext);

  /**
   * Check if the current user has the required permission
   * @param {string} requiredPermission - Permission required (from PERMISSIONS enum)
   * @returns {boolean} - Whether the user has the required permission
   */
  const hasPermission = (requiredPermission) => {
    // Always allow public routes
    if (requiredPermission === PERMISSIONS.PUBLIC) return true;
    
    // If still loading or no user, deny access to protected routes
    if (loading || !user) return false;
    
    // Check admin permission
    if (requiredPermission === PERMISSIONS.ADMIN) {
      return user.role === 'admin';
    }
    
    // For authenticated permission, just need a valid user
    if (requiredPermission === PERMISSIONS.AUTHENTICATED) {
      return true;
    }
    
    // Default deny
    return false;
  };

  return { hasPermission, isLoading: loading };
};

/**
 * Get the required permission for a route
 * @param {string} path - Route path
 * @returns {string} - Required permission from PERMISSIONS enum
 */
export const getRoutePermission = (path) => {
  // Admin routes
  if (path.startsWith('/admin')) {
    return PERMISSIONS.ADMIN;
  }
  
  // Public routes
  if (
    path === '/' || 
    path === '/login' || 
    path === '/signup' || 
    path === '/muscle-groups'
  ) {
    return PERMISSIONS.PUBLIC;
  }
  
  // All other routes require authentication
  return PERMISSIONS.AUTHENTICATED;
};
