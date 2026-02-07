'use client';

import { useState, useEffect, useRef } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { normalizeAddress } from '@/lib/wallet';

export interface UnifiedBalance {
  total: string;
  byChain: Array<{
    chainId: number;
    chainName: string;
    balance: string;
    balanceRaw: string;
  }>;
}

// Shared cache for in-flight requests to prevent duplicate API calls
const pendingRequests = new Map<string, Promise<UnifiedBalance | null>>();
const balanceCache = new Map<string, { balance: UnifiedBalance | null; timestamp: number }>();
const CACHE_TTL = 5000; // Cache for 5 seconds

async function fetchBalanceForWallet(walletAddress: string): Promise<UnifiedBalance | null> {
  const normalizedAddress = normalizeAddress(walletAddress);
  
  // Check cache first
  const cached = balanceCache.get(normalizedAddress);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.balance;
  }

  // If request is already in flight, reuse it
  if (pendingRequests.has(normalizedAddress)) {
    return pendingRequests.get(normalizedAddress)!;
  }

  // Create new request
  const requestPromise = (async () => {
    try {
      const response = await fetch(`/api/balance/unified?wallet=${normalizedAddress}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch unified balance');
      }

      const data = await response.json();
      const balance = data.balance as UnifiedBalance | null;
      
      // Update cache
      balanceCache.set(normalizedAddress, {
        balance,
        timestamp: Date.now(),
      });
      
      return balance;
    } catch (err) {
      console.error('Error fetching unified balance:', err);
      throw err;
    } finally {
      // Remove from pending requests after completion
      pendingRequests.delete(normalizedAddress);
    }
  })();

  pendingRequests.set(normalizedAddress, requestPromise);
  return requestPromise;
}

export function useUnifiedBalance() {
  const account = useActiveAccount();
  const [balance, setBalance] = useState<UnifiedBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!account?.address) {
        setBalance(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetchBalanceForWallet(account.address);
        setBalance(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch balance');
        setBalance(null);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchBalance();
    
    // Refresh balance every 10 seconds
    intervalRef.current = setInterval(fetchBalance, 10000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [account?.address]);

  return {
    balance,
    loading,
    error,
    refetch: async () => {
      if (!account?.address) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Clear cache to force fresh fetch
        const normalizedAddress = normalizeAddress(account.address);
        balanceCache.delete(normalizedAddress);
        
        const result = await fetchBalanceForWallet(account.address);
        setBalance(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch balance');
      } finally {
        setLoading(false);
      }
    },
  };
}
