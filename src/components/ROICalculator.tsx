import { formatCurrency, formatPct } from "@/utils/format";

interface ROICalculatorProps {
  roiAmount: number;
  setRoiAmount: (amount: number) => void;
  roiTime: string;
  setRoiTime: (time: any) => void;
  ranges: { label: string; value: any; days: string }[];
  calculatedRoi: {
    finalValue: number;
    profit: number;
    percentage: number;
    pastPrice: number;
    pastTime: number;
  } | null;
}

export function ROICalculator({
  roiAmount,
  setRoiAmount,
  roiTime,
  setRoiTime,
  ranges,
  calculatedRoi,
}: ROICalculatorProps) {
  return (
    <div className="glass-panel flex flex-col h-full overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100/50 dark:border-white/10 transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="8" x2="16" y1="10" y2="10"/><line x1="8" x2="16" y1="14" y2="14"/><line x1="8" x2="16" y1="18" y2="18"/></svg>
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white transition-colors">Returns Calculator</h3>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ">Investment Amount (USD)</label>
            <div className="relative mt-2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-600 ">$</span>
              <input
                type="number"
                value={roiAmount}
                onChange={(e) => setRoiAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full rounded-xl border border-slate-100 dark:border-white/10 bg-white/50 dark:bg-white/5 py-3 pl-8 pr-4 text-sm font-black text-slate-900 dark:text-white transition focus:border-slate-900 dark:focus:border-sky-400 focus:bg-white dark:focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-sky-500/10"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ">Time Period</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {ranges.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRoiTime(r.value)}
                  className={`rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:focus-visible:ring-sky-400 ${
                    roiTime === r.value ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105" : "bg-slate-100/50 dark:bg-white/5 text-slate-500 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {calculatedRoi && (
          <div className="mt-auto rounded-2xl bg-slate-900 dark:bg-white/5 p-6 text-white shadow-xl shadow-slate-900/20 dark:shadow-none transition-colors">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ">Estimated Value</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black tabular-nums text-white">{formatCurrency(calculatedRoi.finalValue)}</span>
              <span className={`text-xs font-black ${calculatedRoi.profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {calculatedRoi.profit >= 0 ? "+" : ""}{formatPct(calculatedRoi.percentage)}
              </span>
            </div>
            <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                <span className="text-white/60 ">Initial Cost</span>
                <span className="text-white/80 dark:text-slate-300">{formatCurrency(roiAmount)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                <span className="text-white/60 ">Total Profit</span>
                <span className={`font-black ${calculatedRoi.profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatCurrency(calculatedRoi.profit)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
