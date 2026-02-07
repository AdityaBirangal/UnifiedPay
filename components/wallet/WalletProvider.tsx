'use client';

import { useWalletAuth } from '@/hooks/useWalletAuth';
import { createContext, useContext, ReactNode } from 'react';

interface WalletContextType {
  user: {
    walletAddress: string;
    createdAt: string;
    paymentPages?: Array<{
      id: string;
      title: string;
      description: string | null;
      createdAt: string;
    }>;
  } | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  walletAddress: string | null;
  refetch: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const walletAuth = useWalletAuth();

  return (
    <WalletContext.Provider value={walletAuth}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
