import { API_BASE_URL } from '../constants';

/**
 * Base API configuration and helper functions
 */

/**
 * Creates headers for API requests
 * @param {Object} additionalHeaders - Additional headers to include
 * @returns {Object} Headers object
 */
export const createApiHeaders = (additionalHeaders = {}) => {
  return {
    'Content-Type': 'application/json',
    ...additionalHeaders
  };
};

/**
 * Creates a complete API URL
 * @param {string} endpoint - API endpoint
 * @returns {string} Complete API URL
 */
export const createApiUrl = (endpoint) => {
  return `${API_BASE_URL}/api/web${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

/**
 * Generic API request handler with error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} API response
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = createApiUrl(endpoint);
  const headers = createApiHeaders(options.headers);
  
  try {
    console.log('🌐 Making API request:', { url, method: options.method || 'GET', headers });
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    console.log('📡 API Response status:', response.status, response.statusText);

    const result = await response.json();
    console.log('📋 API Response data:', result);

    if (!response.ok) {
      throw new Error(result.errorMessage || `API request failed with status ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error(`💥 API request to ${endpoint} failed:`, error);
    throw error;
  }
};