'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, isVisible, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30',
      border: 'border-2 border-green-300 dark:border-green-700',
      iconBg: 'bg-green-500',
      icon: 'text-green-600 dark:text-green-400',
      text: 'text-green-900 dark:text-green-100',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30',
      border: 'border-2 border-red-300 dark:border-red-700',
      iconBg: 'bg-red-500',
      icon: 'text-red-600 dark:text-red-400',
      text: 'text-red-900 dark:text-red-100',
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30',
      border: 'border-2 border-blue-300 dark:border-blue-700',
      iconBg: 'bg-blue-500',
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-900 dark:text-blue-100',
    },
  }[type];

  const icon = {
    success: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${styles.bg} ${styles.border} px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[320px] max-w-md backdrop-blur-sm animate-slide-in-right`}
      role="alert"
      aria-live="assertive"
    >
      <div className={`flex-shrink-0 w-10 h-10 ${styles.iconBg} rounded-full flex items-center justify-center text-white`}>
        {icon}
      </div>
      <p className={`flex-1 font-semibold ${styles.text}`}>{message}</p>
      <button
        onClick={onClose}
        className={`flex-shrink-0 w-6 h-6 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center justify-center ${styles.icon}`}
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
