import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPayment } from '@/lib/payment-verifier';
import { normalizeAddress, isValidAddress } from '@/lib/wallet';

/**
 * GET /api/payments/access?wallet=0x...&itemId=...
 * Check if a wallet has access to a payment item's content
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('wallet') || searchParams.get('address');
    const itemId = searchParams.get('itemId');

    if (!walletAddress || !itemId) {
      return NextResponse.json(
        { error: 'Wallet address and item ID are required' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!isValidAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    const normalizedWallet = normalizeAddress(walletAddress);

    // Get payment item
    const item = await prisma.paymentItem.findUnique({
      where: { id: itemId },
      include: {
        page: {
          select: {
            creatorWallet: true,
          },
        },
        payments: {
          where: {
            payerWallet: normalizedWallet,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Payment item not found' },
        { status: 404 }
      );
    }

    // Check if item has content
    if (!item.contentUrl) {
      return NextResponse.json({
        success: true,
        hasAccess: false,
        reason: 'This item does not have content to unlock',
        item: {
          id: item.id,
          title: item.title,
          contentUrl: null,
        },
      });
    }

    // Check if user has made any payments for this item
    if (item.payments.length === 0) {
      return NextResponse.json({
        success: true,
        hasAccess: false,
        reason: 'No payment found for this item',
        item: {
          id: item.id,
          title: item.title,
          contentUrl: item.contentUrl,
        },
      });
    }

    // Get the most recent payment
    const latestPayment = item.payments[0];

    // Skip blockchain verification if payment was recorded recently (within last 2 minutes)
    // This reduces RPC calls for fresh payments that were just recorded
    const paymentAge = Date.now() - new Date(latestPayment.createdAt).getTime();
    const RECENT_PAYMENT_THRESHOLD = 2 * 60 * 1000; // 2 minutes

    let verification;
    if (paymentAge < RECENT_PAYMENT_THRESHOLD) {
      // Payment is recent, assume it's valid (it was just recorded after successful transaction)
      verification = {
        isValid: true,
        txHash: latestPayment.txHash,
        from: '',
        to: normalizeAddress(item.page.creatorWallet),
        amount: latestPayment.amount,
        blockNumber: 0,
        timestamp: Math.floor(new Date(latestPayment.createdAt).getTime() / 1000),
      };
    } else {
      // Payment is older, verify on blockchain
      verification = await verifyPayment(
        latestPayment.txHash,
        normalizeAddress(item.page.creatorWallet),
        latestPayment.amount
      );
    }

    if (!verification.isValid) {
      return NextResponse.json({
        success: true,
        hasAccess: false,
        reason: 'Payment verification failed on blockchain',
        payment: {
          txHash: latestPayment.txHash,
          amount: latestPayment.amount,
          createdAt: latestPayment.createdAt,
        },
        verification: {
          isValid: false,
          error: verification.error,
        },
      });
    }

    // User has access!
    return NextResponse.json({
      success: true,
      hasAccess: true,
      item: {
        id: item.id,
        title: item.title,
        contentUrl: item.contentUrl,
      },
      payment: {
        txHash: latestPayment.txHash,
        amount: latestPayment.amount,
        createdAt: latestPayment.createdAt,
      },
      verification: {
        txHash: verification.txHash,
        blockNumber: verification.blockNumber,
        timestamp: verification.timestamp,
      },
    });
  } catch (error) {
    console.error('Error checking payment access:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
