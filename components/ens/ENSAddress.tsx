'use client';

import { useState } from 'react';
import { useENSProfile } from '@/hooks/useENS';
import { shortenAddress } from '@/lib/wallet';

/**
 * ENSAddress Component
 * 
 * Displays Ethereum addresses with ENS names and avatars when available
 * For ETHGlobal HackMoney - ENS Prize Category
 * 
 * Features:
 * - Automatic ENS name resolution
 * - ENS avatar display
 * - Fallback to shortened address
 * - Copy to clipboard
 * - Tooltip with full address
 */

interface ENSAddressProps {
  address: string;
  showAvatar?: boolean;
  shorten?: boolean;
  copyable?: boolean;
  className?: string;
}

export default function ENSAddress({
  address,
  showAvatar = false,
  shorten = true,
  copyable = false,
  className = '',
}: ENSAddressProps) {
  const { ensName, avatar, loading } = useENSProfile(address);
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!copyable) return;

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  // Display name: ENS name or shortened/full address
  const displayName = ensName || (shorten ? shortenAddress(address) : address);
  
  // Show loading state briefly
  if (loading && !ensName) {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        {showAvatar && (
          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
        )}
        <span className="text-gray-400 dark:text-gray-500 animate-pulse">
          {shorten ? shortenAddress(address) : address}
        </span>
      </span>
    );
  }

  const content = (
    <span
      className={`inline-flex items-center gap-2 ${copyable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
      onClick={handleCopy}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      title={ensName ? `${ensName} (${address})` : address}
    >
      {showAvatar && (
        <span className="flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={ensName || 'Avatar'}
              className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
              onError={(e) => {
                // Fallback to default avatar on error
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {(ensName || address).charAt(ensName ? 0 : 2).toUpperCase()}
            </div>
          )}
        </span>
      )}
      
      <span className={ensName ? 'font-semibold' : 'font-mono'}>
        {displayName}
      </span>

      {ensName && (
        <svg
          className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          title="ENS Verified"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}

      {copyable && !copied && (
        <svg
          className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}

      {copyable && copied && (
        <svg
          className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </span>
  );

  return content;
}

/**
 * ENSAddressLarge - Large variant for prominent display
 * Used on payment pages, profile headers, etc.
 */
interface ENSAddressLargeProps {
  address: string;
  showAvatar?: boolean;
  className?: string;
}

export function ENSAddressLarge({
  address,
  showAvatar = true,
  className = '',
}: ENSAddressLargeProps) {
  const { ensName, avatar, loading } = useENSProfile(address);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  if (loading && !ensName) {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        {showAvatar && (
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {showAvatar && (
        <div className="relative">
          {avatar ? (
            <img
              src={avatar}
              alt={ensName || 'Avatar'}
              className="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-600"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {(ensName || address).charAt(ensName ? 0 : 2).toUpperCase()}
            </div>
          )}
          {ensName && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 dark:bg-green-400 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
      )}
      
      <div className="text-center space-y-2">
        {ensName ? (
          <>
            <div className="flex items-center gap-2 justify-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {ensName}
              </h3>
              <svg
                className="w-5 h-5 text-green-500 dark:text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                title="ENS Verified"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <button
              onClick={handleCopy}
              className="group flex items-center gap-2 mx-auto px-3 py-1.5 text-xs font-mono text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              title="Click to copy address"
            >
              <span>{shortenAddress(address)}</span>
              {!copied ? (
                <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </>
        ) : (
          <button
            onClick={handleCopy}
            className="group font-mono text-base text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
            title="Click to copy address"
          >
            <span>{shortenAddress(address)}</span>
            {!copied ? (
              <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
