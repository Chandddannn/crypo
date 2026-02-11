"use client";

import { useState } from "react";
import { Trade } from "@/context/WalletContext";
import { formatCurrency } from "@/utils/format";

interface TradeHistoryProps {
  trades: Trade[];
  assetSymbol?: string;
}

export function TradeHistory({ trades, assetSymbol }: TradeHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter trades if assetSymbol is provided, otherwise show all
  const filteredTrades = assetSymbol 
    ? trades.filter(t => t.symbol.toLowerCase() === assetSymbol.toLowerCase())
    : trades;

  if (filteredTrades.length === 0) {
    return (
      <div className="glass-panel p-8 text-center transition-colors">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors">No activity found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 transition-colors">Recent Activity</h3>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 transition-colors">
            {filteredTrades.length} Transactions
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-200 hover:text-slate-900"
        >
          {isExpanded ? "Hide Details" : "Show Details"}
          <svg 
            className={`transition-transform duration-500 ${isExpanded ? "rotate-180" : ""}`} 
            xmlns="http://www.w3.org/2000/svg" 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
      </div>
      
      {isExpanded && (
        <div className="glass-panel overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-black uppercase tracking-widest transition-colors">
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Total (USD)</th>
                  {filteredTrades.some(t => t.realizedPnlUsd !== undefined) && (
                    <th className="px-6 py-4">PnL</th>
                  )}
                  <th className="px-6 py-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 transition-colors">
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 font-black uppercase text-[9px] shadow-sm ${
                        trade.type === "BUY" 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-rose-100 text-rose-700"
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 tabular-nums">
                      {formatCurrency(trade.priceUsd, trade.priceUsd < 1 ? 5 : 2)}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-500 tabular-nums">
                      {trade.quantity.toFixed(6)} {trade.symbol.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 tabular-nums">
                      {formatCurrency(trade.usdAmount)}
                    </td>
                    {filteredTrades.some(t => t.realizedPnlUsd !== undefined) && (
                      <td className="px-6 py-4">
                        {trade.realizedPnlUsd !== undefined ? (
                          <span className={`font-black tabular-nums ${trade.realizedPnlUsd >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {trade.realizedPnlUsd >= 0 ? "+" : ""}{formatCurrency(trade.realizedPnlUsd)}
                          </span>
                        ) : (
                          <span className="text-slate-200">-</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 text-right text-slate-400 font-black tabular-nums">
                      {new Date(trade.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}