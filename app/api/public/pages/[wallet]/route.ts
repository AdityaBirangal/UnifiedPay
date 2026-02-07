import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidAddress, normalizeAddress } from '@/lib/wallet';

/**
 * GET /api/public/pages/[wallet]
 * Get all public payment pages for a wallet address (no authentication required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params;
    const walletAddress = wallet;

    if (!walletAddress || !isValidAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    const normalizedAddress = normalizeAddress(walletAddress);

    // Get all payment pages for this wallet with their items
    const pages = await prisma.paymentPage.findMany({
      where: {
        creatorWallet: normalizedAddress,
      },
      include: {
        items: {
          where: {
            // Only show items that are ready (have price for fixed, or are open)
            OR: [
              { type: 'fixed', priceUsdc: { not: null } },
              { type: 'open' },
            ],
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        creator: {
          select: {
            walletAddress: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // If no pages found, check if user exists
    if (pages.length === 0) {
      const userExists = await prisma.user.findUnique({
        where: { walletAddress: normalizedAddress },
      });

      if (!userExists) {
        return NextResponse.json(
          { error: 'Creator not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      creator: {
        walletAddress: normalizedAddress,
        createdAt: pages[0]?.creator.createdAt || null,
      },
      pages: pages.map((page) => ({
        id: page.id,
        title: page.title,
        description: page.description,
        createdAt: page.createdAt,
        items: page.items.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          type: item.type,
          priceUsdc: item.priceUsdc,
          contentUrl: item.contentUrl,
        })),
      })),
    });
  } catch (error) {
    console.error('Error fetching public payment pages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
