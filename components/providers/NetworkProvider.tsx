'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ArcNetwork, DEFAULT_NETWORK, NETWORKS, NetworkConfig, isArcNetwork } from '@/lib/constants';
import { getArcChain } from '@/lib/chains';

const STORAGE_KEY = 'unifiedpay:network';

interface NetworkContextType {
  network: ArcNetwork;
  config: NetworkConfig;
  arcChain: ReturnType<typeof getArcChain>;
  setNetwork: (network: ArcNetwork) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetworkState] = useState<ArcNetwork>(DEFAULT_NETWORK);

  // Restore the saved selection (mainnet unless the user picked testnet)
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (isArcNetwork(saved)) {
        setNetworkState(saved);
      }
    } catch {
      // Storage unavailable (private mode, blocked cookies) - keep default
    }
  }, []);

  const setNetwork = (next: ArcNetwork) => {
    setNetworkState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage errors - selection still applies for this session
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        network,
        config: NETWORKS[network],
        arcChain: getArcChain(network),
        setNetwork,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
