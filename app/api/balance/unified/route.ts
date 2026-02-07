import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedUSDCBalance, getDirectChainBalances, getCircleGatewayConfig } from '@/lib/circle-gateway';
import { isValidAddress, normalizeAddress } from '@/lib/wallet';
import { SUPPORTED_CHAINS } from '@/lib/constants';
import { hasRpcUrl } from '@/lib/blockchain';

/**
 * GET /api/balance/unified?wallet=0x...
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

    // Try Circle Gateway first if configured
    const circleConfig = getCircleGatewayConfig();
    
    let unifiedBalance;
    
    if (circleConfig) {
      try {
        unifiedBalance = await getUnifiedUSDCBalance(normalizedWallet, circleConfig);
        
        // If Circle Gateway returns empty results, fall back to direct queries
        if (unifiedBalance.total === '0' && unifiedBalance.byChain.length === 0) {
          console.log('Circle Gateway returned empty balance, falling back to direct chain queries');
          const availableChains = Object.values(SUPPORTED_CHAINS).filter(chainId => hasRpcUrl(chainId));
          unifiedBalance = await getDirectChainBalances(
            normalizedWallet,
            availableChains
          );
        }
      } catch (error) {
        console.error('Circle Gateway error, falling back to direct chain queries:', error);
        // Fall back to direct chain queries
        const availableChains = Object.values(SUPPORTED_CHAINS).filter(chainId => hasRpcUrl(chainId));
        unifiedBalance = await getDirectChainBalances(
          normalizedWallet,
          availableChains
        );
      }
    } else {
      // No Circle Gateway configured, use direct chain queries
      // Only query chains that have RPC URLs configured
      const availableChains = Object.values(SUPPORTED_CHAINS).filter(chainId => hasRpcUrl(chainId));
      
      if (availableChains.length === 0) {
        // At minimum, Arc should be configured
        throw new Error('No RPC URLs configured. Please configure NEXT_PUBLIC_RPC_URL_ARC_TESTNET at minimum.');
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
