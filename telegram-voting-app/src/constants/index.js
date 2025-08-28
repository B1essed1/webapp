// API Configuration
export const API_BASE_URL = 'https://friend-quarter-books-discipline.trycloudflare.com';

// Valid Uzbekistan mobile prefixes
export const VALID_UZ_PREFIXES = ['90', '91', '93', '94', '95', '97', '98', '99', '33', '77', '88'];

// Application Routes
export const ROUTES = {
    MAIN: 'main',
    PHONE: 'phone',
    RESULTS: 'results',
    HISTORY: 'history',
    ADMIN: 'admin',
};

// Vote Status Types
export const VOTE_STATUS = {
    NEW: 'NEW',
    CLICKED: 'CLICKED',
    SUCCESS: 'VOTED',
    CANCELLED: 'FAILED',
};

// Status Message Types
export const MESSAGE_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    LOADING: 'loading',
};

// Telegram WebApp Configuration
export const TELEGRAM_CONFIG = {
    SCRIPT_URL: 'https://telegram.org/js/telegram-web-app.js',
    SCRIPT_LOAD_TIMEOUT: 100,
};

// Phone Number Configuration
export const PHONE_CONFIG = {
    COUNTRY_CODE: '+998',
    MAX_LENGTH: 12,
    REQUIRED_LENGTH: 9,
    FORMAT_PATTERN: /(\d{2})(\d{3})(\d{2})(\d{2})/,
};

// Theme Configuration
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
};

// Development Mock User
export const MOCK_USER = {
    id: 874085254,
    username: "testuser",
    first_name: "Test",
    last_name: "User",
    language_code: "en"
};

// Fallback User (when Telegram script fails)
export const FALLBACK_USER = {
    id: 123456789,
    chat_id: 123456789,
    username: "testuser",
    first_name: "Test",
    last_name: "User",
    language_code: "en"
};

// Animation and UI Constants
export const ANIMATIONS = {
    SPINNER_DURATION: '2s',
    TRANSITION_DURATION: '0.2s',
    SCALE_PRESSED: 0.96,
    SCALE_NORMAL: 1,
    OPACITY_PRESSED: 0.8,
    OPACITY_DISABLED: 0.6,
};

// Balance Configuration
export const BALANCE_CONFIG = {
    TIYIN_TO_SUM_RATIO: 100, // 1 sum = 100 tiyin
    CURRENCY_DISPLAY: 'SO\'M',
};