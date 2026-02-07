import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeAddress, isValidAddress } from '@/lib/wallet';

/**
 * POST /api/auth/wallet
 * Register or get user by wallet address
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress || !isValidAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    const normalizedAddress = normalizeAddress(walletAddress);

    // Upsert user (create if doesn't exist, otherwise return existing)
    const user = await prisma.user.upsert({
      where: { walletAddress: normalizedAddress },
      update: {}, // No update needed, just return existing
      create: {
        walletAddress: normalizedAddress,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error in wallet auth:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/wallet?address=0x...
 * Get user by wallet address
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('address');

    if (!walletAddress || !isValidAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    const normalizedAddress = normalizeAddress(walletAddress);

    const user = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress },
      include: {
        paymentPages: {
          select: {
            id: true,
            title: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
        paymentPages: user.paymentPages,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
