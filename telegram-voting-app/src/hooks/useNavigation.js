import { useState, useEffect, useCallback } from 'react';
import { ROUTES } from '../constants';
import { isAdminRoute } from '../utils';

/**
 * Custom hook for navigation management
 * @param {Object} telegram - Object with showBackButton and hideBackButton functions
 * @returns {Object} Navigation state and functions
 */
export const useNavigation = (telegram) => {
  const [currentPage, setCurrentPage] = useState(() => {
    return isAdminRoute() ? ROUTES.ADMIN : ROUTES.MAIN;
  });

  /**
   * Navigates to main page
   */
  const navigateToMain = useCallback(() => {
    console.log('🧠 [useNavigation] Navigating to main');
    setCurrentPage(ROUTES.MAIN);
    telegram?.hideBackButton?.();
  }, [telegram]);

  /**
   * Navigates to phone input page
   */
  const navigateToPhone = useCallback(() => {
    console.log('🧠 [useNavigation] Navigating to phone');
    setCurrentPage(ROUTES.PHONE);
    telegram?.showBackButton?.();
  }, [telegram]);

  /**
   * Navigates to results page
   */
  const navigateToResults = useCallback(() => {
    console.log('🧠 [useNavigation] Navigating to results');
    setCurrentPage(ROUTES.RESULTS);
    telegram?.showBackButton?.();
  }, [telegram]);

  /**
   * Navigates to payment history page
   */
  const navigateToHistory = useCallback(() => {
    console.log('🧠 [useNavigation] Navigating to history');
    setCurrentPage(ROUTES.HISTORY);
    telegram?.showBackButton?.();
  }, [telegram]);

  /**
   * Navigates to admin page
   */
  const navigateToAdmin = useCallback(() => {
    console.log('🧠 [useNavigation] Navigating to admin');
    setCurrentPage(ROUTES.ADMIN);
    telegram?.hideBackButton?.();
  }, [telegram]);

  // Listen for Telegram back button events
  useEffect(() => {
    const handleBackButton = () => {
      navigateToMain();
    };

    window.addEventListener('telegram-back-button', handleBackButton);
    return () => {
      window.removeEventListener('telegram-back-button', handleBackButton);
    };
  }, [navigateToMain]);


  /**
   * Checks if currently on a specific page
   * @param {string} page - Page to check
   * @returns {boolean} True if on the specified page
   */
  const isCurrentPage = useCallback((page) => {
    return currentPage === page;
  }, [currentPage]);

  return {
    currentPage,
    navigateToMain,
    navigateToPhone,
    navigateToResults,
    navigateToHistory,
    navigateToAdmin,
    isCurrentPage,
  };
};