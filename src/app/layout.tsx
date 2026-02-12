"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WalletProviderClient from "@/components/WalletProviderClient";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // Suppress hydration warnings from browser extensions
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("data-new-gr-c-s-check-loaded")
      ) {
        return;
      }
      originalError.apply(console, args);
    };
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden w-full bg-white relative min-h-screen`}
        suppressHydrationWarning
      >
        {/* Global Abstract Cat Decorations */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
          {/* Top Left */}
          <div className="absolute top-[5%] left-[-2%] text-[240px] opacity-[0.02] rotate-[-15deg] grayscale transition-transform duration-1000 hover:scale-110">
            🐈
          </div>
          {/* Mid Right */}
          <div className="absolute top-[30%] right-[-5%] text-[320px] opacity-[0.015] rotate-[10deg] grayscale">
            🐾
          </div>
          {/* Bottom Left */}
          <div className="absolute bottom-[10%] left-[-3%] text-[280px] opacity-[0.02] rotate-[20deg] grayscale">
            🧶
          </div>
          {/* Bottom Right */}
          <div className="absolute bottom-[-5%] right-[5%] text-[200px] opacity-[0.01] rotate-[-5deg] grayscale">
            🐟
          </div>
          {/* Floating small ones */}
          <div className="absolute top-[15%] right-[20%] text-[40px] opacity-[0.03] rotate-[45deg] grayscale">
            🐾
          </div>
          <div className="absolute bottom-[40%] left-[15%] text-[30px] opacity-[0.02] rotate-[-30deg] grayscale">
            🐈
          </div>
          <div className="absolute top-[60%] right-[10%] text-[50px] opacity-[0.02] rotate-[15deg] grayscale">
            🧶
          </div>
        </div>

        <div className="relative z-10">
          <WalletProviderClient>
            {!isAdminRoute && <Header />}
            {children}
          </WalletProviderClient>
        </div>
      </body>
    </html>
  );
}
