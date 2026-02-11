"use client";

import React from "react";

interface MobileActionToolbarProps {
  onBuyClick: () => void;
  onSellClick: () => void;
  symbol: string;
}

export function MobileActionToolbar({ onBuyClick, onSellClick, symbol }: MobileActionToolbarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white/80 p-4 pb-8 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-md gap-3">
        <button
          onClick={onBuyClick}
          className="flex-1 rounded-2xl bg-emerald-500 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
        >
          Buy {symbol.toUpperCase()}
        </button>
        <button
          onClick={onSellClick}
          className="flex-1 rounded-2xl bg-rose-500 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-rose-500/20 active:scale-[0.98]"
        >
          Sell {symbol.toUpperCase()}
        </button>
      </div>
    </div>
  );
}
