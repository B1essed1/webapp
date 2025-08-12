import { useState, useCallback } from 'react';
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
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  /**
   * Fetches user balance from API
   */
  const fetchBalance = useCallback(async () => {
    if (!user) return;

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
      } else {
        console.error('Failed to fetch balance:', result.errorMessage);
        setBalance(0);
      }
    } catch (error) {
      console.error('💥 Balance fetch error:', error);
      setBalance(0);
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

  return {
    // State
    balance,
    balanceLoading,
    results,
    resultsLoading,
    
    // Actions
    fetchBalance,
    fetchResults,
    submitPhoneVerification,
    updateVoteStatus,
  };
};