import { NextResponse } from "next/server";
import { SUPPORTED_COINS } from "@/utils/binance";

export async function GET() {
  const symbols = SUPPORTED_COINS.map(c => c.binanceSymbol.toUpperCase());
  
  // Strategy 1: Attempt direct Binance API calls (with failover)
  const hostnames = [
    "api.binance.com",
    "api1.binance.com",
    "api2.binance.com",
    "api3.binance.com",
    "api-gcp.binance.com",
    "api.binance.us"
  ];

  let data = null;
  let lastError = null;

  // Try Binance first
  for (const hostname of hostnames) {
    try {
      const url = `https://${hostname}/api/v3/ticker/24hr?symbols=${JSON.stringify(symbols)}`;
      const res = await fetch(url, { 
        signal: AbortSignal.timeout(8000),
        headers: {
          'Cache-Control': 'no-cache',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (res.ok) {
        data = await res.json();
        break;
      }
    } catch (error) {
      lastError = error;
      continue;
    }
  }

  // Strategy 2: If Binance fails (common on Vercel), use CoinGecko as a fallback
  if (!data) {
    console.warn("Binance failed, falling back to CoinGecko...");
    try {
      const ids = SUPPORTED_COINS.map(c => c.id).join(',');
      const cgUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
      const cgRes = await fetch(cgUrl, { signal: AbortSignal.timeout(8000) });
      
      if (cgRes.ok) {
        const cgData = await cgRes.json();
        const assets = SUPPORTED_COINS.map((metadata, index) => ({
          id: metadata.id,
          rank: String(index + 1),
          symbol: metadata.symbol,
          name: metadata.name,
          image: metadata.logo,
          priceUsd: String(cgData[metadata.id]?.usd || 0),
          changePercent24Hr: String(cgData[metadata.id]?.usd_24h_change || 0),
          marketCapUsd: "0",
        }));
        return NextResponse.json(assets);
      }
    } catch (cgError) {
      console.error("CoinGecko fallback also failed:", cgError);
    }
  }

  if (!data) {
    return NextResponse.json({ error: "Market data currently unavailable" }, { status: 503 });
  }

  try {
    // Map Binance data back to our Asset format
    const assets = SUPPORTED_COINS.map((metadata, index) => {
      const ticker = data.find((t: any) => t.symbol.toLowerCase() === metadata.binanceSymbol);
      
      return {
        id: metadata.id,
        rank: String(index + 1),
        symbol: metadata.symbol,
        name: metadata.name,
        image: metadata.logo,
        priceUsd: ticker ? ticker.lastPrice : "0",
        changePercent24Hr: ticker ? ticker.priceChangePercent : "0",
        marketCapUsd: "0", // Binance doesn't provide market cap directly in ticker
      };
    });
    
    return NextResponse.json(assets);
  } catch (error) {
    console.error("Binance Market Error:", error);
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 });
  }
}
