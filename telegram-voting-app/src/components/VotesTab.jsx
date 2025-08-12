import React, { useState, useEffect } from 'react';

const VotesTab = ({ colors, theme, allVotes, allVotesLoading, fetchAllVotes }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    const getStatusIcon = (status) => {
        switch(status) {
            case 'NEW': return '⏳';
            case 'CLICKED': return '👆';
            case 'VOTED': return '✅';
            case 'FAILED': return '❌';
            default: return '❓';
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'NEW': return '#FF9500';
            case 'CLICKED': return '#007AFF';
            case 'VOTED': return '#34C759';
            case 'FAILED': return '#FF3B30';
            default: return colors.textSecondary;
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Unknown';
        }
    };

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
            }}>
                <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: colors.textPrimary,
                    margin: '0'
                }}>
                    All Votes ({allVotes.length})
                </h2>
                <button
                    onClick={fetchAllVotes}
                    style={{
                        backgroundColor: '#007AFF',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        padding: '8px 12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        opacity: allVotesLoading ? 0.6 : 1
                    }}
                    disabled={allVotesLoading}
                >
                    🔄 Refresh
                </button>
            </div>

            {allVotesLoading ? (
                <div style={{ textAlign: 'center', padding: '32px' }}>
                    <div style={{
                        fontSize: '24px',
                        marginBottom: '16px',
                        animation: 'spin 2s linear infinite',
                        display: 'inline-block'
                    }}>
                        ⏳
                    </div>
                    <div style={{
                        fontSize: '16px',
                        color: colors.textSecondary
                    }}>
                        Loading votes...
                    </div>
                    <style>{`
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            ) : allVotes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px' }}>
                    <div style={{
                        fontSize: '48px',
                        marginBottom: '16px'
                    }}>
                        📭
                    </div>
                    <div style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: colors.textPrimary,
                        marginBottom: '8px'
                    }}>
                        No votes found
                    </div>
                    <div style={{
                        fontSize: '15px',
                        color: colors.textSecondary
                    }}>
                        No voting data available yet
                    </div>
                </div>
            ) : isMobile ? (
                // Mobile Card View
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {allVotes.map((vote) => (
                        <div
                            key={vote.id}
                            style={{
                                backgroundColor: colors.cardBackground,
                                borderRadius: '12px',
                                padding: '16px',
                                boxShadow: theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                                border: `1px solid ${colors.borderColor}`
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '12px'
                            }}>
                                <div style={{
                                    fontSize: '14px',
                                    color: colors.textSecondary,
                                    fontFamily: 'monospace'
                                }}>
                                    #{vote.id}
                                </div>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    backgroundColor: getStatusColor(vote.status),
                                    color: 'white',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    padding: '3px 6px',
                                    borderRadius: '6px'
                                }}>
                                    <span>{getStatusIcon(vote.status)}</span>
                                    <span>{vote.status}</span>
                                </div>
                            </div>
                            
                            <div style={{
                                fontSize: '16px',
                                color: colors.textPrimary,
                                fontWeight: '600',
                                fontFamily: 'monospace',
                                marginBottom: '8px'
                            }}>
                                {vote.phoneNumber}
                            </div>
                            
                            <div style={{
                                fontSize: '13px',
                                color: colors.textSecondary,
                                fontFamily: 'monospace'
                            }}>
                                {formatDate(vote.createdAt)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Desktop Table View
                <div style={{
                    backgroundColor: colors.cardBackground,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                    overflowX: 'auto'
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        minWidth: '600px'
                    }}>
                        <thead>
                            <tr style={{
                                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                                borderBottom: `1px solid ${colors.borderColor}`
                            }}>
                                <th style={{
                                    padding: '16px',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    color: colors.textPrimary,
                                    width: '80px'
                                }}>
                                    ID
                                </th>
                                <th style={{
                                    padding: '16px',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    color: colors.textPrimary,
                                    minWidth: '150px'
                                }}>
                                    Phone Number
                                </th>
                                <th style={{
                                    padding: '16px',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    color: colors.textPrimary,
                                    width: '120px'
                                }}>
                                    Status
                                </th>
                                <th style={{
                                    padding: '16px',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    color: colors.textPrimary,
                                    minWidth: '180px'
                                }}>
                                    Created At
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {allVotes.map((vote, index) => (
                                <tr
                                    key={vote.id}
                                    style={{
                                        borderBottom: index < allVotes.length - 1 ? `1px solid ${colors.borderColor}` : 'none',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <td style={{
                                        padding: '16px',
                                        fontSize: '14px',
                                        color: colors.textSecondary,
                                        fontFamily: 'monospace'
                                    }}>
                                        #{vote.id}
                                    </td>
                                    <td style={{
                                        padding: '16px',
                                        fontSize: '14px',
                                        color: colors.textPrimary,
                                        fontWeight: '500',
                                        fontFamily: 'monospace'
                                    }}>
                                        {vote.phoneNumber}
                                    </td>
                                    <td style={{
                                        padding: '16px'
                                    }}>
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            backgroundColor: getStatusColor(vote.status),
                                            color: 'white',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            padding: '4px 8px',
                                            borderRadius: '6px'
                                        }}>
                                            <span>{getStatusIcon(vote.status)}</span>
                                            <span>{vote.status}</span>
                                        </div>
                                    </td>
                                    <td style={{
                                        padding: '16px',
                                        fontSize: '13px',
                                        color: colors.textSecondary,
                                        fontFamily: 'monospace'
                                    }}>
                                        {formatDate(vote.createdAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default VotesTab;