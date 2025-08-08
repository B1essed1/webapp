import React, { useState, useEffect } from 'react';

const App = () => {
    const [currentPage, setCurrentPage] = useState('main');
    const [phoneInput, setPhoneInput] = useState('');
    const [currentPhoneNumber, setCurrentPhoneNumber] = useState('');
    const [status, setStatus] = useState({ message: '', type: '', show: false, url: null });
    const [user, setUser] = useState(null);
    const [tg, setTg] = useState(null);
    const [theme, setTheme] = useState('light');
    const [balance, setBalance] = useState(0);
    const [balanceLoading, setBalanceLoading] = useState(false);

    // Valid Uzbekistan prefixes
    const validPrefixes = ['90', '91', '93', '94', '95', '97', '98', '99', '33', '77', '88'];

    useEffect(() => {
        // Load Telegram Web App script dynamically
        const loadTelegramScript = () => {
            return new Promise((resolve) => {
                if (window.Telegram?.WebApp) {
                    resolve(window.Telegram.WebApp);
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://telegram.org/js/telegram-web-app.js';
                script.onload = () => {
                    // Wait a bit for the script to initialize
                    setTimeout(() => {
                        resolve(window.Telegram?.WebApp || null);
                    }, 100);
                };
                script.onerror = () => {
                    resolve(null);
                };
                document.head.appendChild(script);
            });
        };

        loadTelegramScript().then((telegramApp) => {
            if (telegramApp) {
                console.log('📱 Telegram WebApp initialized:', telegramApp);
                telegramApp.expand();
                setTg(telegramApp);

                // Debug Telegram data
                console.log('📱 InitData:', telegramApp.initData);
                console.log('📱 InitDataUnsafe:', telegramApp.initDataUnsafe);

                // Get user data - try multiple sources
                let userData = null;
                
                if (telegramApp.initDataUnsafe && telegramApp.initDataUnsafe.user) {
                    userData = telegramApp.initDataUnsafe.user;
                    console.log('📱 User from initDataUnsafe:', userData);
                } else if (telegramApp.WebAppUser) {
                    userData = telegramApp.WebAppUser;
                    console.log('📱 User from WebAppUser:', userData);
                } else {
                    // Try to parse initData manually
                    try {
                        const urlParams = new URLSearchParams(telegramApp.initData);
                        const userParam = urlParams.get('user');
                        if (userParam) {
                            userData = JSON.parse(decodeURIComponent(userParam));
                            console.log('📱 User from initData parsing:', userData);
                        }
                    } catch (e) {
                        console.error('📱 Failed to parse initData:', e);
                    }
                }

                // If still no user data, use mock data for development
                if (!userData) {
                    console.warn('📱 No Telegram user data available, using mock data');
                    userData = {
                        id: 123456789,
                        username: "testuser", 
                        first_name: "Test",
                        last_name: "User",
                        language_code: "en"
                    };
                }

                // Add chat ID (usually same as user ID for personal chats)
               // if ()userData.chat_id = userData.id;
                
                setUser(userData);
                console.log('📱 Final user data:', userData);

                // Detect and set theme from Telegram
                const telegramTheme = telegramApp.colorScheme || 'light';
                console.log('📱 Telegram theme:', telegramTheme);
                setTheme(telegramTheme);

                // Listen for theme changes
                telegramApp.onEvent('themeChanged', () => {
                    const newTheme = telegramApp.colorScheme || 'light';
                    console.log('📱 Theme changed to:', newTheme);
                    setTheme(newTheme);
                });

                // Handle back button
                const handleBackButton = () => {
                    setCurrentPage('main');
                };

                telegramApp.onEvent('backButtonClicked', handleBackButton);
            } else {
                console.warn('📱 Telegram WebApp not available, using fallback');
                // Fallback when Telegram script fails to load
                const fallbackUser = {
                    id: 123456789,
                    chat_id: 123456789,
                    username: "testuser",
                    first_name: "Test", 
                    last_name: "User",
                    language_code: "en"
                };
                setUser(fallbackUser);
                console.log('📱 Fallback user data:', fallbackUser);
            }
        });
    }, []);

    // Fetch balance when user is available
    useEffect(() => {
        if (user) {
            fetchBalance();
        }
    }, [user]);

    const openPhonePage = () => {
        setCurrentPage('phone');
        if (tg?.BackButton) {
            tg.BackButton.show();
        }
    };

    const backToMain = () => {
        setCurrentPage('main');
        if (tg?.BackButton) {
            tg.BackButton.hide();
        }
        setPhoneInput('');
        hideStatus();
    };

    const comingSoon = () => {
        if (tg?.showAlert) {
            tg.showAlert('Tez orada!');
        } else {
            alert('Coming soon!');
        }
    };

    const showStatus = (message, type, url = null) => {
        setStatus({ message, type, show: true, url });
    };

    const hideStatus = () => {
        setStatus({ message: '', type: '', show: false, url: null });
    };

    const fetchBalance = async () => {
        if (!user) return;
        
        setBalanceLoading(true);
        const requestData = {
            userId: user.id,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            languageCode: user.language_code
        };

        try {
            const response = await fetch('https://a9689ce00a6a.ngrok-free.app/api/balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();
            console.log('💰 Balance response:', result);

            if (response.ok && result.data?.balance !== undefined) {
                // Convert from tiyin to sum (1 sum = 100 tiyin)
                const balanceInSum = Math.floor(result.data.balance / 100);
                setBalance(balanceInSum);
            } else {
                console.error('Failed to fetch balance:', result.errorMessage);
                setBalance(0);
            }
        } catch (error) {
            console.error('💥 Balance fetch error:', error);
            setBalance(0);
        } finally {
            setBalanceLoading(false);
        }
    };

    const updateVoteStatus = async (phoneNumber, voteStatus) => {
        const requestData = {
            phoneNumber: phoneNumber,
            telegramData: {
                userId: user.id,
                chatId: user.chat_id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                languageCode: user.language_code
            },
            voteStatus: voteStatus
        };

        try {
            const response = await fetch('https://a9689ce00a6a.ngrok-free.app/api/vote-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();
            console.log('📥 Vote status update response:', result);

            if (!response.ok) {
                console.error('Failed to update vote status:', result.errorMessage);
            }
        } catch (error) {
            console.error('💥 Vote status update error:', error);
        }
    };

    const handleVotingLinkClick = () => {
        // Update vote status to CLICKED before opening the link
        if (currentPhoneNumber) {
            updateVoteStatus(currentPhoneNumber, 'CLICKED');
            // Show confirmation message after clicking
            setTimeout(() => {
                showStatus('✅Ovoz bergan bo\'lsangiz 40 minutdan keyin balansingizni tekshiring' , 'success');
            }, 100);
        }
        // The default link behavior will still work (opening in new tab)
    };

    // Theme colors
    const getThemeColors = () => {
        if (theme === 'dark') {
            return {
                background: '#0F0F0F',          // Softer, warmer dark
                secondaryBackground: '#1A1A1A', // Less harsh gray
                cardBackground: '#1E1E1E',      // Warm dark card
                textPrimary: '#E8E8E8',         // Softer white, easier on eyes
                textSecondary: '#A0A0A5',       // Warmer gray text
                borderColor: '#2D2D30',         // Subtle borders
                activeBg: '#2A2A2A',            // Gentle highlight
                inputBg: '#1E1E1E',             // Consistent with cards
                inputPrefix: '#2A2A2A'          // Slightly lighter prefix
            };
        } else {
            return {
                background: '#F2F2F7',
                secondaryBackground: '#FFFFFF',
                cardBackground: '#FFFFFF',
                textPrimary: '#000000',
                textSecondary: '#8E8E93',
                borderColor: '#E5E5EA',
                activeBg: '#F2F2F7',
                inputBg: '#FFFFFF',
                inputPrefix: '#F2F2F7'
            };
        }
    };

    const colors = getThemeColors();

    const formatPhoneNumber = (value) => {
        const cleanValue = value.replace(/\D/g, '');

        // Format: 94 123 45 67 (9 digits total after prefix)
        if (cleanValue.length >= 2) {
            let formatted = cleanValue.substring(0, 2);
            if (cleanValue.length > 2) formatted += ' ' + cleanValue.substring(2, 5);
            if (cleanValue.length > 5) formatted += ' ' + cleanValue.substring(5, 7);
            if (cleanValue.length > 7) formatted += ' ' + cleanValue.substring(7, 11);
            return formatted;
        }
        return cleanValue;
    };

    const handlePhoneInput = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneInput(formatted);
        hideStatus();
    };

    const handleSubmit = async () => {
        const cleanPhone = phoneInput.replace(/\D/g, '');
        console.log('📱 Phone input:', phoneInput, 'Cleaned:', cleanPhone, 'Length:', cleanPhone.length);

        // Validate
        if (cleanPhone.length !== 9) {
            console.log(cleanPhone, cleanPhone.length);
            showStatus('❌ To\'liq raqam kiriting! (94 123 45 67)', 'error');
            return;
        }

        const prefix = cleanPhone.substring(0, 2);
        if (!validPrefixes.includes(prefix)) {
            showStatus('❌ Noto\'g\'ri prefix!', 'error');
            return;
        }

        const fullPhone = '+998' + cleanPhone;

        showStatus('⏳ Yuborilmoqda...', 'loading');

        // Prepare data to send to backend
        const requestData = {
            phoneNumber: fullPhone,
            localNumber: cleanPhone,
            telegramData: {
                userId: user.id,
                chatId: user.chat_id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                languageCode: user.language_code
            },
            timestamp: new Date().toISOString()
        };

        console.log('📤 Sending to backend:', requestData);
        console.log('📤 Sending to backend:', user);

        try {
            const response = await fetch('  https://a9689ce00a6a.ngrok-free.app/api/phone-verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();
            console.log('📥 Backend response:', result);

            if (response.ok) {
                // Store the phone number for vote status updates
                setCurrentPhoneNumber(fullPhone);
                
                if (result.data?.message) {
                    showStatus('✅ Muvaffaqiyatli! Ovoz berish uchun linkni bosing', 'success', result.data.message);
                } else {
                    showStatus('✅ Muvaffaqiyatli!', 'success');
                }

            } else {
                showStatus(`❌ Xatolik: ${result.errorMessage || 'Unknown error'}`, 'error');
            }

        } catch (error) {
            console.error('💥 Request error:', error);
            showStatus('💥 Tarmoq xatosi!', 'error');
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center p-8">
                    <div className="w-12 h-12 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="text-lg font-medium text-gray-700">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            width: '100%',
            minHeight: '100vh',
            backgroundColor: colors.background,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif'
        }}>
            {/* MAIN PAGE */}
            {currentPage === 'main' && (
                <div style={{ paddingBottom: '32px' }}>
                    {/* Balance Card */}
                    <div style={{ padding: '16px' }}>
                        <div style={{
                            backgroundColor: colors.cardBackground,
                            borderRadius: '12px',
                            padding: '20px',
                            boxShadow: theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.12)',
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
                                        onClick={fetchBalance}
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
                                    SO'M
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Menu List */}
                    <div style={{ padding: '0 16px' }}>
                        <div style={{
                            backgroundColor: colors.cardBackground,
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}>
                            <div 
                                style={{
                                    padding: '16px 20px',
                                    borderBottom: `0.5px solid ${colors.borderColor}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.1s ease'
                                }}
                                onClick={openPhonePage}
                                onTouchStart={(e) => e.currentTarget.style.backgroundColor = colors.activeBg}
                                onTouchEnd={(e) => e.currentTarget.style.backgroundColor = colors.cardBackground}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: '#007AFF',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        marginRight: '16px'
                                    }}>
                                        🗳️
                                    </div>
                                    <div>
                                        <div style={{ 
                                            fontWeight: '600', 
                                            color: colors.textPrimary,
                                            fontSize: '17px'
                                        }}>
                                            Ovoz berish
                                        </div>
                                        <div style={{ 
                                            fontSize: '15px', 
                                            color: colors.textSecondary,
                                            marginTop: '2px'
                                        }}>
                                            Saylovda ishtirok eting
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
                            
                            <div 
                                style={{
                                    padding: '16px 20px',
                                    borderBottom: `0.5px solid ${colors.borderColor}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer'
                                }}
                                onClick={comingSoon}
                                onTouchStart={(e) => e.currentTarget.style.backgroundColor = colors.activeBg}
                                onTouchEnd={(e) => e.currentTarget.style.backgroundColor = colors.cardBackground}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: '#AF52DE',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        marginRight: '16px'
                                    }}>
                                        📊
                                    </div>
                                    <div>
                                        <div style={{ 
                                            fontWeight: '600', 
                                            color: colors.textPrimary,
                                            fontSize: '17px'
                                        }}>
                                            Natijalar
                                        </div>
                                        <div style={{ 
                                            fontSize: '15px', 
                                            color: colors.textSecondary,
                                            marginTop: '2px'
                                        }}>
                                            Saylov natijalarini ko'ring
                                        </div>
                                    </div>
                                </div>
                                <div style={{ color: colors.textSecondary, fontSize: '20px' }}>›</div>
                            </div>
                            
                            <div 
                                style={{
                                    padding: '16px 20px',
                                    borderBottom: `0.5px solid ${colors.borderColor}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer'
                                }}
                                onClick={comingSoon}
                                onTouchStart={(e) => e.currentTarget.style.backgroundColor = colors.activeBg}
                                onTouchEnd={(e) => e.currentTarget.style.backgroundColor = colors.cardBackground}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: '#FF9500',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        marginRight: '16px'
                                    }}>
                                        💳
                                    </div>
                                    <div>
                                        <div style={{ 
                                            fontWeight: '600', 
                                            color: colors.textPrimary,
                                            fontSize: '17px'
                                        }}>
                                            To'lovlar tarixi
                                        </div>
                                        <div style={{ 
                                            fontSize: '15px', 
                                            color: colors.textSecondary,
                                            marginTop: '2px'
                                        }}>
                                            Barcha tranzaksiyalar
                                        </div>
                                    </div>
                                </div>
                                <div style={{ color: colors.textSecondary, fontSize: '20px' }}>›</div>
                            </div>
                            
                            <div 
                                style={{
                                    padding: '16px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer'
                                }}
                                onClick={comingSoon}
                                onTouchStart={(e) => e.currentTarget.style.backgroundColor = colors.activeBg}
                                onTouchEnd={(e) => e.currentTarget.style.backgroundColor = colors.cardBackground}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: '#5AC8FA',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        marginRight: '16px'
                                    }}>
                                        🔗
                                    </div>
                                    <div>
                                        <div style={{ 
                                            fontWeight: '600', 
                                            color: colors.textPrimary,
                                            fontSize: '17px'
                                        }}>
                                            Referal ssylka
                                        </div>
                                        <div style={{ 
                                            fontSize: '15px', 
                                            color: colors.textSecondary,
                                            marginTop: '2px'
                                        }}>
                                            Do'stlarni taklif qiling
                                        </div>
                                    </div>
                                </div>
                                <div style={{ color: colors.textSecondary, fontSize: '20px' }}>›</div>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* PHONE PAGE */}
            {currentPage === 'phone' && (
                <div style={{ padding: '16px 16px 24px' }}>
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
                            boxShadow: theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
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
                                    +998
                                </div>
                                <input
                                    type="tel"
                                    value={phoneInput}
                                    onChange={handlePhoneInput}
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
                                    maxLength="12"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status Message */}
                    {status.show && (
                        <div style={{
                            marginBottom: '24px',
                            padding: '16px',
                            borderRadius: '16px',
                            textAlign: 'center',
                            fontWeight: '500',
                            fontSize: '15px',
                            backgroundColor: status.type === 'success' ? '#D1F2EB' : 
                                           status.type === 'error' ? '#FADBD8' : '#EBF5FF',
                            color: status.type === 'success' ? '#0E7245' : 
                                   status.type === 'error' ? '#B03A2E' : '#1B4F72'
                        }}>
                            <div style={{ marginBottom: status.url ? '12px' : '0' }}>
                                {status.message}
                            </div>
                            {status.url && (
                                <a
                                    href={status.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={handleVotingLinkClick}
                                    style={{
                                        display: 'inline-block',
                                        backgroundColor: '#007AFF',
                                        color: 'white',
                                        textDecoration: 'none',
                                        borderRadius: '12px',
                                        padding: '12px 20px',
                                        fontWeight: '600',
                                        fontSize: '16px',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                    onTouchStart={(e) => {
                                        e.currentTarget.style.transform = 'scale(0.96)';
                                        e.currentTarget.style.opacity = '0.8';
                                    }}
                                    onTouchEnd={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.opacity = '1';
                                    }}
                                >
                                    🗳️ Ovoz berish
                                </a>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            onClick={handleSubmit}
                            style={{
                                backgroundColor: '#007AFF',
                                border: 'none',
                                borderRadius: '14px',
                                color: 'white',
                                fontFamily: 'inherit',
                                fontWeight: '600',
                                fontSize: '17px',
                                padding: '17px 20px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                outline: 'none',
                                width: '100%'
                            }}
                            onTouchStart={(e) => {
                                e.currentTarget.style.transform = 'scale(0.96)';
                                e.currentTarget.style.opacity = '0.8';
                            }}
                            onTouchEnd={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.opacity = '1';
                            }}
                        >
                            ✅ Tasdiqlash
                        </button>

                        <button
                            onClick={backToMain}
                            style={{
                                backgroundColor: colors.activeBg,
                                border: 'none',
                                borderRadius: '14px',
                                color: '#007AFF',
                                fontFamily: 'inherit',
                                fontWeight: '600',
                                fontSize: '17px',
                                padding: '17px 20px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                outline: 'none',
                                width: '100%'
                            }}
                            onTouchStart={(e) => {
                                e.currentTarget.style.transform = 'scale(0.96)';
                                e.currentTarget.style.opacity = '0.8';
                            }}
                            onTouchEnd={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.opacity = '1';
                            }}
                        >
                            ← Orqaga
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;