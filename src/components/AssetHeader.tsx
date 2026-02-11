import Image from "next/image";
import { motion } from "framer-motion";
import { formatCurrency, formatNumber, formatPct } from "@/utils/format";

interface AssetHeaderProps {
  asset: {
    id: string;
    symbol: string;
    name: string;
    market_cap_rank: number | null;
    image?: {
      large?: string;
      small?: string;
      thumb?: string;
    };
    market_data: {
      current_price: { usd: number };
      market_cap: { usd: number };
      total_volume: { usd: number };
      circulating_supply: number;
      ath: { usd: number };
    };
  };
  currentPrice: number | null;
  priceChange: number;
  isUp: boolean;
}

export function AssetHeader({
  asset,
  currentPrice,
  priceChange,
  isUp,
}: AssetHeaderProps) {
  const displayPrice = currentPrice ?? asset.market_data.current_price.usd;

  return (
    <div className="glass-panel flex flex-col gap-6 px-6 py-6 md:px-10 md:py-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white dark:bg-white/5 p-2.5 shadow-sm ring-1 ring-slate-200 dark:ring-white/10 transition-colors">
            {asset.image?.large || asset.image?.small || asset.image?.thumb ? (
              <Image
                src={asset.image.large || asset.image.small || asset.image.thumb || ""}
                alt={`${asset.name} logo`}
                width={48}
                height={48}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-sm font-bold dark:text-white">{asset.symbol.slice(0, 4)}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-slate-900 dark:bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white dark:text-slate-900 transition-colors">
                Rank #{asset.market_cap_rank ?? "–"}
              </span>
              <span className="rounded-md bg-slate-100 dark:bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-white/10 transition-colors">
                Coin
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl transition-colors">
              {asset.name}{" "}
              <span className="ml-1 text-xl font-bold text-slate-300 dark:text-slate-500 transition-colors">
                {asset.symbol.toUpperCase()}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-300 transition-colors">
            Live Price
          </p>
          <div className="mt-1 flex flex-col items-end">
            <span className="text-3xl font-black tabular-nums tracking-tighter text-slate-900 dark:text-white md:text-4xl transition-colors">
              {formatCurrency(displayPrice, displayPrice < 1 ? 5 : 2)}
            </span>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${
                  isUp 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-none" 
                    : "bg-rose-500 text-white shadow-lg shadow-rose-100 dark:shadow-none"
                }`}
              >
                {isUp ? "▲" : "▼"} {formatPct(Math.abs(priceChange))}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300 transition-colors">24H</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-white/10 pt-6 sm:grid-cols-4 transition-colors">
        {[
          { label: "Market Cap", value: formatCurrency(asset.market_data.market_cap.usd, 0) },
          { label: "24h Volume", value: formatCurrency(asset.market_data.total_volume.usd, 0) },
          { label: "Circulating Supply", value: formatNumber(asset.market_data.circulating_supply, 0) },
          { label: "All-Time High", value: formatCurrency(asset.market_data.ath.usd, asset.market_data.ath.usd < 1 ? 5 : 2) },
        ].map((stat, i) => (
          <div key={i} className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300 transition-colors">{stat.label}</p>
            <p className="text-sm font-black tabular-nums text-slate-800 dark:text-white transition-colors">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
