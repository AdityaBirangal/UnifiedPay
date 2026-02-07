'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useWallet } from '@/components/wallet/WalletProvider';
import { useToast } from '@/components/ui/ToastProvider';
import Skeleton from '@/components/ui/Skeleton';
import Link from 'next/link';

interface PaymentItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  priceUsdc: string | null;
  contentUrl: string | null;
  createdAt: string;
  paymentCount: number;
}

interface PaymentPage {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  items: PaymentItem[];
}

export default function PaymentPageDetail() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.pageId as string;
  const { walletAddress } = useWallet();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<PaymentPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      if (!walletAddress || !pageId) {
        if (!walletAddress) {
          setError('Wallet not connected');
        }
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/pages/${pageId}?address=${encodeURIComponent(walletAddress)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch payment page');
        }

        setPage(data.page);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [walletAddress, pageId]);

  const handleDeleteItem = async (itemId: string) => {
    if (!walletAddress) {
      alert('Wallet not connected');
      return;
    }

    if (!confirm('Are you sure you want to delete this payment item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/items/${itemId}?address=${encodeURIComponent(walletAddress)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      // Refresh page data
      const pageResponse = await fetch(`/api/pages/${pageId}?address=${encodeURIComponent(walletAddress)}`);
      const pageData = await pageResponse.json();
      if (pageData.success) {
        setPage(pageData.page);
        showToast('Item deleted successfully', 'success');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
      showToast(errorMessage, 'error');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-96" />
              <div className="space-y-4 mt-8">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !page) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-red-900 dark:text-red-100">Error</h2>
                    <p className="text-red-700 dark:text-red-300">{error || 'Page not found'}</p>
                  </div>
                </div>
                {!walletAddress && (
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                    Please make sure your wallet is connected.
                  </p>
                )}
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </Link>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{page.title}</h1>
                  {page.description && (
                    <p className="text-gray-600 dark:text-gray-400">{page.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Created {new Date(page.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Updated {new Date(page.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Payment Items</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage items for this payment page</p>
                </div>
                <Link
                  href={`/dashboard/pages/${pageId}/items/new`}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg whitespace-nowrap flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </Link>
              </div>

              {page.items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {page.items.map((item) => (
                    <div
                      key={item.id}
                      className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-800 dark:to-gray-800/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100">{item.title}</h3>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                              item.type === 'fixed' 
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            }`}>
                              {item.type === 'fixed' ? 'Fixed' : 'Custom'}
                            </span>
                            {item.type === 'fixed' && item.priceUsdc && (
                              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                {item.priceUsdc} USDC
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                        {item.contentUrl && (
                          <div className="flex-shrink-0 ml-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {item.paymentCount} {item.paymentCount === 1 ? 'payment' : 'payments'}
                          </span>
                          {item.contentUrl && (
                            <span className="text-green-600 dark:text-green-400 font-medium">Content included</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/pages/${pageId}/items/${item.id}/edit`}
                            className="px-3 py-1.5 text-sm font-medium border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 border-2 border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Payment Items Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Add your first payment item to start accepting payments!</p>
                  <Link
                    href={`/dashboard/pages/${pageId}/items/new`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Your First Item
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl shadow-sm border border-blue-200 dark:border-blue-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-200 dark:bg-blue-900/40 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-700 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Public Payment Page</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    Share this link with your customers
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <code className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                  {typeof window !== 'undefined' && `${window.location.origin}/pay/${walletAddress}`}
                </code>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(`${window.location.origin}/pay/${walletAddress}`);
                      showToast('Link copied to clipboard!', 'success');
                    }
                  }}
                  className="px-5 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </button>
              </div>
              <a
                href={`/pay/${walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
              >
                <span>Preview public page</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
