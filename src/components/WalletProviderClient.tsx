"use client";

import React from "react";
import { WalletProvider } from "@/context/WalletContext";

export default function WalletProviderClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WalletProvider>{children}</WalletProvider>;
}

