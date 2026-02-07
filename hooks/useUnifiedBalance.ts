'use client';

import { useState, useEffect } from 'react';
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

export function useUnifiedBalance() {
  const account = useActiveAccount();
  const [balance, setBalance] = useState<UnifiedBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!account?.address) {
        setBalance(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const normalizedAddress = normalizeAddress(account.address);
        const response = await fetch(`/api/balance/unified?wallet=${normalizedAddress}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch unified balance');
        }

        const data = await response.json();
        setBalance(data.balance);
      } catch (err) {
        console.error('Error fetching unified balance:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch balance');
        setBalance(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
    
    // Refresh balance every 10 seconds
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
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
        const normalizedAddress = normalizeAddress(account.address);
        const response = await fetch(`/api/balance/unified?wallet=${normalizedAddress}`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch unified balance');
        }
        
        const data = await response.json();
        setBalance(data.balance);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch balance');
      } finally {
        setLoading(false);
      }
    },
  };
}
