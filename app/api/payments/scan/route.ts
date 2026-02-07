import { NextRequest, NextResponse } from 'next/server';
import { scanTransfersToAddress } from '@/lib/payment-verifier';
import { prisma } from '@/lib/prisma';
import { normalizeAddress, isValidAddress } from '@/lib/wallet';
import { getProvider } from '@/lib/blockchain';

/**
 * POST /api/payments/scan
 * Scan blockchain for transfers to a creator's wallet and match them with payment items
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, fromBlock, toBlock } = body;

    if (!walletAddress || !isValidAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Valid wallet address is required' },
        { status: 400 }
      );
    }

    const normalizedWallet = normalizeAddress(walletAddress);

    // Get current block if toBlock not provided (on Arc chain)
    const { PRIMARY_CHAIN_ID } = await import('@/lib/constants');
    const provider = getProvider(PRIMARY_CHAIN_ID);
    const currentBlock = await provider.getBlockNumber();
    const scanToBlock = toBlock || currentBlock;
    const scanFromBlock = fromBlock || Math.max(0, scanToBlock - 1000); // Default: last 1000 blocks

    // Scan for transfers on Arc chain
    const transfers = await scanTransfersToAddress(
      normalizedWallet,
      scanFromBlock,
      scanToBlock,
      PRIMARY_CHAIN_ID
    );

    // Get all payment items for this creator
    const paymentPages = await prisma.paymentPage.findMany({
      where: {
        creatorWallet: normalizedWallet,
      },
      include: {
        items: true,
      },
    });

    const allItems = paymentPages.flatMap((page) => page.items);

    // Match transfers with payment items
    const matchedPayments = [];
    const unmatchedTransfers = [];

    for (const transfer of transfers) {
      // Check if this transaction is already recorded
      const existingPayment = await prisma.payment.findUnique({
        where: { txHash: transfer.txHash },
      });

      if (existingPayment) {
        continue; // Already recorded
      }

      // Try to match with a payment item
      let matched = false;

      for (const item of allItems) {
        // For fixed price items, check amount match
        if (item.type === 'fixed' && item.priceUsdc) {
          const { parseTokenAmount } = await import('@/lib/blockchain');
          const { TOKEN_DECIMALS } = await import('@/lib/constants');
          const expectedAmountWei = parseTokenAmount(item.priceUsdc, TOKEN_DECIMALS).toString();
          
          if (transfer.amount === expectedAmountWei) {
            // Create payment record
            try {
              const payment = await prisma.payment.create({
                data: {
                  itemId: item.id,
                  payerWallet: transfer.from,
                  amount: transfer.amount,
                  txHash: transfer.txHash,
                },
              });
              matchedPayments.push({
                transfer,
                payment,
                item: {
                  id: item.id,
                  title: item.title,
                },
              });
              matched = true;
              break;
            } catch (error) {
              console.error('Error creating payment record:', error);
            }
          }
        } else if (item.type === 'open') {
          // For open payments, we can't automatically match without user confirmation
          // But we can suggest potential matches
          unmatchedTransfers.push({
            transfer,
            potentialItem: {
              id: item.id,
              title: item.title,
            },
          });
        }
      }

      if (!matched) {
        // Check if any open payment items exist for this creator
        const hasOpenItems = allItems.some(item => item.type === 'open');
        
        unmatchedTransfers.push({
          transfer,
          potentialItem: hasOpenItems ? {
            id: 'multiple',
            title: 'Multiple open payment items available',
          } : null,
        });
      }
    }

    return NextResponse.json({
      success: true,
      scanned: {
        fromBlock: scanFromBlock,
        toBlock: scanToBlock,
        totalTransfers: transfers.length,
      },
      matchedPayments: matchedPayments.length,
      unmatchedTransfers: unmatchedTransfers.length,
      results: {
        matched: matchedPayments,
        unmatched: unmatchedTransfers,
      },
    });
  } catch (error) {
    console.error('Error scanning payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
