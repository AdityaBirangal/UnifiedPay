'use client';

import { useActiveAccount } from 'thirdweb/react';
import { useEffect, useState, useCallback } from 'react';
import { normalizeAddress } from '@/lib/wallet';

interface User {
  walletAddress: string;
  createdAt: string;
  paymentPages?: Array<{
    id: string;
    title: string;
    description: string | null;
    createdAt: string;
  }>;
}

export function useWalletAuth() {
  const account = useActiveAccount();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data (with payment pages) - memoized to prevent infinite loops
  const fetchUser = useCallback(async () => {
    if (!account?.address) {
      setUser(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const normalizedAddress = normalizeAddress(account.address);
      
      // First, ensure user exists (POST)
      const authResponse = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: normalizedAddress,
        }),
      });

      if (!authResponse.ok) {
        throw new Error('Failed to authenticate wallet');
      }

      // Then fetch full user data with payment pages (GET)
      const userResponse = await fetch(`/api/auth/wallet?address=${normalizedAddress}`);

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();
      setUser(userData.user);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  }, [account?.address]);

  // Register/authenticate user when wallet is connected
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    isConnected: !!account?.address,
    walletAddress: account?.address ? normalizeAddress(account.address) : null,
    refetch: fetchUser,
  };
}
