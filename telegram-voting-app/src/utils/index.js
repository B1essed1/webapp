import { PHONE_CONFIG, VALID_UZ_PREFIXES, VOTE_STATUS, BALANCE_CONFIG } from '../constants';

/**
 * Formats a phone number with spaces (94 123 45 67)
 * @param {string} value - Raw phone number input
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (value) => {
  console.log('📱 [formatPhoneNumber] Input:', value);
  const cleanValue = value.replace(/\D/g, '');
  console.log('📱 [formatPhoneNumber] Clean value:', cleanValue);

  if (cleanValue.length >= 2) {
    let formatted = cleanValue.substring(0, 2);
    if (cleanValue.length > 2) formatted += ' ' + cleanValue.substring(2, 5);
    if (cleanValue.length > 5) formatted += ' ' + cleanValue.substring(5, 7);
    if (cleanValue.length > 7) formatted += ' ' + cleanValue.substring(7, 11);
    console.log('📱 [formatPhoneNumber] Formatted result:', formatted);
    return formatted;
  }
  console.log('📱 [formatPhoneNumber] Returning clean value:', cleanValue);
  return cleanValue;
};

/**
 * Validates phone number format and prefix
 * @param {string} phoneNumber - Clean phone number (digits only)
 * @returns {Object} Validation result with isValid and error message
 */
export const validatePhoneNumber = (phoneNumber) => {
  console.log('📱 [validatePhoneNumber] Input:', phoneNumber, 'Length:', phoneNumber.length);
  console.log('📱 [validatePhoneNumber] Required length:', PHONE_CONFIG.REQUIRED_LENGTH);
  
  if (phoneNumber.length !== PHONE_CONFIG.REQUIRED_LENGTH) {
    const error = { isValid: false, error: '❌ To\'liq raqam kiriting! (94 123 45 67)' };
    console.log('📱 [validatePhoneNumber] Length validation failed:', error);
    return error;
  }

  const prefix = phoneNumber.substring(0, 2);
  console.log('📱 [validatePhoneNumber] Prefix:', prefix);
  console.log('📱 [validatePhoneNumber] Valid prefixes:', VALID_UZ_PREFIXES);
  
  if (!VALID_UZ_PREFIXES.includes(prefix)) {
    const error = { isValid: false, error: '❌ Noto\'g\'ri prefix!' };
    console.log('📱 [validatePhoneNumber] Prefix validation failed:', error);
    return error;
  }

  const success = { isValid: true, error: null };
  console.log('📱 [validatePhoneNumber] Validation successful:', success);
  return success;
};

/**
 * Formats a full phone number with country code
 * @param {string} localNumber - Local phone number without country code
 * @returns {string} Full phone number with country code
 */
export const formatFullPhoneNumber = (localNumber) => {
  return `${PHONE_CONFIG.COUNTRY_CODE}${localNumber}`;
};

/**
 * Gets status icon for vote status
 * @param {string} status - Vote status
 * @returns {string} Emoji icon
 */
export const getStatusIcon = (status) => {
  switch (status) {
    case VOTE_STATUS.NEW: return '⏳';
    case VOTE_STATUS.CLICKED: return '👆';
    case VOTE_STATUS.VOTED: return '✅';
    case VOTE_STATUS.FAILED: return '❌';
    default: return '❓';
  }
};

/**
 * Gets status color for vote status
 * @param {string} status - Vote status
 * @returns {string} Hex color code
 */
export const getStatusColor = (status) => {
  switch (status) {
    case VOTE_STATUS.NEW: return '#FF9500';
    case VOTE_STATUS.CLICKED: return '#007AFF';
    case VOTE_STATUS.VOTED: return '#34C759';
    case VOTE_STATUS.FAILED: return '#FF3B30';
    default: return '#8E8E93';
  }
};

/**
 * Gets localized status text
 * @param {string} status - Vote status
 * @returns {string} Localized status text
 */
export const getStatusText = (status) => {
  switch (status) {
    case VOTE_STATUS.NEW: return 'Foydalanilmagan';
    case VOTE_STATUS.CLICKED: return 'Foydalanilgan';
    case VOTE_STATUS.VOTED: return 'Ovoz berilgan';
    case VOTE_STATUS.FAILED: return 'Muvaffaqiyatsiz';
    default: return 'Noma\'lum';
  }
};

/**
 * Formats date for display
 * @param {string} dateString - ISO date string
 * @param {string} locale - Locale for formatting (default: 'uz-UZ')
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, locale = 'uz-UZ') => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return locale === 'uz-UZ' ? 'Noma\'lum' : 'Unknown';
  }
};

/**
 * Converts balance from tiyin to sum
 * @param {number} balanceInTiyin - Balance in tiyin
 * @returns {number} Balance in sum
 */
export const convertTiyinToSum = (balanceInTiyin) => {
  return Math.floor(balanceInTiyin / BALANCE_CONFIG.TIYIN_TO_SUM_RATIO);
};

/**
 * Converts sum to tiyin
 * @param {number} sumAmount - Amount in sum
 * @returns {number} Amount in tiyin
 */
export const convertSumToTiyin = (sumAmount) => {
  return sumAmount * BALANCE_CONFIG.TIYIN_TO_SUM_RATIO;
};

/**
 * Formats amount for display with thousand separators
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount string
 */
export const formatAmount = (amount) => {
  return new Intl.NumberFormat('uz-UZ').format(amount);
};

/**
 * Copies text to clipboard with fallback
 * @param {string} text - Text to copy
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const copyToClipboard = async (text, onSuccess, onError) => {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      onSuccess?.(text);
    } catch (err) {
      console.error('Failed to copy:', err);
      fallbackCopyTextToClipboard(text, onSuccess, onError);
    }
  } else {
    fallbackCopyTextToClipboard(text, onSuccess, onError);
  }
};

/**
 * Fallback method for copying text to clipboard
 * @param {string} text - Text to copy
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
const fallbackCopyTextToClipboard = (text, onSuccess, onError) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      onSuccess?.(text);
    } else {
      onError?.(text);
    }
  } catch (err) {
    onError?.(text);
  }

  document.body.removeChild(textArea);
};

/**
 * Checks if current route is admin route
 * @returns {boolean} True if on admin route
 */
export const isAdminRoute = () => {
  return window.location.pathname === '/admin' || window.location.hash === '#admin';
};

/**
 * Creates a debounced function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};