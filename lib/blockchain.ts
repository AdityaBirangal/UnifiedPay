import { ethers } from 'ethers';
import { USDC_ADDRESSES, TOKEN_DECIMALS, PRIMARY_CHAIN_ID, SUPPORTED_CHAINS, CHAIN_NAMES } from './constants';

// ERC-20 ABI (minimal - just what we need)
export const ERC20_ABI = [
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
] as const;

// RPC URLs by chain. NEXT_PUBLIC_* vars must be referenced literally so Next.js can inline them.
// Arc falls back to its public RPC; other chains are optional (only used for the unified balance).
const RPC_URLS: Record<number, string | undefined> = {
  // Mainnets
  [SUPPORTED_CHAINS.ARC_MAINNET]: process.env.NEXT_PUBLIC_RPC_URL_ARC_MAINNET || 'https://rpc.mainnet.arc.io',
  [SUPPORTED_CHAINS.ETHEREUM_MAINNET]: process.env.NEXT_PUBLIC_RPC_URL_ETHEREUM_MAINNET,
  [SUPPORTED_CHAINS.POLYGON_MAINNET]: process.env.NEXT_PUBLIC_RPC_URL_POLYGON_MAINNET,
  [SUPPORTED_CHAINS.AVALANCHE_MAINNET]: process.env.NEXT_PUBLIC_RPC_URL_AVALANCHE_MAINNET,
  [SUPPORTED_CHAINS.BASE_MAINNET]: process.env.NEXT_PUBLIC_RPC_URL_BASE_MAINNET,
  // Testnets
  [SUPPORTED_CHAINS.ARC_TESTNET]: process.env.NEXT_PUBLIC_RPC_URL_ARC_TESTNET || 'https://rpc.testnet.arc.io',
  [SUPPORTED_CHAINS.ETHEREUM_SEPOLIA]: process.env.NEXT_PUBLIC_RPC_URL_ETHEREUM_SEPOLIA,
  [SUPPORTED_CHAINS.POLYGON_AMOY]: process.env.NEXT_PUBLIC_RPC_URL_POLYGON_AMOY,
  [SUPPORTED_CHAINS.AVALANCHE_FUJI]: process.env.NEXT_PUBLIC_RPC_URL_AVALANCHE_FUJI,
  [SUPPORTED_CHAINS.BASE_SEPOLIA]: process.env.NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA,
};

// Get USDC token address for a specific chain
export const getUSDCAddress = (chainId: number = PRIMARY_CHAIN_ID): string => {
  const address = USDC_ADDRESSES[chainId];
  if (!address) {
    const chainName = CHAIN_NAMES[chainId] || `Chain ID ${chainId}`;
    throw new Error(`USDC address not configured for ${chainName} (Chain ID: ${chainId}).`);
  }
  return address;
};

// Legacy function for backwards compatibility (returns USDC on Arc)
export const getTokenAddress = (): string => {
  return getUSDCAddress(PRIMARY_CHAIN_ID);
};

// Get RPC URL for a specific chain (null if not configured)
export const getRpcUrl = (chainId?: number): string | null => {
  return RPC_URLS[chainId || PRIMARY_CHAIN_ID] || null;
};

// Check if a chain has RPC URL configured
export const hasRpcUrl = (chainId: number): boolean => {
  return getRpcUrl(chainId) !== null;
};

// Provider cache by chain ID
const providerCache: Map<number, ethers.JsonRpcProvider> = new Map();

// Create a provider for reading blockchain data (supports multi-chain)
export const getProvider = (chainId?: number): ethers.JsonRpcProvider => {
  const targetChainId = chainId || PRIMARY_CHAIN_ID;
  
  if (providerCache.has(targetChainId)) {
    return providerCache.get(targetChainId)!;
  }
  
  const rpcUrl = getRpcUrl(targetChainId);
  if (!rpcUrl) {
    throw new Error(`RPC URL not configured for chain ID ${targetChainId}`);
  }
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  providerCache.set(targetChainId, provider);
  return provider;
};

// Get USDC token contract instance for a specific chain
export const getTokenContract = (
  chainId?: number,
  signerOrProvider?: ethers.Signer | ethers.Provider
) => {
  const address = getUSDCAddress(chainId || PRIMARY_CHAIN_ID);
  const provider = signerOrProvider || getProvider(chainId);
  return new ethers.Contract(address, ERC20_ABI, provider);
};

// Format token amount (smallest unit to human-readable)
// Defaults to USDC decimals (6) instead of 18
export const formatTokenAmount = (amount: bigint, decimals: number = TOKEN_DECIMALS): string => {
  return ethers.formatUnits(amount, decimals);
};

// Parse token amount (human-readable to smallest unit)
// Defaults to USDC decimals (6) instead of 18
export const parseTokenAmount = (amount: string, decimals: number = TOKEN_DECIMALS): bigint => {
  return ethers.parseUnits(amount, decimals);
};

// Verify a transfer transaction on a specific chain
export const verifyTransfer = async (
  txHash: string,
  expectedFrom: string,
  expectedTo: string,
  expectedAmount: string,
  chainId?: number
): Promise<boolean> => {
  try {
    const targetChainId = chainId || PRIMARY_CHAIN_ID;
    const provider = getProvider(targetChainId);
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt || receipt.status !== 1) {
      return false;
    }

    const contract = getTokenContract(targetChainId, provider);
    const filter = contract.filters.Transfer(expectedFrom, expectedTo);
    const logs = await contract.queryFilter(filter, receipt.blockNumber, receipt.blockNumber);

    for (const log of logs) {
      if (log.transactionHash === txHash) {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog) {
          const amount = parsedLog.args.value.toString();
          return amount === expectedAmount;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Error verifying transfer:', error);
    return false;
  }
};
