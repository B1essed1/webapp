import React, { useState, memo } from 'react';
import { getCardShadow } from '../../utils/theme';
import { convertSumToTiyin, formatAmount } from '../../utils';

/**
 * Withdrawal modal component for requesting money withdrawal
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close modal handler
 * @param {Function} props.onSubmit - Submit withdrawal request handler
 * @param {number} props.balance - Current user balance
 * @param {Object} props.colors - Theme colors
 * @param {string} props.theme - Current theme
 * @param {boolean} props.loading - Whether request is loading
 * @returns {JSX.Element|null} Withdrawal modal component
 */
const WithdrawalModal = memo(({
  isOpen,
  onClose,
  onSubmit,
  balance,
  colors,
  theme,
  loading = false
}) => {
  const [selectedMethod, setSelectedMethod] = useState('paynet'); // 'paynet' or 'click'
  const [cardNumber, setCardNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+998 ');
  const [amount, setAmount] = useState('');

  // Format card number (XXXX XXXX XXXX XXXX)
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format phone number (+998 XX XXX XX XX)
  const formatPhoneNumber = (value) => {
    let v = value.replace(/\D/g, '');
    
    // If starts with 998, keep it but we'll handle it
    if (v.startsWith('998')) {
      v = v.substring(3);
    }
    
    // Remove any leading zeros
    v = v.replace(/^0+/, '');
    
    // Limit to 9 digits for UZ numbers
    v = v.substring(0, 9);
    
    // Format progressively: XX XXX XX XX
    let formatted = '';
    if (v.length > 0) {
      formatted = v.substring(0, 2); // First 2 digits
      if (v.length > 2) {
        formatted += ' ' + v.substring(2, 5); // Next 3 digits
        if (v.length > 5) {
          formatted += ' ' + v.substring(5, 7); // Next 2 digits
          if (v.length > 7) {
            formatted += ' ' + v.substring(7, 9); // Last 2 digits
          }
        }
      }
      return '+998 ' + formatted;
    }
    
    return '+998 ';
  };

  // Validate card number (relaxed validation for testing)
  const isValidCardNumber = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    const isValid = number.length >= 13 && number.length <= 19 && /^\d+$/.test(number);
    console.log('🔍 Card validation:', { cardNumber, number, length: number.length, isValid });
    return isValid;
  };

  // Validate UZ phone number
  const isValidPhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.startsWith('998') && cleaned.length === 12;
  };

  if (!isOpen) return null;

  // Format and validate amount input
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, ''); // Only allow digits
    if (value === '' || parseInt(value) <= balance) {
      setAmount(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate based on selected method
    if (selectedMethod === 'paynet') {
      if (!phoneNumber.trim() || !isValidPhoneNumber(phoneNumber)) {
        return;
      }
    } else {
      if (!cardNumber.trim() || !isValidCardNumber(cardNumber)) {
        return;
      }
    }

    const numAmount = parseInt(amount);
    if (!amount.trim() || numAmount <= 0 || numAmount > balance) {
      return;
    }

    // Convert sum to tiyin for API
    const amountInTiyin = convertSumToTiyin(numAmount);

    onSubmit({
      cardNumber: selectedMethod === 'click' ? cardNumber.replace(/\s/g, '') : '',
      phoneNumber: selectedMethod === 'paynet' ? phoneNumber.replace(/\D/g, '') : '',
      amount: amountInTiyin
    });
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handlePhoneNumberChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedMethod('paynet');
      setCardNumber('');
      setPhoneNumber('+998 ');
      setAmount('');
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: colors.cardBackground,
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        padding: '24px',
        boxShadow: getCardShadow(theme),
        border: `0.5px solid ${colors.borderColor}`
      }}>
        {/* Header with close button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div style={{ width: '24px' }}></div> {/* Spacer for centering */}
          <div style={{
            fontSize: '20px',
            fontWeight: '600',
            color: colors.textPrimary,
            textAlign: 'center',
            flex: 1
          }}>
            Pul yechib olish
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: colors.textSecondary,
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.2s ease'
            }}
            onTouchStart={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(0.9)';
                e.currentTarget.style.backgroundColor = '#FF3B30';
              }
            }}
            onTouchEnd={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = colors.textSecondary;
              }
            }}
          >
            ×
          </button>
        </div>

        {/* Method Selection Buttons */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            backgroundColor: colors.background,
            padding: '4px',
            borderRadius: '8px'
          }}>
            <button
              type="button"
              onClick={() => setSelectedMethod('paynet')}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: selectedMethod === 'paynet' ? '#007AFF' : 'transparent',
                color: selectedMethod === 'paynet' ? 'white' : colors.textPrimary,
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Paynet
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod('click')}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: selectedMethod === 'click' ? '#007AFF' : 'transparent',
                color: selectedMethod === 'click' ? 'white' : colors.textPrimary,
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Click
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Conditional Input Field */}
          {selectedMethod === 'paynet' ? (
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '500',
                color: colors.textPrimary,
                marginBottom: '8px'
              }}>
                Telefon raqami
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="+998 90 123 45 67"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.borderColor}`,
                  backgroundColor: colors.cardBackground,
                  color: colors.textPrimary,
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  opacity: loading ? 0.6 : 1
                }}
              />
            </div>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '500',
                color: colors.textPrimary,
                marginBottom: '8px'
              }}>
                Karta raqami
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="8600 1234 5678 9012"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.borderColor}`,
                  backgroundColor: colors.cardBackground,
                  color: colors.textPrimary,
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  opacity: loading ? 0.6 : 1
                }}
              />
            </div>
          )}

          {/* Amount Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: '500',
              color: colors.textPrimary,
              marginBottom: '8px'
            }}>
              Summa (maksimal {balance.toLocaleString()} so'm)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={amount ? parseInt(amount).toLocaleString() : ''}
              onChange={handleAmountChange}
              placeholder="0"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${colors.borderColor}`,
                backgroundColor: colors.cardBackground,
                color: colors.textPrimary,
                fontSize: '16px',
                fontFamily: 'inherit',
                outline: 'none',
                opacity: loading ? 0.6 : 1
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${colors.borderColor}`,
                backgroundColor: colors.cardBackground,
                color: colors.textSecondary,
                fontSize: '16px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={(() => {
                const disabled = loading || 
                  (selectedMethod === 'paynet' && (!phoneNumber.trim() || !isValidPhoneNumber(phoneNumber))) ||
                  (selectedMethod === 'click' && (!cardNumber.trim() || !isValidCardNumber(cardNumber))) ||
                  !amount.trim() || 
                  parseInt(amount) <= 0 || 
                  parseInt(amount) > balance;
                
                console.log('🔘 Button state:', {
                  selectedMethod,
                  cardNumber: cardNumber.trim(),
                  phoneNumber: phoneNumber.trim(),
                  amount: amount.trim(),
                  loading,
                  disabled,
                  cardValid: selectedMethod === 'click' ? isValidCardNumber(cardNumber) : null,
                  phoneValid: selectedMethod === 'paynet' ? isValidPhoneNumber(phoneNumber) : null,
                  amountValid: amount.trim() && parseInt(amount) > 0 && parseInt(amount) <= balance
                });
                
                return disabled;
              })()}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#007AFF',
                color: 'white',
                fontSize: '16px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: (loading || 
                  (selectedMethod === 'paynet' && (!phoneNumber.trim() || !isValidPhoneNumber(phoneNumber))) ||
                  (selectedMethod === 'click' && (!cardNumber.trim() || !isValidCardNumber(cardNumber))) ||
                  !amount.trim() || 
                  parseInt(amount) <= 0 || 
                  parseInt(amount) > balance) ? 0.6 : 1
              }}
            >
              {loading ? 'Yuborilmoqda...' : 'Yuborish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

WithdrawalModal.displayName = 'WithdrawalModal';

export default WithdrawalModal;