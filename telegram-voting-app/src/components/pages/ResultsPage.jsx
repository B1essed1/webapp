import React, { memo } from 'react';
import { getCardShadow } from '../../utils/theme';
import { getStatusIcon, getStatusColor, getStatusText, formatDate } from '../../utils';
import { ANIMATIONS } from '../../constants';
import Button from '../common/Button';

/**
 * Results page component displaying voting history and status
 * @param {Object} props - Component props
 * @param {Array} props.results - Array of voting results
 * @param {boolean} props.resultsLoading - Whether results are loading
 * @param {Function} props.onRefresh - Refresh results handler
 * @param {Function} props.onBack - Back navigation handler
 * @param {Object} props.colors - Theme colors
 * @param {string} props.theme - Current theme
 * @returns {JSX.Element} Results page component
 */
const ResultsPage = memo(({
  results,
  resultsLoading,
  onRefresh,
  onBack,
  colors,
  theme
}) => {
  const LoadingSpinner = () => (
    <div style={{ textAlign: 'center', padding: '32px 16px' }}>
      <div style={{ 
        fontSize: '24px', 
        marginBottom: '16px',
        animation: `spin ${ANIMATIONS.SPINNER_DURATION} linear infinite`,
        display: 'inline-block'
      }}>
        ⏳
      </div>
      <div style={{ 
        fontSize: '17px', 
        color: colors.textSecondary 
      }}>
        Yuklanmoqda...
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  const EmptyState = () => (
    <div style={{ textAlign: 'center', padding: '32px 16px' }}>
      <div style={{ 
        fontSize: '48px', 
        marginBottom: '16px' 
      }}>
        📭
      </div>
      <div style={{ 
        fontSize: '20px', 
        fontWeight: '600', 
        color: colors.textPrimary,
        marginBottom: '8px'
      }}>
        Ma'lumot topilmadi
      </div>
      <div style={{ 
        fontSize: '16px', 
        color: colors.textSecondary 
      }}>
        Hozircha ovoz berish tarixi mavjud emas
      </div>
    </div>
  );

  const ResultsList = () => (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        backgroundColor: colors.cardBackground,
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: getCardShadow(theme)
      }}>
        {results.map((result, index) => (
          <div 
            key={result.id} 
            style={{
              padding: '16px 20px',
              borderBottom: index < results.length - 1 ? `0.5px solid ${colors.borderColor}` : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: getStatusColor(result.status),
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                marginRight: '16px'
              }}>
                {getStatusIcon(result.status)}
              </div>
              <div>
                <div style={{ 
                  fontWeight: '600', 
                  color: colors.textPrimary,
                  fontSize: '16px'
                }}>
                  {result.phoneNumber}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: colors.textSecondary,
                  marginTop: '2px'
                }}>
                  {formatDate(result.createdAt)}
                </div>
              </div>
            </div>
            <div style={{
              backgroundColor: getStatusColor(result.status),
              color: 'white',
              fontSize: '12px',
              fontWeight: '600',
              padding: '4px 8px',
              borderRadius: '12px'
            }}>
              {getStatusText(result.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
          📊
        </div>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: colors.textPrimary, 
          marginBottom: '8px',
          margin: '0 0 8px 0'
        }}>
          Ovozlar holati
        </h1>
        <p style={{ 
          fontSize: '17px',
          color: colors.textSecondary,
          margin: '0',
          padding: '0 16px'
        }}>
          Barcha ovozlaringizning holati
        </p>
      </div>

      {/* Results Content */}
      {resultsLoading ? <LoadingSpinner /> : 
       results.length === 0 ? <EmptyState /> : <ResultsList />}

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Button
          onClick={onRefresh}
          variant="primary"
          loading={resultsLoading}
        >
          🔄 Yangilash
        </Button>

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

ResultsPage.displayName = 'ResultsPage';

export default ResultsPage;