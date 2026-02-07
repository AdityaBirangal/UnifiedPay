import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractWalletFromBody, validateWalletAddress } from '@/lib/auth';
import { normalizeAddress } from '@/lib/wallet';

/**
 * POST /api/payments
 * Record a payment in the database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, itemId, amount, txHash } = body;

    const walletValidation = extractWalletFromBody(body);
    if (!walletValidation.isValid || !walletValidation.address) {
      return NextResponse.json(
        { error: walletValidation.error || 'Invalid wallet address' },
        { status: 400 }
      );
    }

    if (!itemId || typeof itemId !== 'string') {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== 'string') {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      );
    }

    if (!txHash || typeof txHash !== 'string') {
      return NextResponse.json(
        { error: 'Transaction hash is required' },
        { status: 400 }
      );
    }

    // Verify item exists
    const item = await prisma.paymentItem.findUnique({
      where: { id: itemId },
      include: {
        page: {
          select: {
            creatorWallet: true,
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

    // Check if payment already exists (prevent duplicates)
    const existingPayment = await prisma.payment.findUnique({
      where: { txHash },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already recorded', payment: existingPayment },
        { status: 409 }
      );
    }

    // Validate amount for fixed price items
    // Note: amount is in smallest unit (6 decimals for USDC), priceUsdc field stores USDC amount in human-readable format
    // We need to convert priceUsdc to smallest unit for comparison
    if (item.type === 'fixed' && item.priceUsdc) {
      const { parseTokenAmount } = await import('@/lib/blockchain');
      const { TOKEN_DECIMALS } = await import('@/lib/constants');
      const expectedAmountWei = parseTokenAmount(item.priceUsdc, TOKEN_DECIMALS).toString();
      const providedAmount = amount; // Already in smallest unit from blockchain
      
      // Compare as strings to handle precision
      if (expectedAmountWei !== providedAmount) {
        return NextResponse.json(
          { error: `Amount mismatch. Expected ${item.priceUsdc} USDC, but payment amount doesn't match` },
          { status: 400 }
        );
      }
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        itemId: itemId,
        payerWallet: walletValidation.address,
        amount: amount,
        txHash: txHash,
      },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            type: true,
            contentUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        itemId: payment.itemId,
        payerWallet: payment.payerWallet,
        amount: payment.amount,
        txHash: payment.txHash,
        createdAt: payment.createdAt,
        item: payment.item,
      },
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments?txHash=0x...&wallet=0x...
 * Get payment by transaction hash
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const txHash = searchParams.get('txHash');
    const walletAddress = searchParams.get('wallet');

    if (!txHash) {
      return NextResponse.json(
        { error: 'Transaction hash is required' },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { txHash },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            type: true,
            contentUrl: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // If wallet is provided, verify ownership
    if (walletAddress) {
      const walletValidation = validateWalletAddress(request);
      if (walletValidation.isValid && walletValidation.address) {
        const normalizedWallet = normalizeAddress(walletAddress);
        const normalizedPayer = normalizeAddress(payment.payerWallet);
        
        if (normalizedWallet !== normalizedPayer) {
          return NextResponse.json(
            { error: 'Payment does not belong to this wallet' },
            { status: 403 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        itemId: payment.itemId,
        payerWallet: payment.payerWallet,
        amount: payment.amount,
        txHash: payment.txHash,
        createdAt: payment.createdAt,
        item: payment.item,
      },
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
