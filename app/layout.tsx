import type { Metadata } from "next";
import "./globals.css";
import ThirdWebProvider from "@/components/providers/ThirdWebProvider";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import WalletDisconnectHandler from "@/components/auth/WalletDisconnectHandler";

export const metadata: Metadata = {
  title: "UnifiedPay - Accept USDC Payments on Arc Network",
  description: "The easiest way to accept USDC payments on Arc Network",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThirdWebProvider>
          <WalletProvider>
            <ToastProvider>
              <WalletDisconnectHandler />
              {children}
            </ToastProvider>
          </WalletProvider>
        </ThirdWebProvider>
      </body>
    </html>
  );
}
