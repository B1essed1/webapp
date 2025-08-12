import React from 'react';

const VotesTab = ({ colors, theme, allVotes, allVotesLoading, fetchAllVotes }) => {
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
            ) : (
                <div style={{
                    backgroundColor: colors.cardBackground,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    {allVotes.map((vote, index) => (
                        <div
                            key={vote.id}
                            style={{
                                padding: '16px',
                                borderBottom: index < allVotes.length - 1 ? `0.5px solid ${colors.borderColor}` : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', flex: '1' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    backgroundColor: getStatusColor(vote.status),
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    marginRight: '12px'
                                }}>
                                    {getStatusIcon(vote.status)}
                                </div>
                                <div style={{ flex: '1' }}>
                                    <div style={{
                                        fontWeight: '600',
                                        color: colors.textPrimary,
                                        fontSize: '14px',
                                        marginBottom: '2px'
                                    }}>
                                        {vote.phoneNumber}
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: colors.textSecondary
                                    }}>
                                        User: {vote.telegramData?.firstName} (@{vote.telegramData?.username})
                                    </div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: colors.textSecondary
                                    }}>
                                        {formatDate(vote.createdAt)}
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                backgroundColor: getStatusColor(vote.status),
                                color: 'white',
                                fontSize: '10px',
                                fontWeight: '600',
                                padding: '3px 6px',
                                borderRadius: '8px'
                            }}>
                                {vote.status}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VotesTab;