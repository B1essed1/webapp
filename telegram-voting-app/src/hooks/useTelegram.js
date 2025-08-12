import { useState, useEffect } from 'react';
import { TELEGRAM_CONFIG, MOCK_USER, FALLBACK_USER, THEMES } from '../constants';

/**
 * Custom hook for managing Telegram WebApp integration
 * @returns {Object} Telegram app instance, user data, and theme
 */
export const useTelegram = () => {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(THEMES.LIGHT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTelegramScript = () => {
      return new Promise((resolve) => {
        if (window.Telegram?.WebApp) {
          resolve(window.Telegram.WebApp);
          return;
        }

        const script = document.createElement('script');
        script.src = TELEGRAM_CONFIG.SCRIPT_URL;
        script.onload = () => {
          setTimeout(() => {
            resolve(window.Telegram?.WebApp || null);
          }, TELEGRAM_CONFIG.SCRIPT_LOAD_TIMEOUT);
        };
        script.onerror = () => {
          resolve(null);
        };
        document.head.appendChild(script);
      });
    };

    const initializeTelegram = async () => {
      try {
        const telegramApp = await loadTelegramScript();
        
        if (telegramApp) {
          console.log('📱 Telegram WebApp initialized:', telegramApp);
          telegramApp.expand();
          setTg(telegramApp);

          // Extract user data from multiple sources
          const userData = extractUserData(telegramApp);
          setUser(userData);
          console.log('📱 Final user data:', userData);

          // Set theme from Telegram
          const telegramTheme = telegramApp.colorScheme || THEMES.LIGHT;
          console.log('📱 Telegram theme:', telegramTheme);
          setTheme(telegramTheme);

          // Listen for theme changes
          telegramApp.onEvent('themeChanged', () => {
            const newTheme = telegramApp.colorScheme || THEMES.LIGHT;
            console.log('📱 Theme changed to:', newTheme);
            setTheme(newTheme);
          });

          // Handle back button
          telegramApp.onEvent('backButtonClicked', () => {
            // This will be handled by the component that uses this hook
            window.dispatchEvent(new CustomEvent('telegram-back-button'));
          });

        } else {
          console.warn('📱 Telegram WebApp not available, using fallback');
          setUser(FALLBACK_USER);
          console.log('📱 Fallback user data:', FALLBACK_USER);
        }
      } catch (err) {
        console.error('📱 Failed to initialize Telegram:', err);
        setError(err);
        setUser(FALLBACK_USER);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTelegram();
  }, []);

  const extractUserData = (telegramApp) => {
    console.log('📱 InitData:', telegramApp.initData);
    console.log('📱 InitDataUnsafe:', telegramApp.initDataUnsafe);

    let userData = null;

    // Try multiple sources for user data
    if (telegramApp.initDataUnsafe?.user) {
      userData = telegramApp.initDataUnsafe.user;
      console.log('📱 User from initDataUnsafe:', userData);
    } else if (telegramApp.WebAppUser) {
      userData = telegramApp.WebAppUser;
      console.log('📱 User from WebAppUser:', userData);
    } else {
      // Try to parse initData manually
      try {
        const urlParams = new URLSearchParams(telegramApp.initData);
        const userParam = urlParams.get('user');
        if (userParam) {
          userData = JSON.parse(decodeURIComponent(userParam));
          console.log('📱 User from initData parsing:', userData);
        }
      } catch (e) {
        console.error('📱 Failed to parse initData:', e);
      }
    }

    // Use mock data for development if no user data found
    if (!userData) {
      console.warn('📱 No Telegram user data available, using mock data');
      userData = MOCK_USER;
    }

    // Ensure chat_id is set (usually same as user ID for personal chats)
    if (!userData.chat_id) {
      userData.chat_id = userData.id;
    }

    return userData;
  };

  const showAlert = (message) => {
    if (tg?.showAlert) {
      tg.showAlert(message);
    } else {
      alert(message);
    }
  };

  const showBackButton = () => {
    if (tg?.BackButton) {
      tg.BackButton.show();
    }
  };

  const hideBackButton = () => {
    if (tg?.BackButton) {
      tg.BackButton.hide();
    }
  };

  return {
    tg,
    user,
    theme,
    isLoading,
    error,
    showAlert,
    showBackButton,
    hideBackButton,
  };
};