'use client';

import { useActiveAccount } from 'thirdweb/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ConnectWallet from '@/components/wallet/ConnectWallet';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = useActiveAccount();
  const router = useRouter();

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-2xl font-bold">Wallet Required</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please connect your wallet to access this page
        </p>
        <ConnectWallet />
      </div>
    );
  }

  return <>{children}</>;
}
