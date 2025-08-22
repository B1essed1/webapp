import React, { useState, useEffect } from 'react';
import ClientsTab from './ClientsTab';
import TransactionTab from './TransactionTab';

const AdminDashboard = ({ 
    colors, 
    theme, 
    adminTab, 
    setAdminTab, 
    handleLogout 
}) => {
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarVisible(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };

    return (
        <div style={{ 
            display: 'flex', 
            minHeight: '100vh',
            backgroundColor: colors.pageBackground,
            position: 'relative'
        }}>
            {/* Mobile Overlay */}
            {isMobile && sidebarVisible && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 999,
                        cursor: 'pointer'
                    }}
                    onClick={toggleSidebar}
                />
            )}

            {/* Left Sidebar */}
            <div style={{
                width: isMobile ? '280px' : '280px',
                backgroundColor: theme === 'dark' ? 'rgba(28, 28, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                borderRight: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
                display: 'flex',
                flexDirection: 'column',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                position: isMobile ? 'fixed' : 'relative',
                left: sidebarVisible ? '0' : (isMobile ? '-280px' : '-280px'),
                height: isMobile ? '100vh' : 'auto',
                zIndex: 1000,
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                {/* Header */}
                <div style={{ 
                    padding: '32px 24px 24px 24px',
                    borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`
                }}>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '600',
                        color: colors.textPrimary,
                        margin: '0 0 6px 0',
                        letterSpacing: '-0.5px'
                    }}>
                        Admin
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: colors.textSecondary,
                        margin: '0',
                        fontWeight: '400'
                    }}>
                        Manage clients and voting data
                    </p>
                </div>

                {/* Navigation Menu */}
                <div style={{ padding: '24px 0', flex: 1 }}>
                    <nav>
                        <button
                            onClick={() => setAdminTab('clients')}
                            style={{
                                width: '100%',
                                padding: '16px 24px',
                                backgroundColor: adminTab === 'clients' ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)') : 'transparent',
                                color: adminTab === 'clients' ? colors.textPrimary : colors.textSecondary,
                                border: 'none',
                                borderRadius: '0',
                                fontWeight: adminTab === 'clients' ? '500' : '400',
                                fontSize: '16px',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                textAlign: 'left',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                letterSpacing: '-0.2px'
                            }}
                            onMouseEnter={(e) => {
                                if (adminTab !== 'clients') {
                                    e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (adminTab !== 'clients') {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            Clients
                        </button>
                        <button
                            onClick={() => setAdminTab('transactions')}
                            style={{
                                width: '100%',
                                padding: '16px 24px',
                                backgroundColor: adminTab === 'transactions' ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)') : 'transparent',
                                color: adminTab === 'transactions' ? colors.textPrimary : colors.textSecondary,
                                border: 'none',
                                borderRadius: '0',
                                fontWeight: adminTab === 'transactions' ? '500' : '400',
                                fontSize: '16px',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                textAlign: 'left',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                letterSpacing: '-0.2px'
                            }}
                            onMouseEnter={(e) => {
                                if (adminTab !== 'transactions') {
                                    e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (adminTab !== 'transactions') {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            Transactions
                        </button>
                    </nav>
                </div>

                {/* Logout Button */}
                <div style={{ 
                    padding: '24px',
                    borderTop: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`
                }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            backgroundColor: 'transparent',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                            borderRadius: '8px',
                            color: colors.textSecondary,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            fontWeight: '400',
                            fontSize: '15px',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            letterSpacing: '-0.2px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
                            e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ 
                flex: 1,
                marginLeft: (!isMobile && !sidebarVisible) ? '-280px' : '0',
                transition: 'margin-left 0.3s ease-in-out',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh'
            }}>
                {/* Top Bar with Toggle Button */}
                <div style={{
                    padding: '20px 32px',
                    backgroundColor: colors.cardBackground,
                    borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)'
                }}>
                    <button
                        onClick={toggleSidebar}
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            color: colors.textSecondary,
                            padding: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
                    >
                        {sidebarVisible ? '‹' : '›'}
                    </button>

                    <div style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: colors.textPrimary,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        letterSpacing: '-0.4px'
                    }}>
                        {adminTab === 'transactions' ? 'Transactions' : 'Clients'}
                    </div>
                </div>

                {/* Content Area */}
                <div style={{
                    flex: 1,
                    padding: isMobile ? '16px' : '24px',
                    overflow: 'auto'
                }}>
                    {adminTab === 'transactions' ? (
                        <TransactionTab
                            colors={colors}
                            theme={theme}
                        />
                    ) : (
                        <ClientsTab
                            colors={colors}
                            theme={theme}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;