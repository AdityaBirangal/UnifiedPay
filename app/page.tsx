'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import ConnectWallet from '@/components/wallet/ConnectWallet';
import { useActiveAccount } from 'thirdweb/react';

export default function HomePage() {
  const account = useActiveAccount();
  const router = useRouter();

  // Auto-redirect to dashboard when wallet connects from home page (first time only)
  useEffect(() => {
    if (!account?.address) {
      return;
    }

    // Check if this is the first time connecting (using localStorage)
    const hasRedirectedBefore = localStorage.getItem('stablepay_has_redirected');
    
    if (!hasRedirectedBefore) {
      // Mark as redirected
      localStorage.setItem('stablepay_has_redirected', 'true');
      
      // Small delay to ensure wallet connection is fully established
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [account?.address, router]);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-24 md:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center">
            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 p-4 shadow-lg animate-scale-in">
                <Image
                  src="/logo.png"
                  alt="UnifiedPay Logo"
                  width={96}
                  height={96}
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent">
                  Accept Payments
                </span>
                <br />
                <span className="text-gray-900 dark:text-gray-100">with USDC on Arc Network</span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-200 mb-4 max-w-4xl mx-auto font-medium">
              The easiest way to accept USDC payments
            </p>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Built on Arc Network. Fast, low-cost, and secure. No KYC required.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-full shadow-sm">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-bold text-green-700 dark:text-green-300">Instant Settlements</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-full shadow-sm">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold text-blue-700 dark:text-blue-300">Zero Platform Fees</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-full shadow-sm">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-bold text-blue-700 dark:text-blue-300">Non-Custodial</span>
              </div>
            </div>
            <div className="mb-8">
              <a
                href="https://arc.network/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
              >
                <span>Learn more about Arc Network</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {account ? (
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 text-lg font-bold shadow-xl hover:shadow-2xl flex items-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Go to Dashboard
                </Link>
              ) : (
                <div className="px-8 py-4">
                  <ConnectWallet />
                </div>
              )}
              <Link
                href="#how-it-works"
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-lg font-bold flex items-center gap-2"
              >
                Learn More
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 px-4 bg-white dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">Why Choose UnifiedPay?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Built for creators, sellers, and business owners who want to accept payments without barriers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group text-center p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-800 dark:to-gray-800/50">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Secure & Direct</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Payments go directly from customer to creator using USDC. No third-party holds your funds. You control your money.
              </p>
            </div>

            <div className="group text-center p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-800 dark:to-gray-800/50">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Instant Payments</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Receive payments instantly on Arc Network. Fast, low-cost transactions with USDC. No waiting periods.
              </p>
            </div>

            <div className="group text-center p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-800 dark:to-gray-800/50">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Zero Platform Fees</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Zero platform fees. You keep 100% of what customers pay. Only pay minimal Arc Network fees for transactions.
              </p>
            </div>

            <div className="group text-center p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-700 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-800 dark:to-gray-800/50">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Automatic Content Unlocking</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Automatically unlock premium content after verified payment. Blockchain-verified access control.
              </p>
            </div>

            <div className="group text-center p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-800 dark:to-gray-800/50">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Easy Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Track all your payments, see total earnings, and view transaction history in one dashboard.
              </p>
            </div>

            <div className="group text-center p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-800 dark:to-gray-800/50">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                <svg className="w-8 h-8 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">24/7 Available</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Your payment page is always online. Customers can pay anytime, anywhere in the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Getting started is simple. Create your payment page in minutes and start accepting payments.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* For Creators */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 hover:shadow-xl transition-all duration-200">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-md">1</span>
                <span className="text-gray-900 dark:text-gray-100">For Creators</span>
              </h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Connect Your Wallet</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Link your wallet to get started</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Create Payment Page</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Set up your page with items and prices</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Share Your Link</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Share your payment page link with customers</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Receive Payments</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Get paid directly to your wallet instantly</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Customers */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 hover:shadow-xl transition-all duration-200">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-md">2</span>
                <span className="text-gray-900 dark:text-gray-100">For Customers</span>
              </h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Visit Payment Page</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Open the creator&apos;s payment page link</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Connect Wallet</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Link your wallet to make a payment</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Make Payment</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Pay with USDC securely</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Access Content</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Instantly unlock premium content</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USDC on Arc Network Section */}
      <section className="py-20 md:py-28 px-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white dark:bg-gray-800 p-3 shadow-lg">
                <Image
                  src="/logo.png"
                  alt="UnifiedPay Logo"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">Powered by USDC on Arc Network</h2>
            </div>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-6">
              USDC is the world&apos;s most trusted stablecoin. Built for instant, low-cost global payments on Arc Network.
            </p>
            <a
              href="https://arc.network/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
            >
              Visit Arc.network
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 text-center hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-200">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{'<'} 1s</div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Settlement Time</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 text-center hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-200">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{'<'} 1¢</div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Transaction Cost</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 text-center hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-200">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">100%</div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">USD Backed</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 text-center hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-200">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">ERC-20</div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Arc Network</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-2xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">Key Benefits of USDC on Arc</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  Highly Scalable
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Processes transactions at an unparalleled rate, handling high volumes effortlessly.
                </p>
              </div>
              <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  Fully Regulated
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  GENIUS Act compliant, licensed issuer, fully collateralized and transparent.
                </p>
              </div>
              <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  Global 24/7
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Instant transactions settle globally, available 24/7 without restrictions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-28 px-4 bg-white dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">Perfect For</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Built for creators, sellers, and business owners who want to accept payments without barriers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-200">
              <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-gray-100">Content Creators</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                Sell digital products, courses, or exclusive content. Accept payments instantly with no KYC.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-200">
              <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-gray-100">Sellers & Merchants</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                Accept payments for products and services. Zero platform fees, instant settlements.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-200">
              <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-gray-100">Business Owners</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                Streamline payment processing. Track all transactions with comprehensive analytics.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-200">
              <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-gray-100">Educators</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                Accept payments for online courses and tutorials. Unlock content automatically after payment.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-200">
              <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-gray-100">Artists & Musicians</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                Sell artwork, music, or creative services. Get paid directly to your wallet.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-200">
              <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-gray-100">Consultants</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                Accept payments for services and consultations. Professional payment pages in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hackathon Section */}
      <section className="py-20 md:py-28 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 border-2 border-gray-200 dark:border-gray-700">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Programmable Money for Commerce</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                UnifiedPay showcases how programmable money can revolutionize creator payments and commerce infrastructure.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Solving Real Problems
                </h3>
                <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Eliminates KYC barriers for global creators</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Enables instant, low-cost global payments</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Automates content access with blockchain verification</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  Technical Excellence
                </h3>
                <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Non-custodial architecture - users control funds</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Blockchain payment verification and monitoring</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Production-ready with comprehensive analytics</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl md:text-2xl mb-4 text-blue-50 font-medium">
            Join creators, sellers, and business owners accepting payments with USDC on Arc Network
          </p>
          <p className="text-lg md:text-xl mb-10 text-blue-100">
            No KYC. Zero platform fees. Instant settlements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {account ? (
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-200 text-lg font-bold shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go to Dashboard
              </Link>
            ) : (
              <div className="px-8 py-4">
                <ConnectWallet />
              </div>
            )}
            <Link
              href="#how-it-works"
              className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white/10 transition-all duration-200 text-lg font-bold flex items-center justify-center gap-2"
            >
              Learn More
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.png"
                  alt="UnifiedPay Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <h3 className="text-white font-bold text-xl">UnifiedPay</h3>
              </div>
              <p className="text-sm mb-4 leading-relaxed">
                A non-custodial payment platform for accepting USDC payments on Arc Network. Built for creators, sellers, and business owners.
              </p>
              <div className="space-y-2 text-sm">
                <a href="https://arc.network/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors font-medium">
                  <span>Arc.network</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Project Links</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="https://github.com/AdityaBirangal/UnifiedPay" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
                    <span>GitHub</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="http://unifiedpay.birangal.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
                    <span>Live Demo</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Connect</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="https://www.linkedin.com/in/AdityaBirangal" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
                    <span>LinkedIn</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="https://x.com/AdityaBirangal" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
                    <span>X (Twitter)</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="https://farcaster.xyz/adityabirangal" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
                    <span>Farcaster</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/purchases" className="text-blue-400 hover:text-blue-300 transition-colors">
                    My Purchases
                  </Link>
                </li>
                <li>
                  <a href="#how-it-works" className="text-blue-400 hover:text-blue-300 transition-colors">
                    How It Works
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm">© {new Date().getFullYear()} UnifiedPay. All rights reserved.</p>
            <p className="text-xs text-gray-500 mt-2">Built on Arc Network. Secure, transparent, and decentralized payments for everyone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
