import React from 'react';
import { ANIMATIONS } from '../../constants';

/**
 * Reusable button component with consistent styling and touch interactions
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.variant - Button variant (primary, secondary)
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {string} props.width - Button width (default: 100%)
 * @param {Object} props.style - Additional styles
 * @param {Object} props.colors - Theme colors object
 * @returns {JSX.Element} Button component
 */
const Button = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  width = '100%',
  style = {},
  colors = {},
  ...props
}) => {
  const getButtonStyles = () => {
    const baseStyles = {
      border: 'none',
      borderRadius: '14px',
      fontFamily: 'inherit',
      fontWeight: '600',
      fontSize: '17px',
      padding: '17px 20px',
      cursor: disabled || loading ? 'default' : 'pointer',
      transition: `all ${ANIMATIONS.TRANSITION_DURATION} ease`,
      outline: 'none',
      width,
      opacity: disabled || loading ? ANIMATIONS.OPACITY_DISABLED : 1,
      ...style
    };

    switch (variant) {
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: colors.activeBg || '#F2F2F7',
          color: '#007AFF',
        };
      case 'danger':
        return {
          ...baseStyles,
          backgroundColor: '#FF3B30',
          color: 'white',
        };
      case 'primary':
      default:
        return {
          ...baseStyles,
          backgroundColor: '#007AFF',
          color: 'white',
        };
    }
  };

  const handleTouchStart = (e) => {
    if (!disabled && !loading) {
      e.currentTarget.style.transform = `scale(${ANIMATIONS.SCALE_PRESSED})`;
      e.currentTarget.style.opacity = ANIMATIONS.OPACITY_PRESSED;
    }
  };

  const handleTouchEnd = (e) => {
    if (!disabled && !loading) {
      e.currentTarget.style.transform = `scale(${ANIMATIONS.SCALE_NORMAL})`;
      e.currentTarget.style.opacity = '1';
    }
  };

  return (
    <button
      {...props}
      onClick={disabled || loading ? undefined : onClick}
      style={getButtonStyles()}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      disabled={disabled || loading}
    >
      {loading ? '⏳ Loading...' : children}
    </button>
  );
};

export default Button;