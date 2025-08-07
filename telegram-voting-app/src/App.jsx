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
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center p-8">
                    <div className="text-lg font-semibold text-gray-700 mb-2">Loading Telegram App...</div>
                    <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
            {/* DEBUG INFO */}
            <div className="bg-black bg-opacity-5 backdrop-blur-sm p-3 text-xs font-mono border-b border-white border-opacity-20 text-gray-700">
                🔧 DEBUG:<br/>
                User ID: {user.id}<br/>
                Username: {user.username || 'No username'}<br/>
                API: http://localhost:8080/api
            </div>

            {/* MAIN PAGE */}
            {currentPage === 'main' && (
                <div className="pb-8">
                    {/* Header Card */}
                    <div className="mx-4 mt-6 mb-6 bg-white bg-opacity-60 backdrop-blur-xl rounded-3xl shadow-xl border border-white border-opacity-30 overflow-hidden">
                        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 text-white relative">
                            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                            <div className="relative z-10 text-center">
                                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl backdrop-blur-sm">
                                    👤
                                </div>
                                <div className="text-lg font-medium mb-1 opacity-90">
                                    {user.first_name} {user.last_name || ''}
                                </div>
                                <div className="text-4xl font-bold mb-2 tracking-tight">1,000</div>
                                <div className="text-sm opacity-80 font-medium">SO'M • Balans</div>
                            </div>
                        </div>
                    </div>

                    {/* Menu Cards */}
                    <div className="px-4 space-y-4">
                        <button
                            onClick={openPhonePage}
                            className="w-full bg-white bg-opacity-70 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white border-opacity-50 hover:bg-opacity-80 transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                                        🗳
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-800 text-lg">Ovoz berish</div>
                                        <div className="text-gray-500 text-sm">Saylovda ishtirok eting</div>
                                    </div>
                                </div>
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    <span className="text-gray-600">→</span>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={comingSoon}
                            className="w-full bg-white bg-opacity-70 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white border-opacity-50 hover:bg-opacity-80 transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                                        📊
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-800 text-lg">Natijalar</div>
                                        <div className="text-gray-500 text-sm">Saylov natijalarini ko'ring</div>
                                    </div>
                                </div>
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    <span className="text-gray-600">→</span>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={comingSoon}
                            className="w-full bg-white bg-opacity-70 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white border-opacity-50 hover:bg-opacity-80 transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                                        💳
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-800 text-lg">To'lovlar tarixi</div>
                                        <div className="text-gray-500 text-sm">Barcha tranzaksiyalar</div>
                                    </div>
                                </div>
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    <span className="text-gray-600">→</span>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={comingSoon}
                            className="w-full bg-white bg-opacity-70 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white border-opacity-50 hover:bg-opacity-80 transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                                        🔗
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-800 text-lg">Referal ssylka</div>
                                        <div className="text-gray-500 text-sm">Do'stlarni taklif qiling</div>
                                    </div>
                                </div>
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    <span className="text-gray-600">→</span>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* PHONE PAGE */}
            {currentPage === 'phone' && (
                <div className="p-6">
                    {/* Header */}
                    <div className="text-center mb-8 mt-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl shadow-xl">
                            📱
                        </div>
                        <div className="text-2xl font-bold text-gray-800 mb-2">
                            Telefon raqami
                        </div>
                        <p className="text-gray-600 px-4">
                            O'zbekiston telefon raqamingizni kiriting
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Phone Input Card */}
                        <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-2xl shadow-xl border border-white border-opacity-50 overflow-hidden">
                            <div className="flex">
                                <div className="px-6 py-5 bg-gray-50 bg-opacity-50 font-mono font-bold border-r border-gray-200 border-opacity-50 text-gray-700">
                                    +998
                                </div>
                                <input
                                    type="tel"
                                    value={phoneInput}
                                    onChange={handlePhoneInput}
                                    className="flex-1 px-6 py-5 font-mono text-lg outline-none bg-transparent placeholder-gray-400"
                                    placeholder="94 123 45 67"
                                    maxLength="11"
                                    required
                                />
                            </div>
                        </div>

                        {/* Status Message */}
                        {status.show && (
                            <div className={`p-5 rounded-2xl text-center font-medium backdrop-blur-xl border border-opacity-30 ${
                                status.type === 'success' ? 'bg-green-100 bg-opacity-80 text-green-800 border-green-200' :
                                    status.type === 'error' ? 'bg-red-100 bg-opacity-80 text-red-800 border-red-200' :
                                        'bg-blue-100 bg-opacity-80 text-blue-800 border-blue-200'
                            }`}>
                                {status.message}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-4 pt-4">
                            <button
                                onClick={handleSubmit}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white p-5 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <span>✅</span>
                                    <span>Tasdiqlash</span>
                                </div>
                            </button>

                            <button
                                onClick={backToMain}
                                className="w-full bg-white bg-opacity-80 backdrop-blur-xl text-gray-700 p-5 rounded-2xl font-semibold border border-gray-200 border-opacity-50 shadow-lg hover:bg-opacity-90 transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <span>←</span>
                                    <span>Orqaga</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;