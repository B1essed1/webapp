import React from 'react';

const AdminLogin = ({ colors, adminPassword, setAdminPassword, handleAdminLogin }) => {
    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '100px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#FF3B30',
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '36px'
                }}>
                    🔐
                </div>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: colors.textPrimary,
                    marginBottom: '8px',
                    margin: '0 0 8px 0'
                }}>
                    Admin Panel
                </h1>
                <p style={{
                    fontSize: '17px',
                    color: colors.textSecondary,
                    margin: '0'
                }}>
                    Enter admin password to continue
                </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Admin Password"
                    style={{
                        width: '100%',
                        padding: '16px',
                        fontSize: '17px',
                        border: `1px solid ${colors.borderColor}`,
                        borderRadius: '12px',
                        backgroundColor: colors.inputBg,
                        color: colors.textPrimary,
                        outline: 'none',
                        boxSizing: 'border-box'
                    }}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleAdminLogin();
                        }
                    }}
                />
            </div>

            <button
                onClick={handleAdminLogin}
                style={{
                    width: '100%',
                    backgroundColor: '#FF3B30',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontFamily: 'inherit',
                    fontWeight: '600',
                    fontSize: '17px',
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
                🔓 Login
            </button>
        </div>
    );
};

export default AdminLogin;