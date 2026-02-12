import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Wallet from "@/models/Wallet";

/**
 * USER REGISTRATION WITH MONGODB
 *
 * Creates a new user account and initializes their wallet with $10,000 starting balance.
 */

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const name = body.name?.trim();
    const avatarUrl = body.avatarUrl?.trim();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 },
      );
    }

    // Password strength validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    // Hash password (SHA-256 for consistency with existing data)
    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // Create new user
    const user = await User.create({
      email,
      name,
      passwordHash,
      avatarUrl: avatarUrl || "",
    });

    // Initialize wallet with $10,000 starting balance
    await Wallet.create({
      userId: user._id.toString(),
      balanceUsd: 10000,
      positions: {},
      trades: [],
    });

    // Return user data (excluding password hash)
    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
    };

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Unexpected error while registering." },
      { status: 500 },
    );
  }
}
