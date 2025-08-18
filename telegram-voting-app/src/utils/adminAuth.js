import { API_BASE_URL } from '../constants';

const ADMIN_TOKEN_KEY = 'admin_access_token';

/**
 * Admin authentication utilities
 */
export class AdminAuth {
  /**
   * Login with username and password
   * @param {string} username - Admin username
   * @param {string} password - Admin password
   * @returns {Promise<Object>} Login response with token
   */
  static async login(username, password) {
    const requestData = {
      username,
      password
    };

    console.log('🔐 Admin login attempt for:', username);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      console.log('🔐 Admin login response:', result);

      if (response.ok && result.data?.accessToken) {
        // Store the access token
        this.setToken(result.data.accessToken);
        return result;
      } else {
        throw new Error(result.errorMessage || 'Login failed');
      }
    } catch (error) {
      console.error('💥 Admin login error:', error);
      throw error;
    }
  }

  /**
   * Store the admin access token
   * @param {string} token - JWT access token
   */
  static setToken(token) {
    console.log('🔐 Storing admin token');
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  }

  /**
   * Get the stored admin access token
   * @returns {string|null} JWT access token
   */
  static getToken() {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  }

  /**
   * Check if admin is authenticated
   * @returns {boolean} True if token exists
   */
  static isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  /**
   * Clear admin authentication
   */
  static logout() {
    console.log('🔐 Admin logout - clearing token');
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }

  /**
   * Create headers with admin authorization
   * @param {Object} additionalHeaders - Additional headers
   * @returns {Object} Headers with authorization
   */
  static createAuthHeaders(additionalHeaders = {}) {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...additionalHeaders
    };
  }

  /**
   * Make authenticated admin API request
   * @param {string} endpoint - API endpoint (e.g., '/votes')
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} API response
   */
  static async makeAuthenticatedRequest(endpoint, options = {}) {
    const headers = this.createAuthHeaders(options.headers);
    
    try {
      console.log('🔐 Making authenticated admin request to:', endpoint);
      
      const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
        ...options,
        headers
      });

      // Check for authentication errors
      if (response.status === 401 || response.status === 403) {
        console.error('🔐 Authentication failed - clearing token and redirecting to login');
        this.logout();
        throw new AuthenticationError('Authentication failed', response.status);
      }

      const result = await response.json();
      console.log('🔐 Admin API response:', result);

      if (!response.ok) {
        throw new Error(result.errorMessage || `Request failed with status ${response.status}`);
      }

      return result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      console.error('💥 Admin API request error:', error);
      throw error;
    }
  }
}

/**
 * Custom error for authentication failures
 */
export class AuthenticationError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = status;
  }
}