import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const WALLETS_FILE = path.join(DATA_DIR, "wallets.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(WALLETS_FILE)) {
    fs.writeFileSync(WALLETS_FILE, "{}", "utf8");
  }
}

function readWallets() {
  ensureStore();
  const raw = fs.readFileSync(WALLETS_FILE, "utf8");
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeWallets(wallets: any) {
  ensureStore();
  fs.writeFileSync(WALLETS_FILE, JSON.stringify(wallets, null, 2), "utf8");
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
