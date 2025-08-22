import React, { useState, useEffect } from 'react';
import { AdminAuth } from '../utils/adminAuth';
import { API_BASE_URL } from '../constants';
import { convertTiyinToSum, convertSumToTiyin } from '../utils';
import ClientVotesTab from './ClientVotesTab';

const ClientsTab = ({ colors, theme }) => {
    const [clients, setClients] = useState([]);
    const [clientsLoading, setClientsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [createSuccess, setCreateSuccess] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');

    // Check URL parameters on mount and handle browser navigation
    useEffect(() => {
        const handleUrlChange = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const clientId = urlParams.get('clientId');
            const clientName = urlParams.get('clientName');
            
            if (clientId && clientName) {
                setSelectedClient({
                    id: parseInt(clientId),
                    name: decodeURIComponent(clientName)
                });
            } else {
                setSelectedClient(null);
            }
        };

        // Handle initial load
        handleUrlChange();

        // Handle browser back/forward buttons
        window.addEventListener('popstate', handleUrlChange);

        return () => {
            window.removeEventListener('popstate', handleUrlChange);
        };
    }, []);
    
    const [formData, setFormData] = useState({
        name: '',
        orderCount: '',
        link: '',
        amountPerVote: '',
        profitPerVote: ''
    });

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setClientsLoading(true);
        try {
            const result = await AdminAuth.makeAuthenticatedRequest('/client/all', {
                method: 'GET'
            });

            if (result.data) {
                const clientsArray = Array.isArray(result.data) ? result.data : [];
                setClients(clientsArray);
            } else {
                console.error('Failed to fetch clients:', result.errorMessage);
                setClients([]);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            setClients([]);
        } finally {
            setClientsLoading(false);
        }
    };

    const handleCreateClient = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError(null);
        setCreateSuccess(false);

        try {
            const clientData = {
                name: formData.name,
                orderCount: parseInt(formData.orderCount) || 0,
                link: formData.link,
                amountPerVote: convertSumToTiyin(parseFloat(formData.amountPerVote) || 0),
                profitPerVote: convertSumToTiyin(parseFloat(formData.profitPerVote) || 0)
            };

            const token = AdminAuth.getToken();
            const response = await fetch(`${API_BASE_URL}/api/client`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(clientData)
            });

            const result = await response.json();

            if (response.ok && result.data) {
                setCreateSuccess(true);
                setFormData({
                    name: '',
                    orderCount: '',
                    link: '',
                    amountPerVote: '',
                    profitPerVote: ''
                });
                setTimeout(() => {
                    setShowCreateForm(false);
                    setCreateSuccess(false);
                }, 1500);
                fetchClients();
            } else {
                setCreateError(result.errorMessage || 'Failed to create client');
            }
        } catch (error) {
            console.error('Error creating client:', error);
            setCreateError('Failed to create client');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStatusToggle = async (clientId, currentStatus) => {
        try {
            const token = AdminAuth.getToken();
            const response = await fetch(`${API_BASE_URL}/api/client/status?id=${clientId}&status=${!currentStatus}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            const result = await response.json();

            if (response.ok && result.data) {
                fetchClients();
            } else {
                console.error('Failed to update client status:', result.errorMessage);
            }
        } catch (error) {
            console.error('Error updating client status:', error);
        }
    };

    const handleClientClick = (client) => {
        setSelectedClient(client);
        // Update URL to include client info
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('clientId', client.id);
        urlParams.set('clientName', encodeURIComponent(client.name));
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.pushState(null, '', newUrl);
    };

    const handleBackToClients = () => {
        setSelectedClient(null);
        // Remove client params from URL
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.delete('clientId');
        urlParams.delete('clientName');
        const newUrl = urlParams.toString() 
            ? `${window.location.pathname}?${urlParams.toString()}`
            : window.location.pathname;
        window.history.pushState(null, '', newUrl);
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

    const formatAmount = (amountInTiyin) => {
        const amountInSom = convertTiyinToSum(amountInTiyin || 0);
        return new Intl.NumberFormat('uz-UZ').format(amountInSom);
    };

    const filteredClients = clients.filter(client => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            client.name.toLowerCase().includes(query) ||
            client.id.toString().includes(query) ||
            (client.link && client.link.toLowerCase().includes(query))
        );
    });

    const handleSearch = () => {
        setSearchQuery(searchInput.trim());
        setSearchInput(''); // Clear the input after search
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    if (selectedClient) {
        return (
            <ClientVotesTab
                colors={colors}
                theme={theme}
                clientId={selectedClient.id}
                clientName={selectedClient.name}
                onBack={handleBackToClients}
            />
        );
    }

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                <h2 style={{
                    fontSize: '28px',
                    fontWeight: '600',
                    color: colors.textPrimary,
                    margin: '0',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    letterSpacing: '-0.6px'
                }}>
                    Clients
                    <span style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: colors.textSecondary,
                        marginLeft: '12px'
                    }}>
                        {filteredClients.length}{clients.length !== filteredClients.length ? ` of ${clients.length}` : ''}
                    </span>
                </h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search clients..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                style={{
                                    padding: '10px 12px 10px 36px',
                                    border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                                    borderRadius: '8px',
                                    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                                    color: colors.textPrimary,
                                    fontSize: '15px',
                                    width: isMobile ? '160px' : '200px',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                    outline: 'none',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#007AFF';
                                    e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
                                    e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)';
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: '14px',
                                color: colors.textSecondary
                            }}>
                                ⌕
                            </div>
                        </div>
                        <button
                            onClick={handleSearch}
                            style={{
                                backgroundColor: '#007AFF',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                padding: '10px 16px',
                                fontSize: '15px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                letterSpacing: '-0.2px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#0056CC';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#007AFF';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            Search
                        </button>
                    </div>
                    <button
                        onClick={fetchClients}
                        style={{
                            backgroundColor: 'transparent',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                            borderRadius: '8px',
                            color: colors.textSecondary,
                            padding: '10px 16px',
                            fontSize: '15px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            opacity: clientsLoading ? 0.6 : 1,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            letterSpacing: '-0.2px'
                        }}
                        disabled={clientsLoading}
                        onMouseEnter={(e) => {
                            if (!clientsLoading) {
                                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
                                e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
                        }}
                    >
                        Refresh
                    </button>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        style={{
                            backgroundColor: '#007AFF',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            padding: '10px 16px',
                            fontSize: '15px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            letterSpacing: '-0.2px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#0056CC';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#007AFF';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        Add Client
                    </button>
                </div>
            </div>

            {showCreateForm && (
                <div style={{
                    backgroundColor: colors.cardBackground,
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px',
                    boxShadow: theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: `1px solid ${colors.borderColor}`
                }}>
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: colors.textPrimary,
                        marginBottom: '16px',
                        margin: '0 0 16px 0'
                    }}>
                        Create New Client
                    </h3>

                    {createError && (
                        <div style={{
                            backgroundColor: '#FF3B30',
                            color: 'white',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '16px',
                            fontSize: '14px'
                        }}>
                            {createError}
                        </div>
                    )}

                    {createSuccess && (
                        <div style={{
                            backgroundColor: '#34C759',
                            color: 'white',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '16px',
                            fontSize: '14px'
                        }}>
                            Client created successfully!
                        </div>
                    )}

                    <form onSubmit={handleCreateClient}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                            gap: '16px',
                            marginBottom: '20px'
                        }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: colors.textPrimary,
                                    marginBottom: '6px'
                                }}>
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: `1px solid ${colors.borderColor}`,
                                        borderRadius: '8px',
                                        backgroundColor: colors.cardBackground,
                                        color: colors.textPrimary,
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="Enter client name"
                                />
                            </div>
                            
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: colors.textPrimary,
                                    marginBottom: '6px'
                                }}>
                                    To'plash kerak bo'lgan ovozlar soni
                                </label>
                                <input
                                    type="number"
                                    name="orderCount"
                                    value={formData.orderCount}
                                    onChange={handleInputChange}
                                    min="0"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: `1px solid ${colors.borderColor}`,
                                        borderRadius: '8px',
                                        backgroundColor: colors.cardBackground,
                                        color: colors.textPrimary,
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="0"
                                />
                            </div>

                            <div style={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: colors.textPrimary,
                                    marginBottom: '6px'
                                }}>
                                    Link
                                </label>
                                <input
                                    type="url"
                                    name="link"
                                    value={formData.link}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: `1px solid ${colors.borderColor}`,
                                        borderRadius: '8px',
                                        backgroundColor: colors.cardBackground,
                                        color: colors.textPrimary,
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="https://example.com"
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: colors.textPrimary,
                                    marginBottom: '6px'
                                }}>
                                    Har bir ovoz uchun to'lov
                                </label>
                                <input
                                    type="number"
                                    name="amountPerVote"
                                    value={formData.amountPerVote}
                                    onChange={handleInputChange}
                                    min="0"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: `1px solid ${colors.borderColor}`,
                                        borderRadius: '8px',
                                        backgroundColor: colors.cardBackground,
                                        color: colors.textPrimary,
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: colors.textPrimary,
                                    marginBottom: '6px'
                                }}>
                                    Referal link uchun to'lov
                                </label>
                                <input
                                    type="number"
                                    name="profitPerVote"
                                    value={formData.profitPerVote}
                                    onChange={handleInputChange}
                                    min="0"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: `1px solid ${colors.borderColor}`,
                                        borderRadius: '8px',
                                        backgroundColor: colors.cardBackground,
                                        color: colors.textPrimary,
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                style={{
                                    backgroundColor: 'transparent',
                                    border: `1px solid ${colors.borderColor}`,
                                    borderRadius: '8px',
                                    color: colors.textSecondary,
                                    padding: '10px 16px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createLoading || !formData.name}
                                style={{
                                    backgroundColor: createLoading || !formData.name ? '#ccc' : '#34C759',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    padding: '10px 16px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: createLoading || !formData.name ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {createLoading ? 'Creating...' : 'Create Client'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {clientsLoading ? (
                <div style={{ textAlign: 'center', padding: '64px 32px' }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        border: `2px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                        borderTop: `2px solid ${colors.textSecondary}`,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        display: 'inline-block',
                        marginBottom: '16px'
                    }}>
                    </div>
                    <div style={{
                        fontSize: '15px',
                        color: colors.textSecondary,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        fontWeight: '400'
                    }}>
                        Loading clients...
                    </div>
                    <style>{`
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            ) : filteredClients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 32px' }}>
                    <div style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: colors.textPrimary,
                        marginBottom: '8px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        letterSpacing: '-0.3px'
                    }}>
                        No clients found
                    </div>
                    <div style={{
                        fontSize: '15px',
                        color: colors.textSecondary,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        fontWeight: '400'
                    }}>
                        {clients.length === 0 ? 'Create your first client to get started' : 'No clients match your search'}
                    </div>
                </div>
            ) : isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredClients.map((client) => (
                        <div
                            key={client.id}
                            onClick={() => handleClientClick(client)}
                            style={{
                                backgroundColor: colors.cardBackground,
                                borderRadius: '12px',
                                padding: '16px',
                                boxShadow: theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                                border: `1px solid ${colors.borderColor}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = theme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)';
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
                                    #{client.id}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusToggle(client.id, client.isActive);
                                    }}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        backgroundColor: client.isActive ? '#34C759' : '#FF9500',
                                        color: 'white',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        padding: '3px 6px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'opacity 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '0.8';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                    }}
                                    title={`Click to ${client.isActive ? 'deactivate' : 'activate'}`}
                                >
                                    <span>{client.isActive ? '✅' : '⏸️'}</span>
                                    <span>{client.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                                </button>
                            </div>
                            
                            <div style={{
                                fontSize: '16px',
                                color: colors.textPrimary,
                                fontWeight: '600',
                                marginBottom: '8px'
                            }}>
                                {client.name}
                            </div>
                            
                            <div style={{
                                fontSize: '13px',
                                color: colors.textSecondary,
                                marginBottom: '4px'
                            }}>
                                Orders: {client.orderCount} | Amount: {formatAmount(client.amountPerVote)} SO'M | Profit: {formatAmount(client.profitPerVote)} SO'M
                            </div>
                            
                            <div style={{
                                fontSize: '13px',
                                color: colors.textSecondary,
                                fontFamily: 'monospace'
                            }}>
                                {formatDate(client.createdDate)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
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
                        minWidth: '900px',
                        tableLayout: 'auto'
                    }}>
                        <thead>
                            <tr style={{
                                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                                borderBottom: `2px solid ${colors.borderColor}`
                            }}>
                                <th style={{
                                    padding: '18px 16px',
                                    textAlign: 'left',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    color: colors.textSecondary,
                                    letterSpacing: '-0.1px',
                                    width: '80px',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                                }}>
                                    ID
                                </th>
                                <th style={{
                                    padding: '18px 16px',
                                    textAlign: 'left',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    color: colors.textSecondary,
                                    letterSpacing: '-0.1px',
                                    width: '35%',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                                }}>
                                    Name & Link
                                </th>
                                <th style={{
                                    padding: '18px 16px',
                                    textAlign: 'center',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    color: colors.textSecondary,
                                    letterSpacing: '-0.1px',
                                    width: '12%',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                                }}>
                                    Orders
                                </th>
                                <th style={{
                                    padding: '18px 16px',
                                    textAlign: 'center',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    color: colors.textSecondary,
                                    letterSpacing: '-0.1px',
                                    width: '12%',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                                }}>
                                    Har bir ovoz uchun
                                </th>
                                <th style={{
                                    padding: '18px 16px',
                                    textAlign: 'center',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    color: colors.textSecondary,
                                    letterSpacing: '-0.1px',
                                    width: '12%',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                                }}>
                                    Referal un to'lov
                                </th>
                                <th style={{
                                    padding: '18px 16px',
                                    textAlign: 'left',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    color: colors.textSecondary,
                                    letterSpacing: '-0.1px',
                                    width: '17%',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                                }}>
                                    Created
                                </th>
                                <th style={{
                                    padding: '18px 16px',
                                    textAlign: 'center',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    color: colors.textSecondary,
                                    letterSpacing: '-0.1px',
                                    width: '12%',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                                }}>
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map((client, index) => (
                                <tr
                                    key={client.id}
                                    onClick={() => handleClientClick(client)}
                                    style={{
                                        borderBottom: index < filteredClients.length - 1 ? `1px solid ${colors.borderColor}` : 'none',
                                        transition: 'all 0.2s ease',
                                        height: '70px',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = theme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <td style={{
                                        padding: '20px 16px',
                                        fontSize: '13px',
                                        color: colors.textSecondary,
                                        fontFamily: 'monospace',
                                        fontWeight: '600',
                                        verticalAlign: 'middle'
                                    }}>
                                        #{client.id}
                                    </td>
                                    <td style={{
                                        padding: '20px 16px',
                                        fontSize: '14px',
                                        color: colors.textPrimary,
                                        fontWeight: '500',
                                        verticalAlign: 'middle',
                                        maxWidth: '300px',
                                        wordBreak: 'break-word'
                                    }}>
                                        <div style={{ 
                                            marginBottom: '6px',
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            color: colors.textPrimary
                                        }}>
                                            {client.name}
                                        </div>
                                        {client.link && (
                                            <a
                                                href={client.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    fontSize: '12px',
                                                    color: '#007AFF',
                                                    textDecoration: 'none',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    backgroundColor: 'rgba(0, 122, 255, 0.1)',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(0, 122, 255, 0.2)';
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                            >
                                                🔗 <span>Link</span>
                                            </a>
                                        )}
                                    </td>
                                    <td style={{
                                        padding: '20px 16px',
                                        fontSize: '15px',
                                        color: colors.textPrimary,
                                        fontFamily: 'monospace',
                                        fontWeight: '600',
                                        textAlign: 'center',
                                        verticalAlign: 'middle'
                                    }}>
                                        <div style={{
                                            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                                            padding: '6px 10px',
                                            borderRadius: '8px',
                                            display: 'inline-block',
                                            minWidth: '40px'
                                        }}>
                                            {client.orderCount}
                                        </div>
                                    </td>
                                    <td style={{
                                        padding: '20px 16px',
                                        fontSize: '15px',
                                        color: colors.textPrimary,
                                        fontFamily: 'monospace',
                                        fontWeight: '600',
                                        textAlign: 'center',
                                        verticalAlign: 'middle'
                                    }}>
                                        <div style={{
                                            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                                            padding: '6px 10px',
                                            borderRadius: '8px',
                                            display: 'inline-block',
                                            minWidth: '60px'
                                        }}>
                                            {formatAmount(client.amountPerVote)} SO'M
                                        </div>
                                    </td>
                                    <td style={{
                                        padding: '20px 16px',
                                        fontSize: '15px',
                                        color: colors.textPrimary,
                                        fontFamily: 'monospace',
                                        fontWeight: '600',
                                        textAlign: 'center',
                                        verticalAlign: 'middle'
                                    }}>
                                        <div style={{
                                            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                                            padding: '6px 10px',
                                            borderRadius: '8px',
                                            display: 'inline-block',
                                            minWidth: '60px'
                                        }}>
                                            {formatAmount(client.profitPerVote)} SO'M
                                        </div>
                                    </td>
                                    <td style={{
                                        padding: '20px 16px',
                                        fontSize: '12px',
                                        color: colors.textSecondary,
                                        fontFamily: 'monospace',
                                        verticalAlign: 'middle'
                                    }}>
                                        <div style={{
                                            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            textAlign: 'center'
                                        }}>
                                            {formatDate(client.createdDate)}
                                        </div>
                                    </td>
                                    <td style={{
                                        padding: '20px 16px',
                                        textAlign: 'center',
                                        verticalAlign: 'middle'
                                    }}>
                                        <div style={{
                                            position: 'relative',
                                            display: 'inline-block'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={client.isActive}
                                                onChange={() => handleStatusToggle(client.id, client.isActive)}
                                                style={{
                                                    position: 'absolute',
                                                    opacity: 0,
                                                    cursor: 'pointer',
                                                    height: 0,
                                                    width: 0
                                                }}
                                            />
                                            <div
                                                style={{
                                                    width: '56px',
                                                    height: '28px',
                                                    backgroundColor: client.isActive ? '#34C759' : '#8E8E93',
                                                    borderRadius: '14px',
                                                    position: 'relative',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: client.isActive 
                                                        ? '0 0 0 2px rgba(52, 199, 89, 0.2)' 
                                                        : '0 0 0 2px rgba(142, 142, 147, 0.2)'
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStatusToggle(client.id, client.isActive);
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        backgroundColor: 'white',
                                                        borderRadius: '50%',
                                                        position: 'absolute',
                                                        top: '2px',
                                                        left: client.isActive ? '30px' : '2px',
                                                        transition: 'all 0.3s ease',
                                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '10px'
                                                    }}
                                                >
                                                    {client.isActive ? '✓' : '✕'}
                                                </div>
                                            </div>
                                        </div>
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

export default ClientsTab;