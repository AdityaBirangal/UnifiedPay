import { getNetworkForArcChainId, NETWORKS } from '@/lib/constants';

/**
 * Small pill showing which Arc network a payment page settles on
 */
export default function NetworkBadge({ chainId, className = '' }: { chainId: number; className?: string }) {
  const network = getNetworkForArcChainId(chainId);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
        network === 'testnet'
          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
          : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
      } ${className}`}
    >
      Arc {NETWORKS[network].label}
    </span>
  );
}
