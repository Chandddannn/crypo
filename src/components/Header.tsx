"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";

export default function Header() {
  const router = useRouter();
  const { user, balanceUsd, logout } = useWallet();

  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center transition-all group-hover:scale-110">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 hidden sm:inline-block transition-colors">
              CoinSwitch
            </span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/"
              className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
            >
              Markets
            </Link>
            <Link
              href="/portfolio"
              className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
            >
              Portfolio
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {user && (
            <Link
              href="/portfolio"
              className="flex flex-col items-end mr-1 sm:mr-2 hover:opacity-80 transition-opacity"
            >
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-colors">
                Balance
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 transition-colors tabular-nums">
                {formatCurrency(balanceUsd)}
              </p>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-slate-200">
              <Link href="/profile" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity group/avatar">
                <div className="flex flex-col items-end hidden xs:flex">
                  <p className="text-xs font-bold text-slate-900 leading-none transition-colors">
                    {user.name}
                  </p>
                  <p className="text-[10px] font-medium text-slate-500 mt-1 transition-colors">
                    {user.email}
                  </p>
                </div>
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden transition-all group-hover/avatar:ring-2 group-hover/avatar:ring-slate-900 group-hover/avatar:ring-offset-2">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-slate-600">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full bg-white px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-slate-200">
              <Link href="/profile" className="hidden xs:flex flex-col items-end hover:opacity-80 transition-opacity">
                <p className="text-xs font-bold text-slate-900 leading-none transition-colors">
                  Guest
                </p>
                <p className="text-[10px] font-medium text-slate-500 mt-1 transition-colors">
                  Demo Mode
                </p>
              </Link>
              <Link href="/profile" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 transition-all hover:ring-2 hover:ring-slate-900 hover:ring-offset-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
