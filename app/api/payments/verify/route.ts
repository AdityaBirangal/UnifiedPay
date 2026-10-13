import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/payment-verifier';
import { prisma } from '@/lib/prisma';
import { normalizeAddress } from '@/lib/wallet';
import { PRIMARY_CHAIN_ID, parseArcChainId } from '@/lib/constants';

/**
 * POST /api/payments/verify
 * Verify a payment transaction on the blockchain
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { txHash, recipientAddress, expectedAmount } = body;

    if (!txHash || typeof txHash !== 'string') {
      return NextResponse.json(
        { error: 'Transaction hash is required' },
        { status: 400 }
      );
    }

    if (!recipientAddress) {
      return NextResponse.json(
        { error: 'Recipient address is required' },
        { status: 400 }
      );
    }

    const normalizedRecipient = normalizeAddress(recipientAddress);

    // Check if payment exists in database
    const existingPayment = await prisma.payment.findUnique({
      where: { txHash },
      include: {
        item: {
          include: {
            page: {
              select: {
                creatorWallet: true,
              },
            },
          },
        },
      },
    });

    // Verify on the requested chain, else the chain the payment was recorded on
    const chainId = parseArcChainId(body.chainId) ?? existingPayment?.chainId ?? PRIMARY_CHAIN_ID;

    // Verify payment on blockchain
    const verification = await verifyPayment(
      txHash,
      normalizedRecipient,
      expectedAmount,
      chainId
    );

    if (!verification.isValid) {
      return NextResponse.json({
        success: false,
        verified: false,
        error: verification.error,
        verification,
      });
    }

    // Verify recipient matches
    if (existingPayment) {
      const creatorWallet = normalizeAddress(existingPayment.item.page.creatorWallet);
      if (creatorWallet !== normalizedRecipient) {
        return NextResponse.json({
          success: false,
          verified: false,
          error: 'Recipient address does not match payment item creator',
          verification,
        });
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      verification: {
        txHash: verification.txHash,
        from: verification.from,
        to: verification.to,
        amount: verification.amount,
        blockNumber: verification.blockNumber,
        timestamp: verification.timestamp,
        chainId,
      },
      paymentExists: !!existingPayment,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
