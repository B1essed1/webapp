import React, { useState, useEffect } from 'react';
import { AdminAuth } from '../utils/adminAuth';

const StatisticsTab = ({ colors, theme }) => {
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

    const StatCard = ({ title, value, icon, color, percentage }) => (
        <div style={{
            backgroundColor: colors.cardBackground,
            borderRadius: '16px',
            padding: '28px',
            boxShadow: theme === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = theme === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 8px 32px rgba(0, 0, 0, 0.12)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = theme === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)';
        }}
        >
            {/* Background gradient */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '120px',
                height: '120px',
                background: `linear-gradient(135deg, ${color}15, ${color}05)`,
                borderRadius: '50%',
                transform: 'translate(40px, -40px)'
            }} />
            
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '24px',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    backgroundColor: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    border: `2px solid ${color}25`
                }}>
                    {icon}
                </div>
                
                {percentage !== undefined && (
                    <div style={{
                        backgroundColor: percentage >= 0 ? '#34C759' : '#FF3B30',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                    }}>
                        {percentage >= 0 ? '+' : ''}{percentage}%
                    </div>
                )}
            </div>
            
            <div style={{
                fontSize: '36px',
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: '8px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                letterSpacing: '-1px',
                position: 'relative',
                zIndex: 1
            }}>
                {formatNumber(value)}
            </div>
            
            <div style={{
                fontSize: '16px',
                color: colors.textSecondary,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                fontWeight: '500',
                position: 'relative',
                zIndex: 1
            }}>
                {title}
            </div>
        </div>
    );

    const ProgressBar = ({ label, value, maxValue, color }) => {
        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
        
        return (
            <div style={{ marginBottom: '20px' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                }}>
                    <span style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: colors.textPrimary,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                    }}>
                        {label}
                    </span>
                    <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: color,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                    }}>
                        {formatNumber(value)}
                    </span>
                </div>
                <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${color}, ${color}AA)`,
                        borderRadius: '4px',
                        transition: 'width 1s ease-out',
                        boxShadow: `0 0 8px ${color}40`
                    }} />
                </div>
            </div>
        );
    };

    const CircularProgress = ({ percentage, color, size = 120 }) => {
        const radius = (size - 20) / 2;
        const circumference = 2 * Math.PI * radius;
        const strokeDasharray = circumference;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
            <div style={{
                position: 'relative',
                width: size,
                height: size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                        strokeWidth="10"
                        fill="none"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{
                            transition: 'stroke-dashoffset 1s ease-out',
                            filter: `drop-shadow(0 0 6px ${color}40)`
                        }}
                    />
                </svg>
                <div style={{
                    position: 'absolute',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: colors.textPrimary,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                }}>
                    {Math.round(percentage)}%
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                backgroundColor: colors.cardBackground,
                borderRadius: '16px',
                margin: '24px 0',
                boxShadow: theme === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: `4px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    borderTop: `4px solid #007AFF`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '20px'
                }} />
                <div style={{
                    fontSize: '18px',
                    color: colors.textSecondary,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    fontWeight: '500'
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
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                backgroundColor: colors.cardBackground,
                borderRadius: '16px',
                margin: '24px 0',
                boxShadow: theme === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`
            }}>
                <div style={{
                    fontSize: '64px',
                    marginBottom: '20px'
                }}>
                    ⚠️
                </div>
                <div style={{
                    fontSize: '22px',
                    fontWeight: '600',
                    color: colors.textPrimary,
                    marginBottom: '12px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                }}>
                    Failed to load statistics
                </div>
                <div style={{
                    fontSize: '16px',
                    color: colors.textSecondary,
                    marginBottom: '32px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    textAlign: 'center',
                    maxWidth: '400px'
                }}>
                    {error}
                </div>
                <button
                    onClick={fetchStatistics}
                    style={{
                        backgroundColor: '#007AFF',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        padding: '16px 32px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#0056CC';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 122, 255, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#007AFF';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.3)';
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    // Calculate percentages for demo purposes
    const totalUsers = statistics?.totalUsers || 0;
    const todayPercentage = totalUsers > 0 ? ((statistics?.todayUsers || 0) / totalUsers) * 100 : 0;
    const weekPercentage = totalUsers > 0 ? ((statistics?.lastWeekUsers || 0) / totalUsers) * 100 : 0;
    const monthPercentage = totalUsers > 0 ? ((statistics?.lastMonthUsers || 0) / totalUsers) * 100 : 0;

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px'
            }}>
                <div>
                    <h2 style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        color: colors.textPrimary,
                        margin: '0 0 8px 0',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        letterSpacing: '-0.8px'
                    }}>
                        📊 User Statistics
                    </h2>
                    <p style={{
                        fontSize: '18px',
                        color: colors.textSecondary,
                        margin: '0',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        fontWeight: '400'
                    }}>
                        Overview of user registrations and growth analytics
                    </p>
                </div>
                
                <button
                    onClick={fetchStatistics}
                    style={{
                        backgroundColor: 'transparent',
                        border: `2px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                        borderRadius: '12px',
                        color: colors.textSecondary,
                        padding: '12px 20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
                        e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Main Statistics Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
            }}>
                <StatCard
                    title="Total Users"
                    value={statistics?.totalUsers}
                    icon="👥"
                    color="#007AFF"
                    percentage={+15}
                />
                
                <StatCard
                    title="Last Month"
                    value={statistics?.lastMonthUsers}
                    icon="📅"
                    color="#34C759"
                    percentage={+8}
                />
                
                <StatCard
                    title="Last Week"
                    value={statistics?.lastWeekUsers}
                    icon="📊"
                    color="#FF9500"
                    percentage={+12}
                />
                
                <StatCard
                    title="Today"
                    value={statistics?.todayUsers}
                    icon="⭐"
                    color="#FF3B30"
                    percentage={+25}
                />
            </div>

            {/* Detailed Analytics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '24px'
            }}>
                {/* Progress Bars Chart */}
                <div style={{
                    backgroundColor: colors.cardBackground,
                    borderRadius: '16px',
                    padding: '32px',
                    boxShadow: theme === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`
                }}>
                    <h3 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: colors.textPrimary,
                        marginBottom: '24px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                    }}>
                        📈 User Growth Breakdown
                    </h3>
                    
                    <ProgressBar
                        label="Today's Registrations"
                        value={statistics?.todayUsers || 0}
                        maxValue={statistics?.lastWeekUsers || 1}
                        color="#FF3B30"
                    />
                    
                    <ProgressBar
                        label="This Week"
                        value={statistics?.lastWeekUsers || 0}
                        maxValue={statistics?.lastMonthUsers || 1}
                        color="#FF9500"
                    />
                    
                    <ProgressBar
                        label="This Month"
                        value={statistics?.lastMonthUsers || 0}
                        maxValue={statistics?.totalUsers || 1}
                        color="#34C759"
                    />
                    
                    <ProgressBar
                        label="Total Users"
                        value={statistics?.totalUsers || 0}
                        maxValue={statistics?.totalUsers || 1}
                        color="#007AFF"
                    />
                </div>

                {/* Circular Progress Charts */}
                <div style={{
                    backgroundColor: colors.cardBackground,
                    borderRadius: '16px',
                    padding: '32px',
                    boxShadow: theme === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`
                }}>
                    <h3 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: colors.textPrimary,
                        marginBottom: '24px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                    }}>
                        🎯 Registration Distribution
                    </h3>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '20px',
                        alignItems: 'center'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <CircularProgress
                                percentage={todayPercentage}
                                color="#FF3B30"
                                size={100}
                            />
                            <div style={{
                                fontSize: '14px',
                                color: colors.textSecondary,
                                marginTop: '8px',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                            }}>
                                Today
                            </div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                            <CircularProgress
                                percentage={weekPercentage}
                                color="#FF9500"
                                size={100}
                            />
                            <div style={{
                                fontSize: '14px',
                                color: colors.textSecondary,
                                marginTop: '8px',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                            }}>
                                This Week
                            </div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                            <CircularProgress
                                percentage={monthPercentage}
                                color="#34C759"
                                size={100}
                            />
                            <div style={{
                                fontSize: '14px',
                                color: colors.textSecondary,
                                marginTop: '8px',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                            }}>
                                This Month
                            </div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                            <CircularProgress
                                percentage={100}
                                color="#007AFF"
                                size={100}
                            />
                            <div style={{
                                fontSize: '14px',
                                color: colors.textSecondary,
                                marginTop: '8px',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                            }}>
                                Total
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsTab;