import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { AdminAuth, AuthenticationError } from '../utils/adminAuth';

const AdminPanel = ({ colors, theme }) => {
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => AdminAuth.isAuthenticated());
    const [adminTab, setAdminTab] = useState('clients');
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState(null);

    const handleAdminLogin = async (username, password) => {
        setLoginLoading(true);
        setLoginError(null);

        try {
            await AdminAuth.login(username, password);
            setIsAdminAuthenticated(true);
        } catch (error) {
            console.error('💥 Admin login failed:', error);
            setLoginError(error.message || 'Login failed');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = () => {
        AdminAuth.logout();
        setIsAdminAuthenticated(false);
        setLoginError(null);
        // This will automatically show the login page since isAdminAuthenticated is now false
    };

    return (
        <div style={{ minHeight: '100vh' }}>
            {!isAdminAuthenticated ? (
                <div style={{ padding: '16px' }}>
                    <AdminLogin
                        colors={colors}
                        onLogin={handleAdminLogin}
                        isLoading={loginLoading}
                        error={loginError}
                    />
                </div>
            ) : (
                <AdminDashboard
                    colors={colors}
                    theme={theme}
                    adminTab={adminTab}
                    setAdminTab={setAdminTab}
                    handleLogout={handleLogout}
                />
            )}
        </div>
    );
};

export default AdminPanel;