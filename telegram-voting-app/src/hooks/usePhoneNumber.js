import { useState, useCallback } from 'react';
import { formatPhoneNumber, validatePhoneNumber, formatFullPhoneNumber } from '../utils';

/**
 * Custom hook for phone number management
 * @returns {Object} Phone number state and management functions
 */
export const usePhoneNumber = () => {
  const [phoneInput, setPhoneInput] = useState('');
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState('');

  /**
   * Handles phone number input with formatting
   * @param {Event} e - Input change event
   */
  const handlePhoneInput = useCallback((e) => {
    try {
      const formatted = formatPhoneNumber(e.target.value);
      console.log('📱 [usePhoneNumber] Formatting input:', e.target.value, '->', formatted);
      setPhoneInput(formatted);
    } catch (error) {
      console.error('📱 [usePhoneNumber] Error formatting phone:', error);
    }
  }, []);

  /**
   * Gets the clean phone number (digits only)
   * @returns {string} Clean phone number
   */
  const getCleanPhoneNumber = useCallback(() => {
    const clean = phoneInput.replace(/\D/g, '');
    console.log('📱 [usePhoneNumber] Clean phone from input:', phoneInput, '->', clean);
    return clean;
  }, [phoneInput]);

  /**
   * Validates the current phone number
   * @returns {Object} Validation result
   */
  const validateCurrentPhoneNumber = useCallback(() => {
    const cleanPhone = getCleanPhoneNumber();
    console.log('📱 [usePhoneNumber] Validating phone:', cleanPhone);
    const result = validatePhoneNumber(cleanPhone);
    console.log('📱 [usePhoneNumber] Validation result:', result);
    return result;
  }, [getCleanPhoneNumber]);

  /**
   * Gets the full phone number with country code
   * @returns {string} Full phone number
   */
  const getFullPhoneNumber = useCallback(() => {
    const cleanPhone = getCleanPhoneNumber();
    const full = formatFullPhoneNumber(cleanPhone);
    console.log('📱 [usePhoneNumber] Full phone:', full);
    return full;
  }, [getCleanPhoneNumber]);

  /**
   * Sets the current phone number for tracking
   * @param {string} phoneNumber - Phone number to set as current
   */
  const setAsCurrentPhoneNumber = useCallback((phoneNumber) => {
    setCurrentPhoneNumber(phoneNumber);
  }, []);

  /**
   * Clears the phone input
   */
  const clearPhoneInput = useCallback(() => {
    setPhoneInput('');
  }, []);

  /**
   * Checks if phone input is empty
   * @returns {boolean} True if phone input is empty
   */
  const isPhoneInputEmpty = useCallback(() => {
    return phoneInput.trim() === '';
  }, [phoneInput]);

  return {
    phoneInput,
    currentPhoneNumber,
    handlePhoneInput,
    getCleanPhoneNumber,
    validateCurrentPhoneNumber,
    getFullPhoneNumber,
    setAsCurrentPhoneNumber,
    clearPhoneInput,
    isPhoneInputEmpty,
  };
};