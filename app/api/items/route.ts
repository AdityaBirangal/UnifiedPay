import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractWalletFromBody } from '@/lib/auth';
import { createErrorResponse, validateString, validateNumber, sanitizeInput, sanitizeUrl, AppError } from '@/lib/errors';

/**
 * POST /api/items
 * Create a new payment item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, pageId, title, description, type, priceUsdc, contentUrl } = body;

    const walletValidation = extractWalletFromBody(body);
    if (!walletValidation.isValid || !walletValidation.address) {
      return NextResponse.json(
        { error: walletValidation.error || 'Invalid wallet address' },
        { status: 400 }
      );
    }

    if (!pageId || typeof pageId !== 'string') {
      return NextResponse.json(
        { error: 'Page ID is required' },
        { status: 400 }
      );
    }

    // Validate and sanitize inputs
    const sanitizedTitle = sanitizeInput(validateString(title, 'Title', 1));
    const sanitizedDescription = description ? sanitizeInput(description) : null;

    if (sanitizedTitle.length > 200) {
      throw new AppError('Title must be 200 characters or less', 'VALIDATION_ERROR', 400);
    }

    if (sanitizedDescription && sanitizedDescription.length > 2000) {
      throw new AppError('Description must be 2000 characters or less', 'VALIDATION_ERROR', 400);
    }

    if (!type || !['fixed', 'open'].includes(type)) {
      throw new AppError('Type must be "fixed" or "open"', 'VALIDATION_ERROR', 400);
    }

    // Verify page ownership
    const page = await prisma.paymentPage.findFirst({
      where: {
        id: pageId,
        creatorWallet: walletValidation.address,
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Payment page not found or access denied' },
        { status: 404 }
      );
    }

    // Validate fixed price item
    let sanitizedPrice: string | null = null;
    if (type === 'fixed') {
      if (!priceUsdc || typeof priceUsdc !== 'string' || priceUsdc.trim().length === 0) {
        throw new AppError('Price is required for fixed payment items', 'VALIDATION_ERROR', 400);
      }
      const priceNum = validateNumber(priceUsdc, 'Price', 0);
      sanitizedPrice = priceNum.toString();
    }

    // Validate and sanitize content URL if provided
    let sanitizedContentUrl: string | null = null;
    if (contentUrl) {
      try {
        sanitizedContentUrl = sanitizeUrl(contentUrl);
      } catch (err) {
        throw new AppError('Invalid content URL format', 'VALIDATION_ERROR', 400);
      }
    }

    // Create payment item
    const item = await prisma.paymentItem.create({
      data: {
        pageId: pageId,
        title: sanitizedTitle,
        description: sanitizedDescription,
        type: type,
        priceUsdc: sanitizedPrice,
        contentUrl: sanitizedContentUrl,
      },
    });

    return NextResponse.json({
      success: true,
      item: {
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type,
        priceUsdc: item.priceUsdc,
        contentUrl: item.contentUrl,
        createdAt: item.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating payment item:', error);
    const errorResponse = createErrorResponse(error, 'Failed to create payment item');
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
