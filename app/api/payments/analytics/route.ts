import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateWalletAddress } from '@/lib/auth';
import { normalizeAddress } from '@/lib/wallet';

/**
 * GET /api/payments/analytics?address=0x...
 * Get payment analytics for a creator wallet
 */
export async function GET(request: NextRequest) {
  try {
    const walletValidation = validateWalletAddress(request);
    if (!walletValidation.isValid || !walletValidation.address) {
      return NextResponse.json(
        { error: walletValidation.error || 'Invalid wallet address' },
        { status: 400 }
      );
    }

    const normalizedWallet = normalizeAddress(walletValidation.address);

    // Get all payment pages for this creator
    const pages = await prisma.paymentPage.findMany({
      where: {
        creatorWallet: normalizedWallet,
      },
      include: {
        items: {
          include: {
            payments: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate totals
    let totalAmount = BigInt(0);
    const pageStats: Array<{
      pageId: string;
      pageTitle: string;
      totalAmount: string;
      totalPayments: number;
      items: Array<{
        itemId: string;
        itemTitle: string;
        totalAmount: string;
        totalPayments: number;
        payments: Array<{
          id: string;
          txHash: string;
          amount: string;
          payerWallet: string;
          createdAt: string;
        }>;
      }>;
    }> = [];

    // Process each page
    for (const page of pages) {
      let pageTotal = BigInt(0);
      let pagePaymentCount = 0;
      const itemStats: Array<{
        itemId: string;
        itemTitle: string;
        totalAmount: string;
        totalPayments: number;
        payments: Array<{
          id: string;
          txHash: string;
          amount: string;
          payerWallet: string;
          createdAt: string;
        }>;
      }> = [];

      // Process each item
      for (const item of page.items) {
        let itemTotal = BigInt(0);
        const itemPayments = item.payments.map((payment) => {
          const amount = BigInt(payment.amount);
          itemTotal += amount;
          pageTotal += amount;
          totalAmount += amount;
          pagePaymentCount++;
          return {
            id: payment.id,
            txHash: payment.txHash,
            amount: payment.amount,
            payerWallet: payment.payerWallet,
            createdAt: payment.createdAt.toISOString(),
          };
        });

        itemStats.push({
          itemId: item.id,
          itemTitle: item.title,
          totalAmount: itemTotal.toString(),
          totalPayments: itemPayments.length,
          payments: itemPayments,
        });
      }

      pageStats.push({
        pageId: page.id,
        pageTitle: page.title,
        totalAmount: pageTotal.toString(),
        totalPayments: pagePaymentCount,
        items: itemStats,
      });
    }

    // Get all transactions (for history)
    const allPayments = await prisma.payment.findMany({
      where: {
        item: {
          page: {
            creatorWallet: normalizedWallet,
          },
        },
      },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            page: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const transactionHistory = allPayments.map((payment) => ({
      id: payment.id,
      txHash: payment.txHash,
      amount: payment.amount,
      payerWallet: payment.payerWallet,
      createdAt: payment.createdAt.toISOString(),
      item: {
        id: payment.item.id,
        title: payment.item.title,
        page: {
          id: payment.item.page.id,
          title: payment.item.page.title,
        },
      },
    }));

    return NextResponse.json({
      success: true,
      creatorWallet: normalizedWallet,
      summary: {
        totalAmount: totalAmount.toString(),
        totalPayments: allPayments.length,
        totalPages: pages.length,
        totalItems: pages.reduce((sum, page) => sum + page.items.length, 0),
      },
      pageStats,
      transactionHistory,
    });
  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
