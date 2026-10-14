import type { Metadata } from "next";
import "./globals.css";
import { Nunito } from "next/font/google";
import ThirdWebProvider from "@/components/providers/ThirdWebProvider";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { NetworkProvider } from "@/components/providers/NetworkProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import WalletDisconnectHandler from "@/components/auth/WalletDisconnectHandler";

// Rounded typeface for the claymorphism theme
const nunito = Nunito({ subsets: ["latin"], variable: "--font-clay", display: "swap" });

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
    <html lang="en" className={nunito.variable}>
      <body>
        <ThirdWebProvider>
          <NetworkProvider>
            <WalletProvider>
              <ToastProvider>
                <WalletDisconnectHandler />
                {children}
              </ToastProvider>
            </WalletProvider>
          </NetworkProvider>
        </ThirdWebProvider>
      </body>
    </html>
  );
}
