import React, { useState, useEffect } from 'react';
import { AdminAuth } from '../utils/adminAuth';

const UserStatistics = ({ colors, theme }) => {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await AdminAuth.makeAuthenticatedRequest('/web/user-statistics', {
                method: 'GET'
            });

            if (response.data) {
                setStatistics(response.data);
            } else {
                setError(response.errorMessage || 'Failed to fetch user statistics');
            }
        } catch (error) {
            console.error('Error fetching user statistics:', error);
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (number) => {
        if (number === null || number === undefined) return '0';
        return new Intl.NumberFormat('en-US').format(number);
    };

    const StatCard = ({ title, value, icon, color }) => (
        <div style={{
            backgroundColor: colors.cardBackground,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
            transition: 'all 0.2s ease',
            cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = theme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)';
        }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                }}>
                    {icon}
                </div>
            </div>
            
            <div style={{
                fontSize: '32px',
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: '8px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                letterSpacing: '-0.8px'
            }}>
                {formatNumber(value)}
            </div>
            
            <div style={{
                fontSize: '15px',
                color: colors.textSecondary,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                fontWeight: '500'
            }}>
                {title}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div style={{
                backgroundColor: colors.cardBackground,
                borderRadius: '12px',
                padding: '48px',
                textAlign: 'center',
                boxShadow: theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    border: `3px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    borderTop: `3px solid #007AFF`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px auto'
                }} />
                <div style={{
                    fontSize: '16px',
                    color: colors.textSecondary,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                }}>
                    Loading statistics...
                </div>
                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                backgroundColor: colors.cardBackground,
                borderRadius: '12px',
                padding: '48px',
                textAlign: 'center',
                boxShadow: theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`
            }}>
                <div style={{
                    fontSize: '48px',
                    marginBottom: '16px'
                }}>
                    ⚠️
                </div>
                <div style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: colors.textPrimary,
                    marginBottom: '8px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                }}>
                    Failed to load statistics
                </div>
                <div style={{
                    fontSize: '14px',
                    color: colors.textSecondary,
                    marginBottom: '24px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                }}>
                    {error}
                </div>
                <button
                    onClick={fetchStatistics}
                    style={{
                        backgroundColor: '#007AFF',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        padding: '12px 24px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#0056CC';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#007AFF';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <div>
                    <h2 style={{
                        fontSize: '28px',
                        fontWeight: '600',
                        color: colors.textPrimary,
                        margin: '0 0 8px 0',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        letterSpacing: '-0.6px'
                    }}>
                        User Statistics
                    </h2>
                    <p style={{
                        fontSize: '16px',
                        color: colors.textSecondary,
                        margin: '0',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                    }}>
                        Overview of user registrations and activity
                    </p>
                </div>
                
                <button
                    onClick={fetchStatistics}
                    style={{
                        backgroundColor: 'transparent',
                        border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                        borderRadius: '8px',
                        color: colors.textSecondary,
                        padding: '10px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        transition: 'all 0.2s ease'
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
                    Refresh
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px'
            }}>
                <StatCard
                    title="Total Users"
                    value={statistics?.totalUsers}
                    icon="👥"
                    color="#007AFF"
                />
                
                <StatCard
                    title="Last Month"
                    value={statistics?.lastMonthUsers}
                    icon="📅"
                    color="#34C759"
                />
                
                <StatCard
                    title="Last Week"
                    value={statistics?.lastWeekUsers}
                    icon="📊"
                    color="#FF9500"
                />
                
                <StatCard
                    title="Today"
                    value={statistics?.todayUsers}
                    icon="⭐"
                    color="#FF3B30"
                />
            </div>
        </div>
    );
};

export default UserStatistics;