'use client';

import { ThirdwebProvider } from 'thirdweb/react';

export default function ThirdWebProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Configuration Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            ThirdWeb Client ID is not configured. Please check your environment variables.
          </p>
          <p className="text-sm text-gray-500">
            Make sure NEXT_PUBLIC_THIRDWEB_CLIENT_ID is set in your .env file
          </p>
        </div>
      </div>
    );
  }

  return (
    <ThirdwebProvider>
      {children}
    </ThirdwebProvider>
  );
}
