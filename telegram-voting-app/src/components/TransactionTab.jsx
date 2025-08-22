import React, { useState, useEffect } from 'react';
import { AdminAuth } from '../utils/adminAuth';
import { convertTiyinToSum } from '../utils';

const TransactionTab = ({ colors, theme }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(20);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [currentPage, searchQuery, statusFilter, typeFilter]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                size: pageSize.toString()
            });

            if (searchQuery) {
                params.append('search', searchQuery);
            }
            
            if (statusFilter) {
                params.append('status', statusFilter);
            }
            
            if (typeFilter) {
                params.append('type', typeFilter);
            }

            const result = await AdminAuth.makeAuthenticatedRequest(`/transaction/filter?${params.toString()}`, {
                method: 'GET'
            });

            if (result.data) {
                setTransactions(result.data.content || []);
                setTotalElements(result.data.totalElements || 0);
                setTotalPages(result.data.totalPages || 0);
            } else {
                console.error('Failed to fetch transactions:', result.errorMessage);
                setTransactions([]);
                setTotalElements(0);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactions([]);
            setTotalElements(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
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

    const formatAmount = (amountInTiyin) => {
        const amountInSom = convertTiyinToSum(amountInTiyin || 0);
        return new Intl.NumberFormat('uz-UZ').format(amountInSom);
    };

    const formatCardNumber = (cardNumber) => {
        if (!cardNumber) return 'N/A';
        // Format as XXXX XXXX XXXX XXXX
        const cleaned = cardNumber.toString().replace(/\D/g, '');
        return cleaned.replace(/(.{4})/g, '$1 ').trim();
    };

    const formatPhoneNumber = (phoneNumber) => {
        if (!phoneNumber) return 'N/A';
        const cleaned = phoneNumber.toString().replace(/\D/g, '');
        
        // Format as +998 XX XXX XX XX for Uzbek numbers
        if (cleaned.startsWith('998') && cleaned.length === 12) {
            return `+998 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
        }
        // Format as +998 XX XXX XX XX for numbers starting with country code
        else if (cleaned.length === 9) {
            return `+998 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
        }
        // Generic formatting for other formats
        else if (cleaned.length >= 9) {
            return cleaned.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '+998 $1 $2 $3 $4');
        }
        
        return phoneNumber;
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 4000);
    };

    const updateTransactionState = async (transactionId, isSuccess) => {
        try {
            const response = await AdminAuth.makeAuthenticatedRequest(`/transaction/update/state?id=${transactionId}&isSuccess=${isSuccess}`, {
                method: 'PUT'
            });

            if (response.data) {
                console.log('Transaction state updated:', response.data);
                showToast(`Transaction ${isSuccess ? 'approved' : 'rejected'} successfully!`, 'success');
                fetchTransactions();
            } else {
                const errorMessage = response.errorMessage || 'Failed to update transaction state';
                console.error('Failed to update transaction state:', errorMessage);
                showToast(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Error updating transaction state:', error);
            showToast(error.message || 'Network error occurred', 'error');
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'in_process':
                return '#FF9500';
            case 'success':
                return '#34C759';
            case 'cancelled':
                return '#FF3B30';
            default:
                return '#8E8E93';
        }
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'in_process':
                return 'Jarayonda';
            case 'success':
                return 'Muvaffaqiyatli';
            case 'cancelled':
                return 'Bekor qilingan';
            default:
                return status || 'Noma\'lum';
        }
    };

    const clearFilters = () => {
        setStatusFilter('');
        setTypeFilter('');
        setSearchQuery('');
        setSearchInput('');
        setCurrentPage(0);
    };

    const handleSearch = () => {
        setCurrentPage(0);
        setSearchQuery(searchInput.trim());
        setSearchInput('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = isMobile ? 5 : 10;
        let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(0, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                marginTop: '24px',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    style={{
                        backgroundColor: 'transparent',
                        border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                        borderRadius: '6px',
                        color: currentPage === 0 ? colors.textSecondary : colors.textPrimary,
                        padding: '8px 12px',
                        fontSize: '14px',
                        cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                        opacity: currentPage === 0 ? 0.5 : 1,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                    }}
                >
                    ‹ Prev
                </button>

                {startPage > 0 && (
                    <>
                        <button
                            onClick={() => handlePageChange(0)}
                            style={{
                                backgroundColor: 'transparent',
                                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                                borderRadius: '6px',
                                color: colors.textPrimary,
                                padding: '8px 12px',
                                fontSize: '14px',
                                cursor: 'pointer',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                            }}
                        >
                            1
                        </button>
                        {startPage > 1 && <span style={{ color: colors.textSecondary }}>...</span>}
                    </>
                )}

                {pages.map(page => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        style={{
                            backgroundColor: page === currentPage ? '#007AFF' : 'transparent',
                            border: `1px solid ${page === currentPage ? '#007AFF' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)')}`,
                            borderRadius: '6px',
                            color: page === currentPage ? 'white' : colors.textPrimary,
                            padding: '8px 12px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            fontWeight: page === currentPage ? '600' : '400'
                        }}
                    >
                        {page + 1}
                    </button>
                ))}

                {endPage < totalPages - 1 && (
                    <>
                        {endPage < totalPages - 2 && <span style={{ color: colors.textSecondary }}>...</span>}
                        <button
                            onClick={() => handlePageChange(totalPages - 1)}
                            style={{
                                backgroundColor: 'transparent',
                                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                                borderRadius: '6px',
                                color: colors.textPrimary,
                                padding: '8px 12px',
                                fontSize: '14px',
                                cursor: 'pointer',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                            }}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    style={{
                        backgroundColor: 'transparent',
                        border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                        borderRadius: '6px',
                        color: currentPage === totalPages - 1 ? colors.textSecondary : colors.textPrimary,
                        padding: '8px 12px',
                        fontSize: '14px',
                        cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                        opacity: currentPage === totalPages - 1 ? 0.5 : 1,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                    }}
                >
                    Next ›
                </button>
            </div>
        );
    };

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
                    Transactions
                    <span style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: colors.textSecondary,
                        marginLeft: '12px'
                    }}>
                        {totalElements} total
                    </span>
                </h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search transactions..."
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
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(0);
                        }}
                        style={{
                            padding: '10px 12px',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                            borderRadius: '8px',
                            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                            color: colors.textPrimary,
                            fontSize: '15px',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            outline: 'none',
                            cursor: 'pointer',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='${encodeURIComponent(colors.textSecondary)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px center',
                            backgroundSize: '16px',
                            paddingRight: '40px',
                            minWidth: '140px'
                        }}
                    >
                        <option value="">All Statuses</option>
                        <option value="IN_PROCESS">Jarayonda</option>
                        <option value="SUCCESS">Muvaffaqiyatli</option>
                        <option value="CANCELLED">Bekor qilingan</option>
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value);
                            setCurrentPage(0);
                        }}
                        style={{
                            padding: '10px 12px',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                            borderRadius: '8px',
                            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                            color: colors.textPrimary,
                            fontSize: '15px',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            outline: 'none',
                            cursor: 'pointer',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='${encodeURIComponent(colors.textSecondary)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px center',
                            backgroundSize: '16px',
                            paddingRight: '40px',
                            minWidth: '120px'
                        }}
                    >
                        <option value="">All Types</option>
                        <option value="PAYNET">PAYNET</option>
                        <option value="CARD">CARD</option>
                    </select>
                    {(statusFilter || typeFilter || searchQuery) && (
                        <button
                            onClick={clearFilters}
                            style={{
                                backgroundColor: 'transparent',
                                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                                borderRadius: '8px',
                                color: colors.textSecondary,
                                padding: '10px 16px',
                                fontSize: '14px',
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
                        onClick={fetchTransactions}
                        style={{
                            backgroundColor: 'transparent',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                            borderRadius: '8px',
                            color: colors.textSecondary,
                            padding: '10px 16px',
                            fontSize: '15px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            opacity: loading ? 0.6 : 1,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            letterSpacing: '-0.2px'
                        }}
                        disabled={loading}
                        onMouseEnter={(e) => {
                            if (!loading) {
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


            {loading ? (
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
                        Loading transactions...
                    </div>
                    <style>{`
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            ) : transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 32px' }}>
                    <div style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: colors.textPrimary,
                        marginBottom: '8px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        letterSpacing: '-0.3px'
                    }}>
                        No transactions found
                    </div>
                    <div style={{
                        fontSize: '15px',
                        color: colors.textSecondary,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        fontWeight: '400'
                    }}>
                        {searchQuery ? 'No transactions match your search' : 'No transactions available'}
                    </div>
                </div>
            ) : isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {transactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            style={{
                                backgroundColor: colors.cardBackground,
                                borderRadius: '12px',
                                padding: '16px',
                                boxShadow: theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                                border: `1px solid ${colors.borderColor}`,
                                transition: 'all 0.2s ease'
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
                                    #{transaction.id}
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: getStatusColor(transaction.status),
                                    color: 'white'
                                }}>
                                    {getStatusText(transaction.status)}
                                </div>
                            </div>
                            
                            <div style={{
                                fontSize: '16px',
                                color: colors.textPrimary,
                                fontWeight: '600',
                                marginBottom: '8px',
                                fontFamily: 'monospace'
                            }}>
                                {formatAmount(transaction.amount || 0)} SO'M
                            </div>
                            
                            <div style={{
                                fontSize: '13px',
                                color: colors.textSecondary,
                                marginBottom: '4px'
                            }}>
                                Card: {formatCardNumber(transaction.card || transaction.cardNumber)}
                            </div>
                            
                            <div style={{
                                fontSize: '13px',
                                color: colors.textSecondary,
                                marginBottom: '4px'
                            }}>
                                Phone: {formatPhoneNumber(transaction.phone || transaction.phoneNumber)}
                            </div>
                            
                            <div style={{
                                fontSize: '13px',
                                color: colors.textSecondary,
                                marginBottom: '4px'
                            }}>
                                Type: <span style={{
                                    backgroundColor: transaction.type === 'PAYNET' ? '#007AFF' : '#34C759',
                                    color: 'white',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: '600'
                                }}>
                                    {transaction.type || 'N/A'}
                                </span>
                            </div>
                            
                            <div style={{
                                fontSize: '13px',
                                color: colors.textSecondary,
                                fontFamily: 'monospace',
                                marginBottom: '12px'
                            }}>
                                {formatDate(transaction.updatedAt || transaction.updatedDate || transaction.createdDate)}
                            </div>
                            
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                                alignItems: 'flex-end'
                            }}>
                                <button
                                    onClick={() => updateTransactionState(transaction.id, false)}
                                    style={{
                                        backgroundColor: '#FF3B30',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: 'white',
                                        padding: '8px 12px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                        transition: 'all 0.2s ease',
                                        letterSpacing: '-0.1px'
                                    }}
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => updateTransactionState(transaction.id, true)}
                                    style={{
                                        backgroundColor: '#34C759',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: 'white',
                                        padding: '8px 12px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                        transition: 'all 0.2s ease',
                                        letterSpacing: '-0.1px'
                                    }}
                                >
                                    Approve
                                </button>
                            </div>
                        </div>
                    ))}
                    {renderPagination()}
                </div>
            ) : (
                <div>
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
                            minWidth: '800px',
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
                                        width: '10%',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                                    }}>
                                        ID
                                    </th>
                                    <th style={{
                                        padding: '18px 16px',
                                        textAlign: 'right',
                                        fontWeight: '500',
                                        fontSize: '14px',
                                        color: colors.textSecondary,
                                        letterSpacing: '-0.1px',
                                        width: '15%',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                                    }}>
                                        Amount
                                    </th>
                                    <th style={{
                                        padding: '18px 16px',
                                        textAlign: 'left',
                                        fontWeight: '500',
                                        fontSize: '14px',
                                        color: colors.textSecondary,
                                        letterSpacing: '-0.1px',
                                        width: '20%',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                                    }}>
                                        Card Number
                                    </th>
                                    <th style={{
                                        padding: '18px 16px',
                                        textAlign: 'left',
                                        fontWeight: '500',
                                        fontSize: '14px',
                                        color: colors.textSecondary,
                                        letterSpacing: '-0.1px',
                                        width: '15%',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                                    }}>
                                        Phone
                                    </th>
                                    <th style={{
                                        padding: '18px 16px',
                                        textAlign: 'center',
                                        fontWeight: '500',
                                        fontSize: '14px',
                                        color: colors.textSecondary,
                                        letterSpacing: '-0.1px',
                                        width: '10%',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                                    }}>
                                        Type
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
                                    <th style={{
                                        padding: '18px 16px',
                                        textAlign: 'left',
                                        fontWeight: '500',
                                        fontSize: '14px',
                                        color: colors.textSecondary,
                                        letterSpacing: '-0.1px',
                                        width: '14%',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                                    }}>
                                        Date
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
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction, index) => (
                                    <tr
                                        key={transaction.id}
                                        style={{
                                            borderBottom: index < transactions.length - 1 ? `1px solid ${colors.borderColor}` : 'none',
                                            transition: 'all 0.2s ease',
                                            height: '70px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
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
                                            #{transaction.id}
                                        </td>
                                        <td style={{
                                            padding: '20px 16px',
                                            fontSize: '15px',
                                            color: colors.textPrimary,
                                            fontFamily: 'monospace',
                                            fontWeight: '600',
                                            textAlign: 'right',
                                            verticalAlign: 'middle'
                                        }}>
                                            <div style={{
                                                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                                                padding: '6px 10px',
                                                borderRadius: '8px',
                                                display: 'inline-block'
                                            }}>
                                                {formatAmount(transaction.amount || 0)} SO'M
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: '20px 16px',
                                            fontSize: '14px',
                                            color: colors.textPrimary,
                                            fontFamily: 'monospace',
                                            verticalAlign: 'middle'
                                        }}>
                                            {formatCardNumber(transaction.card || transaction.cardNumber)}
                                        </td>
                                        <td style={{
                                            padding: '20px 16px',
                                            fontSize: '14px',
                                            color: colors.textPrimary,
                                            fontFamily: 'monospace',
                                            verticalAlign: 'middle'
                                        }}>
                                            {formatPhoneNumber(transaction.phone || transaction.phoneNumber)}
                                        </td>
                                        <td style={{
                                            padding: '20px 16px',
                                            textAlign: 'center',
                                            verticalAlign: 'middle'
                                        }}>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                backgroundColor: transaction.type === 'PAYNET' ? '#007AFF' : '#34C759',
                                                color: 'white',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                textTransform: 'uppercase'
                                            }}>
                                                {transaction.type || 'N/A'}
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: '20px 16px',
                                            textAlign: 'center',
                                            verticalAlign: 'middle'
                                        }}>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                backgroundColor: getStatusColor(transaction.status),
                                                color: 'white',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                textTransform: 'uppercase'
                                            }}>
                                                {getStatusText(transaction.status)}
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
                                                {formatDate(transaction.updatedAt || transaction.updatedDate || transaction.createdDate)}
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: '20px 16px',
                                            textAlign: 'center',
                                            verticalAlign: 'middle'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '6px',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}>
                                                <button
                                                    onClick={() => updateTransactionState(transaction.id, false)}
                                                    style={{
                                                        backgroundColor: '#FF3B30',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        color: 'white',
                                                        padding: '6px 12px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                                        transition: 'all 0.2s ease',
                                                        letterSpacing: '-0.1px'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#D70015';
                                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#FF3B30';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }}
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => updateTransactionState(transaction.id, true)}
                                                    style={{
                                                        backgroundColor: '#34C759',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        color: 'white',
                                                        padding: '6px 12px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                                        transition: 'all 0.2s ease',
                                                        letterSpacing: '-0.1px'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#248A3D';
                                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#34C759';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }}
                                                >
                                                    Approve
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {renderPagination()}
                </div>
            )}

            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 1000,
                    backgroundColor: toast.type === 'success' ? '#34C759' : '#FF3B30',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    boxShadow: theme === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.15)',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    maxWidth: '320px',
                    animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <div style={{
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {toast.type === 'success' ? '✓' : '✕'}
                    </div>
                    {toast.message}
                    <style>{`
                        @keyframes slideInRight {
                            from {
                                transform: translateX(100%);
                                opacity: 0;
                            }
                            to {
                                transform: translateX(0);
                                opacity: 1;
                            }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default TransactionTab;