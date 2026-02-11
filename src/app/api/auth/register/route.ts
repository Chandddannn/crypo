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

function writeUsers(users: StoredUser[]) {
  ensureStore();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

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

    const users = readUsers();
    if (users.some((u) => u.email === email)) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const id =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const passwordHash = hashPassword(password);

    const user: StoredUser = {
      id,
      email,
      name,
      avatarUrl,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    writeUsers(users);

    const { passwordHash: _hash, ...publicUser } = user;
    return NextResponse.json(publicUser, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unexpected error while registering." },
      { status: 500 },
    );
  }
}

