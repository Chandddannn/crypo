"use client";

"use client";

import { useEffect, useState, useRef } from "react";
import { getBinanceSymbol } from "@/utils/binance";
import { formatCurrency, formatNumber } from "@/utils/format";

interface PublicTrade {
  id: number;
  price: number;
  quantity: number;
  time: number;
  isBuyerMaker: boolean;
}

interface PublicTradesProps {
  assetId: string;
  symbol: string;
}

export function PublicTrades({ assetId, symbol }: PublicTradesProps) {
  const [buys, setBuys] = useState<PublicTrade[]>([]);
  const [sells, setSells] = useState<PublicTrade[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const binanceSymbol = getBinanceSymbol(assetId);
    if (!binanceSymbol) return;

    const url = `wss://stream.binance.com/ws/${binanceSymbol.toLowerCase()}@trade`;
    
    const connect = () => {
      if (ws.current?.readyState === WebSocket.OPEN) return;

      const socket = new WebSocket(url);
      ws.current = socket;

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.e === "trade") {
            const isSell = data.m;
            const newTrade: PublicTrade = {
              id: data.t,
              price: parseFloat(data.p),
              quantity: parseFloat(data.q),
              time: data.T,
              isBuyerMaker: data.m,
            };

            if (isSell) {
              setSells((prev) => [newTrade, ...prev].slice(0, 4));
            } else {
              setBuys((prev) => [newTrade, ...prev].slice(0, 4));
            }
          }
        } catch (err) {
          console.error("Error parsing public trade:", err);
        }
      };

      socket.onclose = () => {
        if (ws.current === socket) {
          setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
        ws.current = null;
      }
    };
  }, [assetId]);

  const renderColumn = (trades: PublicTrade[], isSell: boolean) => (
    <div className="flex flex-1 flex-col divide-y divide-slate-100/30 dark:divide-white/10 transition-colors">
      <div className={`px-6 py-3 border-b dark:border-white/10 transition-colors ${isSell ? 'bg-rose-500/10 dark:bg-rose-500/5' : 'bg-emerald-500/10 dark:bg-emerald-500/5'}`}>
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isSell ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
          {isSell ? 'Sell Orders' : 'Buy Orders'}
        </span>
      </div>
      {trades.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-200 animate-pulse uppercase tracking-[0.3em]">Waiting for data...</span>
        </div>
      ) : (
        trades.map((trade) => (
          <div key={trade.id} className="flex flex-1 items-center justify-between px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
            <span className={`text-xl md:text-2xl font-black tabular-nums tracking-tighter transition-colors ${isSell ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
              {formatCurrency(trade.price, trade.price < 1 ? 5 : 2)}
            </span>
            
            <div className="flex flex-col items-end">
              <span className="text-sm md:text-base font-black tabular-nums tracking-tighter text-slate-900 dark:text-white transition-colors">
                {formatNumber(trade.quantity, 4)}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest transition-colors">
                {symbol.toUpperCase()}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="glass-panel flex flex-col h-full min-h-[400px] overflow-hidden transition-colors">
      <div className="flex flex-1 divide-x divide-slate-100/50 dark:divide-white/5 transition-colors">
        {renderColumn(sells, true)}
        {renderColumn(buys, false)}
      </div>
      
      <div className="bg-slate-900 dark:bg-slate-800/50 px-6 py-3 flex items-center justify-between transition-colors border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/90 transition-colors">Live Binance Feed</span>
          </div>
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 dark:text-slate-400 transition-colors">{symbol.toUpperCase()} / USDT</span>
      </div>
    </div>
  );
}
