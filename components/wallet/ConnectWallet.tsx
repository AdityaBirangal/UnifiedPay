'use client';

import { useMemo } from 'react';
import { ConnectButton, useActiveAccount, useActiveWalletChain } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { createWallet, inAppWallet } from 'thirdweb/wallets';
import { SUPPORTED_CHAINS, TOKEN_SYMBOL } from '@/lib/constants';
import { shortenAddress } from '@/lib/wallet';
import { ARC_TESTNET } from '@/lib/chains';
import { useUnifiedBalance } from '@/hooks/useUnifiedBalance';

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
              <div className="connect-wallet-icon-circle"></div>
            </div>
            <div className="connect-wallet-info">
              <div className="connect-wallet-address">
                {shortenAddress(account.address)}
              </div>
              {unifiedBalance && (
                <div className="connect-wallet-usdc-balance">
                  {loadingBalance ? (
                    <span className="text-xs text-gray-500">Loading...</span>
                  ) : (
                    <>
                      <span className="font-semibold">
                        {parseFloat(unifiedBalance.total).toFixed(2)} {TOKEN_SYMBOL}
                      </span>
                      {unifiedBalance.byChain.length > 1 && (
                        <span className="text-xs text-gray-500 ml-1">
                          (across {unifiedBalance.byChain.length} chains)
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
              {chain?.id !== SUPPORTED_CHAINS.ARC_TESTNET && (
                <div className="connect-wallet-chain-warning text-xs text-yellow-600">
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
