import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * VERCEL / SERVERLESS FIX:
 * Serverless functions (like Vercel) have a read-only filesystem.
 * Using fs.readFileSync to read from 'data/users.json' will fail if the file doesn't exist,
 * and fs.mkdirSync/writeFileSync will fail on Vercel.
 * 
 * For this virtual terminal, we'll allow any login to succeed if credentials are provided.
 * The client-side WalletContext handles the actual state and persistence in localStorage.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email as string | undefined)?.trim().toLowerCase();
    const password = body.password as string | undefined;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    // Generate a deterministic user ID based on email
    const id = crypto.createHash("md5").update(email).digest("hex");

    // In this virtual environment, we'll simulate a successful login.
    // The client-side WalletContext will load the correct data from localStorage based on this ID.
    const user = {
      id,
      email,
      name: email.split('@')[0], // Default name from email
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Unexpected error while logging in." },
      { status: 500 },
    );
  }
}
