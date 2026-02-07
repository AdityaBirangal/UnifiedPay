import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateWalletAddress, extractWalletFromBody } from '@/lib/auth';

/**
 * GET /api/items/[itemId]?wallet=0x...
 * Get a specific payment item
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const walletValidation = validateWalletAddress(request);
    if (!walletValidation.isValid || !walletValidation.address) {
      return NextResponse.json(
        { error: walletValidation.error || 'Invalid wallet address' },
        { status: 400 }
      );
    }

    const item = await prisma.paymentItem.findFirst({
      where: {
        id: itemId,
        page: {
          creatorWallet: walletValidation.address,
        },
      },
      include: {
        page: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            payments: true,
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

    return NextResponse.json({
      success: true,
      item: {
        id: item.id,
        pageId: item.pageId,
        title: item.title,
        description: item.description,
        type: item.type,
        priceUsdc: item.priceUsdc,
        contentUrl: item.contentUrl,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        paymentCount: item._count.payments,
        page: item.page,
      },
    });
  } catch (error) {
    console.error('Error fetching payment item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/items/[itemId]
 * Update a payment item
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const { walletAddress, title, description, type, priceUsdc, contentUrl } = body;

    const walletValidation = extractWalletFromBody(body);
    if (!walletValidation.isValid || !walletValidation.address) {
      return NextResponse.json(
        { error: walletValidation.error || 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingItem = await prisma.paymentItem.findFirst({
      where: {
        id: itemId,
        page: {
          creatorWallet: walletValidation.address,
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Payment item not found' },
        { status: 404 }
      );
    }

    // Validate type change
    if (type && !['fixed', 'open'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "fixed" or "open"' },
        { status: 400 }
      );
    }

    const finalType = type || existingItem.type;

    // Validate fixed price
    if (finalType === 'fixed') {
      const finalPrice = priceUsdc !== undefined ? priceUsdc : existingItem.priceUsdc;
      if (!finalPrice || finalPrice.trim().length === 0) {
        return NextResponse.json(
          { error: 'Price is required for fixed payment items' },
          { status: 400 }
        );
      }
      const priceNum = parseFloat(finalPrice);
      if (isNaN(priceNum) || priceNum <= 0) {
        return NextResponse.json(
          { error: 'Price must be a positive number' },
          { status: 400 }
        );
      }
    }

    // Update item
    const item = await prisma.paymentItem.update({
      where: { id: itemId },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(type && { type: type }),
        ...(finalType === 'fixed' && priceUsdc !== undefined && { priceUsdc: priceUsdc.trim() }),
        ...(finalType === 'open' && { priceUsdc: null }),
        ...(contentUrl !== undefined && { contentUrl: contentUrl?.trim() || null }),
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
        updatedAt: item.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating payment item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/items/[itemId]?wallet=0x...
 * Delete a payment item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const walletValidation = validateWalletAddress(request);
    if (!walletValidation.isValid || !walletValidation.address) {
      return NextResponse.json(
        { error: walletValidation.error || 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingItem = await prisma.paymentItem.findFirst({
      where: {
        id: itemId,
        page: {
          creatorWallet: walletValidation.address,
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Payment item not found' },
        { status: 404 }
      );
    }

    // Delete item (cascade will delete payments)
    await prisma.paymentItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting payment item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
