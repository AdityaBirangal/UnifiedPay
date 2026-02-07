// Network configuration
export const CHAIN_ID = 1; // Ethereum Mainnet (legacy, for backwards compatibility)
export const ARC_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_ARC_CHAIN_ID || '5042002', 10); // Arc Testnet (default: 5042002, update via env)
export const PRIMARY_CHAIN_ID = ARC_CHAIN_ID; // Arc is now the primary chain

// Supported chains for multi-chain operations
export const SUPPORTED_CHAINS = {
  ARC: ARC_CHAIN_ID,
  ETHEREUM: 1,
  POLYGON: 137,
  AVALANCHE: 43114,
} as const;

// Token configuration
export const TOKEN_SYMBOL = 'USDC'; // USDC stablecoin
export const TOKEN_DECIMALS = 6; // USDC uses 6 decimals (not 18)


// App configuration
export const APP_NAME = 'UnifiedPay';
export const APP_DESCRIPTION = 'The easiest way to accept USDC payments on Arc Network'; 

// Block explorer URLs
export const ETHERSCAN_URL = 'https://etherscan.io';
export const ARCSCAN_URL = process.env.NEXT_PUBLIC_ARCSCAN_URL || 'https://testnet.arcscan.app'; // Arc testnet explorer

// USDC contract addresses by chain
export const USDC_ADDRESSES: Record<number, string> = {
  [ARC_CHAIN_ID]: process.env.NEXT_PUBLIC_USDC_ADDRESS_ARC || '', // Arc testnet USDC
  [SUPPORTED_CHAINS.ETHEREUM]: process.env.NEXT_PUBLIC_USDC_ADDRESS_ETHEREUM || '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum Mainnet USDC
  [SUPPORTED_CHAINS.POLYGON]: process.env.NEXT_PUBLIC_USDC_ADDRESS_POLYGON || '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Polygon USDC
  [SUPPORTED_CHAINS.AVALANCHE]: process.env.NEXT_PUBLIC_USDC_ADDRESS_AVALANCHE || '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // Avalanche USDC
};