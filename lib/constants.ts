// Network configuration
export const CHAIN_ID = 1; // Ethereum Mainnet (legacy, for backwards compatibility)

// Supported chains for multi-chain operations (mainnets + testnets)
export const SUPPORTED_CHAINS = {
  // Mainnets
  ARC_MAINNET: 5042,
  ETHEREUM_MAINNET: 1,
  POLYGON_MAINNET: 137,
  AVALANCHE_MAINNET: 43114,
  BASE_MAINNET: 8453,
  // Testnets
  ARC_TESTNET: 5042002,
  ETHEREUM_SEPOLIA: 11155111,
  POLYGON_AMOY: 80002,
  AVALANCHE_FUJI: 43113,
  BASE_SEPOLIA: 84532,
} as const;

// Arc network selection (switchable in the UI, mainnet by default)
export type ArcNetwork = 'mainnet' | 'testnet';
export const DEFAULT_NETWORK: ArcNetwork = 'mainnet';

export interface NetworkConfig {
  id: ArcNetwork;
  label: string;
  arcChainId: number; // Settlement chain for payments
  arcChainName: string;
  ensChainId: number; // Chain used for ENS lookups
  balanceChainIds: number[]; // Chains included in the unified USDC balance
  gatewayApiUrl: string; // Circle Gateway API base URL
}

export const NETWORKS: Record<ArcNetwork, NetworkConfig> = {
  mainnet: {
    id: 'mainnet',
    label: 'Mainnet',
    arcChainId: SUPPORTED_CHAINS.ARC_MAINNET,
    arcChainName: 'Arc Mainnet',
    ensChainId: SUPPORTED_CHAINS.ETHEREUM_MAINNET,
    balanceChainIds: [
      SUPPORTED_CHAINS.ARC_MAINNET,
      SUPPORTED_CHAINS.ETHEREUM_MAINNET,
      SUPPORTED_CHAINS.POLYGON_MAINNET,
      SUPPORTED_CHAINS.AVALANCHE_MAINNET,
      SUPPORTED_CHAINS.BASE_MAINNET,
    ],
    gatewayApiUrl: 'https://gateway-api.circle.com/v1',
  },
  testnet: {
    id: 'testnet',
    label: 'Testnet',
    arcChainId: SUPPORTED_CHAINS.ARC_TESTNET,
    arcChainName: 'Arc Testnet',
    ensChainId: SUPPORTED_CHAINS.ETHEREUM_SEPOLIA,
    balanceChainIds: [
      SUPPORTED_CHAINS.ARC_TESTNET,
      SUPPORTED_CHAINS.ETHEREUM_SEPOLIA,
      SUPPORTED_CHAINS.POLYGON_AMOY,
      SUPPORTED_CHAINS.AVALANCHE_FUJI,
      SUPPORTED_CHAINS.BASE_SEPOLIA,
    ],
    gatewayApiUrl: 'https://gateway-api-testnet.circle.com/v1',
  },
};

export const ARC_CHAIN_IDS: number[] = [SUPPORTED_CHAINS.ARC_MAINNET, SUPPORTED_CHAINS.ARC_TESTNET];

export function isArcNetwork(value: unknown): value is ArcNetwork {
  return value === 'mainnet' || value === 'testnet';
}

export function isArcChainId(chainId: unknown): chainId is number {
  return typeof chainId === 'number' && ARC_CHAIN_IDS.includes(chainId);
}

// Parse a chainId from a request (query string or body); returns null if not an Arc chain
export function parseArcChainId(value: unknown): number | null {
  const chainId = typeof value === 'string' ? parseInt(value, 10) : value;
  return isArcChainId(chainId) ? chainId : null;
}

export function getNetworkForArcChainId(chainId: number): ArcNetwork {
  return chainId === SUPPORTED_CHAINS.ARC_TESTNET ? 'testnet' : 'mainnet';
}

// Primary chain (Arc is the default settlement chain)
export const PRIMARY_CHAIN_ID = NETWORKS[DEFAULT_NETWORK].arcChainId;

// Legacy export for backwards compatibility
export const ARC_CHAIN_ID = PRIMARY_CHAIN_ID;

