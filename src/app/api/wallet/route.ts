import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Wallet from "@/models/Wallet";

/**
 * WALLET API WITH MONGODB
 *
 * Manages user wallet data including balance, positions, and trade history.
 */

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Fetch wallet for specific user
    let wallet = await Wallet.findOne({ userId });

    // If wallet doesn't exist, create a new one with default balance
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balanceUsd: 10000,
        positions: {},
        trades: [],
      });
    }

    // Convert positions Map to object for JSON response
    const walletData = {
      balanceUsd: wallet.balanceUsd,
      positions: Object.fromEntries(wallet.positions),
      trades: wallet.trades,
    };

    return NextResponse.json(walletData);
  } catch (error) {
    console.error("Wallet fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const { userId, walletData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    if (!walletData) {
      return NextResponse.json(
        { error: "Wallet data is required" },
        { status: 400 },
      );
    }

    // Update or create wallet
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      {
        balanceUsd: walletData.balanceUsd,
        positions: walletData.positions,
        trades: walletData.trades,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );

    return NextResponse.json({
      success: true,
      wallet: {
        balanceUsd: wallet.balanceUsd,
        positions: Object.fromEntries(wallet.positions),
        trades: wallet.trades,
      },
    });
  } catch (error) {
    console.error("Wallet update error:", error);
    return NextResponse.json(
      { error: "Failed to update wallet" },
      { status: 500 },
    );
  }
}
