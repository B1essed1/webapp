import React, { memo, useState } from 'react';
import { getCardShadow, getDeepCardShadow } from '../../utils/theme';
import { BALANCE_CONFIG } from '../../constants';
import { copyToClipboard } from '../../utils';
import WithdrawalModal from '../common/WithdrawalModal';

/**
 * Main page component displaying user balance and navigation menu
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user data
 * @param {number} props.balance - User balance in sum
 * @param {boolean} props.balanceLoading - Whether balance is loading
 * @param {Function} props.onRefreshBalance - Balance refresh handler
 * @param {Function} props.onNavigateToPhone - Navigate to phone page handler
 * @param {Function} props.onNavigateToResults - Navigate to results page handler
 * @param {Function} props.onComingSoon - Coming soon handler for disabled features
 * @param {Object} props.colors - Theme colors
 * @param {string} props.theme - Current theme
 * @param {Function} props.showAlert - Telegram alert function
 * @returns {JSX.Element} Main page component
 */
const MainPage = memo(({
  user,
  balance,
  balanceLoading,
  onRefreshBalance,
  onNavigateToPhone,
  onNavigateToResults,
  onComingSoon,
  onWithdrawalRequest,
  colors,
  theme,
  showAlert
}) => {
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleWithdrawalSubmit = async (withdrawalData) => {
    setWithdrawalLoading(true);
    try {
      const result = await onWithdrawalRequest(withdrawalData);
      
      // Close modal first
      setIsWithdrawalModalOpen(false);
      
      // Show success message below balance
      const message = result?.data?.message || 'Sizning so\'rovingiz qabul qilindi';
      setSuccessMessage(message);
      
      // Hide message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
      // Refresh balance
      onRefreshBalance(true);
    } catch (error) {
      showAlert(`Xatolik: ${error.message}`);
    } finally {
      setWithdrawalLoading(false);
    }
  };

  const handleReferralLink = () => {
    const referralUrl = `https://t.me/o_budged_bot?start=${user.id}`;
    
    copyToClipboard(
      referralUrl,
      () => {
        showAlert('Referal linkdan nusxa olindi');
      },
      () => {
        showAlert(`Referal ssylka: ${referralUrl}`);
      }
    );
  };

  const menuItems = [
    {
      id: 'voting',
      icon: '🗳️',
      title: 'Ovoz berish',
      description: 'Saylovda ishtirok eting',
      backgroundColor: '#007AFF',
      onClick: onNavigateToPhone
    },
    {
      id: 'results',
      icon: '📊',
      title: 'Natijalar',
      description: 'Ovozlar holatini ko\'rish',
      backgroundColor: '#007AFF',
      onClick: onNavigateToResults
    },
    {
      id: 'history',
      icon: '💳',
      title: 'To\'lovlar tarixi',
      description: 'Barcha tranzaksiyalar',
      backgroundColor: '#FF9500',
      onClick: onComingSoon
    },
    {
      id: 'referral',
      icon: '🔗',
      title: 'Referal ssylka',
      description: 'Do\'stlarni taklif qiling',
      backgroundColor: '#5AC8FA',
      onClick: handleReferralLink
    }
  ];

  return (
    <div style={{ 
      paddingBottom: '32px',
      minHeight: '100vh',
      backgroundColor: colors.background
    }}>
      {/* Balance Card */}
      <div style={{ padding: '16px' }}>
        <div style={{
          backgroundColor: colors.cardBackground,
          borderRadius: '12px',
          padding: '20px',
          boxShadow: getDeepCardShadow(theme),
          border: `0.5px solid ${colors.borderColor}`
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: colors.textPrimary,
              marginBottom: '8px'
            }}>
              {user.first_name} {user.last_name || ''}
            </div>
            <div style={{ 
              fontSize: '15px', 
              color: colors.textSecondary,
              marginBottom: '16px'
            }}>
              @{user.username || 'No username'}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '4px'
            }}>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                color: colors.textPrimary,
                letterSpacing: '-0.02em'
              }}>
                {balanceLoading ? '...' : balance.toLocaleString()}
              </div>
              <button
                onClick={onRefreshBalance}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  padding: '4px',
                  borderRadius: '50%',
                  color: colors.textSecondary,
                  transition: 'all 0.2s ease',
                  opacity: balanceLoading ? 0.5 : 1
                }}
                disabled={balanceLoading}
                onTouchStart={(e) => {
                  e.currentTarget.style.transform = 'scale(0.9)';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                🔄
              </button>
            </div>
            <div style={{ 
              fontSize: '17px', 
              color: colors.textSecondary,
              fontWeight: '500'
            }}>
              {BALANCE_CONFIG.CURRENCY_DISPLAY}
            </div>
            
            {/* Withdrawal Button - Only show if balance > 0 */}
            {!balanceLoading && balance > 0 && (
              <button
                onClick={() => setIsWithdrawalModalOpen(true)}
                style={{
                  marginTop: '16px',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#28A745',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                  e.currentTarget.style.backgroundColor = '#218838';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor = '#28A745';
                }}
              >
                💰 Yechib olish
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{
            backgroundColor: '#D4F4DD',
            borderRadius: '8px',
            padding: '12px 16px',
            border: '1px solid #34C759',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ fontSize: '18px' }}>✅</div>
            <div style={{
              fontSize: '15px',
              fontWeight: '500',
              color: '#1B5E20'
            }}>
              {successMessage}
            </div>
          </div>
        </div>
      )}

      {/* Menu List */}
      <div style={{ padding: '0 16px' }}>
        <div style={{
          backgroundColor: colors.cardBackground,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: getCardShadow(theme)
        }}>
          {menuItems.map((item, index) => (
            <div 
              key={item.id}
              style={{
                padding: '16px 20px',
                borderBottom: index < menuItems.length - 1 ? `0.5px solid ${colors.borderColor}` : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'background-color 0.1s ease'
              }}
              onClick={() => {
                console.log('📋 [MainPage] Menu item clicked:', item.id);
                item.onClick();
              }}
              onTouchStart={(e) => e.currentTarget.style.backgroundColor = colors.activeBg}
              onTouchEnd={(e) => e.currentTarget.style.backgroundColor = colors.cardBackground}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: item.backgroundColor,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  marginRight: '16px'
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ 
                    fontWeight: '600', 
                    color: colors.textPrimary,
                    fontSize: '17px'
                  }}>
                    {item.title}
                  </div>
                  <div style={{ 
                    fontSize: '15px', 
                    color: colors.textSecondary,
                    marginTop: '2px'
                  }}>
                    {item.description}
                  </div>
                </div>
              </div>
              <div style={{ 
                color: colors.textSecondary, 
                fontSize: '20px',
                fontWeight: '400'
              }}>
                ›
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        onSubmit={handleWithdrawalSubmit}
        balance={balance}
        colors={colors}
        theme={theme}
        loading={withdrawalLoading}
      />
    </div>
  );
});

MainPage.displayName = 'MainPage';

export default MainPage;