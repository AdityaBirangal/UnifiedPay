'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useActiveAccount } from 'thirdweb/react';

/**
 * Component that handles redirecting to home page when wallet disconnects
 * Only redirects if user is on a protected route (dashboard, purchases, etc.)
 */
export default function WalletDisconnectHandler() {
  const account = useActiveAccount();
  const router = useRouter();
  const pathname = usePathname();
  const previousAccountRef = useRef<string | undefined>(account?.address);

  useEffect(() => {
    const previousAccount = previousAccountRef.current;
    const currentAccount = account?.address;

    // If wallet was connected and now disconnected, redirect to home and clear localStorage
    if (previousAccount && !currentAccount) {
      // Clear localStorage on logout
      localStorage.removeItem('unifiedpay_has_redirected');
      
      // Only redirect if not already on home page
      if (pathname !== '/') {
        router.push('/');
      }
    }

    // Update the ref for next comparison
    previousAccountRef.current = currentAccount;
  }, [account?.address, pathname, router]);

  return null; // This component doesn't render anything
}
