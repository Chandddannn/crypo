import { NextRequest, NextResponse } from "next/server";
import { SUPPORTED_COINS } from "@/utils/binance";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const days = searchParams.get("days") || "7";

  if (!id) {
    return NextResponse.json({ error: "Missing coin ID" }, { status: 400 });
  }

  const metadata = SUPPORTED_COINS.find(c => c.id === id);
  if (!metadata) {
    return NextResponse.json({ error: "Coin not supported" }, { status: 404 });
  }

  // Map days to Binance interval and limit
  // 1d -> 1m or 5m (Binance limit is 1000)
  // 7d -> 1h
  // 30d -> 4h
  // 365d -> 1d
  // max -> 1w
  
  let interval = "1h";
  let limit = 168; // 24 * 7

  if (days === "1" || days === "24H") {
    interval = "15m";
    limit = 96; // 4 * 24
  } else if (days === "7") {
    interval = "1h";
    limit = 168;
  } else if (days === "30") {
    interval = "4h";
    limit = 180; // 30 * 6
  } else if (days === "180") {
    interval = "12h";
    limit = 360;
  } else if (days === "365") {
    interval = "1d";
    limit = 365;
  } else if (days === "max") {
    interval = "1w";
    limit = 500;
  }

  const hostnames = [
    "api.binance.com",
    "api1.binance.com",
    "api2.binance.com",
    "api3.binance.com",
    "api.binance.us" // Fallback for US users
  ];

  let klines = null;
  let lastError = null;

  for (const hostname of hostnames) {
    try {
      const url = `https://${hostname}/api/v3/klines?symbol=${metadata.binanceSymbol.toUpperCase()}&interval=${interval}&limit=${limit}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      
      if (res.ok) {
        klines = await res.json();
        break;
      }
    } catch (error) {
      lastError = error;
      continue;
    }
  }

  if (!klines) {
    console.error("Binance History Error (All hosts failed):", lastError);
    return NextResponse.json({ error: "Failed to connect to Binance API" }, { status: 503 });
  }

  try {
    // Format to { prices: [[timestamp, price], ...] }
    // klines format: [ [openTime, open, high, low, close, volume, closeTime, ...] ]
    const prices = klines.map((k: any) => [
      k[0], // open time
      parseFloat(k[4]) // close price
    ]);
    
    return NextResponse.json({ prices });
  } catch (error) {
    console.error("Format Error:", error);
    return NextResponse.json({ error: "Data formatting error" }, { status: 500 });
  }
}
