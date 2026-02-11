import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Vercel serverless functions have a read-only filesystem except for /tmp
// We will use /tmp for persistence during the session, but for real persistence 
// on Vercel, a database (KV, Postgres, etc.) is required.
// This fix allows the app to function without crashing on Vercel.
const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "data");
const WALLETS_FILE = path.join(DATA_DIR, "wallets.json");

// Fallback in-memory store for Vercel sessions if /tmp is wiped
let memoryWallets: any = null;

function ensureStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(WALLETS_FILE)) {
      // Try to seed from local data if it exists during build
      const localDataPath = path.join(process.cwd(), "data", "wallets.json");
      if (fs.existsSync(localDataPath)) {
        const localData = fs.readFileSync(localDataPath, "utf8");
        fs.writeFileSync(WALLETS_FILE, localData, "utf8");
      } else {
        fs.writeFileSync(WALLETS_FILE, "{}", "utf8");
      }
    }
  } catch (e) {
    console.warn("Filesystem is read-only, using memory store fallback");
  }
}

function readWallets() {
  if (isVercel && memoryWallets) return memoryWallets;
  
  ensureStore();
  try {
    if (fs.existsSync(WALLETS_FILE)) {
      const raw = fs.readFileSync(WALLETS_FILE, "utf8");
      const data = JSON.parse(raw);
      if (isVercel) memoryWallets = data;
      return data;
    }
  } catch (e) {
    console.error("Read failed:", e);
  }
  return memoryWallets || {};
}

function writeWallets(wallets: any) {
  if (isVercel) memoryWallets = wallets;
  
  try {
    ensureStore();
    fs.writeFileSync(WALLETS_FILE, JSON.stringify(wallets, null, 2), "utf8");
  } catch (e) {
    // On Vercel, this might fail if /tmp is full or inaccessible
    console.warn("Write failed, data held in memory only:", e);
  }
}

export async function GET() {
  try {
    const wallets = readWallets();
    return NextResponse.json(wallets);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read wallets" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, walletData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const wallets = readWallets();
    wallets[userId] = walletData;
    writeWallets(wallets);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update wallet" },
      { status: 500 }
    );
  }
}