// Token configuration
export const TOKEN_SYMBOL = 'USDC'; // USDC stablecoin
export const TOKEN_DECIMALS = 6; // USDC ERC-20 interface uses 6 decimals (native gas USDC on Arc uses 18)


// Display a USDC amount: 2 decimals normally, but keep small amounts (e.g. 0.001) visible
export function formatUsdcDisplay(amount: string | number): string {
  const value = typeof amount === 'number' ? amount : parseFloat(amount);
  if (!isFinite(value) || value === 0) return '0.00';
  if (Math.abs(value) >= 0.01) return value.toFixed(2);
  return parseFloat(value.toFixed(6)).toString();
}

// App configuration
export const APP_NAME = 'UnifiedPay';
export const APP_DESCRIPTION = 'The easiest way to accept USDC payments on Arc Network';

// Block explorer URLs
// Source: https://docs.arc.io/arc/references/connect-to-arc
export const EXPLORER_URLS: Record<number, string> = {
  [SUPPORTED_CHAINS.ARC_MAINNET]: 'https://explorer.arc.io',
  [SUPPORTED_CHAINS.ARC_TESTNET]: 'https://explorer.testnet.arc.io',
  [SUPPORTED_CHAINS.ETHEREUM_MAINNET]: 'https://etherscan.io',
  [SUPPORTED_CHAINS.ETHEREUM_SEPOLIA]: 'https://sepolia.etherscan.io',
};

// Explorer link for a transaction (defaults to the primary Arc chain)
export function getExplorerTxUrl(txHash: string, chainId: number = PRIMARY_CHAIN_ID): string {
  return `${EXPLORER_URLS[chainId] || EXPLORER_URLS[PRIMARY_CHAIN_ID]}/tx/${txHash}`;
}

// Human-readable chain names
export const CHAIN_NAMES: Record<number, string> = {
  [SUPPORTED_CHAINS.ARC_MAINNET]: 'Arc Mainnet',
  [SUPPORTED_CHAINS.ETHEREUM_MAINNET]: 'Ethereum',
  [SUPPORTED_CHAINS.POLYGON_MAINNET]: 'Polygon',
  [SUPPORTED_CHAINS.AVALANCHE_MAINNET]: 'Avalanche',
  [SUPPORTED_CHAINS.BASE_MAINNET]: 'Base',
  [SUPPORTED_CHAINS.ARC_TESTNET]: 'Arc Testnet',
  [SUPPORTED_CHAINS.ETHEREUM_SEPOLIA]: 'Ethereum Sepolia',
  [SUPPORTED_CHAINS.POLYGON_AMOY]: 'Polygon Amoy',
  [SUPPORTED_CHAINS.AVALANCHE_FUJI]: 'Avalanche Fuji',
  [SUPPORTED_CHAINS.BASE_SEPOLIA]: 'Base Sepolia',
};

// USDC contract addresses by chain
// Source: https://developers.circle.com/stablecoins/usdc-contract-addresses
// Arc: https://docs.arc.io/arc/references/contract-addresses (same address on mainnet and testnet)
export const USDC_ADDRESSES: Record<number, string> = {
  // Mainnets
  [SUPPORTED_CHAINS.ARC_MAINNET]: '0x3600000000000000000000000000000000000000',
  [SUPPORTED_CHAINS.ETHEREUM_MAINNET]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  [SUPPORTED_CHAINS.POLYGON_MAINNET]: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  [SUPPORTED_CHAINS.AVALANCHE_MAINNET]: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
  [SUPPORTED_CHAINS.BASE_MAINNET]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  // Testnets
  [SUPPORTED_CHAINS.ARC_TESTNET]: '0x3600000000000000000000000000000000000000',
  [SUPPORTED_CHAINS.ETHEREUM_SEPOLIA]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  [SUPPORTED_CHAINS.POLYGON_AMOY]: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
  [SUPPORTED_CHAINS.AVALANCHE_FUJI]: '0x5425890298aed601595a70AB815c96711a31Bc65',
  [SUPPORTED_CHAINS.BASE_SEPOLIA]: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
};
