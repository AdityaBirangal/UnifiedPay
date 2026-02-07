import { ethers } from 'ethers';
import { USDC_ADDRESSES, TOKEN_DECIMALS, PRIMARY_CHAIN_ID, SUPPORTED_CHAINS } from './constants';

// ERC-20 ABI (minimal - just what we need)
export const ERC20_ABI = [
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
] as const;

// Get chain name from chain ID for error messages
function getChainNameForError(chainId: number): string {
  const chainNames: Record<number, string> = {
    [SUPPORTED_CHAINS.ARC_TESTNET]: 'Arc Testnet',
    [SUPPORTED_CHAINS.ETHEREUM_SEPOLIA]: 'Ethereum Sepolia',
    [SUPPORTED_CHAINS.POLYGON_AMOY]: 'Polygon Amoy',
    [SUPPORTED_CHAINS.AVALANCHE_FUJI]: 'Avalanche Fuji',
    [SUPPORTED_CHAINS.BASE_SEPOLIA]: 'Base Sepolia',
  };
  return chainNames[chainId] || `Chain ID ${chainId}`;
}

// Get environment variable name for a chain
function getEnvVarName(chainId: number): string {
  const envVars: Record<number, string> = {
    [SUPPORTED_CHAINS.ARC_TESTNET]: 'NEXT_PUBLIC_USDC_ADDRESS_ARC_TESTNET',
    [SUPPORTED_CHAINS.ETHEREUM_SEPOLIA]: 'NEXT_PUBLIC_USDC_ADDRESS_ETHEREUM_SEPOLIA',
    [SUPPORTED_CHAINS.POLYGON_AMOY]: 'NEXT_PUBLIC_USDC_ADDRESS_POLYGON_AMOY',
    [SUPPORTED_CHAINS.AVALANCHE_FUJI]: 'NEXT_PUBLIC_USDC_ADDRESS_AVALANCHE_FUJI',
    [SUPPORTED_CHAINS.BASE_SEPOLIA]: 'NEXT_PUBLIC_USDC_ADDRESS_BASE_SEPOLIA',
  };
  return envVars[chainId] || 'NEXT_PUBLIC_USDC_ADDRESS_*';
}

// Get USDC token address for a specific chain
export const getUSDCAddress = (chainId: number = PRIMARY_CHAIN_ID): string => {
  const address = USDC_ADDRESSES[chainId];
  if (!address) {
    const chainName = getChainNameForError(chainId);
    const envVar = getEnvVarName(chainId);
    throw new Error(`USDC address not configured for ${chainName} (Chain ID: ${chainId}). Please set ${envVar} in environment variables.`);
  }
  return address;
};

// Legacy function for backwards compatibility (returns USDC on Arc)
export const getTokenAddress = (): string => {
  return getUSDCAddress(SUPPORTED_CHAINS.ARC_TESTNET);
};

// Get RPC URL for a specific chain
export const getRpcUrl = (chainId?: number): string | null => {
  const targetChainId = chainId || PRIMARY_CHAIN_ID;
  
  if (targetChainId === SUPPORTED_CHAINS.ARC_TESTNET) {
    const url = process.env.NEXT_PUBLIC_RPC_URL_ARC_TESTNET;
    if (!url) {
      throw new Error('NEXT_PUBLIC_RPC_URL_ARC_TESTNET not set in environment variables');
    }
    return url;
  }
  
  if (targetChainId === 11155111) {
    // Ethereum Sepolia
    const url = process.env.NEXT_PUBLIC_RPC_URL_ETHEREUM_SEPOLIA;
    return url || null; // Return null if not configured (optional)
  }
  
  if (targetChainId === 80002) {
    // Polygon Amoy
    const url = process.env.NEXT_PUBLIC_RPC_URL_POLYGON_AMOY;
    return url || null; // Return null if not configured (optional)
  }
  
  if (targetChainId === 43113) {
    // Avalanche Fuji
    const url = process.env.NEXT_PUBLIC_RPC_URL_AVALANCHE_FUJI;
    return url || null; // Return null if not configured (optional)
  }
  
  if (targetChainId === 84532) {
    // Base Sepolia
    const url = process.env.NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA;
    return url || null; // Return null if not configured (optional)
  }
  
  // Chain not supported or RPC not configured
  return null;
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
