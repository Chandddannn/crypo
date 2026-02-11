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
    <div className="glass-panel flex flex-col gap-6 px-4 py-6 md:px-10 md:py-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl bg-white p-2 sm:p-2.5 shadow-sm ring-1 ring-slate-200 transition-colors">
            {asset.image?.large || asset.image?.small || asset.image?.thumb ? (
              <Image
                src={asset.image.large || asset.image.small || asset.image.thumb || ""}
                alt={`${asset.name} logo`}
                width={48}
                height={48}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-sm font-bold text-slate-900">{asset.symbol.slice(0, 4)}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white transition-colors">
                Rank #{asset.market_cap_rank ?? "–"}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 ring-1 ring-slate-200 transition-colors">
                Coin
              </span>
            </div>
            <h1 className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 md:text-4xl transition-colors">
              {asset.name}{" "}
              <span className="ml-1 text-lg sm:text-xl font-bold text-slate-400 transition-colors">
                {asset.symbol.toUpperCase()}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 transition-colors">
            Live Price
          </p>
          <div className="mt-1 flex flex-col items-end">
            <span className="text-2xl sm:text-3xl font-black tabular-nums tracking-tighter text-slate-900 md:text-4xl transition-colors">
              {formatCurrency(displayPrice, displayPrice < 1 ? 5 : 2)}
            </span>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${
                  isUp 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" 
                    : "bg-rose-500 text-white shadow-lg shadow-rose-100"
                }`}
              >
                {isUp ? "▲" : "▼"} {formatPct(Math.abs(priceChange))}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors">24H</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-4 transition-colors">
        {[
          { label: "Market Cap", value: formatCurrency(asset.market_data.market_cap.usd, 0) },
          { label: "24h Volume", value: formatCurrency(asset.market_data.total_volume.usd, 0) },
          { label: "Circ. Supply", value: `${formatNumber(asset.market_data.circulating_supply)} ${asset.symbol.toUpperCase()}` },
          { label: "All Time High", value: formatCurrency(asset.market_data.ath.usd, asset.market_data.ath.usd < 1 ? 5 : 2) },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 transition-colors">{stat.label}</p>
            <p className="text-xs sm:text-sm font-black text-slate-900 tabular-nums transition-colors">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
