"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet, UserProfile } from "@/context/WalletContext";

type Mode = "login" | "register";

interface AuthError {
  message: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser } = useWallet();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);

      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";

      const payload: Record<string, unknown> = {
        email,
        password,
      };

      if (mode === "register") {
        payload.name = name;
        if (avatarUrl.trim()) payload.avatarUrl = avatarUrl.trim();
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError({ message: data.error ?? "Authentication failed." });
        return;
      }

      const profile: UserProfile = {
        id: data.id,
        email: data.email,
        name: data.name,
        avatarUrl: data.avatarUrl,
      };

      setUser(profile);
      router.push("/");
    } catch {
      setError({ message: "Unable to reach auth service." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 bg-white transition-colors">
      <div className="glass-panel w-full max-w-md px-6 py-6 md:px-8 md:py-8 transition-colors">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black tracking-tight text-slate-900 transition-colors">
            {mode === "login" ? "Login" : "Create account"}
          </h1>
          <div className="flex rounded-full bg-slate-100 p-1 text-xs font-black transition-colors">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-full px-3 py-1.5 transition-all ${
                mode === "login"
                  ? "bg-slate-900 text-slate-50 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`rounded-full px-3 py-1.5 transition-all ${
                mode === "register"
                  ? "bg-slate-900 text-slate-50 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Register
            </button>
          </div>
        </div>

        <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-colors">
          Simulation Environment · Local Auth
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "register" && (
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 transition-colors"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alice Johnson"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-900 outline-none ring-0 focus:border-sky-400 transition-all"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 transition-colors"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-900 outline-none ring-0 focus:border-sky-400 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 transition-colors"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-900 outline-none ring-0 focus:border-sky-400 transition-all"
            />
          </div>

          {mode === "register" && (
            <div className="space-y-1.5">
              <label
                htmlFor="avatar"
                className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 transition-colors"
              >
                Profile photo URL (optional)
              </label>
              <input
                id="avatar"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/me.png"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-900 outline-none ring-0 focus:border-sky-400 transition-all"
              />
            </div>
          )}

          {error && (
            <p className="text-xs font-black uppercase tracking-widest text-rose-600">{error.message}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-slate-900 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-50 shadow-xl transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? mode === "login"
                ? "Logging in…"
                : "Creating account…"
              : mode === "login"
                ? "Login"
                : "Register"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="ml-1 text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
            >
              {mode === "login" ? "Register now" : "Login instead"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}

