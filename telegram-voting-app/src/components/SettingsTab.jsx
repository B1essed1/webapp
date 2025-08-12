import React from 'react';
import { API_BASE_URL } from '../constants';

const SettingsTab = ({ colors, theme, allVotes }) => {
    return (
        <div>
            <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: colors.textPrimary,
                marginBottom: '16px'
            }}>
                System Settings
            </h2>

            <div style={{
                backgroundColor: colors.cardBackground,
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{
                    padding: '16px',
                    borderBottom: `0.5px solid ${colors.borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{
                            fontWeight: '600',
                            color: colors.textPrimary,
                            fontSize: '16px'
                        }}>
                            API Base URL
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: colors.textSecondary,
                            marginTop: '2px'
                        }}>
                            {API_BASE_URL}
                        </div>
                    </div>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#34C759',
                        borderRadius: '50%'
                    }}></div>
                </div>

                <div style={{
                    padding: '16px',
                    borderBottom: `0.5px solid ${colors.borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{
                            fontWeight: '600',
                            color: colors.textPrimary,
                            fontSize: '16px'
                        }}>
                            Theme
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: colors.textSecondary,
                            marginTop: '2px'
                        }}>
                            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </div>
                    </div>
                    <div style={{
                        padding: '6px 12px',
                        backgroundColor: theme === 'dark' ? '#2D2D30' : '#F2F2F7',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: colors.textPrimary
                    }}>
                        {theme.toUpperCase()}
                    </div>
                </div>

                <div style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{
                            fontWeight: '600',
                            color: colors.textPrimary,
                            fontSize: '16px'
                        }}>
                            Total Votes
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: colors.textSecondary,
                            marginTop: '2px'
                        }}>
                            All registered votes
                        </div>
                    </div>
                    <div style={{
                        padding: '6px 12px',
                        backgroundColor: '#007AFF',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'white'
                    }}>
                        {allVotes.length}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;