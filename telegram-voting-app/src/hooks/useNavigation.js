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
    // Always force MAIN page - never allow admin access
    console.log('🔒 [useNavigation] Always forcing MAIN page - admin disabled');
    return ROUTES.MAIN;
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
    // Block admin navigation in Telegram Web
    if (window.location.href.includes('telegram/web')) {
      console.log('🔒 [useNavigation] Admin navigation blocked in Telegram Web');
      return;
    }
    console.log('🧠 [useNavigation] Navigating to admin');
    setCurrentPage(ROUTES.ADMIN);
    telegram?.hideBackButton?.();
  }, [telegram]);

  // Listen for Telegram back button events and prevent admin access
  useEffect(() => {
    const handleBackButton = () => {
      navigateToMain();
    };

    // Override browser back button behavior
    const handlePopState = (event) => {
      console.log('🔙 [useNavigation] Browser back button pressed, forcing main page');
      event.preventDefault();
      setCurrentPage(ROUTES.MAIN);
      // Replace the current history entry to prevent going back to admin
      window.history.replaceState(null, '', window.location.pathname);
    };

    // Force redirect to main if somehow admin page is accessed
    if (currentPage === ROUTES.ADMIN) {
      console.log('🚫 [useNavigation] Admin page detected, forcing redirect to main');
      setCurrentPage(ROUTES.MAIN);
    }

    window.addEventListener('telegram-back-button', handleBackButton);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('telegram-back-button', handleBackButton);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigateToMain, currentPage]);


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