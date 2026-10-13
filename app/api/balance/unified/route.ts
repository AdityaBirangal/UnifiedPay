import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedUSDCBalance, getDirectChainBalances, getCircleGatewayConfig } from '@/lib/circle-gateway';
import { isValidAddress, normalizeAddress } from '@/lib/wallet';
import { NETWORKS, DEFAULT_NETWORK, isArcNetwork } from '@/lib/constants';
import { hasRpcUrl } from '@/lib/blockchain';

/**
 * GET /api/balance/unified?wallet=0x...&network=mainnet|testnet
 * 
 * Get unified USDC balance across all supported chains.
 * Uses Circle Gateway if configured, otherwise falls back to direct chain queries.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress || !isValidAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Valid wallet address is required' },
        { status: 400 }
      );
    }

    const normalizedWallet = normalizeAddress(walletAddress);
    const networkParam = searchParams.get('network');
    const network = isArcNetwork(networkParam) ? networkParam : DEFAULT_NETWORK;
    const networkChains = NETWORKS[network].balanceChainIds;

    // Try Circle Gateway first if configured
    const circleConfig = getCircleGatewayConfig(network);
    
    let unifiedBalance;
    
    if (circleConfig) {
      try {
        unifiedBalance = await getUnifiedUSDCBalance(normalizedWallet, circleConfig);
        
        // If Circle Gateway returns empty results, fall back to direct queries
        if (unifiedBalance.total === '0' && unifiedBalance.byChain.length === 0) {
          console.log('Circle Gateway returned empty balance, falling back to direct chain queries');
          const availableChains = networkChains.filter(chainId => hasRpcUrl(chainId));
          unifiedBalance = await getDirectChainBalances(
            normalizedWallet,
            availableChains
          );
        }
      } catch (error) {
        console.error('Circle Gateway error, falling back to direct chain queries:', error);
        // Fall back to direct chain queries
        const availableChains = networkChains.filter(chainId => hasRpcUrl(chainId));
        unifiedBalance = await getDirectChainBalances(
          normalizedWallet,
          availableChains
        );
      }
    } else {
      // No Circle Gateway configured, use direct chain queries
      // Only query chains that have RPC URLs configured
      const availableChains = networkChains.filter(chainId => hasRpcUrl(chainId));
      
      if (availableChains.length === 0) {
        // At minimum, Arc should be configured
        throw new Error('No RPC URLs configured. No Arc RPC URL available.');
      }
      
      unifiedBalance = await getDirectChainBalances(
        normalizedWallet,
        availableChains
      );
    }

    return NextResponse.json({
      success: true,
      wallet: normalizedWallet,
      balance: unifiedBalance,
      network,
      source: circleConfig ? 'circle-gateway' : 'direct-chain',
    });
  } catch (error) {
    console.error('Error fetching unified balance:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch unified balance',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
