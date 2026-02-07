'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useActiveAccount } from 'thirdweb/react';
import Link from 'next/link';
import { ARCSCAN_URL } from '@/lib/constants';

interface AccessData {
  hasAccess: boolean;
  reason?: string;
  item?: {
    id: string;
    title: string;
    contentUrl: string | null;
  };
  payment?: {
    txHash: string;
    amount: string;
    createdAt: string;
  };
}

export default function ContentAccessPage() {
  const params = useParams();
  const itemId = params.itemId as string;
  const account = useActiveAccount();
  const [loading, setLoading] = useState(true);
  const [accessData, setAccessData] = useState<AccessData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!account?.address || !itemId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/payments/access?wallet=${account.address}&itemId=${itemId}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to check access');
        }

        setAccessData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [account?.address, itemId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Checking access...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !accessData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Access Error</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Unable to check access'}</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!accessData.hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-yellow-300 dark:border-yellow-700 p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Access Denied</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {accessData.reason || 'You do not have access to this content'}
              </p>
              {accessData.item && (
                <div className="mt-6 p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Item</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{accessData.item.title}</p>
                  <Link
                    href={`/pay/${account?.address}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Make Payment
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 shadow-lg animate-scale-in">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Content Unlocked
              </h1>
              {accessData.item && (
                <p className="text-lg text-gray-600 dark:text-gray-400">{accessData.item.title}</p>
              )}
            </div>

            {accessData.item?.contentUrl && (
              <div className="text-center mb-8">
                <a
                  href={accessData.item.contentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Access Content
                </a>
              </div>
            )}

            {accessData.payment && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Payment Verified
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Transaction confirmed on blockchain
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                      {accessData.payment.txHash}
                    </p>
                    <a
                      href={`${ARCSCAN_URL}/tx/${accessData.payment.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      aria-label="View on Arcscan"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
