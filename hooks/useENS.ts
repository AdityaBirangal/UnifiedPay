import { useState, useEffect } from 'react';
import { resolveENSName, lookupENSName, getENSAvatar } from '@/lib/ens';

/**
 * ENS React Hooks
 * For ETHGlobal HackMoney - ENS Prize Category
 * 
 * These hooks provide React-friendly interfaces to ENS functionality
 */

interface ENSNameResult {
  ensName: string | null;
  loading: boolean;
  error: Error | null;
}

interface ENSAddressResult {
  address: string | null;
  loading: boolean;
  error: Error | null;
}

interface ENSAvatarResult {
  avatar: string | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to resolve ENS name from Ethereum address (reverse lookup)
 * 
 * @param address - Ethereum address
 * @returns ENS name, loading state, and error
 * 
 * @example
 * const { ensName, loading } = useENSName("0x1234...");
 * return <div>{ensName || "0x1234..."}</div>
 */
export function useENSName(address: string | null | undefined): ENSNameResult {
  const [ensName, setEnsName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address || !address.startsWith('0x')) {
      setEnsName(null);
      setLoading(false);
      setError(null);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    lookupENSName(address)
      .then((name) => {
        if (mounted) {
          setEnsName(name);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
          setEnsName(null);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [address]);

  return { ensName, loading, error };
}

/**
 * Hook to resolve Ethereum address from ENS name (forward lookup)
 * 
 * @param ensName - ENS name (e.g., "vitalik.eth")
 * @returns Ethereum address, loading state, and error
 * 
 * @example
 * const { address, loading } = useENSAddress("vitalik.eth");
 */
export function useENSAddress(ensName: string | null | undefined): ENSAddressResult {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ensName) {
      setAddress(null);
      setLoading(false);
      setError(null);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    resolveENSName(ensName)
      .then((addr) => {
        if (mounted) {
          setAddress(addr);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
          setAddress(null);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [ensName]);

  return { address, loading, error };
}

/**
 * Hook to get ENS avatar URL
 * 
 * @param ensName - ENS name (e.g., "vitalik.eth")
 * @returns Avatar URL, loading state, and error
 * 
 * @example
 * const { avatar, loading } = useENSAvatar("vitalik.eth");
 * {avatar && <img src={avatar} alt="ENS Avatar" />}
 */
export function useENSAvatar(ensName: string | null | undefined): ENSAvatarResult {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ensName) {
      setAvatar(null);
      setLoading(false);
      setError(null);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    getENSAvatar(ensName)
      .then((avatarUrl) => {
        if (mounted) {
          setAvatar(avatarUrl);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
          setAvatar(null);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [ensName]);

  return { avatar, loading, error };
}

/**
 * Combined hook to get both ENS name and avatar for an address
 * Useful for displaying user identity with avatar
 * 
 * @param address - Ethereum address
 * @returns ENS name, avatar URL, loading state, and error
 * 
 * @example
 * const { ensName, avatar, loading } = useENSProfile("0x1234...");
 */
export function useENSProfile(address: string | null | undefined) {
  const { ensName, loading: nameLoading, error: nameError } = useENSName(address);
  const { avatar, loading: avatarLoading, error: avatarError } = useENSAvatar(ensName || undefined);

  return {
    ensName,
    avatar,
    loading: nameLoading || avatarLoading,
    error: nameError || avatarError,
  };
}
