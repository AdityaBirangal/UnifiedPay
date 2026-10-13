import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractWalletFromBody, validateWalletAddress } from '@/lib/auth';
import { createErrorResponse, validateString, sanitizeInput, AppError } from '@/lib/errors';
import { PRIMARY_CHAIN_ID, parseArcChainId } from '@/lib/constants';

/**
 * POST /api/pages
 * Create a new payment page
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, title, description } = body;

    const walletValidation = extractWalletFromBody(body);
    if (!walletValidation.isValid || !walletValidation.address) {
      return NextResponse.json(
        { error: walletValidation.error || 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Validate and sanitize inputs
    const sanitizedTitle = sanitizeInput(validateString(title, 'Title', 1));
    const sanitizedDescription = description ? sanitizeInput(description) : null;

    // Limit title length
    if (sanitizedTitle.length > 200) {
      throw new AppError('Title must be 200 characters or less', 'VALIDATION_ERROR', 400);
    }

    // Limit description length
    if (sanitizedDescription && sanitizedDescription.length > 2000) {
      throw new AppError('Description must be 2000 characters or less', 'VALIDATION_ERROR', 400);
    }

    // Arc network the page accepts payments on (fixed once created)
    const chainId = body.chainId === undefined ? PRIMARY_CHAIN_ID : parseArcChainId(body.chainId);
    if (chainId === null) {
      throw new AppError('Network must be Arc Mainnet or Arc Testnet', 'VALIDATION_ERROR', 400);
    }

    // Verify user exists (create if doesn't exist)
    await prisma.user.upsert({
      where: { walletAddress: walletValidation.address },
      update: {},
      create: {
        walletAddress: walletValidation.address,
      },
    });

    // Create payment page
    const page = await prisma.paymentPage.create({
      data: {
        creatorWallet: walletValidation.address,
        title: sanitizedTitle,
        description: sanitizedDescription,
        chainId,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      page: {
        id: page.id,
        title: page.title,
        description: page.description,
        chainId: page.chainId,
        createdAt: page.createdAt,
        itemCount: page.items.length,
      },
    });
  } catch (error) {
    console.error('Error creating payment page:', error);
    const errorResponse = createErrorResponse(error, 'Failed to create payment page');
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * GET /api/pages?wallet=0x...
 * Get all payment pages for a wallet
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

    const pages = await prisma.paymentPage.findMany({
      where: {
        creatorWallet: walletValidation.address,
      },
      include: {
        items: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      pages: pages.map((page) => ({
        id: page.id,
        title: page.title,
        description: page.description,
        chainId: page.chainId,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        itemCount: page._count.items,
        items: page.items,
      })),
    });
  } catch (error) {
    console.error('Error fetching payment pages:', error);
    const errorResponse = createErrorResponse(error, 'Failed to fetch payment pages');
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
