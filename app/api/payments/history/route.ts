import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeAddress, isValidAddress } from '@/lib/wallet';

/**
 * GET /api/payments/history?wallet=0x...
 * Get all payments made by a wallet address across all creators
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('wallet') || searchParams.get('address');

    if (!walletAddress || !isValidAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Valid wallet address is required' },
        { status: 400 }
      );
    }

    const normalizedWallet = normalizeAddress(walletAddress);

    // Get all payments made by this wallet
    const payments = await prisma.payment.findMany({
      where: {
        payerWallet: normalizedWallet,
      },
      include: {
        item: {
          include: {
            page: {
              select: {
                id: true,
                title: true,
                creatorWallet: true,
                creator: {
                  select: {
                    walletAddress: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format response with all relevant information
    const purchaseHistory = payments.map((payment) => ({
      id: payment.id,
      txHash: payment.txHash,
      amount: payment.amount,
      createdAt: payment.createdAt.toISOString(),
      item: {
        id: payment.item.id,
        title: payment.item.title,
        description: payment.item.description,
        type: payment.item.type,
        priceUsdc: payment.item.priceUsdc,
        contentUrl: payment.item.contentUrl,
      },
      page: {
        id: payment.item.page.id,
        title: payment.item.page.title,
        creatorWallet: payment.item.page.creatorWallet,
      },
    }));

    return NextResponse.json({
      success: true,
      walletAddress: normalizedWallet,
      totalPurchases: purchaseHistory.length,
      purchases: purchaseHistory,
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
