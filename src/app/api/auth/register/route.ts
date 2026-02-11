import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * VERCEL / SERVERLESS FIX:
 * Serverless functions (like Vercel) have a read-only filesystem (except /tmp).
 * Using fs.writeFileSync to save users in 'data/users.json' will fail with 500 errors.
 * 
 * For this demo, we'll use a purely client-side "mock" registration.
 * The server will return a success response with a hashed ID, and the client
 * will handle the local storage persistence via the WalletContext.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email as string | undefined)?.trim().toLowerCase();
    const password = body.password as string | undefined;
    const name = (body.name as string | undefined)?.trim();
    const avatarUrl = (body.avatarUrl as string | undefined)?.trim();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    // In a serverless environment, we can't persist to a local JSON file.
    // Instead of failing with a 500, we'll generate a deterministic user object.
    // The client-side WalletContext already handles persistence in localStorage.
    
    const id = crypto.createHash("md5").update(email).digest("hex");
    
    const user = {
      id,
      email,
      name,
      avatarUrl,
      createdAt: new Date().toISOString(),
    };

    // Return success. The client-side will "log them in" and save to localStorage.
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Unexpected error while registering." },
      { status: 500 },
    );
  }
}
