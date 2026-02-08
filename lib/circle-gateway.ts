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
 * @param walletAddress - Wallet address (0x format for EVM chains)
 * @param config - Circle Gateway configuration
 * @returns Unified balance information
 */
export async function getUnifiedUSDCBalance(
  walletAddress: string,
  config: CircleGatewayConfig
): Promise<UnifiedBalance> {
  const baseUrl = config.baseUrl || 'https://gateway-api-testnet.circle.com/v1';
  const apiKey = config.apiKey;

  if (!apiKey) {
    throw new Error('Circle Gateway API key is required');
  }

  try {
    // Circle Gateway API endpoint: POST /v1/balances
    // Documentation: https://developers.circle.com/api-reference/gateway/all/get-token-balances
    const response = await fetch(`${baseUrl}/balances`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'USDC',
        sources: [
          {
            depositor: walletAddress,
            // Omitting domain to get balances from all domains
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Circle Gateway API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Transform Circle Gateway response to UnifiedBalance format
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
 * Circle Gateway API returns:
 * {
 *   token: "USDC",
 *   balances: [
 *     {
 *       domain: number,      // Circle domain identifier
 *       depositor: string,   // Wallet address
 *       balance: string      // Balance as string (e.g., "100.5")
 *     }
 *   ]
 * }
 */
function transformCircleGatewayResponse(
  data: any,
  walletAddress: string
): UnifiedBalance {
  const byChain: UnifiedBalance['byChain'] = [];
  let total = BigInt(0);

  // Circle Gateway returns balances array with domain, depositor, and balance
  if (data.balances && Array.isArray(data.balances)) {
    for (const balanceEntry of data.balances) {
      const domain = balanceEntry.domain;
      const balanceStr = balanceEntry.balance || '0';
      
      // Convert balance string to BigInt (balance is in human-readable format with decimals)
      // Parse the string balance and convert to smallest unit (6 decimals for USDC)
      const balanceDecimal = parseFloat(balanceStr);
      const balanceRaw = BigInt(Math.floor(balanceDecimal * 1_000_000)); // USDC has 6 decimals
      
      total += balanceRaw;
      
      // Map Circle domain to chain ID and name
      const chainInfo = getChainInfoFromDomain(domain);
      
      byChain.push({
        chainId: chainInfo.chainId,
        chainName: chainInfo.chainName,
        balance: balanceStr, // Already in human-readable format
        balanceRaw: balanceRaw.toString(),
      });
    }
  }

  // Calculate total in human-readable format
  const totalFormatted = formatUSDC(total);

  return {
    total: totalFormatted,
    byChain,
  };
}

/**
 * Map Circle Gateway domain to chain ID and name
 * 
 * Circle domains:
 * - 0: Ethereum
 * - 1: Avalanche
 * - 2: OP (Optimism)
 * - 3: Arbitrum
 * - 5: Solana
 * - 6: Base
 * - 7: Polygon PoS
 * - 10: Unichain
 * - 13: Sonic
 * - 14: World Chain
 * - 16: Sei
 * - 19: HyperEVM
 * - 26: Arc
 */
function getChainInfoFromDomain(domain: number): { chainId: number; chainName: string } {
  const domainMap: Record<number, { chainId: number; chainName: string }> = {
    0: { chainId: 1, chainName: 'Ethereum' },
    1: { chainId: 43114, chainName: 'Avalanche' },
    2: { chainId: 10, chainName: 'Optimism' },
    3: { chainId: 42161, chainName: 'Arbitrum' },
    5: { chainId: 0, chainName: 'Solana' }, // Solana doesn't use EVM chain IDs
    6: { chainId: 8453, chainName: 'Base' },
    7: { chainId: 137, chainName: 'Polygon' },
    10: { chainId: 0, chainName: 'Unichain' },
    13: { chainId: 0, chainName: 'Sonic' },
    14: { chainId: 0, chainName: 'World Chain' },
    16: { chainId: 0, chainName: 'Sei' },
    19: { chainId: 0, chainName: 'HyperEVM' },
    26: { chainId: 0, chainName: 'Arc' },
  };

  return domainMap[domain] || { chainId: domain, chainName: `Domain ${domain}` };
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
    baseUrl: process.env.CIRCLE_GATEWAY_BASE_URL || 'https://gateway-api-testnet.circle.com/v1',
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
