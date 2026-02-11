import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

interface StoredUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  passwordHash: string;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, "[]", "utf8");
  }
}

function readUsers(): StoredUser[] {
  ensureStore();
  const raw = fs.readFileSync(USERS_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

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

    const users = readUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const passwordHash = hashPassword(password);
    if (passwordHash !== user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const { passwordHash: _hash, ...publicUser } = user;
    return NextResponse.json(publicUser, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unexpected error while logging in." },
      { status: 500 },
    );
  }
}

