"use client";

import { useParams } from "next/navigation";
import { TradingCard } from "@/components/TradingCard";
import { TradeHistory } from "@/components/TradeHistory";
import { PublicTrades } from "@/components/PublicTrades";
import { PricePerformance } from "@/components/PricePerformance";
import { MarketMetrics } from "@/components/MarketMetrics";
import { AssetHeader } from "@/components/AssetHeader";
import { PriceChart } from "@/components/PriceChart";
import { ROICalculator } from "@/components/ROICalculator";
import { WalletQuickView } from "@/components/WalletQuickView";
import { MobileActionToolbar } from "@/components/MobileActionToolbar";
import { useCoinDetails } from "@/hooks/useCoinDetails";
import { useState } from "react";

export default function CoinDetailPage() {
  const params = useParams<{ id: string }>();
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeMode, setTradeMode] = useState<"BUY" | "SELL">("BUY");

  const {
    asset,
    range,
    setRange,
    loading,
    error,
    chartLoading,
    chartError,
    loadHistory,
    currentPrice,
    priceChange,
    chartData,
    formatXAxis,
    position,
    unrealizedPnl,
    detailsExpanded,
    setDetailsExpanded,
    roiAmount,
    setRoiAmount,
    roiTime,
    setRoiTime,
    calculatedRoi,
    trades,
    RANGES,
  } = useCoinDetails(params?.id);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 bg-white transition-colors">
        <div className="glass-panel flex max-w-md flex-col items-center gap-3 px-6 py-6 text-sm text-slate-600 transition-colors">
          <span className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
          <p className="font-bold uppercase tracking-widest text-[10px]">
            Loading coin details…
          </p>
        </div>
      </main>
    );
  }

  if (error || !asset) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 bg-white transition-colors">
        <div className="glass-panel max-w-md px-6 py-6 text-sm text-rose-600 font-bold uppercase tracking-widest text-[10px] transition-colors">
          {error ?? "Coin not found."}
        </div>
      </main>
    );
  }

  const isUp = priceChange >= 0;

  return (
    <main className="relative min-h-screen px-4 pb-32 pt-12 md:px-10 lg:px-16 bg-white transition-colors">
      <div className="mx-auto max-w-7xl">
        {/* Top Navigation */}
        <div className="mb-10 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-all hover:text-slate-900"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-all group-hover:-translate-x-1 group-hover:bg-slate-50">
              <svg
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
                <path d="m15 18-6-6 6-6" />
              </svg>
            </div>
            Back to Market
          </button>
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-100 transition-colors">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 transition-colors">
              Live Market Active
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_380px]">
          <div className="min-w-0 space-y-8">
            <AssetHeader
              asset={asset}
              currentPrice={currentPrice}
              priceChange={priceChange}
              isUp={isUp}
            />

            <PriceChart
              range={range}
              setRange={setRange}
              ranges={RANGES}
              chartLoading={chartLoading}
              chartError={chartError}
              loadHistory={loadHistory}
              chartData={chartData}
              formatXAxis={formatXAxis}
            />

            <div className="lg:hidden">
              <WalletQuickView
                position={position}
                symbol={asset.symbol}
                unrealizedPnl={unrealizedPnl}
              />
            </div>

            <div className="grid gap-8">
              <TradeHistory trades={trades} assetSymbol={asset.symbol} />

              {/* Public Trades - Full Width */}
              <PublicTrades assetId={asset.id} symbol={asset.symbol} />

              {/* Calculator and Price Performance - Side by Side */}
              <div className="grid gap-8 lg:grid-cols-2">
                <ROICalculator
                  roiAmount={roiAmount}
                  setRoiAmount={setRoiAmount}
                  roiTime={roiTime}
                  setRoiTime={setRoiTime}
                  ranges={RANGES}
                  calculatedRoi={calculatedRoi}
                />
                <PricePerformance asset={asset} currentPrice={currentPrice} />
              </div>

              <MarketMetrics asset={asset} />
            </div>

            {asset.description?.en && (
              <div className="glass-panel overflow-hidden transition-colors">
                <div className="px-6 py-5 border-b border-slate-100/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 transition-colors">
                      About {asset.name}
                    </h3>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <div
                    className={`relative overflow-hidden transition-all duration-500 ${detailsExpanded ? "max-h-[2000px]" : "max-h-32"}`}
                  >
                    <div
                      className="prose prose-sm max-w-none text-slate-600 leading-relaxed font-medium transition-colors"
                      dangerouslySetInnerHTML={{ __html: asset.description.en }}
                    />
                    {!detailsExpanded && (
                      <div className="absolute bottom-0 left-0 h-20 w-full bg-gradient-to-t from-white/95 via-white/50 to-transparent transition-colors" />
                    )}
                  </div>
                  <button
                    onClick={() => setDetailsExpanded(!detailsExpanded)}
                    className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 transition-all hover:text-indigo-700"
                  >
                    {detailsExpanded
                      ? "Collapse Details"
                      : "Read Full Description"}
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 transition-all duration-500 ${detailsExpanded ? "rotate-180" : ""}`}
                    >
                      <svg
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
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-12 space-y-8">
              <TradingCard
                assetId={asset.id}
                symbol={asset.symbol}
                name={asset.name}
                currentPriceUsd={
                  currentPrice ?? asset.market_data.current_price.usd
                }
              />
              <WalletQuickView
                position={position}
                symbol={asset.symbol}
                unrealizedPnl={unrealizedPnl}
              />
            </div>
          </aside>
        </div>
      </div>

      <MobileActionToolbar
        symbol={asset.symbol}
        onBuyClick={() => {
          setTradeMode("BUY");
          setIsTradeModalOpen(true);
        }}
        onSellClick={() => {
          setTradeMode("SELL");
          setIsTradeModalOpen(true);
        }}
      />

      {/* Trade Modal for Mobile */}
      {isTradeModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/60 backdrop-blur-md lg:hidden">
          <div
            className="absolute inset-0"
            onClick={() => setIsTradeModalOpen(false)}
          />
          <div className="relative w-full max-h-[90vh] overflow-hidden rounded-t-[32px] bg-white p-1 animate-in slide-in-from-bottom duration-300 flex flex-col">
            <div className="mx-auto mb-2 mt-3 h-1.5 w-12 rounded-full bg-slate-200 flex-shrink-0" />
            <div className="flex-1 overflow-hidden">
              <TradingCard
                assetId={asset.id}
                symbol={asset.symbol}
                name={asset.name}
                currentPriceUsd={
                  currentPrice ?? asset.market_data.current_price.usd
                }
                initialMode={tradeMode}
                onClose={() => setIsTradeModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
