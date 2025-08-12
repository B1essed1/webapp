import React, { useState } from 'react';

const AdminLogin = ({ colors, onLogin, isLoading, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };
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
                    Enter admin credentials to continue
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
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
                    />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
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
                    />
                </div>

                {error && (
                    <div style={{
                        marginBottom: '16px',
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: '#FADBD8',
                        color: '#B03A2E',
                        fontSize: '15px',
                        textAlign: 'center'
                    }}>
                        ❌ {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !username || !password}
                    style={{
                        width: '100%',
                        backgroundColor: isLoading ? '#ccc' : '#FF3B30',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontFamily: 'inherit',
                        fontWeight: '600',
                        fontSize: '17px',
                        padding: '16px',
                        cursor: isLoading ? 'default' : 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: isLoading || !username || !password ? 0.6 : 1
                    }}
                    onTouchStart={(e) => {
                        if (!isLoading && username && password) {
                            e.currentTarget.style.transform = 'scale(0.96)';
                            e.currentTarget.style.opacity = '0.8';
                        }
                    }}
                    onTouchEnd={(e) => {
                        if (!isLoading && username && password) {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.opacity = '1';
                        }
                    }}
                >
                    {isLoading ? '🔄 Logging in...' : '🔓 Login'}
                </button>
            </form>

        </div>
    );
};

export default AdminLogin;