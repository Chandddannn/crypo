"use client";

import { useMemo, useState } from "react";
import { useWallet } from "@/context/WalletContext";

type Mode = "BUY" | "SELL";

export interface TradingCardProps {
  assetId: string;
  symbol: string;
  name: string;
  currentPriceUsd: number;
}

export function TradingCard({
  assetId,
  symbol,
  name,
  currentPriceUsd,
}: TradingCardProps) {
  const { balanceUsd, buy, sell, getPosition } = useWallet();
  const [mode, setMode] = useState<Mode>("BUY");
  const [inputValue, setInputValue] = useState<string>("");
  const [inputType, setInputType] = useState<"USD" | "QTY">("USD");
  const [isSellAll, setIsSellAll] = useState(false);

  const position = getPosition(assetId);

  const handleAmountChange = (val: string) => {
    setInputValue(val);
    setIsSellAll(false);
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setInputValue("");
    setIsSellAll(false);
  };

  const toggleInputType = () => {
    if (inputType === "USD") {
      // Convert current USD to QTY for a seamless transition
      if (quantity > 0) {
        setInputValue(quantity.toFixed(6));
      }
      setInputType("QTY");
    } else {
      // Convert current QTY to USD
      if (usdAmount > 0) {
        setInputValue(usdAmount.toFixed(2));
      }
      setInputType("USD");
    }
  };

  const parsedValue = useMemo(() => {
    const num = parseFloat(inputValue);
    return Number.isFinite(num) && num > 0 ? num : 0;
  }, [inputValue]);

  const usdAmount = useMemo(() => {
    if (inputType === "USD") return parsedValue;
    return parsedValue * currentPriceUsd;
  }, [inputType, parsedValue, currentPriceUsd]);

  const quantity = useMemo(() => {
    if (inputType === "QTY") return parsedValue;
    if (!currentPriceUsd) return 0;
    return parsedValue / currentPriceUsd;
  }, [inputType, parsedValue, currentPriceUsd]);

  const canBuy = mode === "BUY" && usdAmount > 0 && usdAmount <= balanceUsd;
  const canSell =
    mode === "SELL" &&
    quantity > 0 &&
    !!position &&
    position.quantity >= quantity;

  const realizedPnl = useMemo(() => {
    if (mode === "SELL" && position && currentPriceUsd > 0 && quantity > 0) {
      return (currentPriceUsd - position.avgBuyPriceUsd) * quantity;
    }
    return 0;
  }, [mode, position, currentPriceUsd, quantity]);

  const handleSubmit = () => {
    if (!currentPriceUsd || parsedValue <= 0) return;
    
    if (mode === "BUY") {
      if (!canBuy) return;
      buy({ 
        assetId, 
        symbol, 
        name, 
        usdAmount: inputType === "USD" ? parsedValue : undefined,
        quantity: inputType === "QTY" ? parsedValue : undefined,
        priceUsd: currentPriceUsd 
      });
    } else {
      if (!canSell) return;
      
      if (isSellAll && position) {
        sell({
          assetId,
          symbol,
          name,
          quantity: position.quantity,
          priceUsd: currentPriceUsd,
        });
      } else {
        sell({
          assetId,
          symbol,
          name,
          usdAmount: inputType === "USD" ? parsedValue : undefined,
          quantity: inputType === "QTY" ? parsedValue : undefined,
          priceUsd: currentPriceUsd,
        });
      }
    }
    setInputValue("");
    setIsSellAll(false);
  };

  const handleSellAll = () => {
    if (!position || !currentPriceUsd) return;
    setMode("SELL");
    setIsSellAll(true);
    setInputType("QTY");
    setInputValue(position.quantity.toFixed(6));
  };

  const handlePercentageClick = (pct: number) => {
    if (mode === "BUY") {
      const amount = balanceUsd * (pct / 100);
      setInputType("USD");
      setInputValue(amount.toFixed(2));
      setIsSellAll(false);
    } else if (position) {
      const qty = position.quantity * (pct / 100);
      setInputType("QTY");
      setInputValue(qty.toFixed(6));
      setIsSellAll(pct === 100);
    }
  };

  return (
    <aside className="glass-panel flex flex-col overflow-hidden border-none shadow-2xl">
      {/* Header Section */}
      <div className="border-b border-slate-100/50 dark:border-white/5 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white">Terminal</h3>
            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-200 transition-colors">{name} · {symbol}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300 transition-colors">Buying Power</span>
            <span className="text-xs font-black tabular-nums text-slate-900 dark:text-white transition-colors">
              ${balanceUsd.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Mode Switcher */}
        <div className="flex gap-2 rounded-xl bg-slate-100/50 dark:bg-white/5 p-1 transition-colors">
          <button
            type="button"
            onClick={() => handleModeChange("BUY")}
            className={`flex-1 rounded-lg py-2 text-[10px] font-black uppercase tracking-[0.1em] transition-all ${
              mode === "BUY"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]"
                : "text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Long / Buy
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("SELL")}
            className={`flex-1 rounded-lg py-2 text-[10px] font-black uppercase tracking-[0.1em] transition-all ${
              mode === "SELL"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-[1.02]"
                : "text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Short / Sell
          </button>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300 transition-colors">Order Amount</span>
            <button
              type="button"
              onClick={toggleInputType}
              className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Set in {inputType === "USD" ? symbol.toUpperCase() : "USD"}
            </button>
          </div>

          <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="text-xs font-black text-slate-400 dark:text-slate-200 transition-colors">
              {inputType === "USD" ? "$" : symbol.toUpperCase()}
            </span>
          </div>
          <input
            type="number"
            min={0}
            step={inputType === "USD" ? "0.01" : "0.000001"}
            value={inputValue}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-100 dark:border-white/5 bg-white/50 dark:bg-white/5 py-4 pl-12 pr-4 text-xl font-black tabular-nums text-slate-900 dark:text-white transition focus:border-slate-900 dark:focus:border-sky-400 focus:bg-white dark:focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-sky-500/10"
            placeholder="0.00"
          />
        </div>

          {/* Quick Selection */}
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentageClick(pct)}
                className="flex-1 rounded-lg border border-slate-100 dark:border-white/10 bg-white/50 dark:bg-white/5 py-1.5 text-[9px] font-black text-slate-500 dark:text-slate-300 transition-all hover:border-slate-900 dark:hover:border-sky-400 hover:text-slate-900 dark:hover:text-white hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:focus-visible:ring-sky-400"
              >
                {pct === 100 ? "MAX" : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Trade Details Table */}
        <div className="space-y-3 border-t border-slate-100/50 dark:border-white/10 pt-6">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
            <span className="text-slate-400 dark:text-slate-300 transition-colors">Execution Price</span>
            <span className="text-slate-900 dark:text-white tabular-nums transition-colors">
              {currentPriceUsd ? `$${currentPriceUsd.toLocaleString("en-US", { maximumFractionDigits: currentPriceUsd < 1 ? 5 : 2 })}` : "-"}
            </span>
          </div>
          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
            <span className="text-slate-400 dark:text-slate-300 transition-colors">Network Fee</span>
            <span className="text-slate-900 dark:text-white tabular-nums transition-colors">FREE</span>
          </div>
          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
            <span className="text-slate-400 dark:text-slate-300 transition-colors">Estimated Receipt</span>
            <span className="text-slate-900 dark:text-white font-black tabular-nums transition-colors">
              {inputType === "USD" 
                ? `${quantity.toFixed(6)} ${symbol.toUpperCase()}`
                : `$${usdAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
            </span>
          </div>

          {mode === "SELL" && quantity > 0 && position && (
            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
              <span className="text-slate-400 dark:text-slate-300 transition-colors">Realized P&L</span>
              <span className={`font-black tabular-nums transition-colors ${realizedPnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {realizedPnl >= 0 ? "+" : "-"}${Math.abs(realizedPnl).toLocaleString("en-US", { maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        {/* Position Info Section */}
        <div className="rounded-2xl bg-slate-900 dark:bg-white/5 p-5 text-white shadow-xl shadow-slate-900/20 dark:shadow-none transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 dark:text-slate-400 transition-colors">Current Position</span>
            {mode === "SELL" && position && position.quantity > 0 && (
              <button
                type="button"
                onClick={handleSellAll}
                className="text-[9px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 transition-colors"
              >
                Exit Position
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/40 dark:text-slate-400 transition-colors">Holdings</span>
              <span className="text-sm font-black tabular-nums transition-colors">
                {position ? position.quantity.toFixed(6) : "0.000000"} {symbol.toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/40 dark:text-slate-400 transition-colors">Entry Price</span>
              <span className="text-sm font-black tabular-nums text-right transition-colors">
                {position ? `$${position.avgBuyPriceUsd.toLocaleString("en-US", { maximumFractionDigits: position.avgBuyPriceUsd < 1 ? 5 : 2 })}` : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Execute Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={mode === "BUY" ? !canBuy : !canSell}
          className={`group relative flex w-full items-center justify-center overflow-hidden rounded-2xl px-6 py-4 text-[11px] font-black uppercase tracking-[0.3em] text-white shadow-xl transition-all ${
            mode === "BUY"
              ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 disabled:bg-emerald-300"
              : "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20 disabled:bg-rose-300"
          } disabled:cursor-not-allowed active:scale-[0.98]`}
        >
          <span className="relative z-10">{mode === "BUY" ? "Execute Long" : "Execute Short"}</span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        </button>

        <p className="text-[8px] font-bold leading-relaxed text-slate-400 dark:text-slate-600 uppercase tracking-widest text-center">
          Simulation Environment · No Real Funds Used
        </p>
      </div>
    </aside>
  );
}

