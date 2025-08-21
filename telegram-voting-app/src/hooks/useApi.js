import { useState, useCallback, useRef } from 'react';
import { API_BASE_URL, VOTE_STATUS } from '../constants';
import { convertTiyinToSum } from '../utils';

/**
 * Custom hook for API operations
 * @param {Object} user - Current user data
 * @returns {Object} API functions and loading states
 */
export const useApi = (user) => {
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const balanceFetchedRef = useRef(false);
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  /**
   * Fetches user balance from API
   */
  const fetchBalance = useCallback(async (force = false) => {
    if (!user) return;
    if (!force && balanceFetchedRef.current) return;

    setBalanceLoading(true);
    const requestData = {
      userId: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      languageCode: user.language_code
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/web/balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      console.log('💰 Balance response:', result);

      if (response.ok && result.data?.balance !== undefined) {
        const balanceInSum = convertTiyinToSum(result.data.balance);
        setBalance(balanceInSum);
        balanceFetchedRef.current = true;
      } else {
        console.error('Failed to fetch balance:', result.errorMessage);
        setBalance(0);
        balanceFetchedRef.current = true;
      }
    } catch (error) {
      console.error('💥 Balance fetch error:', error);
      setBalance(0);
      balanceFetchedRef.current = true;
    } finally {
      setBalanceLoading(false);
    }
  }, [user]);

  /**
   * Fetches user voting results from API
   */
  const fetchResults = useCallback(async () => {
    if (!user) return;

    setResultsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/web/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      console.log('📊 Results response:', result);

      if (response.ok && result.data) {
        const resultsArray = Array.isArray(result.data) ? result.data : [];
        console.log('📊 Results statuses:', resultsArray.map(r => ({ id: r.id, status: r.status })));
        setResults(resultsArray);
      } else {
        console.error('Failed to fetch results:', result.errorMessage);
        setResults([]);
      }
    } catch (error) {
      console.error('💥 Results fetch error:', error);
      setResults([]);
    } finally {
      setResultsLoading(false);
    }
  }, [user]);

  /**
   * Submits phone number for verification
   * @param {string} phoneNumber - Full phone number with country code
   * @param {string} localNumber - Local phone number without country code
   * @returns {Promise<Object>} API response
   */
  const submitPhoneVerification = useCallback(async (phoneNumber, localNumber) => {
    if (!user) {
      throw new Error('User data not available');
    }

    const requestData = {
      phoneNumber: phoneNumber,
      localNumber: localNumber,
      telegramData: {
        userId: user.id,
        chatId: user.chat_id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        languageCode: user.language_code
      },
      timestamp: new Date().toISOString()
    };

    console.log('📤 Sending to backend:', requestData);

    const response = await fetch(`${API_BASE_URL}/api/web/phone-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    console.log('📥 Backend response:', result);

    if (!response.ok) {
      throw new Error(result.errorMessage || 'Phone verification failed');
    }

    return result;
  }, [user]);

  /**
   * Updates vote status for a phone number
   * @param {string} phoneNumber - Phone number to update
   * @param {string} voteStatus - New vote status
   */
  const updateVoteStatus = useCallback(async (phoneNumber, voteStatus) => {
    if (!user) {
      console.error('User data not available for vote status update');
      return;
    }

    const requestData = {
      phoneNumber: phoneNumber,
      telegramData: {
        userId: user.id,
        chatId: user.chat_id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        languageCode: user.language_code
      },
      voteStatus: voteStatus
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/web/vote-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      console.log('📥 Vote status update response:', result);

      if (!response.ok) {
        console.error('Failed to update vote status:', result.errorMessage);
      }
    } catch (error) {
      console.error('💥 Vote status update error:', error);
    }
  }, [user]);

  /**
   * Sends a transaction request
   * @param {string} cardNumber - Card number for transaction
   * @param {string} phoneNumber - Phone number for transaction
   * @param {number} amount - Amount to withdraw
   * @returns {Promise<Object>} API response
   */
  const requestTransaction = useCallback(async (cardNumber, phoneNumber, amount) => {
    if (!user) {
      throw new Error('User data not available');
    }

    // Determine transaction type based on which field is provided
    const transactionType = cardNumber ? 'CARD' : 'PAYNET';
    
    const requestData = {
      transactionType: transactionType,
      cardNumber: cardNumber,
      phoneNumber: phoneNumber,
      amount: amount,
      telegramData: {
        userId: user.id,
        chatId: user.chat_id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        languageCode: user.language_code
      }
    };

    console.log('💸 Sending transaction request:', requestData);

    const response = await fetch(`${API_BASE_URL}/api/transaction/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    console.log('💸 Transaction response:', result);

    if (!response.ok) {
      throw new Error(result.errorMessage || 'Transaction request failed');
    }

    return result;
  }, [user]);

  /**
   * Fetches user transaction history
   * @returns {Promise<void>}
   */
  const fetchTransactions = useCallback(async () => {
    if (!user) return;

    setTransactionsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/transaction/users?userId=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      console.log('💳 Transactions response:', result);

      if (response.ok && result.data) {
        // Convert amounts from tiyin to sum for display
        const transactionsWithConvertedAmounts = result.data.content.map(transaction => ({
          ...transaction,
          amount: convertTiyinToSum(transaction.amount)
        }));
        setTransactions(transactionsWithConvertedAmounts);
      } else {
        console.error('Failed to fetch transactions:', result.errorMessage);
        setTransactions([]);
      }
    } catch (error) {
      console.error('💥 Transactions fetch error:', error);
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  }, [user]);

  return {
    // State
    balance,
    balanceLoading,
    results,
    resultsLoading,
    transactions,
    transactionsLoading,
    
    // Actions
    fetchBalance,
    fetchResults,
    submitPhoneVerification,
    updateVoteStatus,
    requestTransaction,
    fetchTransactions,
  };
};