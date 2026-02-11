"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useWallet } from "@/context/WalletContext";

interface Asset {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  image?: string;
  priceUsd: string;
  changePercent24Hr: string;
  marketCapUsd: string;
}

interface PriceFlashState {
  direction: "up" | "down";
}

type PriceFlashMap = Record<string, PriceFlashState | undefined>;

const DEMO_ASSETS: Asset[] = [
  {
    id: "bitcoin",
    rank: "1",
    symbol: "BTC",
    name: "Bitcoin",
    image: "",
    priceUsd: "64000",
    changePercent24Hr: "1.23",
    marketCapUsd: "1200000000000",
  },
  {
    id: "ethereum",
    rank: "2",
    symbol: "ETH",
    name: "Ethereum",
    image: "",
    priceUsd: "3200",
    changePercent24Hr: "-0.75",
    marketCapUsd: "400000000000",
  },
  {
    id: "tether",
    rank: "3",
    symbol: "USDT",
    name: "Tether",
    image: "",
    priceUsd: "1.0",
    changePercent24Hr: "0.01",
    marketCapUsd: "90000000000",
  },
];

export default function Home() {
  const router = useRouter();
  const { 
    balanceUsd, 
    updatePrice, 
    ownerName, 
    user, 
    prices, 
    subscribeToPrice, 
    unsubscribeFromPrice 
  } = useWallet();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceFlashes, setPriceFlashes] = useState<PriceFlashMap>({});
  const [loadingBatchLabel, setLoadingBatchLabel] = useState<string | null>(null);

  const lastPricesRef = useRef<Record<string, number>>({});

  // Initial REST fetch
  useEffect(() => {
    let cancelled = false;

    const fetchAssets = async () => {
      try {
        setLoading(true);

        const url = "/api/binance/market";

        setLoadingBatchLabel("Loading Binance assets…");
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Failed to load Binance markets");
        }
        const normalized = await res.json() as Asset[];

        if (!cancelled) {
          // Prime wallet prices and lastPricesRef
          normalized.forEach((asset) => {
            const price = parseFloat(asset.priceUsd);
            if (Number.isFinite(price) && price > 0) {
              updatePrice(asset.id, price);
              lastPricesRef.current[asset.id] = price;
            }
          });
          setAssets(normalized);
        }
      } catch (e) {
        if (!cancelled) {
          // Fall back to a small demo dataset so the UI remains usable
          setAssets(DEMO_ASSETS);
          setError(
            e instanceof Error
              ? `Live data unavailable: ${e.message}. Showing demo data.`
              : "Live data unavailable. Showing demo data.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingBatchLabel(null);
        }
      }
    };

    fetchAssets();
    return () => {
      cancelled = true;
    };
  }, []);

  // Subscribe to all assets for live prices
  useEffect(() => {
    if (assets.length === 0) return;
    
    assets.forEach(asset => {
      subscribeToPrice(asset.id);
    });

    return () => {
      assets.forEach(asset => {
        unsubscribeFromPrice(asset.id);
      });
    };
  }, [assets.length, subscribeToPrice, unsubscribeFromPrice]);

  // Handle price flashes when WebSocket prices update
  useEffect(() => {
    const assetIds = Object.keys(prices);
    if (assetIds.length === 0) return;

    assetIds.forEach((id) => {
      const newPrice = prices[id];
      const oldPrice = lastPricesRef.current[id];

      if (oldPrice !== undefined && newPrice !== oldPrice && oldPrice > 0) {
        const direction: "up" | "down" = newPrice >= oldPrice ? "up" : "down";

        setPriceFlashes((prev) => ({
          ...prev,
          [id]: { direction },
        }));

        setTimeout(() => {
          setPriceFlashes((current) => {
            const copy = { ...current };
            delete copy[id];
            return copy;
          });
        }, 450);
      }
      
      // Update ref for next comparison
      lastPricesRef.current[id] = newPrice;
    });
  }, [prices]);

  // WebSocket live prices
  useEffect(() => {
    if (assets.length === 0) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const url = "/api/binance/market";
        const res = await fetch(url);
        if (!res.ok) return;
        const json = (await res.json()) as Asset[];

        if (cancelled) return;

        // Derive updates outside of setState to avoid cross-component updates during render
        if (!assets.length) return;

        const prevById = new Map(assets.map((a) => [a.id, a]));

        const updated: Asset[] = json.map((mapped) => {
          // Update ref if polling brings a new price
          const p = parseFloat(mapped.priceUsd);
          if (Number.isFinite(p) && p > 0) {
            lastPricesRef.current[mapped.id] = p;
          }
          return mapped;
        });

        setAssets(updated);
      } catch {
        // ignore polling errors
      }
    };

    const interval = window.setInterval(poll, 30000); // Poll less frequently, e.g., every 30s

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [assets.length, updatePrice]);

  const sortedAssets = useMemo(
    () =>
      [...assets].sort(
        (a, b) => parseInt(a.rank, 10) - parseInt(b.rank, 10),
      ),
    [assets],
  );

  const formatCurrency = (value: string | number, digits = 2) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (!Number.isFinite(num)) return "-";
    return num.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: digits,
    });
  };

  const formatPct = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (!Number.isFinite(num)) return "-";
    return `${num.toFixed(2)}%`;
  };

  return (
    <main className="min-h-screen px-4 py-8 md:px-10 lg:px-16 bg-white transition-colors">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500 transition-colors">
              Virtual Crypto Desk
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl transition-colors">
              CoinSwitch Market Watch
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-slate-600 transition-colors">
              Stream real-time prices from Binance and practice trading with a
              simulated USD wallet.
            </p>
          </div>
        </header>

        <section className="glass-panel overflow-hidden transition-colors">
          <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4 transition-colors">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] transition-colors">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]" />
              Live Market Dashboard
            </div>
            <span className="rounded-md bg-emerald-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-700 ring-1 ring-emerald-100 transition-colors">
              WebSocket · Realtime
            </span>
          </div>

          <div className="max-h-[640px] overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50/90 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 backdrop-blur transition-colors">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-3 py-4">Asset</th>
                  <th className="px-3 py-4">Symbol</th>
                  <th className="px-3 py-4 text-right">Live Price</th>
                  <th className="px-6 py-4 text-right">24h Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 transition-colors">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <span className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors">
                          {loadingBatchLabel ?? "Loading live market data…"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedAssets.map((asset) => {
                    const livePriceValue = prices[asset.id] ?? parseFloat(asset.priceUsd);
                    const pct = parseFloat(asset.changePercent24Hr);
                    const flash = priceFlashes[asset.id];

                    return (
                      <tr
                        key={asset.id}
                        onClick={() => router.push(`/coin/${asset.id}`)}
                        className="group cursor-pointer bg-white text-sm text-slate-700 transition-all hover:bg-slate-50/80"
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-[10px] font-black text-slate-400 transition-colors">
                          #{asset.rank}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-[10px] font-black text-slate-600 transition-colors">
                              {asset.image ? (
                                <Image
                                  src={asset.image}
                                  alt={`${asset.name} logo`}
                                  width={32}
                                  height={32}
                                  className="h-8 w-8 object-contain"
                                />
                              ) : (
                                <span className="uppercase tracking-tighter">{asset.symbol.slice(0, 4)}</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 transition-colors">
                                {asset.name}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 tabular-nums transition-colors">
                                Mkt Cap: {formatCurrency(asset.marketCapUsd, 0)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-600 uppercase tracking-widest transition-colors group-hover:bg-slate-200">
                            {asset.symbol}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-right">
                          <motion.div
                            initial={false}
                            animate={
                              flash
                                ? {
                                    backgroundColor:
                                      flash.direction === "up"
                                        ? "rgba(16, 185, 129, 0.15)"
                                        : "rgba(244, 63, 94, 0.15)",
                                    scale: [1, 1.05, 1],
                                  }
                                : {
                                    backgroundColor: "rgba(255, 255, 255, 0)",
                                    scale: 1,
                                  }
                            }
                            className="inline-block rounded-md px-2 py-1 font-black text-sm text-slate-900 tabular-nums transition-colors"
                          >
                            {formatCurrency(
                              livePriceValue,
                              livePriceValue < 1 ? 5 : 2,
                            )}
                          </motion.div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`inline-flex min-w-[80px] items-center justify-end rounded-md px-2.5 py-1 text-[10px] font-black tabular-nums transition-colors ${
                              pct >= 0
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {pct >= 0 ? "+" : ""}
                            {formatPct(pct)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
