import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractWalletFromBody, validateWalletAddress } from '@/lib/auth';
import { normalizeAddress } from '@/lib/wallet';
import { PRIMARY_CHAIN_ID, CHAIN_NAMES, TOKEN_DECIMALS, parseArcChainId } from '@/lib/constants';
import { parseTokenAmount } from '@/lib/blockchain';
import { verifyPayment } from '@/lib/payment-verifier';

// The server's RPC can lag a few seconds behind the wallet's, so retry while the tx isn't visible yet
async function verifyPaymentWithRetry(
  ...args: Parameters<typeof verifyPayment>
): ReturnType<typeof verifyPayment> {
  const MAX_ATTEMPTS = 4;
  let result = await verifyPayment(...args);
  for (let attempt = 1; attempt < MAX_ATTEMPTS && result.error === 'Transaction not found'; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    result = await verifyPayment(...args);
  }
  return result;
}

/**
 * POST /api/payments
 * Record a payment in the database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, amount, txHash } = body;
    const chainId = body.chainId === undefined ? PRIMARY_CHAIN_ID : parseArcChainId(body.chainId);

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

    if (chainId === null) {
      return NextResponse.json(
        { error: 'Unsupported chain ID. Payments must be made on Arc Mainnet or Arc Testnet' },
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
            chainId: true,
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

    // Payments are only accepted on the network the creator chose for this page
    if (chainId !== item.page.chainId) {
      return NextResponse.json(
        { error: `This page only accepts payments on ${CHAIN_NAMES[item.page.chainId]}` },
        { status: 400 }
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

    // Verify the transfer on-chain before recording it: right chain, right recipient,
    // right amount (fixed price), and sent by the wallet claiming the payment
    let expectedAmountWei: string | undefined;
    if (item.type === 'fixed' && item.priceUsdc) {
      expectedAmountWei = parseTokenAmount(item.priceUsdc, TOKEN_DECIMALS).toString();
    }

    const verification = await verifyPaymentWithRetry(
      txHash,
      normalizeAddress(item.page.creatorWallet),
      expectedAmountWei,
      chainId
    );

    if (!verification.isValid) {
      return NextResponse.json(
        { error: `Payment could not be verified on-chain: ${verification.error}` },
        { status: 400 }
      );
    }

    if (verification.from !== normalizeAddress(walletValidation.address)) {
      return NextResponse.json(
        { error: 'Transaction was not sent by this wallet' },
        { status: 403 }
      );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        itemId: itemId,
        payerWallet: walletValidation.address,
        amount: verification.amount, // On-chain amount, not the client-supplied one
        txHash: txHash,
        chainId,
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
        chainId: payment.chainId,
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
        chainId: payment.chainId,
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
