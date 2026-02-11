import { useEffect, useRef, useState } from "react";
import { getBinanceSymbol, getCoinId } from "@/utils/binance";

export function useBinanceWebSocket(coinIds: string[]) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!coinIds.length) return;

    const symbols = coinIds
      .map(id => getBinanceSymbol(id))
      .filter((s): s is string => !!s);

    if (!symbols.length) return;

    // Binance stream URL for multiple tickers
    const streams = symbols.map(s => `${s}@trade`).join("/");
    const url = `wss://stream.binance.com:9443/ws/${streams}`;

    ws.current = new WebSocket(url);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.e === "trade") {
        const symbol = data.s.toLowerCase();
        const price = parseFloat(data.p);
        const coinId = getCoinId(symbol);
        
        if (coinId) {
          setPrices(prev => ({
            ...prev,
            [coinId]: price
          }));
        }
      }
    };

    ws.current.onerror = (error) => {
      console.error("Binance WebSocket Error:", error);
    };

    return () => {
      if (ws.current) {
        // Remove listeners before closing to avoid "ping after close" or state updates on unmounted component
        ws.current.onmessage = null;
        ws.current.onerror = null;
        ws.current.onclose = null;
        ws.current.onopen = null;
        
        if (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING) {
          ws.current.close();
        }
        ws.current = null;
      }
    };
  }, [JSON.stringify(coinIds)]);

  return prices;
}
