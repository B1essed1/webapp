import React, { memo } from 'react';

/**
 * Loading screen component
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message to display
 * @returns {JSX.Element} Loading screen
 */
const LoadingScreen = memo(({ message = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8">
        <div className="w-12 h-12 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-lg font-medium text-gray-700">{message}</div>
      </div>
    </div>
  );
});

LoadingScreen.displayName = 'LoadingScreen';

export default LoadingScreen;