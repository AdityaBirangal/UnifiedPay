import { ethers } from 'ethers';

/**
 * ENS Resolution Utilities
 * Uses Ethereum Sepolia testnet for ENS lookups
 * 
 * Note: This is for ETHGlobal HackMoney - ENS prize category
 * All ENS resolution is done via explicit ethers ENS API calls
 */

// Cache for ENS lookups (in-memory, per session)
interface ENSCacheEntry {
  name: string | null;
  timestamp: number;
}

interface ENSAddressCacheEntry {
  address: string | null;
  timestamp: number;
}

interface ENSAvatarCacheEntry {
  avatar: string | null;
  timestamp: number;
}

const nameCache = new Map<string, ENSCacheEntry>();
const addressCache = new Map<string, ENSAddressCacheEntry>();
const avatarCache = new Map<string, ENSAvatarCacheEntry>();

// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Get ENS provider (Sepolia testnet)
 */
export function getENSProvider(): ethers.JsonRpcProvider {
  const sepoliaRpc = process.env.NEXT_PUBLIC_RPC_URL_ETHEREUM_SEPOLIA || 
                     process.env.NEXT_PUBLIC_ETHEREUM_SEPOLIA_RPC ||
                     'https://eth-sepolia.g.alchemy.com/v2/demo';
  
  return new ethers.JsonRpcProvider(sepoliaRpc);
}

/**
 * Check if a string looks like an ENS name
 */
export function isENSName(input: string): boolean {
  if (!input) return false;
  
  // ENS names contain dots and don't start with 0x
  // Most common: .eth, but also .xyz, .com, etc.
  return input.includes('.') && !input.startsWith('0x');
}

/**
 * Forward resolution: ENS name → Ethereum address
 * 
 * @param ensName - ENS name (e.g., "vitalik.eth")
 * @returns Ethereum address or null if not found
 */
export async function resolveENSName(ensName: string): Promise<string | null> {
  if (!ensName || !isENSName(ensName)) {
    return null;
  }

  // Check cache first
  const cached = addressCache.get(ensName);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.address;
  }

  try {
    const provider = getENSProvider();
    
    // Explicit ENS resolution using ethers
    const address = await provider.resolveName(ensName);
    
    // Cache the result
    addressCache.set(ensName, {
      address,
      timestamp: Date.now(),
    });
    
    return address;
  } catch (error) {
    console.error(`ENS resolution failed for ${ensName}:`, error);
    
    // Cache null result to avoid repeated failures
    addressCache.set(ensName, {
      address: null,
      timestamp: Date.now(),
    });
    
    return null;
  }
}

/**
 * Reverse resolution: Ethereum address → ENS name
 * 
 * @param address - Ethereum address (e.g., "0x1234...")
 * @returns ENS name or null if not found
 */
export async function lookupENSName(address: string): Promise<string | null> {
  if (!address || !address.startsWith('0x')) {
    return null;
  }

  // Normalize address
  try {
    address = ethers.getAddress(address);
  } catch {
    return null;
  }

  // Check cache first
  const cached = nameCache.get(address);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.name;
  }

  try {
    const provider = getENSProvider();
    
    // Explicit ENS reverse lookup using ethers
    const name = await provider.lookupAddress(address);
    
    // Cache the result
    nameCache.set(address, {
      name,
      timestamp: Date.now(),
    });
    
    return name;
  } catch (error) {
    console.error(`ENS reverse lookup failed for ${address}:`, error);
    
    // Cache null result
    nameCache.set(address, {
      name: null,
      timestamp: Date.now(),
    });
    
    return null;
  }
}

/**
 * Get ENS avatar URL
 * 
 * @param ensName - ENS name (e.g., "vitalik.eth")
 * @returns Avatar URL or null if not set
 */
export async function getENSAvatar(ensName: string): Promise<string | null> {
  if (!ensName || !isENSName(ensName)) {
    return null;
  }

  // Check cache first
  const cached = avatarCache.get(ensName);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.avatar;
  }

  try {
    const provider = getENSProvider();
    
    // Get resolver for the ENS name
    const resolver = await provider.getResolver(ensName);
    
    if (!resolver) {
      avatarCache.set(ensName, {
        avatar: null,
        timestamp: Date.now(),
      });
      return null;
    }
    
    // Get avatar text record using ENS resolver
    const avatar = await resolver.getAvatar();
    
    // avatar can be an Avatar object or null
    const avatarUrl = avatar?.url || null;
    
    // Cache the result
    avatarCache.set(ensName, {
      avatar: avatarUrl,
      timestamp: Date.now(),
    });
    
    return avatarUrl;
  } catch (error) {
    console.error(`ENS avatar lookup failed for ${ensName}:`, error);
    
    // Cache null result
    avatarCache.set(ensName, {
      avatar: null,
      timestamp: Date.now(),
    });
    
    return null;
  }
}

/**
 * Resolve ENS name or address to a valid Ethereum address
 * Handles both ENS names and raw addresses
 * 
 * @param input - ENS name or Ethereum address
 * @returns Normalized Ethereum address or null
 */
export async function resolveENSOrAddress(input: string): Promise<string | null> {
  if (!input) return null;
  
  // If it looks like an ENS name, resolve it
  if (isENSName(input)) {
    return await resolveENSName(input);
  }
  
  // If it's an address, normalize and return it
  if (input.startsWith('0x')) {
    try {
      return ethers.getAddress(input);
    } catch {
      return null;
    }
  }
  
  return null;
}

/**
 * Clear ENS cache (useful for testing)
 */
export function clearENSCache(): void {
  nameCache.clear();
  addressCache.clear();
  avatarCache.clear();
}
