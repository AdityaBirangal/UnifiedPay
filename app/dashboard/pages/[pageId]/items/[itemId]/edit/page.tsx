'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useWallet } from '@/components/wallet/WalletProvider';
import { useToast } from '@/components/ui/ToastProvider';

export default function EditPaymentItem() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.pageId as string;
  const itemId = params.itemId as string;
  const { walletAddress } = useWallet();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'fixed' as 'fixed' | 'open',
    priceUsdc: '',
    contentUrl: '',
  });

  useEffect(() => {
    const fetchItem = async () => {
      if (!walletAddress || !itemId) return;

      try {
        const response = await fetch(`/api/items/${itemId}?wallet=${walletAddress}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch payment item');
        }

        setFormData({
          title: data.item.title,
          description: data.item.description || '',
          type: data.item.type as 'fixed' | 'open',
          priceUsdc: data.item.priceUsdc || '',
          contentUrl: data.item.contentUrl || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [walletAddress, itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          priceUsdc: formData.type === 'fixed' ? formData.priceUsdc : undefined,
          contentUrl: formData.contentUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update payment item');
      }

      showToast('Payment item updated successfully!', 'success');
      // Redirect back to page
      router.push(`/dashboard/pages/${pageId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading payment item...</p>
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
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <Link
                href={`/dashboard/pages/${pageId}`}
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Page
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Edit Payment Item</h1>
              <p className="text-gray-600 dark:text-gray-400">Update your payment item details</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Item Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Optional: Add details about what customers receive</p>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Payment Type *
                </label>
                <select
                  id="type"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'fixed' | 'open', priceUsdc: formData.type === 'open' ? '' : formData.priceUsdc })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="open">Open Amount (Sells, Tips, Donations)</option>
                </select>
                <div className={`mt-2 p-3 rounded-lg ${
                  formData.type === 'fixed' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                    : 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                }`}>
                  <p className={`text-xs ${
                    formData.type === 'fixed' 
                      ? 'text-blue-700 dark:text-blue-300' 
                      : 'text-purple-700 dark:text-purple-300'
                  }`}>
                    {formData.type === 'fixed'
                      ? '✓ Customer pays a fixed amount to unlock content'
                      : '✓ Customer enters any amount (for sells, tips, donations, etc.)'}
                  </p>
                </div>
              </div>

              {formData.type === 'fixed' && (
                <div>
                  <label htmlFor="priceUsdc" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Price (USDC) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="priceUsdc"
                      required
                      step="0.01"
                      min="0"
                      value={formData.priceUsdc}
                      onChange={(e) => setFormData({ ...formData, priceUsdc: e.target.value })}
                      className="w-full px-4 py-3 pr-16 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                      USDC
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="contentUrl" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Content URL <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  id="contentUrl"
                  value={formData.contentUrl}
                  onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                  placeholder="https://example.com/premium-content"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  URL to unlock after payment (for fixed price items with content)
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
