import { NextRequest, NextResponse } from "next/server";
import { SUPPORTED_COINS } from "@/utils/binance";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing coin ID" }, { status: 400 });
  }

  const metadata = SUPPORTED_COINS.find(c => c.id === id);
  if (!metadata) {
    return NextResponse.json({ error: "Coin not supported" }, { status: 404 });
  }

  const hostnames = [
    "api.binance.com",
    "api1.binance.com",
    "api2.binance.com",
    "api3.binance.com",
    "api-gcp.binance.com",
    "api.binance.us"
  ];

  let ticker = null;
  let lastError = null;

  for (const hostname of hostnames) {
    try {
      const tickerRes = await fetch(
        `https://${hostname}/api/v3/ticker/24hr?symbol=${metadata.binanceSymbol.toUpperCase()}`,
        { 
          signal: AbortSignal.timeout(8000),
          headers: {
            'Cache-Control': 'no-cache',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        }
      );
      
      if (tickerRes.ok) {
        ticker = await tickerRes.json();
        break;
      }
    } catch (error) {
      lastError = error;
      continue;
    }
  }

  if (!ticker) {
    console.error("Binance Coin Error (All hosts failed):", lastError);
    return NextResponse.json({ error: "Failed to connect to Binance API" }, { status: 503 });
  }

  try {
    // Fetch Market Cap from CoinGecko as a fallback for missing Binance data
    let marketCap = 0;
    let circulatingSupply = 0;
    let maxSupply = 0;
    let totalSupply = 0;
    let fdv = 0;
    let marketCapRank = 0;
    
    try {
      const cgRes = await fetch(`https://api.coingecko.com/api/v3/coins/${metadata.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
      if (cgRes.ok) {
        const cgData = await cgRes.json();
        marketCap = cgData.market_data?.market_cap?.usd || 0;
        circulatingSupply = cgData.market_data?.circulating_supply || 0;
        maxSupply = cgData.market_data?.max_supply || 0;
        totalSupply = cgData.market_data?.total_supply || 0;
        fdv = cgData.market_data?.fully_diluted_valuation?.usd || 0;
        marketCapRank = cgData.market_cap_rank || 0;
      }
    } catch (e) {
      console.warn("CoinGecko fetch failed, using zero for market cap");
    }

    // Construct response to match what CoinDetailPage expects
    const athData: Record<string, { price: number; date: string }> = {
      bitcoin: { price: 126198.07, date: "2025-10-07T00:00:00Z" },
      ethereum: { price: 4891.70, date: "2021-11-16T00:00:00Z" },
      solana: { price: 260.06, date: "2021-11-07T00:00:00Z" },
      ripple: { price: 3.84, date: "2018-01-04T00:00:00Z" },
      dogecoin: { price: 0.7376, date: "2021-05-08T00:00:00Z" },
      cardano: { price: 3.10, date: "2021-09-02T00:00:00Z" },
      polkadot: { price: 55.00, date: "2021-11-04T00:00:00Z" },
      litecoin: { price: 412.96, date: "2021-05-10T00:00:00Z" },
      chainlink: { price: 52.88, date: "2021-05-10T00:00:00Z" },
    };

    const atlData: Record<string, { price: number; date: string }> = {
      bitcoin: { price: 0.04865, date: "2010-07-15T00:00:00Z" },
      ethereum: { price: 0.4209, date: "2015-10-21T00:00:00Z" },
      solana: { price: 0.5052, date: "2020-05-11T00:00:00Z" },
      ripple: { price: 0.002802, date: "2014-07-07T00:00:00Z" },
      dogecoin: { price: 0.00008547, date: "2015-05-07T00:00:00Z" },
      cardano: { price: 0.01735, date: "2020-03-13T00:00:00Z" },
      polkadot: { price: 2.69, date: "2020-08-20T00:00:00Z" },
      litecoin: { price: 1.11, date: "2015-01-14T00:00:00Z" },
      chainlink: { price: 0.1263, date: "2017-09-23T00:00:00Z" },
    };

    const currentAth = athData[metadata.id] || { price: parseFloat(ticker.highPrice) * 1.2, date: new Date().toISOString() };
    const currentAtl = atlData[metadata.id] || { price: parseFloat(ticker.lowPrice) * 0.5, date: new Date().toISOString() };

    const data = {
      id: metadata.id,
      symbol: metadata.symbol.toLowerCase(),
      name: metadata.name,
      image: {
        large: metadata.logo,
        small: metadata.logo,
        thumb: metadata.logo,
      },
      market_data: {
        current_price: { usd: parseFloat(ticker.lastPrice) },
        market_cap: { usd: marketCap },
        total_volume: { usd: parseFloat(ticker.volume) * parseFloat(ticker.lastPrice) },
        price_change_percentage_24h: parseFloat(ticker.priceChangePercent),
        high_24h: { usd: parseFloat(ticker.highPrice) },
        low_24h: { usd: parseFloat(ticker.lowPrice) },
        circulating_supply: circulatingSupply,
        max_supply: maxSupply,
        total_supply: totalSupply,
        fully_diluted_valuation: { usd: fdv },
        market_cap_rank: marketCapRank,
        ath: { usd: currentAth.price },
        ath_date: { usd: currentAth.date },
        atl: { usd: currentAtl.price },
        atl_date: { usd: currentAtl.date },
      },
      description: {
        en: `Real-time data for ${metadata.name} from Binance.`,
      },
    };
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Binance Coin Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
