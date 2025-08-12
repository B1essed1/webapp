import { useState, useEffect } from 'react';
import { AdminAuth } from '../utils/adminAuth';

/**
 * Hook for managing admin authentication state
 * @returns {Object} Authentication state and functions
 */
export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => AdminAuth.isAuthenticated());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = AdminAuth.isAuthenticated();
      setIsAuthenticated(authenticated);
    };

    checkAuth();

    // Listen for storage changes (if user logs out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'admin_access_token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);

    try {
      await AdminAuth.login(username, password);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AdminAuth.logout();
    setIsAuthenticated(false);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError
  };
};