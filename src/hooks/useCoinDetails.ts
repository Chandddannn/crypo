import { useCallback, useEffect, useMemo, useState } from "react";
import { useWallet } from "@/context/WalletContext";

export interface AssetDetail {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number | null;
  image?: {
    small?: string;
    large?: string;
    thumb?: string;
  };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    price_change_percentage_24h: number;
    circulating_supply: number;
    high_24h: { usd: number };
    low_24h: { usd: number };
    ath: { usd: number };
    ath_date: { usd: string };
    atl: { usd: number };
    atl_date: { usd: string };
  };
  description?: {
    en?: string;
  };
}

export interface HistoryPoint {
  time: number;
  price: number;
}

export type RangeKey = "24H" | "7D" | "1M" | "6M" | "1Y" | "MAX";

export const RANGES: { label: string; value: RangeKey; days: string }[] = [
  { label: "1D", value: "24H", days: "1" },
  { label: "7D", value: "7D", days: "7" },
  { label: "1M", value: "1M", days: "30" },
  { label: "6M", value: "6M", days: "180" },
  { label: "1Y", value: "1Y", days: "365" },
  { label: "MAX", value: "MAX", days: "max" },
];

export function useCoinDetails(id: string | undefined) {
  const { 
    updatePrice, 
    getUnrealizedPnl, 
    getPosition, 
    prices, 
    trades,
    subscribeToPrice, 
    unsubscribeFromPrice 
  } = useWallet();

  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [range, setRange] = useState<RangeKey>("7D");
  const [cachedData, setCachedData] = useState<Record<string, Record<string, HistoryPoint[]>>>({});
  const [lastFetchedId, setLastFetchedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [roiAmount, setRoiAmount] = useState<number>(1000);
  const [roiTime, setRoiTime] = useState<RangeKey>("1Y");

  // Use price from context (Binance WebSocket) as priority
  const currentPrice = prices[id as string] ?? livePrice ?? asset?.market_data?.current_price?.usd ?? null;

  const fullHistory = useMemo(() => {
    if (!id || !cachedData[id]) return [];
    return cachedData[id][range] || [];
  }, [id, range, cachedData]);

  const calculatedRoi = useMemo(() => {
    if (!fullHistory.length) return null;
    const sortedHistory = [...fullHistory].sort((a, b) => a.time - b.time);
    const latestHistoryPoint = sortedHistory[sortedHistory.length - 1];
    const now = currentPrice ?? latestHistoryPoint.price;
    const rangeObj = RANGES.find((r) => r.value === roiTime);
    if (!rangeObj) return null;

    let pastPoint: HistoryPoint;
    if (roiTime === "MAX") {
      pastPoint = sortedHistory[0];
    } else {
      const days = parseInt(rangeObj.days);
      const cutoff = latestHistoryPoint.time - days * 24 * 60 * 60 * 1000;
      pastPoint = sortedHistory.find((p) => p.time >= cutoff) || sortedHistory[0];
    }

    const pastPrice = pastPoint.price;
    const multiplier = now / pastPrice;
    const finalValue = roiAmount * multiplier;
    const profit = finalValue - roiAmount;
    const percentage = ((finalValue - roiAmount) / roiAmount) * 100;

    return { finalValue, profit, percentage, pastPrice, pastTime: pastPoint.time };
  }, [fullHistory, roiAmount, roiTime, currentPrice]);

  const history = useMemo(() => {
    if (!fullHistory.length) return [];
    return fullHistory;
  }, [fullHistory]);

  const loadHistory = useCallback(async (isRetry = false) => {
    if (!id) return;
    
    // Check if we already have this specific range data cached
    if (!isRetry && cachedData[id]?.[range] && id === lastFetchedId) {
      return;
    }

    try {
      // Show loading if we don't have this range data yet
      setChartLoading(true);
      setChartError(null);

      const rangeObj = RANGES.find(r => r.value === range);
      // Ensure days is "1" for 1D range explicitly
      const days = range === "24H" ? "1" : (rangeObj?.days || "7");

      const res = await fetch(`/api/binance/history?id=${id}&days=${days}`);
      if (res.status === 429) throw new Error("RATE_LIMIT");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "FETCH_ERROR");
      }
      
      const json = await res.json();
      const points: [number, number][] = json.prices ?? [];
      
      if (points.length === 0) {
        setChartError("No historical data found for this range.");
      } else {
        const mapped: HistoryPoint[] = points.map(([t, p]) => ({ time: t, price: p }));
        
        setCachedData(prev => ({
          ...prev,
          [id]: {
            ...(prev[id] || {}),
            [range]: mapped
          }
        }));
        setLastFetchedId(id as string);
      }
    } catch (err: any) {
      console.error("Chart Data Load Error:", err);
      setChartError(err.message === "RATE_LIMIT" ? "Rate limit exceeded." : `Failed to load chart: ${err.message}`);
    } finally {
      setChartLoading(false);
    }
  }, [id, range, lastFetchedId, cachedData]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const fetchAsset = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/binance/coin?id=${id}`);
        if (!res.ok) throw new Error("Failed to load asset");
        const json: AssetDetail = await res.json();
        if (!cancelled) {
          setAsset(json);
          const price = json.market_data?.current_price?.usd;
          if (Number.isFinite(price)) {
            setLivePrice(price);
            updatePrice(json.id, price);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error loading asset.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAsset();
    return () => { cancelled = true; };
  }, [id, updatePrice]);

  useEffect(() => {
    loadHistory();
  }, [id, range, loadHistory]);

  useEffect(() => {
    if (!id) return;
    subscribeToPrice(id);
    return () => unsubscribeFromPrice(id);
  }, [id, subscribeToPrice, unsubscribeFromPrice]);

  const position = asset ? getPosition(asset.id) : undefined;
  const unrealizedPnl = useMemo(
    () => (asset && currentPrice ? getUnrealizedPnl(asset.id, currentPrice) : 0),
    [asset, currentPrice, getUnrealizedPnl]
  );

  const chartData = useMemo(() => {
    // Subsample data for large ranges to improve chart performance
    let data = history;
    if (range === "6M" || range === "1Y" || range === "MAX") {
      const step = Math.ceil(data.length / 300); // Max 300 points
      if (step > 1) {
        data = data.filter((_, i) => i % step === 0);
      }
    }

    const mappedData = data.map((point) => ({
      time: point.time,
      price: point.price,
    }));

    // Append current live price if it's within a reasonable timeframe of the last historical point
    if (currentPrice !== null && mappedData.length > 0) {
      const lastPoint = mappedData[mappedData.length - 1];
      const now = Date.now();
      
      // If the last point is older than 5 minutes and we have a live price, append it
      if (now - lastPoint.time > 5 * 60 * 1000) {
        mappedData.push({
          time: now,
          price: currentPrice
        });
      } else if (now - lastPoint.time <= 5 * 60 * 1000) {
        // If it's very recent, just update the last point to the live price
        lastPoint.price = currentPrice;
        lastPoint.time = now;
      }
    }

    return mappedData;
  }, [history, range, currentPrice]);

  const formatXAxis = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    if (range === "24H") return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    if (range === "7D" || range === "1M") return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (range === "6M" || range === "1Y") return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    return date.toLocaleDateString("en-US", { year: "numeric" });
  }, [range]);

    return {
      asset,
      range,
      setRange,
      loading,
      error,
      chartLoading,
      chartError,
      loadHistory,
      currentPrice,
      priceChange: (asset && currentPrice !== null) ? ((currentPrice - (asset.market_data.current_price.usd / (1 + asset.market_data.price_change_percentage_24h / 100))) / (asset.market_data.current_price.usd / (1 + asset.market_data.price_change_percentage_24h / 100))) * 100 : 0,
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
    };
}
