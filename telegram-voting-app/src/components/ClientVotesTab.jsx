import React, { useState, useEffect } from 'react';
import { AdminAuth } from '../utils/adminAuth';
import { API_BASE_URL } from '../constants';

const ClientVotesTab = ({ colors, theme, clientId, clientName, onBack }) => {
    const [votes, setVotes] = useState([]);
    const [votesLoading, setVotesLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [updatingVotes, setUpdatingVotes] = useState(new Set());
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [tempFromDate, setTempFromDate] = useState('');
    const [tempToDate, setTempToDate] = useState('');

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        fetchClientVotes();
    }, [currentPage, pageSize, statusFilter, searchQuery, fromDate, toDate]);

    const fetchClientVotes = async () => {
        setVotesLoading(true);
        try {
            const params = new URLSearchParams({
                clientId: clientId,
                page: currentPage,
                size: pageSize
            });

            if (statusFilter !== 'ALL') {
                params.append('status', statusFilter);
            }

            if (searchQuery.trim()) {
                params.append('search', searchQuery.trim());
            }

            if (fromDate) {
                params.append('from', fromDate);
            }

            if (toDate) {
                params.append('to', toDate);
            }

            const token = AdminAuth.getToken();
            const response = await fetch(`${API_BASE_URL}/api/admin/votes?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            const result = await response.json();

            if (response.ok && result.data) {
                const votesData = result.data;
                setVotes(votesData.content || []);
                setTotalPages(votesData.totalPages || 0);
                setTotalElements(votesData.totalElements || 0);
            } else {
                console.error('Failed to fetch client votes:', result.errorMessage);
                setVotes([]);
            }
        } catch (error) {
            console.error('Error fetching client votes:', error);
            setVotes([]);
        } finally {
            setVotesLoading(false);
        }
    };

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

    const getStatusLabel = (status) => {
        switch(status) {
            case 'NEW': return 'NEW';
            case 'CLICKED': return 'CLICKED';
            case 'VOTED': return 'SUCCESS';
            case 'FAILED': return 'CANCELLED';
            default: return status;
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

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setCurrentPage(0);
    };

    const handleSearch = () => {
        setSearchQuery(searchInput.trim());
        setCurrentPage(0);
        setSearchInput(''); // Clear the input after search
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const statusOptions = [{ value: 'ALL', label: 'All Status' },
        { value: 'NEW', label: 'New' },
        { value: 'CLICKED', label: 'Clicked' },
        { value: 'SUCCESS', label: 'Voted' },
        { value: 'CANCELLED', label: 'Cancelled' }
    ];

    const handleVoteUpdate = async (voteId, isSuccess) => {
        setUpdatingVotes(prev => new Set([...prev, voteId]));
        try {
            const token = AdminAuth.getToken();
            const response = await fetch(`${API_BASE_URL}/api/admin/update?id=${voteId}&isSuccess=${isSuccess}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            const result = await response.json();

            if (response.ok) {
                // Refresh the votes list to show updated status
                await fetchClientVotes();
            } else {
                console.error('Failed to update vote:', result.errorMessage);
                alert(`Failed to update vote: ${result.errorMessage || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating vote:', error);
            alert('Failed to update vote. Please try again.');
        } finally {
            setUpdatingVotes(prev => {
                const newSet = new Set(prev);
                newSet.delete(voteId);
                return newSet;
            });
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <button
                    onClick={onBack}
                    style={{
                        backgroundColor: 'transparent',
                        border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                        borderRadius: '8px',
                        color: colors.textSecondary,
                        padding: '10px 16px',
                        fontSize: '15px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        fontWeight: '400',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        letterSpacing: '-0.2px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
                        e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
                    }}
                >
                    ← Back to Clients
                </button>
                <div>
                    <h2 style={{
                        fontSize: '28px',
                        fontWeight: '600',
                        color: colors.textPrimary,
                        margin: '0 0 6px 0',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        letterSpacing: '-0.6px'
                    }}>
                        Ovozlar statistikasi - {clientName}
                    </h2>
                    <p style={{
                        fontSize: '15px',
                        color: colors.textSecondary,
                        margin: 0,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        fontWeight: '400'
                    }}>
                        {totalElements} total votes
                    </p>
                </div>
            </div>

            {/* Controls Bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
                gap: '16px',
                flexWrap: 'wrap'
            }}>
                {/* Search Section */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px'
                }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search phone numbers..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            style={{
                                width: '250px',
                                padding: '10px 14px 10px 38px',
                                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                                borderRadius: '8px',
                                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                                color: colors.textPrimary,
                                fontSize: '14px',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                outline: 'none',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxSizing: 'border-box'
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
                            left: '14px',
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
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            letterSpacing: '-0.2px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#0056CC';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#007AFF';
                        }}
                    >
                        Search
                    </button>
                </div>

                {/* Date Filters */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            fontSize: '14px',
                            color: colors.textSecondary,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            fontWeight: '400'
                        }}>
                            From:
                        </span>
                        <input
                            type="datetime-local"
                            value={tempFromDate || fromDate}
                            onChange={(e) => {
                                setTempFromDate(e.target.value);
                            }}
                            onBlur={(e) => {
                                setFromDate(e.target.value);
                                setCurrentPage(0);
                                setTempFromDate('');
                            }}
                            style={{
                                padding: '8px 12px',
                                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                                borderRadius: '8px',
                                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                                color: colors.textPrimary,
                                fontSize: '14px',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                outline: 'none',
                                cursor: 'pointer',
                                minWidth: '160px'
                            }}
                        />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            fontSize: '14px',
                            color: colors.textSecondary,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            fontWeight: '400'
                        }}>
                            To:
                        </span>
                        <input
                            type="datetime-local"
                            value={tempToDate || toDate}
                            onChange={(e) => {
                                setTempToDate(e.target.value);
                            }}
                            onBlur={(e) => {
                                setToDate(e.target.value);
                                setCurrentPage(0);
                                setTempToDate('');
                            }}
                            style={{
                                padding: '8px 12px',
                                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                                borderRadius: '8px',
                                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                                color: colors.textPrimary,
                                fontSize: '14px',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                outline: 'none',
                                cursor: 'pointer',
                                minWidth: '160px'
                            }}
                        />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            fontSize: '14px',
                            color: colors.textSecondary,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            fontWeight: '400'
                        }}>
                            Status:
                        </span>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(0);
                            }}
                            style={{
                                padding: '8px 12px',
                                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                                borderRadius: '8px',
                                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                                color: colors.textPrimary,
                                fontSize: '14px',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                cursor: 'pointer',
                                outline: 'none',
                                minWidth: '120px'
                            }}
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {(fromDate || toDate || statusFilter !== 'ALL' || searchQuery) && (
                        <button
                            onClick={() => {
                                setFromDate('');
                                setToDate('');
                                setStatusFilter('ALL');
                                setSearchQuery('');
                                setSearchInput('');
                                setCurrentPage(0);
                            }}
                            style={{
                                backgroundColor: 'transparent',
                                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                                borderRadius: '8px',
                                color: colors.textSecondary,
                                padding: '8px 12px',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                letterSpacing: '-0.1px',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
                                e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
                            }}
                        >
                            Clear Filters
                        </button>
                    )}

                    <button
                        onClick={fetchClientVotes}
                        style={{
                            backgroundColor: 'transparent',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                            borderRadius: '8px',
                            color: colors.textSecondary,
                            padding: '10px 16px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            opacity: votesLoading ? 0.6 : 1,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            letterSpacing: '-0.2px'
                        }}
                        disabled={votesLoading}
                        onMouseEnter={(e) => {
                            if (!votesLoading) {
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
                </div>
            </div>

            {/* Content */}
            {votesLoading ? (
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
            ) : votes.length === 0 ? (
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
                        No votes found for the selected filters
                    </div>
                </div>
            ) : isMobile ? (
                // Mobile Card View
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {votes.map((vote) => (
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
                                    <span>{getStatusLabel(vote.status)}</span>
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
                                fontFamily: 'monospace',
                                marginBottom: '12px'
                            }}>
                                {formatDate(vote.createdAt)}
                            </div>
                            
                            {/* Action Buttons - Only show if status is not SUCCESS or CANCELLED */}
                            {vote.status !== 'SUCCESS' && vote.status !== 'CANCELLED' && (
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginTop: '12px'
                                }}>
                                    <button
                                        onClick={() => handleVoteUpdate(vote.id, true)}
                                        disabled={updatingVotes.has(vote.id)}
                                        style={{
                                            backgroundColor: '#34C759',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: 'white',
                                            padding: '6px 12px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            cursor: updatingVotes.has(vote.id) ? 'not-allowed' : 'pointer',
                                            opacity: updatingVotes.has(vote.id) ? 0.6 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            flex: 1,
                                            justifyContent: 'center',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!updatingVotes.has(vote.id)) {
                                                e.currentTarget.style.backgroundColor = '#2AAA4A';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#34C759';
                                        }}
                                    >
                                        ✓ Accept
                                    </button>
                                    <button
                                        onClick={() => handleVoteUpdate(vote.id, false)}
                                        disabled={updatingVotes.has(vote.id)}
                                        style={{
                                            backgroundColor: '#FF3B30',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: 'white',
                                            padding: '6px 12px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            cursor: updatingVotes.has(vote.id) ? 'not-allowed' : 'pointer',
                                            opacity: updatingVotes.has(vote.id) ? 0.6 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            flex: 1,
                                            justifyContent: 'center',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!updatingVotes.has(vote.id)) {
                                                e.currentTarget.style.backgroundColor = '#D12B20';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#FF3B30';
                                        }}
                                    >
                                        ✕ Reject
                                    </button>
                                </div>
                            )}
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
                                borderBottom: `2px solid ${colors.borderColor}`
                            }}>
                                <th style={{
                                    padding: '18px 16px',
                                    textAlign: 'left',
                                    fontWeight: '700',
                                    fontSize: '13px',
                                    color: colors.textPrimary,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    width: '80px'
                                }}>
                                    ID
                                </th>
                                <th style={{
                                    padding: '18px 16px',
                                    textAlign: 'left',
                                    fontWeight: '700',
                                    fontSize: '13px',
                                    color: colors.textPrimary,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    minWidth: '150px'
                                }}>
                                    Phone Number
                                </th>
                                <th style={{
                                    padding: '18px 16px',
                                    textAlign: 'center',
                                    fontWeight: '700',
                                    fontSize: '13px',
                                    color: colors.textPrimary,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    width: '120px'
                                }}>
                                    Status
                                </th>
                                <th style={{
                                    padding: '18px 16px',
                                    textAlign: 'left',
                                    fontWeight: '700',
                                    fontSize: '13px',
                                    color: colors.textPrimary,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    minWidth: '180px'
                                }}>
                                    Created At
                                </th>
                                <th style={{
                                    padding: '18px 16px',
                                    textAlign: 'center',
                                    fontWeight: '700',
                                    fontSize: '13px',
                                    color: colors.textPrimary,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    minWidth: '200px'
                                }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {votes.map((vote, index) => (
                                <tr
                                    key={vote.id}
                                    style={{
                                        borderBottom: index < votes.length - 1 ? `1px solid ${colors.borderColor}` : 'none',
                                        transition: 'all 0.2s ease',
                                        height: '60px'
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
                                        fontFamily: 'monospace',
                                        fontWeight: '600'
                                    }}>
                                        #{vote.id}
                                    </td>
                                    <td style={{
                                        padding: '16px',
                                        fontSize: '15px',
                                        color: colors.textPrimary,
                                        fontWeight: '600',
                                        fontFamily: 'monospace'
                                    }}>
                                        {vote.phoneNumber}
                                    </td>
                                    <td style={{
                                        padding: '16px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            backgroundColor: getStatusColor(vote.status),
                                            color: 'white',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            padding: '6px 10px',
                                            borderRadius: '8px'
                                        }}>
                                            <span>{getStatusIcon(vote.status)}</span>
                                            <span>{getStatusLabel(vote.status)}</span>
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
                                    <td style={{
                                        padding: '16px',
                                        textAlign: 'center'
                                    }}>
                                        {vote.status !== 'SUCCESS' && vote.status !== 'CANCELLED' ? (
                                            <div style={{
                                                display: 'flex',
                                                gap: '8px',
                                                justifyContent: 'center'
                                            }}>
                                                <button
                                                    onClick={() => handleVoteUpdate(vote.id, true)}
                                                    disabled={updatingVotes.has(vote.id)}
                                                    style={{
                                                        backgroundColor: '#34C759',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        color: 'white',
                                                        padding: '6px 12px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: updatingVotes.has(vote.id) ? 'not-allowed' : 'pointer',
                                                        opacity: updatingVotes.has(vote.id) ? 0.6 : 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                                        transition: 'all 0.2s ease',
                                                        minWidth: '70px',
                                                        justifyContent: 'center'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!updatingVotes.has(vote.id)) {
                                                            e.currentTarget.style.backgroundColor = '#2AAA4A';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#34C759';
                                                    }}
                                                >
                                                    ✓ Accept
                                                </button>
                                                <button
                                                    onClick={() => handleVoteUpdate(vote.id, false)}
                                                    disabled={updatingVotes.has(vote.id)}
                                                    style={{
                                                        backgroundColor: '#FF3B30',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        color: 'white',
                                                        padding: '6px 12px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: updatingVotes.has(vote.id) ? 'not-allowed' : 'pointer',
                                                        opacity: updatingVotes.has(vote.id) ? 0.6 : 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                                        transition: 'all 0.2s ease',
                                                        minWidth: '70px',
                                                        justifyContent: 'center'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!updatingVotes.has(vote.id)) {
                                                            e.currentTarget.style.backgroundColor = '#D12B20';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#FF3B30';
                                                    }}
                                                >
                                                    ✕ Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{
                                                fontSize: '13px',
                                                color: colors.textSecondary,
                                                fontStyle: 'italic'
                                            }}>
                                                {vote.status === 'SUCCESS' ? 'Completed' : 'Cancelled'}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination and Page Size */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '20px',
                gap: '16px',
                flexWrap: 'wrap'
            }}>
                {/* Page Size Control */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span style={{
                        fontSize: '14px',
                        color: colors.textSecondary,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        fontWeight: '400'
                    }}>
                        Show:
                    </span>
                    <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                        style={{
                            padding: '6px 10px',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                            borderRadius: '6px',
                            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                            color: colors.textPrimary,
                            fontSize: '13px',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                    </select>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            style={{
                                backgroundColor: currentPage === 0 ? colors.borderColor : '#007AFF',
                                border: 'none',
                                borderRadius: '6px',
                                color: currentPage === 0 ? colors.textSecondary : 'white',
                                padding: '8px 12px',
                                fontSize: '14px',
                                cursor: currentPage === 0 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            ← Previous
                        </button>

                        <span style={{
                            fontSize: '14px',
                            color: colors.textPrimary,
                            padding: '8px 16px'
                        }}>
                            Page {currentPage + 1} of {totalPages}
                        </span>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1}
                            style={{
                                backgroundColor: currentPage >= totalPages - 1 ? colors.borderColor : '#007AFF',
                                border: 'none',
                                borderRadius: '6px',
                                color: currentPage >= totalPages - 1 ? colors.textSecondary : 'white',
                                padding: '8px 12px',
                                fontSize: '14px',
                                cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientVotesTab;