import { defineChain } from 'thirdweb/chains';

/**
 * Arc Testnet Configuration
 * Arc is an EVM-compatible chain optimized for USDC
 */
import { SUPPORTED_CHAINS } from './constants';

export const ARC_TESTNET = defineChain({
  id: SUPPORTED_CHAINS.ARC_TESTNET,
  name: 'Arc Testnet',
  rpc: process.env.NEXT_PUBLIC_RPC_URL_ARC_TESTNET || 'https://rpc.testnet.arc.network',
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
 * Ethereum Sepolia Testnet
 */
export const ETHEREUM_SEPOLIA = defineChain({
  id: 11155111,
  name: 'Ethereum Sepolia',
  rpc: process.env.NEXT_PUBLIC_RPC_URL_ETHEREUM_SEPOLIA || 'https://eth-sepolia.g.alchemy.com/v2/demo',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorers: [
    {
      name: 'Etherscan',
      url: 'https://sepolia.etherscan.io',
    },
  ],
});

/**
 * Polygon Amoy Testnet
 */
export const POLYGON_AMOY = defineChain({
  id: 80002,
  name: 'Polygon Amoy',
  rpc: process.env.NEXT_PUBLIC_RPC_URL_POLYGON_AMOY || 'https://polygon-amoy.g.alchemy.com/v2/demo',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  blockExplorers: [
    {
      name: 'Polygonscan',
      url: 'https://amoy.polygonscan.com',
    },
  ],
});

/**
 * Avalanche Fuji Testnet
 */
export const AVALANCHE_FUJI = defineChain({
  id: 43113,
  name: 'Avalanche Fuji',
  rpc: process.env.NEXT_PUBLIC_RPC_URL_AVALANCHE_FUJI || 'https://avax-fuji.g.alchemy.com/v2/demo',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  blockExplorers: [
    {
      name: 'Snowtrace',
      url: 'https://testnet.snowtrace.io',
    },
  ],
});

/**
 * Base Sepolia Testnet
 */
export const BASE_SEPOLIA = defineChain({
  id: 84532,
  name: 'Base Sepolia',
  rpc: process.env.NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA || 'https://base-sepolia.g.alchemy.com/v2/demo',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorers: [
    {
      name: 'Basescan',
      url: 'https://sepolia.basescan.org',
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
    case ETHEREUM_SEPOLIA.id:
      return ETHEREUM_SEPOLIA;
    case POLYGON_AMOY.id:
      return POLYGON_AMOY;
    case AVALANCHE_FUJI.id:
      return AVALANCHE_FUJI;
    case BASE_SEPOLIA.id:
      return BASE_SEPOLIA;
    default:
      return ARC_TESTNET; // Default to Arc
  }
}

/**
 * Get all supported chains
 */
export function getSupportedChains() {
  return [ARC_TESTNET, ETHEREUM_SEPOLIA, POLYGON_AMOY, AVALANCHE_FUJI, BASE_SEPOLIA];
}

/**
 * Check if a chain ID is supported
 */
export function isSupportedChain(chainId: number): boolean {
  return getSupportedChains().some((chain) => chain.id === chainId);
}
