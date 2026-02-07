'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useWallet } from '@/components/wallet/WalletProvider';
import { useActiveAccount } from 'thirdweb/react';
import Link from 'next/link';
import { formatTokenAmount } from '@/lib/blockchain';
import { shortenAddress } from '@/lib/wallet';
import { ARCSCAN_URL } from '@/lib/constants';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';

interface Analytics {
  success: boolean;
  summary: {
    totalAmount: string;
    totalPayments: number;
    totalPages: number;
    totalItems: number;
  };
  pageStats: Array<{
    pageId: string;
    pageTitle: string;
    totalAmount: string;
    totalPayments: number;
    items: Array<{
      itemId: string;
      itemTitle: string;
      totalAmount: string;
      totalPayments: number;
      payments: Array<{
        id: string;
        txHash: string;
        amount: string;
        payerWallet: string;
        createdAt: string;
      }>;
    }>;
  }>;
  transactionHistory: Array<{
    id: string;
    txHash: string;
    amount: string;
    payerWallet: string;
    createdAt: string;
    item: {
      id: string;
      title: string;
      page: {
        id: string;
        title: string;
      };
    };
  }>;
}

export default function DashboardPage() {
  const { user, loading } = useWallet();
  const account = useActiveAccount();
  const { showToast } = useToast();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!account?.address) {
        setAnalytics(null);
        return;
      }

      setAnalyticsLoading(true);
      setAnalyticsError(null);

      try {
        const response = await fetch(`/api/payments/analytics?address=${account.address}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch analytics');
        }

        setAnalytics(data);
      } catch (err) {
        setAnalyticsError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [account?.address]);

  const togglePage = (pageId: string) => {
    const newExpanded = new Set(expandedPages);
    if (newExpanded.has(pageId)) {
      newExpanded.delete(pageId);
    } else {
      newExpanded.add(pageId);
    }
    setExpandedPages(newExpanded);
  };

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your payment pages and track your earnings</p>
            </div>

            {loading ? (
              <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Stats - Always show, with loading states */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Collected */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Total Collected</p>
                    {analyticsLoading ? (
                  <div className="space-y-2">
                        <Skeleton className="h-8 w-24 bg-green-200/50 dark:bg-green-800/30" />
                        <Skeleton className="h-4 w-12 bg-green-200/50 dark:bg-green-800/30" />
                      </div>
                    ) : analyticsError ? (
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">Error</p>
                        <p className="text-xs text-red-500 dark:text-red-500">Failed to load</p>
                      </div>
                    ) : analytics ? (
                      <>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                          {formatTokenAmount(BigInt(analytics.summary.totalAmount), 6)}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">USDC</p>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-24 bg-green-200/50 dark:bg-green-800/30" />
                        <Skeleton className="h-4 w-12 bg-green-200/50 dark:bg-green-800/30" />
                      </div>
                    )}
                  </div>

                  {/* Total Payments */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Total Payments</p>
                    {analyticsLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-16 bg-blue-200/50 dark:bg-blue-800/30" />
                        <Skeleton className="h-4 w-20 bg-blue-200/50 dark:bg-blue-800/30" />
                      </div>
                    ) : analyticsError ? (
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">Error</p>
                        <p className="text-xs text-red-500 dark:text-red-500">Failed to load</p>
                      </div>
                    ) : analytics ? (
                      <>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                          {analytics.summary.totalPayments}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Transactions</p>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-16 bg-blue-200/50 dark:bg-blue-800/30" />
                        <Skeleton className="h-4 w-20 bg-blue-200/50 dark:bg-blue-800/30" />
                      </div>
                    )}
                  </div>

                  {/* Payment Pages */}
                  <div className="bg-gradient-to-br from-blue-50 to-yellow-50 dark:from-blue-900/20 dark:to-yellow-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Payment Pages</p>
                    {analyticsLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-12 bg-blue-200/50 dark:bg-blue-800/30" />
                        <Skeleton className="h-4 w-20 bg-blue-200/50 dark:bg-blue-800/30" />
                      </div>
                    ) : analyticsError ? (
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">Error</p>
                        <p className="text-xs text-red-500 dark:text-red-500">Failed to load</p>
                      </div>
                    ) : analytics ? (
                      <>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                          {analytics.summary.totalPages}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Active pages</p>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-12 bg-blue-200/50 dark:bg-blue-800/30" />
                        <Skeleton className="h-4 w-20 bg-blue-200/50 dark:bg-blue-800/30" />
                      </div>
                    )}
                </div>

                  {/* Payment Items */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Payment Items</p>
                    {analyticsLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-12 bg-purple-200/50 dark:bg-purple-800/30" />
                        <Skeleton className="h-4 w-16 bg-purple-200/50 dark:bg-purple-800/30" />
                  </div>
                ) : analyticsError ? (
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">Error</p>
                        <p className="text-xs text-red-500 dark:text-red-500">Failed to load</p>
                  </div>
                ) : analytics ? (
                  <>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                          {analytics.summary.totalItems}
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Total items</p>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-12 bg-purple-200/50 dark:bg-purple-800/30" />
                        <Skeleton className="h-4 w-16 bg-purple-200/50 dark:bg-purple-800/30" />
                        </div>
                    )}
                        </div>
                        </div>

                {/* Payment Pages with Analytics */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Payment Pages</h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your payment pages and track performance</p>
                        </div>
                    <Link
                      href="/dashboard/pages/new"
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg whitespace-nowrap flex items-center gap-2"
                      aria-label="Create a new payment page"
                    >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                      Create New Page
                    </Link>
                  </div>

                  {user?.paymentPages && user.paymentPages.length > 0 ? (
                    <div className="space-y-3">
                      {user.paymentPages.map((page) => {
                        const pageStats = analytics?.pageStats.find((p) => p.pageId === page.id);
                        return (
                          <div
                            key={page.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/50"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-3 mb-2">
                                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                  <Link
                                    href={`/dashboard/pages/${page.id}`}
                                      className="font-bold text-lg text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block truncate"
                                  >
                                    {page.title}
                                  </Link>
                                {page.description && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                    {page.description}
                                  </p>
                                )}
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>{new Date(page.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  {analyticsLoading ? (
                                    <>
                                      <Skeleton className="h-4 w-20 bg-gray-200/50 dark:bg-gray-700/30" />
                                      <Skeleton className="h-4 w-16 bg-gray-200/50 dark:bg-gray-700/30" />
                                    </>
                                  ) : pageStats ? (
                                    <>
                                      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{formatTokenAmount(BigInt(pageStats.totalAmount), 6)} USDC</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>{pageStats.totalPayments} payments</span>
                                      </div>
                                    </>
                                  ) : null}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 sm:ml-4 flex-shrink-0">
                                <Link
                                  href={`/dashboard/pages/${page.id}`}
                                  className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                  aria-label={`Edit ${page.title}`}
                                >
                                  Edit
                                </Link>
                                {pageStats && pageStats.items.length > 0 && (
                                  <button
                                    onClick={() => togglePage(page.id)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    aria-label={expandedPages.has(page.id) ? 'Collapse details' : 'Expand details'}
                                  >
                                    <svg
                                      className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${
                                        expandedPages.has(page.id) ? 'rotate-180' : ''
                                      }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Expanded Item Details */}
                            {expandedPages.has(page.id) && pageStats && (
                              <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2">
                                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  Items Breakdown
                                </h4>
                                <div className="space-y-3">
                                  {pageStats.items.map((item) => (
                                    <div key={item.itemId} className="ml-6 border-l-2 border-blue-200 dark:border-blue-800 pl-4">
                                      <div
                                        className="flex items-center justify-between cursor-pointer group"
                                        onClick={() => toggleItem(item.itemId)}
                                      >
                                        <div className="flex-1">
                                          <h5 className="font-semibold text-gray-900 dark:text-gray-100">{item.itemTitle}</h5>
                                          <div className="flex items-center gap-3 mt-1.5">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold">
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                              </svg>
                                              {formatTokenAmount(BigInt(item.totalAmount), 6)} USDC
                                            </span>
                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                              {item.totalPayments} {item.totalPayments === 1 ? 'payment' : 'payments'}
                                            </span>
                                          </div>
                                        </div>
                                        {item.payments.length > 0 && (
                                          <svg
                                            className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-all duration-200 ${
                                              expandedItems.has(item.itemId) ? 'rotate-180' : ''
                                            }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        )}
                                      </div>

                                      {expandedItems.has(item.itemId) && item.payments.length > 0 && (
                                        <div className="mt-3 space-y-2 animate-in slide-in-from-top-2">
                                          {item.payments.map((payment) => (
                                            <div
                                              key={payment.id}
                                              className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                                            >
                                              <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                  <a
                                                    href={`${ARCSCAN_URL}/tx/${payment.txHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-mono text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors break-all"
                                                  >
                                                    {shortenAddress(payment.txHash)}
                                                  </a>
                                                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-600 dark:text-gray-400">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span>From: {shortenAddress(payment.payerWallet)}</span>
                                                  </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                  <p className="font-bold text-green-600 dark:text-green-400">
                                                    {formatTokenAmount(BigInt(payment.amount), 6)} USDC
                                                  </p>
                                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {new Date(payment.createdAt).toLocaleDateString()}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No payment pages yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                        Create your first payment page to start accepting payments with USDC
                      </p>
                      <Link
                        href="/dashboard/pages/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Your First Page
                      </Link>
                    </div>
                  )}
                </div>

                {/* Public Payment Page URL */}
                {user?.walletAddress && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl shadow-sm border border-blue-200 dark:border-blue-800 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-200 dark:bg-blue-900/40 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-700 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Public Payment Page URL</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                          Share this link with your customers
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <code className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                        {typeof window !== 'undefined' && `${window.location.origin}/pay/${user.walletAddress}`}
                      </code>
                      <button
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            navigator.clipboard.writeText(`${window.location.origin}/pay/${user.walletAddress}`);
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
                      href={`/pay/${user.walletAddress}`}
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
                )}

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                      href="/dashboard/pages/new"
                      className="group p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/50"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Create Payment Page</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Set up a new page to accept payments
                      </p>
                    </Link>
                    {user?.walletAddress && (
                      <Link
                        href={`/pay/${user.walletAddress}`}
                        className="group p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/50"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">View Public Page</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          See how your page looks to customers
                        </p>
                      </Link>
                    )}
                    <Link
                      href="/dashboard/test-verification"
                      className="group p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/50"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Test Verification</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Test blockchain payment verification
                      </p>
                    </Link>
                    <Link
                      href="/purchases"
                      className="group p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-300 dark:hover:border-green-700 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/50"
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">My Purchases</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        View all your purchased content
                      </p>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
