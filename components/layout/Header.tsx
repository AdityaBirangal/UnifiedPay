'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ConnectWallet from '@/components/wallet/ConnectWallet';
import { useActiveAccount } from 'thirdweb/react';

export default function Header() {
  const account = useActiveAccount();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  const isActive = (path: string) => pathname === path;

  const navLinks = account
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/purchases', label: 'Purchases', icon: '🛒' },
      ]
    : [];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm'
            : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'
        }`}
        role="banner"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 group"
              aria-label="UnifiedPay Home"
            >
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="UnifiedPay Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain transition-transform group-hover:scale-110"
                  priority
                />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                UnifiedPay
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav
              className="hidden md:flex items-center gap-1 lg:gap-2"
              role="navigation"
              aria-label="Main navigation"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  aria-label={link.label}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Connect */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex-shrink-0">
                <ConnectWallet />
              </div>
            </div>

            {/* Mobile: Menu Button (WalletInfo shown in drawer) */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
        </div>
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl md:hidden transform transition-transform duration-300 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image
                  src="/logo.png"
                  alt="UnifiedPay Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                UnifiedPay
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Content */}
          <nav className="flex-1 overflow-y-auto p-4" role="navigation">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  aria-label={link.label}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Connect Wallet */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 px-4">
              <ConnectWallet />
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
