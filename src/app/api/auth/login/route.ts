import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

/**
 * USER LOGIN WITH MONGODB
 *
 * Authenticates user credentials against the database.
 */

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    // Hash the provided password and compare
    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    if (user.passwordHash !== passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    // Return user data (excluding password hash)
    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
    };

    return NextResponse.json(userResponse, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Unexpected error while logging in." },
      { status: 500 },
    );
  }
}
