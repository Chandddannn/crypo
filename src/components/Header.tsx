"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { motion } from "framer-motion";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, balanceUsd, logout } = useWallet();

  const navLinks = [
    { name: "Markets", href: "/" },
    { name: "Portfolio", href: "/portfolio" },
  ];

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
    <header className="sticky top-0 z-50 w-full border-b border-slate-100/80 bg-white/70 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center gap-4 sm:gap-12">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-slate-900 flex items-center justify-center transition-all duration-500 group-hover:rotate-[10deg] group-hover:scale-110 shadow-xl shadow-slate-900/30 ring-4 ring-slate-100 group-hover:ring-sky-100">
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/30 via-transparent to-rose-500/20" />
              <span className="relative text-white font-black text-3xl tracking-tighter drop-shadow-lg">🐈</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black uppercase tracking-[0.25em] text-slate-900 leading-none">
                CryptoCat
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-1 w-1 rounded-full bg-sky-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-sky-500 leading-none">
                  Virtual Terminal
                </span>
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all"
                >
                  <span className={`${isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}>
                    {link.name}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 z-[-1] rounded-lg bg-slate-100/80 shadow-sm ring-1 ring-slate-200/50"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <nav className="flex md:hidden items-center gap-1 border-r border-slate-100 pr-3 mr-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-2 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                    isActive ? "text-slate-900 bg-slate-100 rounded-md" : "text-slate-400"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {user && (
            <Link
              href="/portfolio"
              className="group hidden sm:flex flex-col items-end px-4 py-1.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
            >
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 transition-colors group-hover:text-sky-500">
                Wallet Balance
              </p>
              <p className="text-sm font-black text-slate-900 transition-colors tabular-nums">
                {formatCurrency(balanceUsd)}
              </p>
            </Link>
          )}

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-slate-100">
                <Link 
                  href="/profile" 
                  className="relative group/avatar"
                >
                  <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center border-2 border-slate-100 transition-all duration-300 group-hover/avatar:border-slate-900 group-hover/avatar:shadow-lg overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-black text-slate-600">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden sm:block rounded-xl bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 border border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 shadow-sm active:scale-95"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                href="/profile" 
                className="group flex items-center gap-3 pl-3 sm:pl-4 border-l border-slate-100"
              >
                <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center border-2 border-slate-100 transition-all duration-300 group-hover:border-slate-900 overflow-hidden">
                  <span className="text-xs font-black text-slate-400 group-hover:text-slate-900 transition-colors">?</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}