import React, { memo, useEffect } from 'react';
import { getCardShadow } from '../../utils/theme';
import { formatDate } from '../../utils';

/**
 * Payment history page component
 * @param {Object} props - Component props
 * @param {Array} props.transactions - List of transactions
 * @param {boolean} props.transactionsLoading - Whether transactions are loading
 * @param {Function} props.onFetchTransactions - Function to fetch transactions
 * @param {Function} props.onBack - Back navigation handler
 * @param {Object} props.colors - Theme colors
 * @param {string} props.theme - Current theme
 * @returns {JSX.Element} Payment history page component
 */
const PaymentHistoryPage = memo(({
  transactions,
  transactionsLoading,
  onFetchTransactions,
  onBack,
  colors,
  theme
}) => {
  // Fetch transactions when component mounts
  useEffect(() => {
    onFetchTransactions();
  }, [onFetchTransactions]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#34C759';
      case 'PENDING': return '#FF9500';
      case 'FAILED': return '#FF3B30';
      case 'CANCELLED': return '#8E8E93';
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED': return 'Bajarildi';
      case 'PENDING': return 'Kutilmoqda';
      case 'FAILED': return 'Muvaffaqiyatsiz';
      case 'CANCELLED': return 'Bekor qilindi';
      default: return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'CARD': return 'Karta';
      case 'PAYNET': return 'Paynet';
      default: return type;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'CARD': return '💳';
      case 'PAYNET': return '📱';
      default: return '💰';
    }
  };

  return (
    <div style={{ 
      paddingBottom: '32px',
      minHeight: '100vh',
      backgroundColor: colors.background
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        backgroundColor: colors.cardBackground,
        borderBottom: `0.5px solid ${colors.borderColor}`,
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '24px',
              color: colors.textPrimary,
              padding: '4px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.backgroundColor = colors.activeBg;
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ←
          </button>
          <div style={{
            fontSize: '20px',
            fontWeight: '600',
            color: colors.textPrimary
          }}>
            To'lovlar tarixi
          </div>
        </div>
      </div>

      {/* Loading State */}
      {transactionsLoading && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          color: colors.textSecondary
        }}>
          <div>Yuklanmoqda...</div>
        </div>
      )}

      {/* Empty State */}
      {!transactionsLoading && transactions.length === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          color: colors.textSecondary,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Hech qanday tranzaksiya yo'q
          </div>
          <div style={{ fontSize: '15px' }}>
            Sizning to'lovlar tarixi bo'sh
          </div>
        </div>
      )}

      {/* Transactions List */}
      {!transactionsLoading && transactions.length > 0 && (
        <div style={{ padding: '16px' }}>
          <div style={{
            backgroundColor: colors.cardBackground,
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: getCardShadow(theme)
          }}>
            {transactions.map((transaction, index) => (
              <div
                key={transaction.id}
                style={{
                  padding: '16px 20px',
                  borderBottom: index < transactions.length - 1 ? `0.5px solid ${colors.borderColor}` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: colors.background,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    marginRight: '16px'
                  }}>
                    {getTypeIcon(transaction.type)}
                  </div>
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px'
                    }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: colors.textPrimary,
                        fontSize: '16px'
                      }}>
                        {getTypeText(transaction.type)}
                      </div>
                      <div style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: getStatusColor(transaction.status),
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {getStatusText(transaction.status)}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: colors.textSecondary
                    }}>
                      {formatDate(transaction.updatedAt)}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: colors.textPrimary,
                    fontSize: '16px'
                  }}>
                    {transaction.amount.toLocaleString()} so'm
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

PaymentHistoryPage.displayName = 'PaymentHistoryPage';

export default PaymentHistoryPage;