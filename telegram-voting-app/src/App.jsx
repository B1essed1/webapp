import React, { useState, useEffect } from 'react';

const App = () => {
    const [currentPage, setCurrentPage] = useState('main');
    const [phoneInput, setPhoneInput] = useState('');
    const [status, setStatus] = useState({ message: '', type: '', show: false });
    const [user, setUser] = useState(null);
    const [tg, setTg] = useState(null);
    const [theme, setTheme] = useState('light');

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
                userData.chat_id = userData.id;
                
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

    const showStatus = (message, type) => {
        setStatus({ message, type, show: true });
    };

    const hideStatus = () => {
        setStatus({ message: '', type: '', show: false });
    };

    // Theme colors
    const getThemeColors = () => {
        if (theme === 'dark') {
            return {
                background: '#1C1C1E',
                secondaryBackground: '#2C2C2E',
                cardBackground: '#2C2C2E',
                textPrimary: '#FFFFFF',
                textSecondary: '#8E8E93',
                borderColor: '#38383A',
                activeBg: '#3A3A3C',
                inputBg: '#3A3A3C',
                inputPrefix: '#2C2C2E'
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
                chatId: user.id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                languageCode: user.language_code
            },
            timestamp: new Date().toISOString()
        };

        console.log('📤 Sending to backend:', requestData);

        try {
            const response = await fetch('http://localhost:8080/api/phone-verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();
            console.log('📥 Backend response:', result);

            if (response.ok && result.success) {
                showStatus('✅ Muvaffaqiyatli!', 'success');

                setTimeout(() => {
                    if (result.votingLink) {
                        window.open(result.votingLink, '_blank');
                    }
                    backToMain();
                }, 2000);

            } else {
                showStatus(`❌ Xatolik: ${result.message || 'Unknown error'}`, 'error');
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
                                    fontSize: '32px', 
                                    fontWeight: '700', 
                                    color: colors.textPrimary,
                                    letterSpacing: '-0.02em',
                                    marginBottom: '4px',
                                    wordBreak: 'break-all'
                                }}>
                                    1,000,000
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
                                    borderBottom: '0.5px solid #E5E5EA',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.1s ease'
                                }}
                                onClick={openPhonePage}
                                onTouchStart={(e) => e.currentTarget.style.backgroundColor = '#f2f2f7'}
                                onTouchEnd={(e) => e.currentTarget.style.backgroundColor = 'white'}
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
                                            color: '#000000',
                                            fontSize: '17px'
                                        }}>
                                            Ovoz berish
                                        </div>
                                        <div style={{ 
                                            fontSize: '15px', 
                                            color: '#8E8E93',
                                            marginTop: '2px'
                                        }}>
                                            Saylovda ishtirok eting
                                        </div>
                                    </div>
                                </div>
                                <div style={{ 
                                    color: '#C7C7CC', 
                                    fontSize: '20px',
                                    fontWeight: '400'
                                }}>
                                    ›
                                </div>
                            </div>
                            
                            <div 
                                style={{
                                    padding: '16px 20px',
                                    borderBottom: '0.5px solid #E5E5EA',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer'
                                }}
                                onClick={comingSoon}
                                onTouchStart={(e) => e.currentTarget.style.backgroundColor = '#f2f2f7'}
                                onTouchEnd={(e) => e.currentTarget.style.backgroundColor = 'white'}
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
                                            color: '#000000',
                                            fontSize: '17px'
                                        }}>
                                            Natijalar
                                        </div>
                                        <div style={{ 
                                            fontSize: '15px', 
                                            color: '#8E8E93',
                                            marginTop: '2px'
                                        }}>
                                            Saylov natijalarini ko'ring
                                        </div>
                                    </div>
                                </div>
                                <div style={{ color: '#C7C7CC', fontSize: '20px' }}>›</div>
                            </div>
                            
                            <div 
                                style={{
                                    padding: '16px 20px',
                                    borderBottom: '0.5px solid #E5E5EA',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer'
                                }}
                                onClick={comingSoon}
                                onTouchStart={(e) => e.currentTarget.style.backgroundColor = '#f2f2f7'}
                                onTouchEnd={(e) => e.currentTarget.style.backgroundColor = 'white'}
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
                                            color: '#000000',
                                            fontSize: '17px'
                                        }}>
                                            To'lovlar tarixi
                                        </div>
                                        <div style={{ 
                                            fontSize: '15px', 
                                            color: '#8E8E93',
                                            marginTop: '2px'
                                        }}>
                                            Barcha tranzaksiyalar
                                        </div>
                                    </div>
                                </div>
                                <div style={{ color: '#C7C7CC', fontSize: '20px' }}>›</div>
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
                                onTouchStart={(e) => e.currentTarget.style.backgroundColor = '#f2f2f7'}
                                onTouchEnd={(e) => e.currentTarget.style.backgroundColor = 'white'}
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
                                            color: '#000000',
                                            fontSize: '17px'
                                        }}>
                                            Referal ssylka
                                        </div>
                                        <div style={{ 
                                            fontSize: '15px', 
                                            color: '#8E8E93',
                                            marginTop: '2px'
                                        }}>
                                            Do'stlarni taklif qiling
                                        </div>
                                    </div>
                                </div>
                                <div style={{ color: '#C7C7CC', fontSize: '20px' }}>›</div>
                            </div>
                        </div>
                    </div>

                    {/* Debug Info */}
                    <div style={{ padding: '24px 16px 0' }}>
                        <div style={{
                            backgroundColor: 'rgba(118, 118, 128, 0.12)',
                            borderRadius: '16px',
                            padding: '16px'
                        }}>
                            <div style={{ 
                                fontSize: '12px', 
                                fontFamily: 'SF Mono, Monaco, monospace',
                                color: '#8E8E93',
                                lineHeight: '1.6'
                            }}>
                                <div>🔧 DEBUG</div>
                                <div>User ID: {user.id}</div>
                                <div>Username: {user.username || 'No username'}</div>
                                <div>API: http://localhost:8080/api</div>
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
                            color: '#000000', 
                            marginBottom: '8px',
                            margin: '0 0 8px 0'
                        }}>
                            Telefon raqami
                        </h1>
                        <p style={{ 
                            fontSize: '17px',
                            color: '#8E8E93',
                            margin: '0',
                            padding: '0 16px'
                        }}>
                            O'zbekiston telefon raqamingizni kiriting
                        </p>
                    </div>

                    {/* Phone Input */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{ display: 'flex' }}>
                                <div style={{
                                    padding: '16px 16px',
                                    backgroundColor: '#F2F2F7',
                                    fontFamily: 'SF Mono, Monaco, monospace',
                                    fontWeight: '600',
                                    borderRight: '1px solid #E5E5EA',
                                    color: '#3A3A3C',
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
                                        backgroundColor: 'white',
                                        color: '#000000'
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
                            {status.message}
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
                                backgroundColor: '#F2F2F7',
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