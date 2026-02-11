"use client";

import { formatCurrency, formatNumber } from "@/utils/format";

interface MarketMetricsProps {
  asset: {
    market_data: {
      market_cap: { usd: number };
      fully_diluted_valuation: { usd: number };
      total_volume: { usd: number };
      circulating_supply: number;
      total_supply: number;
      max_supply: number;
      market_cap_rank: number;
    };
  };
}

export function MarketMetrics({ asset }: MarketMetricsProps) {
  const data = asset.market_data;

  const metrics = [
    {
      label: "Market Cap",
      value: formatCurrency(data.market_cap.usd),
      rank: data.market_cap_rank ? `#${data.market_cap_rank}` : null,
      tooltip: "The total market value of a cryptocurrency's circulating supply."
    },
    {
      label: "Fully Diluted Valuation",
      value: data.fully_diluted_valuation.usd > 0 ? formatCurrency(data.fully_diluted_valuation.usd) : "N/A",
      tooltip: "The market cap if the max supply was in circulation."
    },
    {
      label: "24h Trading Volume",
      value: formatCurrency(data.total_volume.usd),
      tooltip: "A measure of how much of a cryptocurrency was traded in the last 24 hours."
    },
    {
      label: "Circulating Supply",
      value: `${formatNumber(data.circulating_supply, 0)} ${asset.market_data.market_cap.usd > 0 ? "" : ""}`,
      percentage: data.max_supply > 0 ? (data.circulating_supply / data.max_supply) * 100 : null,
      tooltip: "The amount of coins that are circulating in the market and are in public hands."
    },
    {
      label: "Total Supply",
      value: data.total_supply > 0 ? formatNumber(data.total_supply, 0) : "N/A",
      tooltip: "The amount of coins that have already been created, minus any coins that have been burned."
    },
    {
      label: "Max Supply",
      value: data.max_supply > 0 ? formatNumber(data.max_supply, 0) : "∞",
      tooltip: "The maximum amount of coins that will ever exist in the lifetime of the cryptocurrency."
    }
  ];

  return (
    <div className="glass-panel overflow-hidden transition-colors">
      <div className="px-6 py-5 border-b border-slate-100/50 dark:border-white/10 transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white transition-colors">Market Analytics</h3>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric, i) => (
            <div key={i} className="group flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300 group-hover:text-slate-600 dark:group-hover:text-white transition-colors">
                    {metric.label}
                  </span>
                  <div className="relative inline-block group/tooltip">
                    <svg className="cursor-help text-slate-300 dark:text-slate-400 transition-colors hover:text-slate-400 dark:hover:text-slate-300" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 scale-0 rounded-lg bg-slate-900 dark:bg-slate-800 px-3 py-2 text-[10px] font-bold leading-relaxed text-white opacity-0 transition-all group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100 z-50 shadow-2xl pointer-events-none ring-1 ring-white/10">
                      {metric.tooltip}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
                    </div>
                  </div>
                </div>
                {metric.rank && (
                  <span className="rounded-md bg-slate-900 dark:bg-white px-2 py-0.5 text-[9px] font-black text-white dark:text-slate-950 shadow-sm transition-colors">
                    {metric.rank}
                  </span>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight tabular-nums transition-colors">
                  {metric.value}
                </span>
                {metric.percentage !== null && metric.percentage !== undefined && (
                  <div className="space-y-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5 border border-slate-50 dark:border-white/10 transition-colors">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(99,102,241,0.4)]" 
                        style={{ width: `${Math.min(100, metric.percentage)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-tighter transition-colors">
                        Supply Progress
                      </span>
                      <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 tabular-nums transition-colors">
                        {metric.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
