// Network configuration
export const CHAIN_ID = 1; // Ethereum Mainnet (legacy, for backwards compatibility)

// Supported chains for multi-chain operations (Testnets only)
export const SUPPORTED_CHAINS = {
  ARC_TESTNET: 5042002,
  ETHEREUM_SEPOLIA: 11155111,
  POLYGON_AMOY: 80002,
  AVALANCHE_FUJI: 43113,
  BASE_SEPOLIA: 84532,
} as const;

// Primary chain (Arc is the default settlement chain)
export const PRIMARY_CHAIN_ID = SUPPORTED_CHAINS.ARC_TESTNET;

// Legacy export for backwards compatibility
export const ARC_CHAIN_ID = SUPPORTED_CHAINS.ARC_TESTNET;

// Token configuration
export const TOKEN_SYMBOL = 'USDC'; // USDC stablecoin
export const TOKEN_DECIMALS = 6; // USDC uses 6 decimals (not 18)


// App configuration
export const APP_NAME = 'UnifiedPay';
export const APP_DESCRIPTION = 'The easiest way to accept USDC payments on Arc Network'; 

// Block explorer URLs (Testnets)
export const ETHERSCAN_URL = 'https://sepolia.etherscan.io'; // Ethereum Sepolia
export const ARCSCAN_URL = process.env.NEXT_PUBLIC_ARCSCAN_URL || 'https://testnet.arcscan.app'; // Arc testnet explorer

// USDC contract addresses by chain (Testnets)
// Source: https://developers.circle.com/stablecoins/usdc-contract-addresses
export const USDC_ADDRESSES: Record<number, string> = {
  [SUPPORTED_CHAINS.ARC_TESTNET]: process.env.NEXT_PUBLIC_USDC_ADDRESS_ARC_TESTNET || '', // Arc testnet USDC (get from Arc documentation)
  [SUPPORTED_CHAINS.ETHEREUM_SEPOLIA]: process.env.NEXT_PUBLIC_USDC_ADDRESS_ETHEREUM_SEPOLIA || '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Ethereum Sepolia USDC
  [SUPPORTED_CHAINS.POLYGON_AMOY]: process.env.NEXT_PUBLIC_USDC_ADDRESS_POLYGON_AMOY || '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', // Polygon Amoy USDC
  [SUPPORTED_CHAINS.AVALANCHE_FUJI]: process.env.NEXT_PUBLIC_USDC_ADDRESS_AVALANCHE_FUJI || '', // Avalanche Fuji USDC (not available in Circle docs)
  [SUPPORTED_CHAINS.BASE_SEPOLIA]: process.env.NEXT_PUBLIC_USDC_ADDRESS_BASE_SEPOLIA || '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia USDC
};