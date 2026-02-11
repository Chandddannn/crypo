import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid } from "recharts";
import { formatCurrency } from "@/utils/format";

interface ChartDataPoint {
  time: number;
  price: number;
}

interface PriceChartProps {
  range: string;
  setRange: (range: any) => void;
  ranges: { label: string; value: any; days: string }[];
  chartLoading: boolean;
  chartError: string | null;
  loadHistory: (isRetry?: boolean) => void;
  chartData: ChartDataPoint[];
  formatXAxis: (timestamp: number) => string;
}

export function PriceChart({
  range,
  setRange,
  ranges,
  chartLoading,
  chartError,
  loadHistory,
  chartData,
  formatXAxis,
}: PriceChartProps) {
  return (
    <div className="glass-panel overflow-hidden transition-colors">
      <div className="flex flex-col gap-4 border-b border-slate-100/50 dark:border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between transition-colors">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-slate-900 dark:bg-white transition-colors" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-200 transition-colors">
            Price Performance
          </h2>
        </div>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 transition-colors">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                range === r.value ? "bg-white text-sky-600 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="h-[480px] w-full">
          {chartLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 dark:border-white/10 border-t-slate-900 dark:border-t-white transition-colors" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300 transition-colors">Loading Market Data...</p>
              </div>
            </div>
          ) : chartError ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <p className="max-w-[280px] text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 leading-relaxed transition-colors">
                  {chartError}
                </p>
                <button 
                  onClick={() => loadHistory(true)} 
                  className="group flex items-center gap-2 rounded-full bg-slate-900 dark:bg-white px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white dark:text-slate-950 transition-all hover:bg-slate-800 dark:hover:bg-slate-200 shadow-lg shadow-slate-200 dark:shadow-none active:scale-95"
                >
                  <svg className="transition-transform group-hover:rotate-180" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                  Try Again
                </button>
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300 italic transition-colors">No data points available for this range</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-fill)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--chart-fill)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" opacity={0.5} />
                <XAxis 
                  dataKey="time" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={12} 
                  minTickGap={range === "24H" ? 60 : 40} 
                  tickFormatter={formatXAxis} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: "currentColor" }}
                  className="text-slate-500"
                />
                <YAxis 
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 10, fontWeight: 900, fill: "currentColor" }}
                  className="text-slate-500"
                  tickFormatter={(val) => formatCurrency(val, val < 1 ? 4 : 2)}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  cursor={{ stroke: "var(--chart-stroke)", strokeWidth: 1.5, strokeDasharray: "4 4" }}
                  contentStyle={{ 
                    borderRadius: 16, 
                    border: "none", 
                    boxShadow: "var(--glass-shadow)", 
                    padding: "12px 16px",
                    backgroundColor: "var(--tooltip-bg)",
                    backdropFilter: "blur(12px)",
                    color: "var(--tooltip-text)",
                    borderWidth: 0
                  }}
                  itemStyle={{
                    color: "var(--tooltip-text)",
                    fontSize: "12px",
                    fontWeight: "800",
                    textTransform: "uppercase"
                  }}
                  labelStyle={{
                    color: "var(--tooltip-text)",
                    opacity: 0.6,
                    fontSize: "10px",
                    fontWeight: "700",
                    marginBottom: "4px"
                  }}
                  formatter={(val: any) => {
                    const num = Number(val);
                    return [formatCurrency(num, num < 1 ? 5 : 2), "Price"];
                  }}
                  labelFormatter={(label: any) => {
                    return new Date(label).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                      {value}
                    </span>
                  )}
                />
                <Area 
                  name="Live Price"
                  type="monotone" 
                  dataKey="price" 
                  stroke="var(--chart-stroke)" 
                  strokeWidth={2.5} 
                  fill="url(#priceGradient)" 
                  isAnimationActive={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: "var(--chart-stroke)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
