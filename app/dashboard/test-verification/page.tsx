'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useWallet } from '@/components/wallet/WalletProvider';
import { useActiveAccount } from 'thirdweb/react';

export default function TestVerificationPage() {
  const { walletAddress } = useWallet();
  const account = useActiveAccount();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Test 1: Verify a specific transaction
  const [txHash, setTxHash] = useState('');
  const [recipientAddress, setRecipientAddress] = useState(walletAddress || '');
  const [expectedAmount, setExpectedAmount] = useState('');

  // Test 2: Scan for payments
  const [scanWallet, setScanWallet] = useState(walletAddress || '');
  const [fromBlock, setFromBlock] = useState('');
  const [toBlock, setToBlock] = useState('');

  const handleVerify = async () => {
    if (!txHash || !recipientAddress) {
      setError('Transaction hash and recipient address are required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txHash,
          recipientAddress,
          expectedAmount: expectedAmount || undefined,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyByHash = async () => {
    if (!txHash || !recipientAddress) {
      setError('Transaction hash and recipient address are required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const url = `/api/payments/verify/${txHash}?recipient=${encodeURIComponent(recipientAddress)}${expectedAmount ? `&amount=${expectedAmount}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    if (!scanWallet) {
      setError('Wallet address is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/payments/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: scanWallet,
          fromBlock: fromBlock ? parseInt(fromBlock) : undefined,
          toBlock: toBlock ? parseInt(toBlock) : undefined,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Test Payment Verification</h1>
              <p className="text-gray-600 dark:text-gray-400">Test blockchain payment verification and scanning functionality</p>
            </div>

            <div className="space-y-6">
              {/* Test 1: Verify Transaction */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Verify a Transaction</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Transaction Hash *
                    </label>
                    <input
                      type="text"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors font-mono"
                      placeholder="0x..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Recipient Address *
                    </label>
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors font-mono"
                      placeholder="0x..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Expected Amount (wei, optional)
                    </label>
                    <input
                      type="text"
                      value={expectedAmount}
                      onChange={(e) => setExpectedAmount(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                      placeholder="Leave empty for open payments"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Optional: Specify expected amount in wei for validation</p>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={handleVerify}
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verify (POST)
                    </button>
                    <button
                      onClick={handleVerifyByHash}
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verify (GET)
                    </button>
                  </div>
                </div>
              </div>

              {/* Test 2: Scan Blockchain */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400">2</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Scan Blockchain for Payments</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Creator Wallet Address *
                    </label>
                    <input
                      type="text"
                      value={scanWallet}
                      onChange={(e) => setScanWallet(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors font-mono"
                      placeholder="0x..."
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        From Block (optional)
                      </label>
                      <input
                        type="number"
                        value={fromBlock}
                        onChange={(e) => setFromBlock(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                        placeholder="Auto: last 1000 blocks"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        To Block (optional)
                      </label>
                      <input
                        type="number"
                        value={toBlock}
                        onChange={(e) => setToBlock(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                        placeholder="Auto: current block"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleScan}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Scan Blockchain
                  </button>
                </div>
              </div>

              {/* Results */}
              {(result || error) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Results</h2>
                  </div>
                  {error && (
                    <div className="mb-4 p-5 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <p className="text-red-900 dark:text-red-100 font-bold">Error</p>
                      </div>
                      <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  )}
                  {result && (
                    <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                      <pre className="text-sm overflow-auto font-mono text-gray-900 dark:text-gray-100">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">How to Test</h3>
                </div>
                <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <li>
                    <strong className="text-gray-900 dark:text-gray-100">Make a test payment:</strong> Go to a payment page and make a payment to get a transaction hash
                  </li>
                  <li>
                    <strong className="text-gray-900 dark:text-gray-100">Verify the payment:</strong> Use the transaction hash from step 1 to verify it on-chain
                  </li>
                  <li>
                    <strong className="text-gray-900 dark:text-gray-100">Scan for payments:</strong> Enter your wallet address to scan for any unrecorded payments
                  </li>
                  <li>
                    <strong className="text-gray-900 dark:text-gray-100">Check results:</strong> Review the verification results and any matched/unmatched payments
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
