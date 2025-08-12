import React, { memo } from 'react';
import { getStatusMessageColors } from '../../utils/theme';
import { ANIMATIONS } from '../../constants';

/**
 * Status message component for displaying success, error, and loading messages
 * @param {Object} props - Component props
 * @param {Object} props.status - Status object with message, type, show, and url
 * @param {string} props.theme - Current theme
 * @param {Function} props.onUrlClick - Callback for URL button clicks
 * @returns {JSX.Element|null} Status message or null if not visible
 */
const StatusMessage = memo(({ status, theme, onUrlClick }) => {
  if (!status.show) return null;

  const colors = getStatusMessageColors(status.type, theme);

  return (
    <div style={{
      marginBottom: '24px',
      padding: '16px',
      borderRadius: '16px',
      textAlign: 'center',
      fontWeight: '500',
      fontSize: '15px',
      backgroundColor: colors.backgroundColor,
      color: colors.color
    }}>
      <div style={{ marginBottom: status.url ? '12px' : '0' }}>
        {status.message}
      </div>
      {status.url && (
        <a
          href={status.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onUrlClick}
          style={{
            display: 'inline-block',
            backgroundColor: '#007AFF',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '12px',
            padding: '12px 20px',
            fontWeight: '600',
            fontSize: '16px',
            transition: `all ${ANIMATIONS.TRANSITION_DURATION} ease`,
            cursor: 'pointer'
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = `scale(${ANIMATIONS.SCALE_PRESSED})`;
            e.currentTarget.style.opacity = ANIMATIONS.OPACITY_PRESSED;
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = `scale(${ANIMATIONS.SCALE_NORMAL})`;
            e.currentTarget.style.opacity = '1';
          }}
        >
          🗳️ Ovoz berish
        </a>
      )}
    </div>
  );
});

StatusMessage.displayName = 'StatusMessage';

export default StatusMessage;