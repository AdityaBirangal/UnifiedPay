'use client';

import { useState } from 'react';
import { useActiveAccount, useActiveWallet } from 'thirdweb/react';
import { shortenAddress } from '@/lib/wallet';
import { useENSProfile } from '@/hooks/useENS';

/**
 * WalletInfo Component with ENS Integration
 * For ETHGlobal HackMoney - ENS Prize Category
 * 
 * Displays connected wallet with ENS name and avatar when available
 */
export default function WalletInfo() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const [copied, setCopied] = useState(false);
  
  // ENS Integration: Lookup ENS name and avatar for connected wallet
  const { ensName, avatar, loading: ensLoading } = useENSProfile(account?.address);

  if (!account || !wallet) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(account.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  // Display name: ENS name or shortened address
  const displayName = ensName || shortenAddress(account.address);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2.5 px-3.5 py-2 bg-gradient-to-r from-blue-500/10 to-blue-400/10 dark:from-blue-500/20 dark:to-blue-400/20 border border-blue-300/50 dark:border-blue-700/50 rounded-xl hover:from-blue-500/15 hover:to-blue-400/15 dark:hover:from-blue-500/30 dark:hover:to-blue-400/30 hover:border-blue-400/70 dark:hover:border-blue-600/70 transition-all duration-200 active:scale-95 group shadow-sm hover:shadow-md"
      title={ensName ? `${ensName} (${account.address})` : 'Click to copy address'}
      aria-label="Copy wallet address"
    >
      {/* ENS Avatar */}
      {avatar ? (
        <img
          src={avatar}
          alt={ensName || 'Avatar'}
          className="w-7 h-7 rounded-full border border-blue-300 dark:border-blue-700 flex-shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : ensLoading ? (
        <div className="w-7 h-7 rounded-full bg-blue-200 dark:bg-blue-800 animate-pulse flex-shrink-0" />
      ) : null}
      
      <div className="flex flex-col items-start min-w-0">
        <span className="font-semibold text-sm text-blue-900 dark:text-blue-100 leading-tight truncate max-w-[120px] flex items-center gap-1">
          {displayName}
          {ensName && (
            <svg
              className="w-3 h-3 text-green-500 dark:text-green-400 flex-shrink-0"
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
          )}
        </span>
        {wallet.id && (
          <span className="text-[11px] text-blue-700/70 dark:text-blue-300/70 capitalize leading-tight">
            {wallet.id.replace(/[._]/g, ' ')}
          </span>
        )}
      </div>
      <div className="flex-shrink-0 ml-1">
        {copied ? (
          <svg 
            className="w-4 h-4 text-green-600 dark:text-green-400 transition-all animate-in" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg 
            className="w-4 h-4 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </div>
    </button>
  );
}
