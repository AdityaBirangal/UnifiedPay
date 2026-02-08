'use client';

import { useMemo } from 'react';
import { ConnectButton, useActiveAccount, useActiveWalletChain } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { createWallet, inAppWallet } from 'thirdweb/wallets';
import { SUPPORTED_CHAINS, TOKEN_SYMBOL } from '@/lib/constants';
import { shortenAddress } from '@/lib/wallet';
import { ARC_TESTNET } from '@/lib/chains';
import { useUnifiedBalance } from '@/hooks/useUnifiedBalance';
import { useENSProfile } from '@/hooks/useENS';

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

const wallets = [
  inAppWallet(),
  createWallet('io.metamask'),
  createWallet('com.coinbase.wallet'),
  createWallet('me.rainbow'),
];

export default function ConnectWallet() {
  const account = useActiveAccount();
  const chain = useActiveWalletChain();
  const { balance: unifiedBalance, loading: loadingBalance } = useUnifiedBalance();
  
  // ENS Integration: Get ENS name and avatar for connected wallet
  const { ensName, avatar, loading: ensLoading } = useENSProfile(account?.address);

  const client = useMemo(() => {
    if (!clientId) {
      return null;
    }
    return createThirdwebClient({
      clientId: clientId,
    });
  }, [clientId]);

  if (!client) {
    return (
      <div className="px-4 py-2 text-sm text-red-600">
        ThirdWeb Client ID not configured
      </div>
    );
  }

  if (!ARC_TESTNET) {
    return (
      <div className="px-4 py-2 text-sm text-red-600">
        Arc RPC URL not configured
      </div>
    );
  }

  return (
    <div className={`connect-wallet-container ${!account ? 'connect-wallet-not-connected' : 'connect-wallet-connected'}`}>
      <div className="connect-wallet-button-wrapper">
        <ConnectButton
          client={client}
          wallets={wallets}
          chain={ARC_TESTNET}
          connectModal={{ size: 'wide' }}
        />
        {account && (
          <div className="connect-wallet-custom-content">
            <div className="connect-wallet-icon">
              {/* ENS Avatar */}
              {avatar ? (
                <img
                  src={avatar}
                  alt={ensName || 'Avatar'}
                  className="w-8 h-8 rounded-full border-2 border-blue-300 dark:border-blue-600 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : ensLoading ? (
                <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800 animate-pulse"></div>
              ) : (
                <div className="connect-wallet-icon-circle"></div>
              )}
            </div>
            <div className="connect-wallet-info">
              {/* ENS Integration: Display ENS name or address */}
              <div className="connect-wallet-address">
                {ensLoading ? (
                  <span className="text-gray-400 animate-pulse">
                    {shortenAddress(account.address)}
                  </span>
                ) : ensName ? (
                  <>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {ensName}
                    </span>
                    <svg
                      className="w-3.5 h-3.5 text-green-500 dark:text-green-400 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="ENS Verified"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </>
                ) : (
                  <span className="font-mono text-gray-700 dark:text-gray-300">
                    {shortenAddress(account.address)}
                  </span>
                )}
              </div>
              {(unifiedBalance || loadingBalance) && (
                <div className="connect-wallet-usdc-balance">
                  {loadingBalance && !unifiedBalance ? (
                    <span className="text-xs text-gray-500 animate-pulse">Loading...</span>
                  ) : unifiedBalance ? (
                    <>
                      <span className="font-semibold">
                        {parseFloat(unifiedBalance.total).toFixed(2)} {TOKEN_SYMBOL}
                      </span>
                      {unifiedBalance.byChain.length > 1 && (
                        <span className="text-xs opacity-70">
                          (across {unifiedBalance.byChain.length} chains)
                        </span>
                      )}
                    </>
                  ) : null}
                </div>
              )}
              {chain?.id !== SUPPORTED_CHAINS.ARC_TESTNET && (
                <div className="connect-wallet-chain-warning text-xs text-yellow-600 dark:text-yellow-500">
                  Switch to Arc Network Testnet
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
