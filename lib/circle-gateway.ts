/**
 * Circle Gateway API Client
 * 
 * Circle Gateway provides unified USDC balance across multiple chains.
 * This is a read-only integration for fetching unified balances.
 * 
 * Documentation: https://developers.circle.com/gateway
 */

export interface UnifiedBalance {
  total: string; // Total USDC balance across all chains (human-readable)
  byChain: Array<{
    chainId: number;
    chainName: string;
    balance: string; // Balance in human-readable format
    balanceRaw: string; // Balance in smallest unit (6 decimals for USDC)
  }>;
}

export interface CircleGatewayConfig {
  apiKey: string;
  baseUrl?: string;
}

/**
 * Get unified USDC balance across all supported chains via Circle Gateway
 * 
 * @param walletAddress - Ethereum wallet address (0x format)
 * @param config - Circle Gateway configuration
 * @returns Unified balance information
 */
export async function getUnifiedUSDCBalance(
  walletAddress: string,
  config: CircleGatewayConfig
): Promise<UnifiedBalance> {
  const baseUrl = config.baseUrl || 'https://api.circle.com/v1';
  const apiKey = config.apiKey;

  if (!apiKey) {
    throw new Error('Circle Gateway API key is required');
  }

  try {
    // Circle Gateway API endpoint for unified balance
    // Note: This is a placeholder structure - actual API endpoint may differ
    // Check Circle Gateway documentation for exact endpoint
    // Common patterns: /v1/wallets/{address}/balances or /v1/balances?address={address}
    const response = await fetch(`${baseUrl}/gateway/balances?address=${walletAddress}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Circle Gateway API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Transform Circle Gateway response to our UnifiedBalance format
    // Adjust this based on actual API response structure
    return transformCircleGatewayResponse(data, walletAddress);
  } catch (error) {
    console.error('Error fetching unified USDC balance from Circle Gateway:', error);
    
    // Fallback: If Circle Gateway fails, return empty balance
    // In production, you might want to fall back to direct chain queries
    return {
      total: '0',
      byChain: [],
    };
  }
}

/**
 * Transform Circle Gateway API response to UnifiedBalance format
 * 
 * Adjust this function based on actual Circle Gateway API response structure
 */
function transformCircleGatewayResponse(
  data: any,
  walletAddress: string
): UnifiedBalance {
  // Placeholder transformation - adjust based on actual API response
  // Example structure (adjust as needed):
  
  const byChain: UnifiedBalance['byChain'] = [];
  let total = BigInt(0);

  // If Circle Gateway returns balances by chain
  if (data.balances && Array.isArray(data.balances)) {
    for (const balance of data.balances) {
      const balanceRaw = BigInt(balance.amount || '0');
      total += balanceRaw;
      
      byChain.push({
        chainId: balance.chainId || 0,
        chainName: balance.chainName || 'Unknown',
        balance: formatUSDC(balanceRaw),
        balanceRaw: balanceRaw.toString(),
      });
    }
  }

  return {
    total: formatUSDC(total),
    byChain,
  };
}

/**
 * Format USDC amount from smallest unit (6 decimals) to human-readable
 */
function formatUSDC(amount: bigint): string {
  const decimals = 6; // USDC uses 6 decimals
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fractional = amount % divisor;
  
  if (fractional === BigInt(0)) {
    return whole.toString();
  }
  
  const fractionalStr = fractional.toString().padStart(decimals, '0');
  const trimmed = fractionalStr.replace(/0+$/, '');
  
  return `${whole}.${trimmed}`;
}

/**
 * Get Circle Gateway configuration from environment variables
 */
export function getCircleGatewayConfig(): CircleGatewayConfig | null {
  const apiKey = process.env.CIRCLE_GATEWAY_API_KEY;
  
  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    baseUrl: process.env.CIRCLE_GATEWAY_BASE_URL || 'https://api.circle.com/v1',
  };
}

/**
 * Fallback: Get USDC balance directly from chains if Circle Gateway is unavailable
 * This can be used as a backup when Circle Gateway API is down or not configured
 * Only queries chains that have RPC URLs configured
 */
export async function getDirectChainBalances(
  walletAddress: string,
  chainIds: number[]
): Promise<UnifiedBalance> {
  const { getTokenContract, formatTokenAmount, hasRpcUrl } = await import('./blockchain');
  const { TOKEN_DECIMALS } = await import('./constants');
  
  const byChain: UnifiedBalance['byChain'] = [];
  let total = BigInt(0);

  for (const chainId of chainIds) {
    // Skip chains that don't have RPC URLs configured
    if (!hasRpcUrl(chainId)) {
      console.log(`Skipping chain ${chainId} - RPC URL not configured`);
      continue;
    }

    try {
      const contract = getTokenContract(chainId);
      const balance = await contract.balanceOf(walletAddress);
      const balanceRaw = balance.toString();
      const balanceFormatted = formatTokenAmount(balance, TOKEN_DECIMALS);
      
      total += balance;
      
      byChain.push({
        chainId,
        chainName: getChainName(chainId),
        balance: balanceFormatted,
        balanceRaw,
      });
    } catch (error) {
      console.error(`Error fetching balance for chain ${chainId}:`, error);
      // Continue with other chains
    }
  }

  return {
    total: formatTokenAmount(total, TOKEN_DECIMALS),
    byChain,
  };
}

/**
 * Get chain name from chain ID
 */
function getChainName(chainId: number): string {
  const chainNames: Record<number, string> = {
    5042002: 'Arc Testnet',
    11155111: 'Ethereum Sepolia',
    80002: 'Polygon Amoy',
    43113: 'Avalanche Fuji',
    84532: 'Base Sepolia',
  };
  
  return chainNames[chainId] || `Chain ${chainId}`;
}
