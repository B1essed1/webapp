import React from 'react';
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
    return (
        <div>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#FF3B30',
                    borderRadius: '50%',
                    margin: '0 auto 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                }}>
                    ⚙️
                </div>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: colors.textPrimary,
                    margin: '0 0 8px 0'
                }}>
                    Admin Dashboard
                </h1>
                <p style={{
                    fontSize: '15px',
                    color: colors.textSecondary,
                    margin: '0'
                }}>
                    Manage voting system
                </p>
            </div>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                backgroundColor: colors.cardBackground,
                borderRadius: '12px',
                padding: '4px',
                marginBottom: '24px',
                boxShadow: theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
                <button
                    onClick={() => setAdminTab('votes')}
                    style={{
                        flex: '1',
                        padding: '12px 16px',
                        backgroundColor: adminTab === 'votes' ? '#007AFF' : 'transparent',
                        color: adminTab === 'votes' ? 'white' : colors.textSecondary,
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '15px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    📊 Votes
                </button>
                <button
                    onClick={() => setAdminTab('settings')}
                    style={{
                        flex: '1',
                        padding: '12px 16px',
                        backgroundColor: adminTab === 'settings' ? '#007AFF' : 'transparent',
                        color: adminTab === 'settings' ? 'white' : colors.textSecondary,
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '15px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    ⚙️ Settings
                </button>
            </div>

            {/* Tab Content */}
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

            {/* Logout Button */}
            <div style={{ marginTop: '32px' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        backgroundColor: '#FF3B30',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontFamily: 'inherit',
                        fontWeight: '600',
                        fontSize: '16px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
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
                    🚪 Logout
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;