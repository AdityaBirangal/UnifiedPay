'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import ConnectWallet from '@/components/wallet/ConnectWallet';
import { useActiveAccount } from 'thirdweb/react';
import { shortenAddress } from '@/lib/wallet';
import { usePayment } from '@/hooks/usePayment';
import { useUnifiedBalance } from '@/hooks/useUnifiedBalance';
import { SUPPORTED_CHAINS, ARCSCAN_URL, TOKEN_SYMBOL } from '@/lib/constants';
import { useToast } from '@/components/ui/ToastProvider';
import Skeleton from '@/components/ui/Skeleton';
import { ENSAddressLarge } from '@/components/ens/ENSAddress';
import ENSAddress from '@/components/ens/ENSAddress';
import { resolveENSOrAddress, isENSName } from '@/lib/ens';

interface PaymentItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  priceUsdc: string | null;
  contentUrl: string | null;
}

interface PaymentPage {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  items: PaymentItem[];
}

interface PublicPagesData {
  creator: {
    walletAddress: string;
    createdAt: string | null;
  };
  pages: PaymentPage[];
}

export default function PublicPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const walletParamRaw = params.wallet as string;
  const account = useActiveAccount();
  const { executePayment, loading: paymentLoading, error: paymentError, isCorrectChain } = usePayment();
  const { balance: unifiedBalance, loading: balanceLoading } = useUnifiedBalance();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PublicPagesData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<PaymentItem | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ensResolutionError, setEnsResolutionError] = useState<string | null>(null);

  // ENS Resolution: Convert ENS name to address if needed
  useEffect(() => {
    const resolveWalletParam = async () => {
      if (!walletParamRaw) {
        setWalletAddress(null);
        setLoading(false);
        return;
      }

      // Check if the parameter is an ENS name
      if (isENSName(walletParamRaw)) {
        try {
          setLoading(true);
          setEnsResolutionError(null);
          
          // Resolve ENS name to address
          const resolvedAddress = await resolveENSOrAddress(walletParamRaw);
          
          if (resolvedAddress) {
            setWalletAddress(resolvedAddress);
          } else {
            setEnsResolutionError(`Could not resolve ENS name: ${walletParamRaw}`);
            setLoading(false);
          }
        } catch (err) {
          console.error('ENS resolution failed:', err);
          setEnsResolutionError(`Failed to resolve ENS name: ${walletParamRaw}`);
          setLoading(false);
        }
      } else {
        // It's a regular address
        setWalletAddress(walletParamRaw);
      }
    };

    resolveWalletParam();
  }, [walletParamRaw]);

  useEffect(() => {
    const fetchPages = async () => {
      if (!walletAddress) return;

      try {
        const response = await fetch(`/api/public/pages/${walletAddress}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch payment pages');
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [walletAddress]);

  const handlePayClick = (item: PaymentItem) => {
    setSelectedItem(item);
    if (item.type === 'open') {
      setCustomAmount('');
    }
  };

  const handleCloseModal = () => {
    if (paymentStatus === 'processing') return; // Don't close during payment
    setSelectedItem(null);
    setCustomAmount('');
    setPaymentStatus('idle');
    setTxHash(null);
  };

  const handlePayment = async () => {
    if (!account || !selectedItem || !data) {
      showToast('Please connect your wallet first', 'error');
      return;
    }

    if (!isCorrectChain) {
      showToast(`Please switch to Arc Network Testnet (Chain ID: ${SUPPORTED_CHAINS.ARC_TESTNET})`, 'error');
      return;
    }

    if (selectedItem.type === 'open' && (!customAmount || parseFloat(customAmount) <= 0)) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    const amount = selectedItem.type === 'fixed' 
      ? selectedItem.priceUsdc! 
      : customAmount;

    setPaymentStatus('processing');

    const hash = await executePayment({
      itemId: selectedItem.id,
      recipientAddress: data.creator.walletAddress,
      amount: amount,
      onSuccess: (txHash) => {
        setTxHash(txHash);
        setPaymentStatus('success');
        showToast('Payment successful! Redirecting...', 'success');
        // Redirect to success page after 2 seconds
        setTimeout(() => {
          router.push(`/payment/${txHash}/success`);
        }, 2000);
      },
      onError: (error) => {
        setPaymentStatus('error');
        showToast(error.message || 'Payment failed', 'error');
        console.error('Payment error:', error);
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <Skeleton className="h-12 w-48 mx-auto mb-4" />
              <Skeleton className="h-6 w-64 mx-auto" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || ensResolutionError || !data) {
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {ensResolutionError ? 'ENS Resolution Failed' : 'Payment Page Not Found'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {ensResolutionError || error || 'This creator has not set up any payment pages yet.'}
            </p>
            {ensResolutionError && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6 font-mono">
                Tried to resolve: {walletParamRaw}
              </p>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Creator Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4">
              <Image
                src="/logo.png"
                alt="UnifiedPay Logo"
                width={80}
                height={80}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              UnifiedPay
            </h1>
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Creator
              </p>
              {/* ENS Integration: Display ENS name with avatar if available */}
              <ENSAddressLarge 
                address={data.creator.walletAddress}
                showAvatar={true}
              />
            </div>
          </div>

          {/* Payment Pages */}
          {data.pages.length > 0 ? (
            <div className="space-y-8">
              {data.pages.map((page) => (
                <div key={page.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Page Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 px-6 py-5 border-b border-blue-200 dark:border-blue-800">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{page.title}</h2>
                    {page.description && (
                      <p className="text-gray-700 dark:text-gray-300">{page.description}</p>
                    )}
                  </div>

                  {/* Payment Items */}
                  <div className="p-6">
                  {page.items.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {page.items.map((item) => (
                        <div
                          key={item.id}
                            className="group border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-800 dark:to-gray-800/50 cursor-pointer"
                            onClick={() => handlePayClick(item)}
                        >
                            <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{item.title}</h3>
                                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                    item.type === 'fixed' 
                                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                                      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                  }`}>
                                    {item.type === 'fixed' ? 'Fixed' : 'Custom'}
                                </span>
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
                              {item.type === 'fixed' && item.priceUsdc ? (
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Price</p>
                                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {item.priceUsdc} <span className="text-base text-gray-600 dark:text-gray-400">USDC</span>
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Amount</p>
                                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Custom</p>
                                </div>
                              )}
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePayClick(item);
                                }}
                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
                              aria-label={`Pay for ${item.title}`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Pay Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No payment items available</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Payment Pages</h3>
              <p className="text-gray-600 dark:text-gray-400">
                This creator hasn't set up any payment pages yet.
              </p>
            </div>
          )}

          {/* Payment Modal */}
          {selectedItem && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
              onClick={handleCloseModal}
            >
              <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-top-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Complete Payment</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Secure payment with USDC on Arc Network</p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    disabled={paymentStatus === 'processing'}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                    aria-label="Close modal"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Item Info */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-200 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-700 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-gray-100 mb-1">{selectedItem.title}</p>
                  {selectedItem.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedItem.description}
                    </p>
                  )}
                    </div>
                  </div>
                </div>

                {!account ? (
                  <div className="mb-6">
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Step 1: Connect Your Wallet
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Connect your wallet to proceed with payment
                      </p>
                    </div>
                    <ConnectWallet />
                  </div>
                ) : (
                  <>
                    {/* Payment Amount */}
                    {selectedItem.type === 'open' ? (
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Payment Amount (USDC) *
                        </label>
                        <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 text-lg font-semibold"
                            placeholder="0.00"
                        />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                            USDC
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                        <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-2">Amount to Pay</p>
                        <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                          {selectedItem.priceUsdc} <span className="text-xl text-green-700 dark:text-green-300">USDC</span>
                        </p>
                      </div>
                    )}

                    {/* Recipient Info */}
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Recipient</p>
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {/* ENS Integration: Show ENS name or address */}
                        <ENSAddress 
                          address={data.creator.walletAddress}
                          showAvatar={true}
                          copyable={true}
                        />
                      </div>
                    </div>

                    {/* Unified Balance Display */}
                    {account && unifiedBalance && (
                      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">Your USDC Balance</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                            {parseFloat(unifiedBalance.total).toFixed(2)} {TOKEN_SYMBOL}
                          </p>
                          {unifiedBalance.byChain.length > 1 && (
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              across {unifiedBalance.byChain.length} chains
                            </p>
                          )}
                        </div>
                        {unifiedBalance.byChain.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">By Chain:</p>
                            <div className="space-y-1">
                              {unifiedBalance.byChain.map((chain) => (
                                <div key={chain.chainId} className="flex justify-between text-xs">
                                  <span className="text-blue-700 dark:text-blue-300">{chain.chainName}:</span>
                                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                                    {parseFloat(chain.balance).toFixed(2)} {TOKEN_SYMBOL}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedItem && (
                          <div className="mt-3 pt-2 border-t border-blue-200 dark:border-blue-700">
                            {(() => {
                              const paymentAmount = parseFloat(
                                selectedItem.type === 'fixed' 
                                  ? selectedItem.priceUsdc || '0'
                                  : customAmount || '0'
                              );
                              const totalBalance = parseFloat(unifiedBalance.total);
                              const hasEnough = totalBalance >= paymentAmount;
                              
                              return (
                                <div className={`flex items-center gap-2 text-xs ${hasEnough ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
                                  {hasEnough ? (
                                    <>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      <span>Sufficient balance</span>
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                      </svg>
                                      <span>Insufficient balance on Arc. Bridge USDC to Arc to complete payment.</span>
                                    </>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status Messages */}
                    {paymentStatus === 'success' ? (
                      <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-700 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-green-900 dark:text-green-100 font-bold text-lg">Payment Successful!</p>
                            <p className="text-sm text-green-700 dark:text-green-300 mt-0.5">Redirecting to confirmation...</p>
                          </div>
                        </div>
                        {txHash && (
                          <a
                            href={`${ARCSCAN_URL}/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-mono break-all block"
                          >
                            View on Arcscan: {shortenAddress(txHash)}
                          </a>
                        )}
                      </div>
                    ) : paymentStatus === 'error' ? (
                      <div className="mb-6 p-5 bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-red-900 dark:text-red-100 font-bold">Payment Failed</p>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          {paymentError || 'An error occurred. Please try again.'}
                        </p>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {!isCorrectChain && (
                      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Please switch to Arc Network Testnet to make payments
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handlePayment}
                        disabled={paymentLoading || paymentStatus === 'processing' || !isCorrectChain || (selectedItem.type === 'open' && !customAmount)}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        {paymentLoading || paymentStatus === 'processing' ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pay {selectedItem.type === 'open' ? (customAmount || '0') : selectedItem.priceUsdc} USDC
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCloseModal}
                        disabled={paymentStatus === 'processing'}
                        className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
