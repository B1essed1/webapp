import React, { memo } from 'react';
import { getCardShadow } from '../../utils/theme';
import { PHONE_CONFIG } from '../../constants';
import StatusMessage from '../common/StatusMessage';
import Button from '../common/Button';

/**
 * Phone number input page component
 * @param {Object} props - Component props
 * @param {string} props.phoneInput - Current phone input value
 * @param {Function} props.onPhoneInputChange - Phone input change handler
 * @param {Function} props.onSubmit - Form submit handler
 * @param {Function} props.onBack - Back navigation handler
 * @param {Object} props.status - Status message object
 * @param {Function} props.onStatusUrlClick - Status URL click handler
 * @param {Object} props.colors - Theme colors
 * @param {string} props.theme - Current theme
 * @returns {JSX.Element} Phone page component
 */
const PhonePage = memo(({
  phoneInput,
  onPhoneInputChange,
  onSubmit,
  onBack,
  status,
  onStatusUrlClick,
  colors,
  theme
}) => {
  // Check if voting success message is shown (means voting is complete)
  const isVotingComplete = status.show && status.message && status.message.includes('Ovoz bergan bo\'lsangiz 40 minutdan keyin');
  return (
    <div style={{ 
      padding: '16px 16px 24px',
      minHeight: '100vh',
      backgroundColor: colors.background
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px', paddingTop: '16px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#007AFF',
          borderRadius: '50%',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px'
        }}>
          📱
        </div>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: colors.textPrimary, 
          marginBottom: '8px',
          margin: '0 0 8px 0'
        }}>
          Telefon raqami
        </h1>
        <p style={{ 
          fontSize: '17px',
          color: colors.textSecondary,
          margin: '0',
          padding: '0 16px'
        }}>
          O'zbekiston telefon raqamingizni kiriting
        </p>
      </div>

      {/* Phone Input */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          backgroundColor: colors.inputBg,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: getCardShadow(theme),
          border: `1px solid ${colors.borderColor}`
        }}>
          <div style={{ display: 'flex' }}>
            <div style={{
              padding: '16px 16px',
              backgroundColor: colors.inputPrefix,
              fontFamily: 'SF Mono, Monaco, monospace',
              fontWeight: '600',
              borderRight: `1px solid ${colors.borderColor}`,
              color: colors.textPrimary,
              fontSize: '17px'
            }}>
              {PHONE_CONFIG.COUNTRY_CODE}
            </div>
            <input
              type="tel"
              value={phoneInput}
              onChange={onPhoneInputChange}
              style={{
                flex: '1',
                padding: '16px',
                fontFamily: 'SF Mono, Monaco, monospace',
                fontSize: '17px',
                border: 'none',
                outline: 'none',
                backgroundColor: colors.inputBg,
                color: colors.textPrimary
              }}
              placeholder="94 123 45 67"
              maxLength={PHONE_CONFIG.MAX_LENGTH}
            />
          </div>
        </div>
      </div>

      {/* Status Message */}
      <StatusMessage 
        status={status} 
        theme={theme} 
        onUrlClick={onStatusUrlClick} 
      />

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!isVotingComplete && (
          <Button
            onClick={onSubmit}
            variant="primary"
          >
            ✅ Tasdiqlash
          </Button>
        )}

        <Button
          onClick={onBack}
          variant="secondary"
          colors={colors}
        >
          ← Orqaga
        </Button>
      </div>
    </div>
  );
});

PhonePage.displayName = 'PhonePage';

export default PhonePage;