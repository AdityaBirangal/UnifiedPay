'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import ConnectWallet from '@/components/wallet/ConnectWallet';
import { useActiveAccount } from 'thirdweb/react';
import { formatTokenAmount } from '@/lib/blockchain';
import { shortenAddress } from '@/lib/wallet';
import { ARCSCAN_URL } from '@/lib/constants';
import Link from 'next/link';

interface Purchase {
  id: string;
  txHash: string;
  amount: string;
  createdAt: string;
  item: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    priceUsdc: string | null;
    contentUrl: string | null;
  };
  page: {
    id: string;
    title: string;
    creatorWallet: string;
  };
}

interface PurchaseHistory {
  success: boolean;
  walletAddress: string;
  totalPurchases: number;
  purchases: Purchase[];
}

export default function PurchasesPage() {
  const account = useActiveAccount();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PurchaseHistory | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!account?.address) {
        setData(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/payments/history?wallet=${account.address}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch purchase history');
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [account?.address]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">My Purchases</h1>
            <p className="text-gray-600 dark:text-gray-400">View your purchase history and access premium content</p>
          </div>

          {!account ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Connect Your Wallet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Connect your wallet to view your purchase history and access premium content
              </p>
              <ConnectWallet />
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading purchase history...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-red-900 dark:text-red-100 font-bold">Error</p>
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          ) : data && data.totalPurchases === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">No Purchases Yet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                You haven't made any purchases yet. Start exploring payment pages to unlock premium content!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Explore Payment Pages
              </Link>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Total Purchases</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{data.totalPurchases}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Wallet Address</p>
                  <p className="text-sm font-mono text-purple-900 dark:text-purple-100 break-all">{data.walletAddress}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {data.purchases.reduce((sum, p) => {
                      try {
                        return sum + parseFloat(formatTokenAmount(BigInt(p.amount), 6));
                      } catch {
                        return sum;
                      }
                    }, 0).toFixed(2)} <span className="text-base text-green-700 dark:text-green-300">USDC</span>
                  </p>
                </div>
              </div>

              {/* Purchases List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Purchase History</h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{data.totalPurchases} {data.totalPurchases === 1 ? 'purchase' : 'purchases'}</span>
                </div>
                {data.purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      {/* Left: Item Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {purchase.item.title}
                              </h3>
                              {purchase.item.contentUrl && (
                                <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Premium
                                </span>
                              )}
                            </div>
                            {purchase.item.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                {purchase.item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-gray-500 dark:text-gray-400">From:</span>
                            <Link
                              href={`/pay/${purchase.page.creatorWallet}`}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium truncate"
                            >
                              {purchase.page.title}
                            </Link>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-gray-500 dark:text-gray-400">Creator:</span>
                            <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                              {shortenAddress(purchase.page.creatorWallet)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                            <span className="font-bold text-green-600 dark:text-green-400">
                              {formatTokenAmount(BigInt(purchase.amount), 6)} USDC
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-500 dark:text-gray-400">Date:</span>
                            <span className="text-gray-700 dark:text-gray-300">
                              {new Date(purchase.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="text-gray-500 dark:text-gray-400 text-xs">Transaction:</span>
                            <a
                              href={`${ARCSCAN_URL}/tx/${purchase.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 break-all"
                            >
                              {shortenAddress(purchase.txHash)}
                            </a>
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col gap-2 lg:min-w-[200px] lg:ml-4">
                        {purchase.item.contentUrl ? (
                          <>
                            <a
                              href={purchase.item.contentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg text-center flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Access Content
                            </a>
                            <Link
                              href={`/content/${purchase.item.id}`}
                              className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center text-sm font-medium"
                            >
                              View Content Page
                            </Link>
                          </>
                        ) : (
                          <div className="px-4 py-2 text-center text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            No content available
                          </div>
                        )}
                        <Link
                          href={`/payment/${purchase.txHash}/success`}
                          className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View Receipt
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
