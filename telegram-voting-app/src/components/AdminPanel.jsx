import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { AdminAuth, AuthenticationError } from '../utils/adminAuth';

const AdminPanel = ({ colors, theme }) => {
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => AdminAuth.isAuthenticated());
    const [adminTab, setAdminTab] = useState('votes');
    const [allVotes, setAllVotes] = useState([]);
    const [allVotesLoading, setAllVotesLoading] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState(null);

    const fetchAllVotes = async () => {
        if (!AdminAuth.isAuthenticated()) {
            setIsAdminAuthenticated(false);
            return;
        }

        setAllVotesLoading(true);
        
        try {
            const result = await AdminAuth.makeAuthenticatedRequest('/votes', {
                method: 'GET'
            });

            console.log('🔧 Admin votes response:', result);

            if (result.data) {
                const votesArray = Array.isArray(result.data) ? result.data : [];
                setAllVotes(votesArray);
            } else {
                console.error('Failed to fetch admin votes:', result.errorMessage);
                setAllVotes([]);
            }
        } catch (error) {
            if (error instanceof AuthenticationError) {
                setIsAdminAuthenticated(false);
                setLoginError('Session expired. Please login again.');
            } else {
                console.error('💥 Admin votes fetch error:', error);
                setAllVotes([]);
            }
        } finally {
            setAllVotesLoading(false);
        }
    };

    const handleAdminLogin = async (username, password) => {
        setLoginLoading(true);
        setLoginError(null);

        try {
            await AdminAuth.login(username, password);
            setIsAdminAuthenticated(true);
            fetchAllVotes();
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
        setAllVotes([]);
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
                    allVotes={allVotes}
                    allVotesLoading={allVotesLoading}
                    fetchAllVotes={fetchAllVotes}
                    handleLogout={handleLogout}
                />
            )}
        </div>
    );
};

export default AdminPanel;