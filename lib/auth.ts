import { NextRequest } from 'next/server';
import { isValidAddress, normalizeAddress } from './wallet';

/**
 * Middleware helper to validate wallet address from request
 */
export function validateWalletAddress(request: NextRequest): {
  isValid: boolean;
  address?: string;
  error?: string;
} {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (!address) {
    return {
      isValid: false,
      error: 'Wallet address is required',
    };
  }

  if (!isValidAddress(address)) {
    return {
      isValid: false,
      error: 'Invalid wallet address format',
    };
  }

  return {
    isValid: true,
    address: normalizeAddress(address),
  };
}

/**
 * Extract wallet address from request body
 */
export function extractWalletFromBody(body: any): {
  isValid: boolean;
  address?: string;
  error?: string;
} {
  const { walletAddress } = body || {};

  if (!walletAddress) {
    return {
      isValid: false,
      error: 'Wallet address is required',
    };
  }

  if (!isValidAddress(walletAddress)) {
    return {
      isValid: false,
      error: 'Invalid wallet address format',
    };
  }

  return {
    isValid: true,
    address: normalizeAddress(walletAddress),
  };
}
