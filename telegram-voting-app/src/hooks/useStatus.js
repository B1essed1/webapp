import { useState, useCallback } from 'react';
import { MESSAGE_TYPES } from '../constants';

/**
 * Custom hook for managing status messages
 * @returns {Object} Status state and management functions
 */
export const useStatus = () => {
  const [status, setStatus] = useState({
    message: '',
    type: '',
    show: false,
    url: null
  });

  /**
   * Shows a status message
   * @param {string} message - Message to display
   * @param {string} type - Message type (success, error, loading)
   * @param {string|null} url - Optional URL for action buttons
   */
  const showStatus = useCallback((message, type = MESSAGE_TYPES.SUCCESS, url = null) => {
    setStatus({
      message,
      type,
      show: true,
      url
    });
  }, []);

  /**
   * Shows a success message
   * @param {string} message - Success message
   * @param {string|null} url - Optional URL for action buttons
   */
  const showSuccess = useCallback((message, url = null) => {
    showStatus(message, MESSAGE_TYPES.SUCCESS, url);
  }, [showStatus]);

  /**
   * Shows an error message
   * @param {string} message - Error message
   */
  const showError = useCallback((message) => {
    showStatus(message, MESSAGE_TYPES.ERROR);
  }, [showStatus]);

  /**
   * Shows a loading message
   * @param {string} message - Loading message
   */
  const showLoading = useCallback((message) => {
    showStatus(message, MESSAGE_TYPES.LOADING);
  }, [showStatus]);

  /**
   * Hides the current status message
   */
  const hideStatus = useCallback(() => {
    setStatus({
      message: '',
      type: '',
      show: false,
      url: null
    });
  }, []);

  /**
   * Checks if status is currently visible
   * @returns {boolean} True if status is visible
   */
  const isStatusVisible = useCallback(() => {
    return status.show;
  }, [status.show]);

  /**
   * Gets the current status type
   * @returns {string} Current status type
   */
  const getStatusType = useCallback(() => {
    return status.type;
  }, [status.type]);

  return {
    status,
    showStatus,
    showSuccess,
    showError,
    showLoading,
    hideStatus,
    isStatusVisible,
    getStatusType,
  };
};