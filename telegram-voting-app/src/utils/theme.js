import { THEMES } from '../constants';

/**
 * Gets theme colors based on current theme
 * @param {string} theme - Current theme (light/dark)
 * @returns {Object} Theme color palette
 */
export const getThemeColors = (theme) => {
  if (theme === THEMES.DARK) {
    return {
      background: '#0F0F0F',          // Softer, warmer dark
      secondaryBackground: '#1A1A1A', // Less harsh gray
      cardBackground: '#1E1E1E',      // Warm dark card
      textPrimary: '#E8E8E8',         // Softer white, easier on eyes
      textSecondary: '#A0A0A5',       // Warmer gray text
      borderColor: '#2D2D30',         // Subtle borders
      activeBg: '#2A2A2A',            // Gentle highlight
      inputBg: '#1E1E1E',             // Consistent with cards
      inputPrefix: '#2A2A2A'          // Slightly lighter prefix
    };
  } else {
    return {
      background: '#F2F2F7',
      secondaryBackground: '#FFFFFF',
      cardBackground: '#FFFFFF',
      textPrimary: '#000000',
      textSecondary: '#8E8E93',
      borderColor: '#E5E5EA',
      activeBg: '#F2F2F7',
      inputBg: '#FFFFFF',
      inputPrefix: '#F2F2F7'
    };
  }
};

/**
 * Gets card shadow based on theme
 * @param {string} theme - Current theme
 * @returns {string} CSS box-shadow value
 */
export const getCardShadow = (theme) => {
  return theme === THEMES.DARK 
    ? '0 1px 3px rgba(0, 0, 0, 0.3)' 
    : '0 1px 3px rgba(0, 0, 0, 0.1)';
};

/**
 * Gets deep card shadow based on theme
 * @param {string} theme - Current theme
 * @returns {string} CSS box-shadow value
 */
export const getDeepCardShadow = (theme) => {
  return theme === THEMES.DARK 
    ? '0 1px 3px rgba(0, 0, 0, 0.3)' 
    : '0 1px 3px rgba(0, 0, 0, 0.12)';
};

/**
 * Gets status message colors based on type and theme
 * @param {string} type - Message type (success, error, loading)
 * @param {string} theme - Current theme
 * @returns {Object} Background and text colors
 */
export const getStatusMessageColors = (type, theme) => {
  const isDark = theme === THEMES.DARK;
  
  switch (type) {
    case 'success':
      return {
        backgroundColor: isDark ? '#1B4332' : '#D1F2EB',
        color: isDark ? '#40E0D0' : '#0E7245'
      };
    case 'error':
      return {
        backgroundColor: isDark ? '#4A1E1E' : '#FADBD8',
        color: isDark ? '#FF6B6B' : '#B03A2E'
      };
    case 'loading':
      return {
        backgroundColor: isDark ? '#1A2B3D' : '#EBF5FF',
        color: isDark ? '#5DADE2' : '#1B4F72'
      };
    default:
      return {
        backgroundColor: isDark ? '#2A2A2A' : '#F8F9FA',
        color: isDark ? '#E8E8E8' : '#495057'
      };
  }
};