import { ethers } from 'ethers';
import { USDC_ADDRESSES, TOKEN_DECIMALS, PRIMARY_CHAIN_ID, ARC_CHAIN_ID } from './constants';

// ERC-20 ABI (minimal - just what we need)
export const ERC20_ABI = [
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
] as const;

// Get USDC token address for a specific chain
export const getUSDCAddress = (chainId: number = PRIMARY_CHAIN_ID): string => {
  const address = USDC_ADDRESSES[chainId];
  if (!address) {
    throw new Error(`USDC address not configured for chain ID ${chainId}. Please set NEXT_PUBLIC_USDC_ADDRESS_ARC in environment variables.`);
  }
  return address;
};

// Legacy function for backwards compatibility (returns USDC on Arc)
export const getTokenAddress = (): string => {
  return getUSDCAddress(ARC_CHAIN_ID);
};

// Get RPC URL for a specific chain
export const getRpcUrl = (chainId?: number): string => {
  const targetChainId = chainId || PRIMARY_CHAIN_ID;
  
  if (targetChainId === ARC_CHAIN_ID) {
    const url = process.env.NEXT_PUBLIC_ARC_RPC_URL;
    if (!url) {
      throw new Error('NEXT_PUBLIC_ARC_RPC_URL not set in environment variables');
    }
    return url;
  }
  
  if (targetChainId === 1) {
    // Ethereum Mainnet
    const url = process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL;
    if (!url) {
      throw new Error('NEXT_PUBLIC_ETHEREUM_RPC_URL not set in environment variables');
    }
    return url;
  }
  
  // Add other chains as needed
  throw new Error(`RPC URL not configured for chain ID ${targetChainId}`);
};

// Provider cache by chain ID
const providerCache: Map<number, ethers.JsonRpcProvider> = new Map();

// Create a provider for reading blockchain data (supports multi-chain)
export const getProvider = (chainId?: number): ethers.JsonRpcProvider => {
  const targetChainId = chainId || PRIMARY_CHAIN_ID;
  
  if (providerCache.has(targetChainId)) {
    return providerCache.get(targetChainId)!;
  }
  
  const provider = new ethers.JsonRpcProvider(getRpcUrl(targetChainId));
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
