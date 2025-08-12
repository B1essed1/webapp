import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { API_BASE_URL } from '../constants';

const AdminPanel = ({ colors, theme }) => {
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [adminTab, setAdminTab] = useState('votes');
    const [allVotes, setAllVotes] = useState([]);
    const [allVotesLoading, setAllVotesLoading] = useState(false);

    const fetchAllVotes = async () => {
        setAllVotesLoading(true);
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/votes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer admin:${adminPassword}`
                }
            });

            const result = await response.json();
            console.log('🔧 Admin votes response:', result);

            if (response.ok && result.data) {
                const votesArray = Array.isArray(result.data) ? result.data : [];
                setAllVotes(votesArray);
            } else {
                console.error('Failed to fetch admin votes:', result.errorMessage);
                setAllVotes([]);
            }
        } catch (error) {
            console.error('💥 Admin votes fetch error:', error);
            setAllVotes([]);
        } finally {
            setAllVotesLoading(false);
        }
    };

    const handleAdminLogin = () => {
        if (adminPassword === 'admin123') {
            setIsAdminAuthenticated(true);
            fetchAllVotes();
        } else {
            alert('Invalid password');
        }
    };

    const handleLogout = () => {
        setIsAdminAuthenticated(false);
        setAdminPassword('');
        setAllVotes([]);
        // Navigate back to main page
        window.history.pushState(null, '', '/');
        window.location.reload();
    };

    return (
        <div style={{ padding: '16px', minHeight: '100vh' }}>
            {!isAdminAuthenticated ? (
                <AdminLogin
                    colors={colors}
                    adminPassword={adminPassword}
                    setAdminPassword={setAdminPassword}
                    handleAdminLogin={handleAdminLogin}
                />
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