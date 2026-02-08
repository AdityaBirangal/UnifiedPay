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
                  Accept USDC Payments
                </span>
                <br />
                <span className="text-gray-900 dark:text-gray-100">Across Any Chain</span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-200 mb-4 max-w-4xl mx-auto font-medium">
              Pay from any chain. Settle with Arc's unified liquidity. <br />Send to human-readable names.
            </p>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              One seamless USDC experience across multiple networks. No KYC required.
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

      {/* Arc Liquidity Hub Section */}
      <section className="py-20 md:py-28 px-4 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <span className="text-sm font-bold">⚡ Powered by Arc Network</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Arc: The USDC Liquidity Hub</h2>
            <p className="text-xl text-blue-50 max-w-3xl mx-auto leading-relaxed">
              UnifiedPay treats multiple blockchains as a single USDC liquidity surface
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                How It Works
              </h3>
              <ul className="space-y-4 text-blue-50">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-300 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Users pay from Ethereum, Polygon, Avalanche, or Base</strong> — USDC lives where they already have it</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-300 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Arc serves as the settlement layer</strong> — All creator payments settle on Arc Network</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-300 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Balances unified via Circle Gateway</strong> — See total USDC across all chains in one view</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-300 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Chain complexity abstracted</strong> — Users see one unified USDC balance, not fragmented liquidity</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Why This Matters
              </h3>
              <ul className="space-y-4 text-blue-50">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-300 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>For Creators:</strong> Receive all payments on Arc (low fees ~$0.01, fast finality &lt;1s)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-300 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>For Customers:</strong> Pay from wherever your USDC lives — no forced bridging required</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-300 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>For the Ecosystem:</strong> Arc becomes the canonical settlement layer for multi-chain USDC commerce</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm text-blue-100 leading-relaxed">
                  <strong>Capital Efficiency:</strong> No manual bridging. No fragmented liquidity. Arc acts as the hub while users maintain assets on their preferred chains.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
            <p className="text-lg text-blue-50 leading-relaxed max-w-4xl mx-auto">
              <strong>Technical Implementation:</strong> UnifiedPay integrates Circle Gateway APIs to aggregate USDC balances across Ethereum, Polygon, Avalanche, and Base testnets. All payment settlements occur on Arc Network, establishing it as the primary liquidity hub for creator payments.
            </p>
          </div>
        </div>
      </section>

      {/* ENS Integration Section */}
      <section className="py-20 md:py-28 px-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-purple-100 dark:bg-purple-900/30 backdrop-blur-sm rounded-full border border-purple-200 dark:border-purple-800 mb-6">
              <span className="text-sm font-bold text-purple-700 dark:text-purple-300">🌐 ENS Integration</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">Human-Readable Payments with ENS</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              UnifiedPay replaces complex wallet addresses with ENS names across the entire platform
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border-2 border-purple-200 dark:border-purple-800 shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                  ✓
                </div>
                ENS Features Implemented
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong className="text-gray-900 dark:text-gray-100">Payment URLs:</strong>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1"><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">/pay/creator.eth</code> instead of <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">/pay/0x1234...</code></p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong className="text-gray-900 dark:text-gray-100">Transaction History:</strong>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Shows <strong>vitalik.eth</strong> paid you, not <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">0xd8dA...</code></p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong className="text-gray-900 dark:text-gray-100">Profile Display:</strong>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">ENS avatars and names displayed everywhere in the UI</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong className="text-gray-900 dark:text-gray-100">Dynamic Resolution:</strong>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Real-time ENS lookups, not hard-coded mappings</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-8 shadow-lg text-white">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  ✨
                </div>
                Before vs After
              </h3>
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-xs uppercase tracking-wider text-red-200 mb-2">❌ Before (Hex Address)</div>
                  <code className="text-sm break-all font-mono">
                    https://unifiedpay.com/pay/<br/>
                    0x742d35Cc6634C0532925a3b844Bc9e7595f0aEb0
                  </code>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-xs uppercase tracking-wider text-green-200 mb-2">✅ After (ENS Name)</div>
                  <code className="text-sm break-all font-mono">
                    https://unifiedpay.com/pay/alice.eth
                  </code>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/20">
                <p className="text-sm text-white/90 leading-relaxed">
                  <strong>ENS makes crypto payments feel like sending money to @username.</strong> Improved UX, better safety (verify names vs hex), and stronger web3 identity.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border-2 border-purple-200 dark:border-purple-800 text-center shadow-lg">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-4xl mx-auto">
              <strong>Technical Implementation:</strong> UnifiedPay integrates ENS resolution via ethers.js and Ethereum mainnet providers. The <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">ENSAddress</code> component dynamically resolves names to addresses, fetches ENS avatars from IPFS/HTTP, and performs reverse resolution for transaction senders. ENS data is cached for performance.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 px-4 bg-white dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">Why Choose UnifiedPay?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Chain-abstracted payments powered by Arc and ENS — the future of Web3 commerce
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group text-center p-6 rounded-xl border-2 border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Arc Settlement Layer</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                All payments settle on Arc Network — the USDC liquidity hub with &lt;$0.01 fees and &lt;1s finality.
              </p>
            </div>

            <div className="group text-center p-6 rounded-xl border-2 border-purple-300 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">ENS-Powered Identity</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Human-readable addresses everywhere. Pay alice.eth instead of 0x1234... with ENS avatars and names.
              </p>
            </div>

            <div className="group text-center p-6 rounded-xl border-2 border-green-300 dark:border-green-700 hover:border-green-400 dark:hover:border-green-600 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Unified USDC Balance</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                See total USDC across Ethereum, Polygon, Avalanche, and Base in one view via Circle Gateway.
              </p>
            </div>

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

      {/* Architecture Section */}
      <section className="py-20 md:py-28 px-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Technical Architecture</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              How Arc + ENS power chain-abstracted USDC payments
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 md:p-12 border border-white/10">
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-blue-300">User Wallet (Any Chain)</h3>
                  <p className="text-gray-300 leading-relaxed mb-2">
                    Customers hold USDC on <strong>Ethereum Sepolia</strong>, <strong>Polygon Amoy</strong>, <strong>Avalanche Fuji</strong>, or <strong>Base Sepolia</strong>
                  </p>
                  <div className="text-sm text-gray-400 mt-2">
                    → Users pay from wherever their USDC already lives
                  </div>
                </div>
              </div>

              <div className="border-l-2 border-blue-500/30 ml-6 h-8"></div>

              {/* Step 2 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-green-300">Circle Gateway (Balance Aggregation)</h3>
                  <p className="text-gray-300 leading-relaxed mb-2">
                    <strong>Circle Gateway API</strong> aggregates USDC balances across all chains
                  </p>
                  <div className="text-sm text-gray-400 mt-2">
                    → Provides unified "total USDC" view<br/>
                    → Read-only balance aggregation (no custody)
                  </div>
                </div>
              </div>

              <div className="border-l-2 border-green-500/30 ml-6 h-8"></div>

              {/* Step 3 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-xl font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-purple-300">Arc Network (Settlement Layer)</h3>
                  <p className="text-gray-300 leading-relaxed mb-2">
                    <strong>All creator payments settle on Arc Network</strong>
                  </p>
                  <div className="text-sm text-gray-400 mt-2">
                    → Low fees (~$0.01 per transaction)<br/>
                    → Fast finality (&lt;1 second)<br/>
                    → Acts as the <strong>USDC liquidity hub</strong> for multi-chain commerce
                  </div>
                </div>
              </div>

              <div className="border-l-2 border-purple-500/30 ml-6 h-8"></div>

              {/* Step 4 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-xl font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-pink-300">ENS Resolution (Human-Readable Identity)</h3>
                  <p className="text-gray-300 leading-relaxed mb-2">
                    <strong>ENS provides human-readable addresses throughout the platform</strong>
                  </p>
                  <div className="text-sm text-gray-400 mt-2">
                    → Resolves <code className="bg-white/10 px-2 py-1 rounded">creator.eth</code> → 0x address<br/>
                    → Displays sender ENS names in payment history<br/>
                    → Shows ENS avatars from IPFS/HTTP records
                  </div>
                </div>
              </div>

              <div className="border-l-2 border-pink-500/30 ml-6 h-8"></div>

              {/* Step 5 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-xl font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-yellow-300">Backend Verification (Payment Monitoring)</h3>
                  <p className="text-gray-300 leading-relaxed mb-2">
                    <strong>UnifiedPay backend monitors Arc Network for incoming payments</strong>
                  </p>
                  <div className="text-sm text-gray-400 mt-2">
                    → Verifies transactions on-chain via ethers.js<br/>
                    → Stores payment records in PostgreSQL<br/>
                    → Unlocks content access after verification
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-block bg-blue-500/10 border border-blue-500/30 rounded-xl px-8 py-6 max-w-4xl">
              <p className="text-lg text-gray-200 leading-relaxed">
                <strong className="text-blue-300">Result:</strong> Users experience a unified USDC payment system that abstracts chain complexity while maintaining non-custodial control. Arc serves as the liquidity hub, and ENS provides human-readable identity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Get Started</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Create your payment page in minutes and start accepting payments across chains
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

      {/* Technology Integration Section */}
      <section className="py-20 md:py-28 px-4 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full mb-6 shadow-lg">
              <span className="text-lg font-bold">🔧 Production-Ready Technology Stack</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">Core Technology Integration</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              UnifiedPay leverages Arc Network for chain abstraction and ENS for human-readable identity
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Arc Integration */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-4 border-blue-400 dark:border-blue-600 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-2xl">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Arc Network Integration</h3>
                    <p className="text-blue-100 text-sm">Chain Abstracted USDC Payments Using Arc as a Liquidity Hub</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">✅ What We Implemented:</h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <strong className="text-gray-900 dark:text-gray-100">Multi-chain USDC as unified liquidity surface</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Users can pay from Ethereum, Polygon, Avalanche, or Base</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <strong className="text-gray-900 dark:text-gray-100">Arc as primary settlement layer</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">All creator payments settle on Arc Network (low fees, fast finality)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <strong className="text-gray-900 dark:text-gray-100">Circle Gateway integration</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Unified USDC balance view across all supported chains</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <strong className="text-gray-900 dark:text-gray-100">Chain complexity abstracted</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Users don&apos;t need to know which chain they&apos;re on — Arc handles settlement</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <strong className="text-gray-900 dark:text-gray-100">Capital-efficient payments</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">No forced bridging required — pay from wherever USDC lives</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* ENS Prize */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-4 border-purple-400 dark:border-purple-600 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-2xl">
                    🏆
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">ENS Integration</h3>
                    <p className="text-purple-100 text-sm">Human-Readable Identity Layer</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">✅ What We Implemented:</h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <strong className="text-gray-900 dark:text-gray-100">ENS payment URLs</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1"><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">/pay/creator.eth</code> instead of <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">/pay/0x1234...</code></p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <strong className="text-gray-900 dark:text-gray-100">Dynamic ENS name resolution</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Real-time lookups via ethers.js, not hard-coded mappings</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <strong className="text-gray-900 dark:text-gray-100">ENS avatar display</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Profile pictures from IPFS/HTTP ENS records across the platform</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <strong className="text-gray-900 dark:text-gray-100">Reverse resolution in transaction history</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Shows sender ENS names automatically in payment records</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <strong className="text-gray-900 dark:text-gray-100">Improved payment UX and safety</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Human-readable names reduce errors and improve trust</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Technical Evidence */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 md:p-10 text-white shadow-2xl border border-gray-700">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">📋 Technical Evidence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-lg mb-3 text-blue-300">Arc Integration Points</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ <code className="bg-white/10 px-2 py-1 rounded">lib/chains.ts</code> — Arc Testnet configuration</li>
                  <li>✓ <code className="bg-white/10 px-2 py-1 rounded">lib/circle-gateway.ts</code> — Circle Gateway API client</li>
                  <li>✓ <code className="bg-white/10 px-2 py-1 rounded">app/api/balance/unified/route.ts</code> — Unified balance endpoint</li>
                  <li>✓ Arc Network as primary payment chain in production</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-3 text-purple-300">ENS Integration Points</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ <code className="bg-white/10 px-2 py-1 rounded">lib/ens.ts</code> — ENS resolution utilities</li>
                  <li>✓ <code className="bg-white/10 px-2 py-1 rounded">hooks/useENS.ts</code> — ENS React hooks</li>
                  <li>✓ <code className="bg-white/10 px-2 py-1 rounded">components/ens/ENSAddress.tsx</code> — ENS display component</li>
                  <li>✓ <code className="bg-white/10 px-2 py-1 rounded">app/pay/[wallet]/page.tsx</code> — ENS URL routing</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-700 text-center">
              <p className="text-lg text-gray-200 leading-relaxed max-w-4xl mx-auto">
                <strong>Production-Ready:</strong> UnifiedPay is deployed at <a href="https://unifiedpay.birangal.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">unifiedpay.birangal.com</a> with full Arc and ENS integration. All features are working and testable on Arc Testnet.
              </p>
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
