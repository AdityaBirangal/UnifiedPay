import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateWalletAddress } from '@/lib/auth';

/**
 * GET /api/pages/[pageId]?wallet=0x...
 * Get a specific payment page with items
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const walletValidation = validateWalletAddress(request);
    if (!walletValidation.isValid || !walletValidation.address) {
      return NextResponse.json(
        { error: walletValidation.error || 'Invalid wallet address' },
        { status: 400 }
      );
    }

    const page = await prisma.paymentPage.findFirst({
      where: {
        id: pageId,
        creatorWallet: walletValidation.address,
      },
      include: {
        items: {
          include: {
            _count: {
              select: {
                payments: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Payment page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      page: {
        id: page.id,
        title: page.title,
        description: page.description,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        items: page.items.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          type: item.type,
          priceUsdc: item.priceUsdc,
          contentUrl: item.contentUrl,
          createdAt: item.createdAt,
          paymentCount: item._count.payments,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching payment page:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/pages/[pageId]
 * Update a payment page
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const body = await request.json();
    const { walletAddress, title, description } = body;

    const walletValidation = validateWalletAddress(request);
    if (!walletValidation.isValid || !walletValidation.address) {
      return NextResponse.json(
        { error: walletValidation.error || 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingPage = await prisma.paymentPage.findFirst({
      where: {
        id: pageId,
        creatorWallet: walletValidation.address,
      },
    });

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Payment page not found' },
        { status: 404 }
      );
    }

    // Update page
    const page = await prisma.paymentPage.update({
      where: { id: pageId },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
      },
    });

    return NextResponse.json({
      success: true,
      page: {
        id: page.id,
        title: page.title,
        description: page.description,
        updatedAt: page.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating payment page:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pages/[pageId]?wallet=0x...
 * Delete a payment page
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const walletValidation = validateWalletAddress(request);
    if (!walletValidation.isValid || !walletValidation.address) {
      return NextResponse.json(
        { error: walletValidation.error || 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingPage = await prisma.paymentPage.findFirst({
      where: {
        id: pageId,
        creatorWallet: walletValidation.address,
      },
    });

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Payment page not found' },
        { status: 404 }
      );
    }

    // Delete page (cascade will delete items and payments)
    await prisma.paymentPage.delete({
      where: { id: pageId },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment page deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting payment page:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
