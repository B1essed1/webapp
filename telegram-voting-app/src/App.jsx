import React, { useState, useEffect } from 'react';

const App = () => {
    const [currentPage, setCurrentPage] = useState('main');
    const [phoneInput, setPhoneInput] = useState('');
    const [status, setStatus] = useState({ message: '', type: '', show: false });
    const [user, setUser] = useState(null);
    const [tg, setTg] = useState(null);

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
                telegramApp.expand();
                setTg(telegramApp);

                // Get user data
                let userData = null;
                if (telegramApp.initDataUnsafe && telegramApp.initDataUnsafe.user) {
                    userData = telegramApp.initDataUnsafe.user;
                } else {
                    // Mock data for testing when not in Telegram
                    userData = {
                        id: 123456789,
                        username: "testuser",
                        first_name: "Test",
                        last_name: "User",
                        language_code: "en"
                    };
                }
                setUser(userData);

                // Handle back button
                const handleBackButton = () => {
                    setCurrentPage('main');
                };

                telegramApp.onEvent('backButtonClicked', handleBackButton);
            } else {
                // Fallback when Telegram script fails to load
                setUser({
                    id: 123456789,
                    username: "testuser",
                    first_name: "Test",
                    last_name: "User",
                    language_code: "en"
                });
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

    const formatPhoneNumber = (value) => {
        const cleanValue = value.replace(/\D/g, '');

        // Format: 94 123 45 67
        if (cleanValue.length >= 2) {
            let formatted = cleanValue.substring(0, 2);
            if (cleanValue.length > 2) formatted += ' ' + cleanValue.substring(2, 5);
            if (cleanValue.length > 5) formatted += ' ' + cleanValue.substring(5, 7);
            if (cleanValue.length > 7) formatted += ' ' + cleanValue.substring(7, 9);
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

        // Validate
        if (cleanPhone.length !== 10) {
            showStatus('❌ 9 ta raqam kiriting!', 'error');
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
            maxWidth: '390px',
            margin: '0 auto',
            minHeight: '100vh',
            backgroundColor: '#f2f2f7',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif'
        }}>
            {/* MAIN PAGE */}
            {currentPage === 'main' && (
                <div style={{ paddingBottom: '32px' }}>
                    {/* Balance Card */}
                    <div style={{ padding: '16px 16px 24px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)'
                        }}>
                            <div style={{ 
                                padding: '32px', 
                                textAlign: 'center', 
                                color: 'white' 
                            }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '50%',
                                    margin: '0 auto 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px'
                                }}>
                                    👤
                                </div>
                                <div style={{ 
                                    fontSize: '18px', 
                                    fontWeight: '500', 
                                    marginBottom: '4px',
                                    opacity: '0.9'
                                }}>
                                    {user.first_name} {user.last_name || ''}
                                </div>
                                <div style={{ 
                                    fontSize: '36px', 
                                    fontWeight: 'bold', 
                                    marginBottom: '8px',
                                    letterSpacing: '-0.02em'
                                }}>
                                    1,000
                                </div>
                                <div style={{ 
                                    fontSize: '14px', 
                                    opacity: '0.8',
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
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
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
                                    maxLength="11"
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