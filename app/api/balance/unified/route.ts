import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedUSDCBalance, getDirectChainBalances, getCircleGatewayConfig } from '@/lib/circle-gateway';
import { isValidAddress, normalizeAddress } from '@/lib/wallet';
import { NETWORKS, DEFAULT_NETWORK, TOKEN_DECIMALS, isArcNetwork } from '@/lib/constants';
import { hasRpcUrl, formatTokenAmount } from '@/lib/blockchain';

/**
 * GET /api/balance/unified?wallet=0x...&network=mainnet|testnet
 * 
 * Get unified USDC balance across the selected network's chains:
 * on-chain wallet balances, plus Circle Gateway deposits if Gateway is configured.
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

    // Wallet USDC on each chain of the selected network (only chains with an RPC configured)
    const availableChains = networkChains.filter(chainId => hasRpcUrl(chainId));
    if (availableChains.length === 0) {
      throw new Error('No RPC URLs configured. No Arc RPC URL available.');
    }

    // Circle Gateway only reports USDC deposited into the Gateway Wallet contract, not what the
    // wallet itself holds - so add any Gateway deposits on top of the on-chain wallet balances
    const circleConfig = getCircleGatewayConfig(network);
    const [walletBalance, gatewayBalance] = await Promise.all([
      getDirectChainBalances(normalizedWallet, availableChains),
      circleConfig ? getUnifiedUSDCBalance(normalizedWallet, circleConfig) : Promise.resolve(null),
    ]);

    const gatewayDeposits = (gatewayBalance?.byChain || [])
      .filter((entry) => BigInt(entry.balanceRaw) > BigInt(0))
      .map((entry) => ({ ...entry, chainName: `${entry.chainName} (Gateway deposit)` }));

    const byChain = [...walletBalance.byChain, ...gatewayDeposits];
    const totalRaw = byChain.reduce((sum, entry) => sum + BigInt(entry.balanceRaw), BigInt(0));
    const unifiedBalance = {
      total: formatTokenAmount(totalRaw, TOKEN_DECIMALS),
      byChain,
    };

    return NextResponse.json({
      success: true,
      wallet: normalizedWallet,
      balance: unifiedBalance,
      network,
      source: gatewayDeposits.length > 0 ? 'direct-chain+circle-gateway' : 'direct-chain',
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
