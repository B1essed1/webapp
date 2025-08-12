import React, { useState, useEffect } from 'react';
import VotesTab from './VotesTab';
import SettingsTab from './SettingsTab';

const AdminDashboard = ({ 
    colors, 
    theme, 
    adminTab, 
    setAdminTab, 
    allVotes, 
    allVotesLoading, 
    fetchAllVotes, 
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
                backgroundColor: colors.cardBackground,
                borderRight: `1px solid ${colors.borderColor}`,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: theme === 'dark' ? '2px 0 8px rgba(0, 0, 0, 0.3)' : '2px 0 8px rgba(0, 0, 0, 0.1)',
                position: isMobile ? 'fixed' : 'relative',
                left: sidebarVisible ? '0' : (isMobile ? '-280px' : '-280px'),
                height: isMobile ? '100vh' : 'auto',
                zIndex: 1000,
                transition: 'left 0.3s ease-in-out'
            }}>
                {/* Header */}
                <div style={{ 
                    padding: '24px 20px',
                    borderBottom: `1px solid ${colors.borderColor}`
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#FF3B30',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        marginBottom: '12px'
                    }}>
                        ⚙️
                    </div>
                    <h1 style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: colors.textPrimary,
                        margin: '0 0 4px 0'
                    }}>
                        Admin Panel
                    </h1>
                    <p style={{
                        fontSize: '14px',
                        color: colors.textSecondary,
                        margin: '0'
                    }}>
                        Voting System Management
                    </p>
                </div>

                {/* Navigation Menu */}
                <div style={{ padding: '16px 0', flex: 1 }}>
                    <nav>
                        <button
                            onClick={() => {
                                setAdminTab('votes');
                                if (adminTab !== 'votes') {
                                    fetchAllVotes();
                                }
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 20px',
                                backgroundColor: adminTab === 'votes' ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                                color: adminTab === 'votes' ? '#007AFF' : colors.textSecondary,
                                border: 'none',
                                borderLeft: adminTab === 'votes' ? '3px solid #007AFF' : '3px solid transparent',
                                fontWeight: adminTab === 'votes' ? '600' : '500',
                                fontSize: '15px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}
                            onMouseEnter={(e) => {
                                if (adminTab !== 'votes') {
                                    e.currentTarget.style.backgroundColor = 'rgba(0, 122, 255, 0.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (adminTab !== 'votes') {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <span style={{ fontSize: '16px' }}>📊</span>
                            <span>Votes</span>
                        </button>
                        
                        <button
                            onClick={() => setAdminTab('settings')}
                            style={{
                                width: '100%',
                                padding: '12px 20px',
                                backgroundColor: adminTab === 'settings' ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                                color: adminTab === 'settings' ? '#007AFF' : colors.textSecondary,
                                border: 'none',
                                borderLeft: adminTab === 'settings' ? '3px solid #007AFF' : '3px solid transparent',
                                fontWeight: adminTab === 'settings' ? '600' : '500',
                                fontSize: '15px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}
                            onMouseEnter={(e) => {
                                if (adminTab !== 'settings') {
                                    e.currentTarget.style.backgroundColor = 'rgba(0, 122, 255, 0.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (adminTab !== 'settings') {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <span style={{ fontSize: '16px' }}>⚙️</span>
                            <span>Settings</span>
                        </button>
                    </nav>
                </div>

                {/* Logout Button */}
                <div style={{ 
                    padding: '16px 20px',
                    borderTop: `1px solid ${colors.borderColor}`
                }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            backgroundColor: '#FF3B30',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            fontSize: '14px',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#D32F2F';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FF3B30';
                        }}
                    >
                        <span>🚪</span>
                        <span>Logout</span>
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
                    padding: '16px 24px',
                    backgroundColor: colors.cardBackground,
                    borderBottom: `1px solid ${colors.borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    <button
                        onClick={toggleSidebar}
                        style={{
                            backgroundColor: 'transparent',
                            border: `1px solid ${colors.borderColor}`,
                            borderRadius: '8px',
                            color: colors.textSecondary,
                            padding: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
                            e.currentTarget.style.borderColor = colors.textSecondary;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = colors.borderColor;
                        }}
                        title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
                    >
                        {sidebarVisible ? '◀' : '▶'}
                    </button>

                    <div style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: colors.textPrimary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ fontSize: '20px' }}>
                            {adminTab === 'votes' ? '📊' : '⚙️'}
                        </span>
                        <span>
                            {adminTab === 'votes' ? 'Votes' : 'Settings'}
                        </span>
                    </div>
                </div>

                {/* Content Area */}
                <div style={{
                    flex: 1,
                    padding: isMobile ? '16px' : '24px',
                    overflow: 'auto'
                }}>
                    {adminTab === 'votes' && (
                        <VotesTab
                            colors={colors}
                            theme={theme}
                            allVotes={allVotes}
                            allVotesLoading={allVotesLoading}
                            fetchAllVotes={fetchAllVotes}
                        />
                    )}

                    {adminTab === 'settings' && (
                        <SettingsTab
                            colors={colors}
                            theme={theme}
                            allVotes={allVotes}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;