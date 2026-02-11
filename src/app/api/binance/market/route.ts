import { NextResponse } from "next/server";
import { SUPPORTED_COINS } from "@/utils/binance";

export async function GET() {
  const symbols = SUPPORTED_COINS.map(c => c.binanceSymbol.toUpperCase());
  
  // Strategy 1: Use CoinGecko as the primary source (provides Market Cap + Prices)
  try {
    const ids = SUPPORTED_COINS.map(c => c.id).join(',');
    const cgUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;
    
    const cgRes = await fetch(cgUrl, { 
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(10000),
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    if (cgRes.ok) {
      const cgData = await cgRes.json();
      const assets = SUPPORTED_COINS.map((metadata, index) => {
        const coinData = cgData[metadata.id] || {};
        return {
          id: metadata.id,
          rank: String(index + 1),
          symbol: metadata.symbol,
          name: metadata.name,
          image: metadata.logo,
          priceUsd: String(coinData.usd || 0),
          changePercent24Hr: String(coinData.usd_24h_change || 0),
          marketCapUsd: String(coinData.usd_market_cap || 0),
        };
      });

      // If we got valid data (not all zeros), return it
      const hasData = assets.some(a => parseFloat(a.priceUsd) > 0);
      if (hasData) {
        return NextResponse.json(assets);
      }
    }
  } catch (cgError) {
    console.warn("CoinGecko primary fetch failed:", cgError);
  }

  // Strategy 2: Fallback to Binance if CoinGecko fails
  const hostnames = [
    "api.binance.com",
    "api1.binance.com",
    "api2.binance.com",
    "api3.binance.com"
  ];

  let binanceData = null;
  const encodedSymbols = encodeURIComponent(JSON.stringify(symbols));

  for (const hostname of hostnames) {
    try {
      const url = `https://${hostname}/api/v3/ticker/24hr?symbols=${encodedSymbols}`;
      const res = await fetch(url, { 
        signal: AbortSignal.timeout(8000),
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          binanceData = json;
          break;
        }
      }
    } catch (error) {
      continue;
    }
  }

  if (binanceData) {
    const assets = SUPPORTED_COINS.map((metadata, index) => {
      const ticker = binanceData.find((t: any) => t.symbol.toLowerCase() === metadata.binanceSymbol);
      return {
        id: metadata.id,
        rank: String(index + 1),
        symbol: metadata.symbol,
        name: metadata.name,
        image: metadata.logo,
        priceUsd: ticker ? ticker.lastPrice : "0",
        changePercent24Hr: ticker ? ticker.priceChangePercent : "0",
        marketCapUsd: "0", // Binance fallback still won't have market cap
      };
    });
    return NextResponse.json(assets);
  }

  return NextResponse.json(
    { error: "Market data unavailable", details: "All data sources failed" }, 
    { status: 503 }
  );
}
