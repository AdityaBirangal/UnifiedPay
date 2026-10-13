import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/payment-verifier';
import { prisma } from '@/lib/prisma';
import { normalizeAddress } from '@/lib/wallet';
import { PRIMARY_CHAIN_ID, parseArcChainId } from '@/lib/constants';

/**
 * GET /api/payments/verify/[txHash]
 * Verify a specific payment transaction
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ txHash: string }> }
) {
  try {
    const { txHash } = await params;
    const searchParams = request.nextUrl.searchParams;
    const recipientAddress = searchParams.get('recipient');
    const expectedAmount = searchParams.get('amount');

    if (!recipientAddress) {
      return NextResponse.json(
        { error: 'Recipient address is required as query parameter' },
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
    const chainId = parseArcChainId(searchParams.get('chainId')) ?? existingPayment?.chainId ?? PRIMARY_CHAIN_ID;

    // Verify payment on blockchain
    const verification = await verifyPayment(
      txHash,
      normalizedRecipient,
      expectedAmount || undefined,
      chainId
    );

    return NextResponse.json({
      success: true,
      verified: verification.isValid,
      verification: verification.isValid ? {
        txHash: verification.txHash,
        from: verification.from,
        to: verification.to,
        amount: verification.amount,
        blockNumber: verification.blockNumber,
        timestamp: verification.timestamp,
      } : null,
      error: verification.error,
      paymentRecorded: !!existingPayment,
      payment: existingPayment ? {
        id: existingPayment.id,
        itemId: existingPayment.itemId,
        payerWallet: existingPayment.payerWallet,
        amount: existingPayment.amount,
        chainId: existingPayment.chainId,
        createdAt: existingPayment.createdAt,
        item: existingPayment.item,
      } : null,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
