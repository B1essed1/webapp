import React, { useState } from 'react';
import { AdminAuth } from '../utils/adminAuth';

const SendMessageTab = ({ colors, theme }) => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 4000);
    };

    const sendMessage = async () => {
        if (!message.trim()) {
            showToast('Iltimos, xabar matnini kiriting', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await AdminAuth.makeAuthenticatedRequest('/admin/send/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message.trim()
                })
            });

            // Check for HTTP 200 status - even with empty response body
            if (response && (response.status === 200 || response.ok !== false)) {
                showToast('Xabar jonatilmoqda', 'success');
                setMessage('');
            } else {
                const errorMessage = response?.errorMessage || 'Xabar jonatishda xatolik yuz berdi';
                showToast(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            showToast('Tarmoq xatosi yuz berdi', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            sendMessage();
        }
    };

    return (
        <div>
            <div style={{
                marginBottom: '24px'
            }}>
                <h2 style={{
                    fontSize: '28px',
                    fontWeight: '600',
                    color: colors.textPrimary,
                    margin: '0 0 8px 0',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    letterSpacing: '-0.6px'
                }}>
                    Send Message
                </h2>
                <p style={{
                    fontSize: '16px',
                    color: colors.textSecondary,
                    margin: '0',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    fontWeight: '400'
                }}>
                    Send a message to all users
                </p>
            </div>

            <div style={{
                backgroundColor: colors.cardBackground,
                borderRadius: '12px',
                padding: '24px',
                boxShadow: theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`
            }}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '15px',
                        fontWeight: '500',
                        color: colors.textPrimary,
                        marginBottom: '8px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                    }}>
                        Message
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter your message here..."
                        rows={8}
                        style={{
                            width: '100%',
                            padding: '16px',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                            borderRadius: '8px',
                            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                            color: colors.textPrimary,
                            fontSize: '15px',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            outline: 'none',
                            resize: 'vertical',
                            minHeight: '120px',
                            maxHeight: '300px',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#007AFF';
                            e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
                            e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)';
                        }}
                    />
                    <p style={{
                        fontSize: '13px',
                        color: colors.textSecondary,
                        margin: '8px 0 0 0',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                    }}>
                        Tip: Press Ctrl+Enter to send quickly
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <div style={{
                        fontSize: '14px',
                        color: colors.textSecondary,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                    }}>
                        Characters: {message.length}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => setMessage('')}
                            disabled={!message.trim() || loading}
                            style={{
                                backgroundColor: 'transparent',
                                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                                borderRadius: '8px',
                                color: colors.textSecondary,
                                padding: '12px 20px',
                                fontSize: '15px',
                                fontWeight: '500',
                                cursor: (!message.trim() || loading) ? 'not-allowed' : 'pointer',
                                opacity: (!message.trim() || loading) ? 0.5 : 1,
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                letterSpacing: '-0.2px'
                            }}
                            onMouseEnter={(e) => {
                                if (message.trim() && !loading) {
                                    e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
                                    e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
                            }}
                        >
                            Clear
                        </button>
                        
                        <button
                            onClick={sendMessage}
                            disabled={!message.trim() || loading}
                            style={{
                                backgroundColor: (!message.trim() || loading) ? '#888' : '#007AFF',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                padding: '12px 24px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: (!message.trim() || loading) ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.8 : 1,
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                letterSpacing: '-0.2px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                                if (message.trim() && !loading) {
                                    e.currentTarget.style.backgroundColor = '#0056CC';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (message.trim() && !loading) {
                                    e.currentTarget.style.backgroundColor = '#007AFF';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            {loading && (
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    borderTop: '2px solid white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                            )}
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 1000,
                    backgroundColor: toast.type === 'success' ? '#34C759' : '#FF3B30',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    boxShadow: theme === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.15)',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    maxWidth: '320px',
                    animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <div style={{
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {toast.type === 'success' ? '✓' : '✕'}
                    </div>
                    {toast.message}
                    <style>{`
                        @keyframes slideInRight {
                            from {
                                transform: translateX(100%);
                                opacity: 0;
                            }
                            to {
                                transform: translateX(0);
                                opacity: 1;
                            }
                        }
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default SendMessageTab;