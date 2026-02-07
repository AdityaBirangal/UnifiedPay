import { defineChain } from 'thirdweb/chains';

/**
 * Arc Testnet Configuration
 * Arc is an EVM-compatible chain optimized for USDC
 */
export const ARC_TESTNET = defineChain({
  id: parseInt(process.env.NEXT_PUBLIC_ARC_CHAIN_ID || '5042002', 10),
  name: 'Arc Testnet',
  rpc: process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorers: [
    {
      name: 'Arcscan',
      url: process.env.NEXT_PUBLIC_ARCSCAN_URL || 'https://testnet.arcscan.app',
    },
  ],
});

/**
 * Ethereum Mainnet (for backwards compatibility and multi-chain support)
 */
export const ETHEREUM_MAINNET = defineChain({
  id: 1,
  name: 'Ethereum',
  rpc: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorers: [
    {
      name: 'Etherscan',
      url: 'https://etherscan.io',
    },
  ],
});

/**
 * Polygon Mainnet (for multi-chain support)
 */
export const POLYGON_MAINNET = defineChain({
  id: 137,
  name: 'Polygon',
  rpc: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  blockExplorers: [
    {
      name: 'Polygonscan',
      url: 'https://polygonscan.com',
    },
  ],
});

/**
 * Avalanche Mainnet (for multi-chain support)
 */
export const AVALANCHE_MAINNET = defineChain({
  id: 43114,
  name: 'Avalanche',
  rpc: process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  blockExplorers: [
    {
      name: 'Snowtrace',
      url: 'https://snowtrace.io',
    },
  ],
});

/**
 * Get chain configuration by chain ID
 */
export function getChainById(chainId: number) {
  switch (chainId) {
    case ARC_TESTNET.id:
      return ARC_TESTNET;
    case ETHEREUM_MAINNET.id:
      return ETHEREUM_MAINNET;
    case POLYGON_MAINNET.id:
      return POLYGON_MAINNET;
    case AVALANCHE_MAINNET.id:
      return AVALANCHE_MAINNET;
    default:
      return ARC_TESTNET; // Default to Arc
  }
}

/**
 * Get all supported chains
 */
export function getSupportedChains() {
  return [ARC_TESTNET, ETHEREUM_MAINNET, POLYGON_MAINNET, AVALANCHE_MAINNET];
}

/**
 * Check if a chain ID is supported
 */
export function isSupportedChain(chainId: number): boolean {
  return getSupportedChains().some((chain) => chain.id === chainId);
}
