import { getAddress, isAddress } from 'ethers';

/**
 * Validates an Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
  try {
    return isAddress(address);
  } catch {
    return false;
  }
};

/**
 * Normalizes an Ethereum address to checksum format
 */
export const normalizeAddress = (address: string): string => {
  try {
    return getAddress(address);
  } catch {
    return address;
  }
};

/**
 * Shortens an Ethereum address for display
 * Example: 0x1234...5678
 */
export const shortenAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  const normalized = normalizeAddress(address);
  return `${normalized.slice(0, chars + 2)}...${normalized.slice(-chars)}`;
};
