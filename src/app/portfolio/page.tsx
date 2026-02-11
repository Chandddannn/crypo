"use client";

import { useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { TradeHistory } from "@/components/TradeHistory";

export default function PortfolioPage() {
  const router = useRouter();
  const {
    balanceUsd,
    positions,
    prices,
    ownerName,
    user,
    trades,
    lastSession,
  } = useWallet();
  const hasRedirected = useRef(false);

  // Derive showFlashback from props instead of state
  const showFlashback = !user && !!lastSession;

  const displayData = useMemo(() => {
    const activePositions = user ? positions : lastSession?.positions || {};
    const activeBalance = user ? balanceUsd : lastSession?.balanceUsd || 0;
    const activeTrades = user ? trades : lastSession?.trades || [];
    const activeName = user
      ? ownerName
      : lastSession?.user.name || "Demo Trader";

    const posArray = Object.values(activePositions);
    const rows = posArray.map((pos) => {
      // Use current price from live feed, fallback to average buy price
      const hasLivePrice = !!prices[pos.assetId];
      const currentPrice = prices[pos.assetId] ?? pos.avgBuyPriceUsd;
      const value = currentPrice * pos.quantity;
      const cost = pos.avgBuyPriceUsd * pos.quantity;
      const pnl = value - cost;
      const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;

      // Debug log for price tracking
      console.log(
        `Portfolio ${pos.symbol}:`,
        hasLivePrice
          ? `Live $${currentPrice.toFixed(2)}`
          : `Using Avg Buy $${currentPrice.toFixed(2)}`,
        `| Qty: ${pos.quantity.toFixed(4)} | Value: $${value.toFixed(2)}`,
      );

      return {
        assetId: pos.assetId,
        name: pos.name,
        symbol: pos.symbol,
        quantity: pos.quantity,
        avgBuyPrice: pos.avgBuyPriceUsd,
        currentPrice,
        value,
        pnl,
        pnlPct,
        hasLivePrice,
      };
    });

    const totalValue = rows.reduce((sum, r) => sum + r.value, 0);
    const totalCost = rows.reduce(
      (sum, r) => sum + r.avgBuyPrice * r.quantity,
      0,
    );
    const totalPnl = totalValue - totalCost;

    const realized = (activeTrades || [])
      .filter((t) => t.type === "SELL" && t.realizedPnlUsd !== undefined)
      .reduce((sum, t) => sum + (t.realizedPnlUsd || 0), 0);

    const totalEquity = activeBalance + totalValue;
    const livePriceCount = rows.filter((r) => r.hasLivePrice).length;

    // Debug logging
    console.log("📊 PORTFOLIO EQUITY BREAKDOWN:", {
      "💵 Available Cash": `$${activeBalance.toFixed(2)}`,
      "📈 Total Holdings Value": `$${totalValue.toFixed(2)}`,
      "💰 TOTAL EQUITY": `$${totalEquity.toFixed(2)}`,
      "🔢 Positions": rows.length,
      "📡 Live Prices": `${livePriceCount}/${rows.length}`,
      "🔌 Price Feed Status":
        Object.keys(prices).length > 0 ? "Connected" : "Disconnected",
    });

    return {
      rows,
      totalEquity,
      totalCostBasis: totalCost,
      totalPnl,
      realizedPnl: realized,
      ownerName: activeName,
      balanceUsd: activeBalance,
      trades: activeTrades,
      livePriceCount,
      totalPositions: rows.length,
    };
  }, [user, positions, prices, balanceUsd, trades, lastSession, ownerName]);

  useEffect(() => {
    if (!user && !hasRedirected.current) {
      hasRedirected.current = true;

      // Immediate redirect if no session data exists
      if (!lastSession) {
        router.push("/login");
      } else {
        // Show flashback briefly if session exists
        const timer = setTimeout(() => {
          router.push("/login");
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, router, lastSession]);

  // Don't render anything if no user and no flashback
  if (!user && !showFlashback) return null;

  const { rows, totalEquity, totalCostBasis, totalPnl, realizedPnl } =
    displayData;

  const formatCurrency = (value: number, digits = 2) => {
    if (!Number.isFinite(value)) return "-";
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: digits,
    });
  };

  const formatPct = (value: number) => {
    if (!Number.isFinite(value)) return "-";
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <main
      className={`min-h-screen px-4 py-12 md:px-10 lg:px-16 bg-white transition-colors ${showFlashback ? "animate-pulse" : ""}`}
    >
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ring-1 ${showFlashback ? "bg-amber-50 ring-amber-500/20" : "bg-sky-50 ring-sky-500/20"}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${showFlashback ? "bg-amber-500" : "bg-sky-500"}`}
                />
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.2em] ${showFlashback ? "text-amber-600" : "text-sky-600"}`}
                >
                  {showFlashback
                    ? "Session Flashback (Redirecting...)"
                    : "Live Portfolio"}
                </p>
              </div>
              {!showFlashback && (
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ring-1 ${
                    displayData.livePriceCount > 0
                      ? "bg-emerald-50 ring-emerald-500/20"
                      : "bg-amber-50 ring-amber-500/20"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      displayData.livePriceCount > 0
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-amber-500"
                    }`}
                  />
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                      displayData.livePriceCount > 0
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {displayData.livePriceCount > 0
                      ? `${displayData.livePriceCount}/${displayData.totalPositions} Real-Time`
                      : "Prices Loading..."}
                  </p>
                </div>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
              {displayData.ownerName}&apos;s Dashboard
            </h1>
            <p className="max-w-xl text-xs sm:text-sm font-medium leading-relaxed text-slate-600">
              Real-time monitoring of your virtual holdings, total equity, and
              historical performance.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full md:w-auto">
            <div className="glass-panel min-w-[140px] sm:min-w-[160px] p-4 sm:p-5 shadow-xl shadow-emerald-500/5 ring-1 ring-emerald-500/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Total Equity
                </p>
              </div>
              <p className="text-xl sm:text-2xl font-black tabular-nums text-slate-900">
                {formatCurrency(totalEquity)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-[9px] font-bold text-slate-500">
                  Cash + Holdings
                </p>
                {displayData.livePriceCount > 0 && (
                  <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    <span className="inline-block h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                    {displayData.livePriceCount}/{displayData.totalPositions}{" "}
                    Live
                  </span>
                )}
              </div>
            </div>
            <div className="glass-panel min-w-[140px] sm:min-w-[160px] p-4 sm:p-5 shadow-xl shadow-sky-500/5 ring-1 ring-sky-500/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-4 rounded-full bg-sky-100 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                </div>
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Available Cash
                </p>
              </div>
              <p className="text-xl sm:text-2xl font-black tabular-nums text-slate-900">
                {formatCurrency(displayData.balanceUsd)}
              </p>
              <p className="text-[9px] font-bold text-slate-500 mt-2">
                Holdings: {formatCurrency(totalEquity - displayData.balanceUsd)}
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          <div className="glass-panel p-5 sm:p-6 bg-gradient-to-br from-white to-slate-50/50">
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
              Unrealized P&L
            </p>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl sm:text-3xl font-black tabular-nums ${totalPnl >= 0 ? "text-emerald-600" : "text-rose-600"}`}
              >
                {totalPnl >= 0 ? "+" : ""}
                {formatCurrency(totalPnl)}
              </span>
              <span
                className={`text-[10px] sm:text-xs font-bold ${totalPnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}
              >
                (
                {formatPct(
                  totalCostBasis > 0 ? (totalPnl / totalCostBasis) * 100 : 0,
                )}
                )
              </span>
            </div>
          </div>
          <div className="glass-panel p-5 sm:p-6 bg-gradient-to-br from-white to-slate-50/50">
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
              Realized Profit
            </p>
            <span
              className={`text-2xl sm:text-3xl font-black tabular-nums ${realizedPnl >= 0 ? "text-emerald-600" : "text-rose-600"}`}
            >
              {realizedPnl >= 0 ? "+" : ""}
              {formatCurrency(realizedPnl)}
            </span>
          </div>
          <div className="glass-panel p-5 sm:p-6 bg-gradient-to-br from-white to-slate-50/50">
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
              Open Positions
            </p>
            <span className="text-2xl sm:text-3xl font-black tabular-nums text-slate-900">
              {rows.length}
            </span>
          </div>
        </div>

        <section className="glass-panel overflow-hidden border-none shadow-2xl shadow-slate-200/50">
          <div className="flex items-center justify-between bg-slate-50/50 px-8 py-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">
                Asset Allocation
              </h3>
            </div>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="group flex items-center gap-2 rounded-full bg-white px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:ring-slate-300"
            >
              Explore Markets
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
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-white text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 border-b border-slate-50">
                  <th className="px-8 py-5">Asset</th>
                  <th className="px-4 py-5 text-right">Balance</th>
                  <th className="px-4 py-5 text-right">Avg Price</th>
                  <th className="px-4 py-5 text-right">Market Price</th>
                  <th className="px-4 py-5 text-right">Unrealized P&L</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-40">
                        <div className="h-12 w-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 12h8" />
                          </svg>
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                          Empty Portfolio
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.assetId}
                      className="group transition-all hover:bg-slate-50/50"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                            {row.symbol[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900">
                              {row.name}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                              {row.symbol}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-black text-slate-900 tabular-nums">
                            {row.quantity.toFixed(row.quantity < 1 ? 6 : 4)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-600 tabular-nums">
                            {formatCurrency(row.value)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-[11px] font-bold text-slate-500 tabular-nums">
                            {formatCurrency(
                              row.avgBuyPrice,
                              row.avgBuyPrice < 1 ? 5 : 2,
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[11px] font-bold text-slate-900 tabular-nums">
                            {formatCurrency(
                              row.currentPrice,
                              row.currentPrice < 1 ? 5 : 2,
                            )}
                          </span>
                          {row.hasLivePrice ? (
                            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Live
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-amber-600">
                              Static
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-5 text-right">
                        <div
                          className={
                            row.pnl >= 0 ? "text-emerald-600" : "text-rose-600"
                          }
                        >
                          <div className="text-[11px] font-black tabular-nums">
                            {row.pnl >= 0 ? "+" : ""}
                            {formatCurrency(row.pnl, 2)}
                          </div>
                          <div className="text-[9px] font-black uppercase tracking-widest">
                            {formatPct(row.pnlPct)}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => router.push(`/coin/${row.assetId}`)}
                          className="rounded-full bg-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-500/20 active:scale-95"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="pt-4">
          <TradeHistory trades={displayData.trades} />
        </div>
      </div>
    </main>
  );
}
