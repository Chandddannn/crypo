import { formatCurrency } from "@/utils/format";

interface WalletQuickViewProps {
  position: {
    quantity: number;
    avgBuyPriceUsd: number;
  } | undefined;
  symbol: string;
  unrealizedPnl: number;
}

export function WalletQuickView({
  position,
  symbol,
  unrealizedPnl,
}: WalletQuickViewProps) {
  return (
    <div className="glass-panel p-6 transition-colors">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-colors">Your Position</p>
      {position && position.quantity > 0 ? (
        <div className="mt-4 space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tabular-nums text-slate-900 transition-colors">{position.quantity.toFixed(6)}</span>
            <span className="text-xs font-black text-slate-400 transition-colors">{symbol.toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 transition-colors">
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 transition-colors">Avg. Buy</p>
              <p className="text-xs font-black text-slate-700 transition-colors">{formatCurrency(position.avgBuyPriceUsd)}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 transition-colors">Unrealized P&L</p>
              <p className={`text-xs font-black ${unrealizedPnl >= 0 ? "text-emerald-600" : "text-rose-600"} transition-colors`}>
                {unrealizedPnl >= 0 ? "+" : ""}{formatCurrency(unrealizedPnl)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 italic transition-colors">No open position in this asset.</p>
      )}
    </div>
  );
}