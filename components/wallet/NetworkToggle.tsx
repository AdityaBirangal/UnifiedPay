'use client';

import { useNetwork } from '@/components/providers/NetworkProvider';
import { ArcNetwork, NETWORKS } from '@/lib/constants';

const OPTIONS: ArcNetwork[] = ['mainnet', 'testnet'];

/**
 * Mainnet / Testnet switch for the Arc settlement network
 */
export default function NetworkToggle({ className = '' }: { className?: string }) {
  const { network, setNetwork } = useNetwork();

  return (
    <div
      role="radiogroup"
      aria-label="Arc network"
      className={`inline-flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-0.5 text-xs font-medium ${className}`}
    >
      {OPTIONS.map((option) => {
        const selected = network === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setNetwork(option)}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              selected
                ? option === 'testnet'
                  ? 'bg-yellow-400 text-yellow-950 shadow-sm'
                  : 'bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-300 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            {NETWORKS[option].label}
          </button>
        );
      })}
    </div>
  );
}
