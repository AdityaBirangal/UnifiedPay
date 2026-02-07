'use client';

import { useState, useEffect, useMemo } from 'react';
import { ConnectButton, useActiveAccount, useActiveWalletChain } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { createWallet, inAppWallet } from 'thirdweb/wallets';
import { ARC_CHAIN_ID, TOKEN_SYMBOL, TOKEN_DECIMALS } from '@/lib/constants';
import { getTokenContract, formatTokenAmount } from '@/lib/blockchain';
import { shortenAddress } from '@/lib/wallet';
import { ARC_TESTNET } from '@/lib/chains';

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
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const client = useMemo(() => {
    if (!clientId) {
      return null;
    }
    return createThirdwebClient({
      clientId: clientId,
    });
  }, [clientId]);

  // Fetch USDC balance on Arc when account is connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (!account?.address) {
        setUsdcBalance(null);
        return;
      }

      // Only fetch balance if on Arc chain
      if (chain?.id !== ARC_CHAIN_ID) {
        setUsdcBalance(null);
        return;
      }

      try {
        setLoadingBalance(true);
        const contract = getTokenContract(ARC_CHAIN_ID);
        const balance = await contract.balanceOf(account.address);
        const formatted = formatTokenAmount(balance, TOKEN_DECIMALS);
        setUsdcBalance(formatted);
      } catch (error) {
        console.error('Error fetching USDC balance:', error);
        setUsdcBalance(null);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchBalance();
    // Refresh balance every 10 seconds
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [account?.address, chain?.id]);

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
              {usdcBalance !== null && chain?.id === ARC_CHAIN_ID && (
                <div className="connect-wallet-usdc-balance">
                  {parseFloat(usdcBalance).toFixed(2)} {TOKEN_SYMBOL}
                </div>
              )}
              {chain?.id !== ARC_CHAIN_ID && (
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
