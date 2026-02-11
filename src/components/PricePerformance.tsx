"use client";

import { formatCurrency, formatNumber } from "@/utils/format";

interface PricePerformanceProps {
  asset: {
    market_data: {
      current_price: { usd: number };
      high_24h: { usd: number };
      low_24h: { usd: number };
      ath: { usd: number };
      ath_date: { usd: string };
      atl: { usd: number };
      atl_date: { usd: string };
    };
  };
  currentPrice: number | null;
}

export function PricePerformance({ asset, currentPrice: livePrice }: PricePerformanceProps) {
  const data = asset.market_data;
  const currentPrice = livePrice ?? data.current_price.usd;
  
  // Dynamically update low/high if current price exceeds them
  const low24h = Math.min(data.low_24h.usd, currentPrice);
  const high24h = Math.max(data.high_24h.usd, currentPrice);

  // Calculate position of current price in 24h range (0 to 100)
  const rangePosition = Math.max(0, Math.min(100, 
    ((currentPrice - low24h) / (high24h - low24h)) * 100
  ));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays}d ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}m ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  const calculateChange = (current: number, target: number) => {
    const change = ((current - target) / target) * 100;
    return change;
  };

  const athChange = calculateChange(currentPrice, data.ath.usd);
  const atlChange = calculateChange(currentPrice, data.atl.usd);

  return (
    <div className="glass-panel flex flex-col h-full overflow-hidden transition-colors">
      <div className="px-6 py-5 border-b border-slate-100/50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 transition-colors">Price Performance</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 transition-colors">Live</span>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 space-y-8">
        {/* 24h Range */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors">24h Price Range</span>
            <div className="flex gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold uppercase text-slate-400 transition-colors">Low</span>
                <span className="text-xs font-black text-slate-900 tabular-nums transition-colors">{formatCurrency(low24h)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold uppercase text-slate-400 transition-colors">High</span>
                <span className="text-xs font-black text-slate-900 tabular-nums transition-colors">{formatCurrency(high24h)}</span>
              </div>
            </div>
          </div>
          
          <div className="relative pt-2 pb-6">
            <div className="relative h-3 w-full rounded-full bg-slate-100/50 shadow-inner overflow-hidden border border-slate-100 transition-colors">
              <div 
                className="absolute h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 opacity-90" 
                style={{ width: '100%' }}
              />
            </div>
            
            {/* Current Price Marker */}
            <div 
              className="absolute top-0 flex flex-col items-center transition-all duration-500 ease-out"
              style={{ left: `${rangePosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="h-5 w-1.5 bg-slate-900 rounded-full border-2 border-white shadow-md z-10 transition-colors" />
              <div className="mt-2 bg-slate-900 text-white font-black px-2 py-1 rounded shadow-xl whitespace-nowrap ring-1 ring-white/20 transition-colors">
                {formatCurrency(currentPrice)}
              </div>
            </div>
          </div>
        </div>

        {/* ATH & ATL Grid */}
        <div className="grid grid-cols-1 gap-3">
          {/* All-time High */}
          <div className="group relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-100">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 transition-colors">All-time high</span>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-black text-slate-900 tracking-tight transition-colors">{formatCurrency(data.ath.usd)}</span>
                  <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 transition-colors">
                    {athChange.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {formatDate(data.ath_date.usd)} <span className="text-slate-300">•</span> {getTimeAgo(data.ath_date.usd)}
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m19 9-7 7-7-7"/></svg>
              </div>
            </div>
          </div>

          {/* All-time Low */}
          <div className="group relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-100">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 transition-colors">All-time low</span>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-black text-slate-900 tracking-tight transition-colors">{formatCurrency(data.atl.usd)}</span>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 transition-colors">
                    +{formatNumber(atlChange, 0)}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {formatDate(data.atl_date.usd)} <span className="text-slate-300">•</span> {getTimeAgo(data.atl_date.usd)}
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 15 7-7 7 7"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}