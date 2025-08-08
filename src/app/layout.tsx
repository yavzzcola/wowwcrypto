import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import GlobalHeader from '@/components/GlobalHeader';
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: "GameChain AI - Next Generation Gaming Engine",
  description: "AI-Powered Gaming Engine with Blockchain Integration - Create, Play, Earn",
  keywords: "AI, Gaming, Blockchain, Meme Coin, GameChain, Web3, Gaming Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-rubik antialiased bg-primary-bg text-text-primary min-h-screen overflow-x-hidden matte-surface"
      >
        <div className="min-h-screen flex flex-col relative">
          {/* Global Header */}
          <GlobalHeader />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </div>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(26, 26, 26, 0.95)',
              color: '#f5f5f5',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0, 255, 255, 0.2)',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#121212',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#121212',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
