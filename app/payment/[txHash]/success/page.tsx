'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { useActiveAccount } from 'thirdweb/react';
import { formatTokenAmount } from '@/lib/blockchain';
import ConnectWallet from '@/components/wallet/ConnectWallet';
import { ARCSCAN_URL } from '@/lib/constants';

interface PaymentData {
  payment: {
    id: string;
    txHash: string;
    amount: string;
    createdAt: string;
    item: {
      id: string;
      title: string;
      contentUrl: string | null;
    };
  };
  access: {
    hasAccess: boolean;
    contentUrl?: string;
  };
}

export default function PaymentSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const txHash = params.txHash as string;
  const account = useActiveAccount();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaymentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!txHash) {
        setLoading(false);
        return;
      }

      try {
        // Get payment details (without wallet requirement - txHash is enough)
        const paymentResponse = await fetch(`/api/payments?txHash=${txHash}`);
        const paymentData = await paymentResponse.json();

        if (!paymentResponse.ok || !paymentData.payment) {
          throw new Error(paymentData.error || 'Payment not found');
        }

        // If wallet is connected, check access to content
        if (account?.address) {
          const itemId = paymentData.payment.item?.id;
          if (itemId) {
            try {
              const accessResponse = await fetch(
                `/api/payments/access?wallet=${account.address}&itemId=${itemId}`
              );
              const accessData = await accessResponse.json();

              setData({
                payment: paymentData.payment,
                access: {
                  hasAccess: accessData.hasAccess || false,
                  contentUrl: accessData.item?.contentUrl || null,
                },
              });
              setAccessChecked(true);
            } catch (accessErr) {
              // If access check fails, still show payment but no access
              setData({
                payment: paymentData.payment,
                access: {
                  hasAccess: false,
                  contentUrl: paymentData.payment.item?.contentUrl || null,
                },
              });
              setAccessChecked(true);
            }
          } else {
            setData({
              payment: paymentData.payment,
              access: {
                hasAccess: false,
                contentUrl: paymentData.payment.item?.contentUrl || null,
              },
            });
          }
        } else {
          // Wallet not connected - show payment but prompt for connection to check access
          setData({
            payment: paymentData.payment,
            access: {
              hasAccess: false,
              contentUrl: paymentData.payment.item?.contentUrl || null,
            },
          });
          setAccessChecked(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [txHash, account?.address]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading payment details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Payment Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Unable to load payment details'}</p>
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 shadow-lg animate-scale-in">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Your payment has been confirmed on the blockchain
            </p>
          </div>

          {/* Payment Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Payment Details</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</span>
                <p className="font-bold text-gray-900 dark:text-gray-100 mt-1">{data.payment.item.title}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Transaction Hash</span>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm break-all text-gray-900 dark:text-gray-100">{data.payment.txHash}</p>
                  <a
                    href={`${ARCSCAN_URL}/tx/${data.payment.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    aria-label="View on Arcscan"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <span className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wider">Amount</span>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                  {formatTokenAmount(BigInt(data.payment.amount), 6)} <span className="text-base text-green-700 dark:text-green-300">USDC</span>
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</span>
                <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{new Date(data.payment.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Content Access */}
          {data.payment.item.contentUrl && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Content Access</h2>
              </div>
              {!account ? (
                <div className="p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-blue-900 dark:text-blue-100 font-medium mb-4">
                    Connect your wallet to verify access to this content
                  </p>
                  <div className="mb-4">
                    <ConnectWallet />
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Or visit: <Link href={`/content/${data.payment.item?.id}`} className="font-semibold hover:underline">Content Page</Link>
                  </p>
                </div>
              ) : accessChecked ? (
                data.access.hasAccess ? (
                  <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-green-900 dark:text-green-100 font-bold">
                        You have access to this content
                      </p>
                    </div>
                    <div className="space-y-3">
                      <a
                        href={data.access.contentUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Access Content
                      </a>
                      <div>
                        <Link
                          href={`/content/${data.payment.item?.id}`}
                          className="text-sm text-green-700 dark:text-green-300 hover:underline font-medium"
                        >
                          Or view content page →
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-yellow-900 dark:text-yellow-100 font-bold">Content access verification failed</p>
                    </div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
                      The payment may still be confirming on the blockchain. Please try again in a moment.
                    </p>
                    <Link
                      href={`/content/${data.payment.item?.id}`}
                      className="inline-flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300 hover:underline font-semibold"
                    >
                      Try content page
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-600 dark:text-gray-400">Checking access...</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center font-semibold"
            >
              Go to Dashboard
            </Link>
            {data.payment.item.contentUrl && data.access.hasAccess && (
              <a
                href={data.access.contentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg text-center flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Access Content
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
