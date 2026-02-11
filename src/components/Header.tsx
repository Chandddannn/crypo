"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, balanceUsd, logout } = useWallet();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
    setShowMobileMenu(false);
    logout();
    router.push("/");
  };

  const handleProfileClick = () => {
    setShowMobileMenu(false);
    router.push("/profile");
  };

  const handleLoginClick = () => {
    setShowMobileMenu(false);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100/80 bg-white/70 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 relative z-10">
        {/* Logo Section */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-12 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative h-9 w-9 sm:h-12 sm:w-12 overflow-hidden rounded-xl sm:rounded-2xl bg-slate-900 flex items-center justify-center transition-all duration-500 group-hover:rotate-[10deg] group-hover:scale-110 shadow-lg sm:shadow-xl shadow-slate-900/30 ring-2 sm:ring-4 ring-slate-100 group-hover:ring-sky-100">
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/30 via-transparent to-rose-500/20" />
              <span className="relative text-white font-black text-xl sm:text-3xl tracking-tighter drop-shadow-lg">
                🐈
              </span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-lg sm:text-xl font-black uppercase tracking-[0.25em] text-slate-900 leading-none">
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

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all"
                >
                  <span
                    className={`${isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    {link.name}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 z-[-1] rounded-lg bg-slate-100/80 shadow-sm ring-1 ring-slate-200/50"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 flex-shrink-0">
          {/* Mobile Navigation */}
          <nav className="flex lg:hidden items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest transition-all rounded-lg ${
                    isActive
                      ? "text-slate-900 bg-slate-100 shadow-sm"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Wallet Balance - Hidden on xs, visible on sm+ */}
          {user && (
            <Link
              href="/portfolio"
              className="group hidden sm:flex flex-col items-end px-3 sm:px-4 py-1.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
            >
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 transition-colors group-hover:text-sky-500">
                Balance
              </p>
              <p className="text-xs sm:text-sm font-black text-slate-900 transition-colors tabular-nums">
                {formatCurrency(balanceUsd)}
              </p>
            </Link>
          )}

          {/* User Section */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-100 relative">
            {user ? (
              <>
                {/* Desktop User Section */}
                <div className="hidden sm:flex items-center gap-3">
                  <Link
                    href="/profile"
                    className="relative group/avatar flex-shrink-0"
                  >
                    <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center border-2 border-slate-100 transition-all duration-300 group-hover/avatar:border-slate-900 group-hover/avatar:shadow-lg overflow-hidden">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
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
                    className="rounded-lg sm:rounded-xl bg-slate-50 px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-[0.15em] text-slate-600 border border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 shadow-sm active:scale-95"
                  >
                    Logout
                  </button>
                </div>

                {/* Mobile User Menu */}
                <div className="sm:hidden relative">
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="relative group/avatar flex-shrink-0"
                  >
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border-2 border-slate-100 transition-all duration-300 group-hover/avatar:border-slate-900 overflow-hidden">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-black text-slate-600">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                  </button>

                  <AnimatePresence>
                    {showMobileMenu && (
                      <>
                        {/* Backdrop */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                          onClick={() => setShowMobileMenu(false)}
                        />

                        {/* Menu */}
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{
                            type: "spring",
                            bounce: 0.3,
                            duration: 0.3,
                          }}
                          className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                        >
                          {/* User Info */}
                          <div className="p-4 bg-slate-50 border-b border-slate-100">
                            <p className="text-xs font-black text-slate-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5">
                              {user.email}
                            </p>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            <button
                              onClick={handleProfileClick}
                              className="w-full px-4 py-3 text-left text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                              View Profile
                            </button>

                            {/* Wallet Balance in Mobile Menu */}
                            <Link
                              href="/portfolio"
                              onClick={() => setShowMobileMenu(false)}
                              className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 border-t border-slate-100"
                            >
                              <div className="flex items-center gap-3">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <rect
                                    width="20"
                                    height="14"
                                    x="2"
                                    y="5"
                                    rx="2"
                                  />
                                  <line x1="2" x2="22" y1="10" y2="10" />
                                </svg>
                                <span className="text-sm font-black text-slate-700">
                                  Balance
                                </span>
                              </div>
                              <span className="text-xs font-black text-emerald-600 tabular-nums">
                                {formatCurrency(balanceUsd)}
                              </span>
                            </Link>

                            <div className="border-t border-slate-100 mt-2 pt-2">
                              <button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 text-left text-sm font-black text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-3"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                  <polyline points="16 17 21 12 16 7" />
                                  <line x1="21" x2="9" y1="12" y2="12" />
                                </svg>
                                Logout
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                {/* Desktop Guest */}
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-2 rounded-lg sm:rounded-xl bg-slate-50 px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-[0.15em] text-slate-600 border border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 shadow-sm active:scale-95"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" x2="3" y1="12" y2="12" />
                  </svg>
                  Login
                </Link>

                {/* Mobile Guest Menu */}
                <div className="sm:hidden relative">
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="group flex-shrink-0"
                  >
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border-2 border-slate-100 transition-all duration-300 group-hover:border-slate-900 overflow-hidden">
                      <span className="text-xs font-black text-slate-400 group-hover:text-slate-900 transition-colors">
                        ?
                      </span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {showMobileMenu && (
                      <>
                        {/* Backdrop */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                          onClick={() => setShowMobileMenu(false)}
                        />

                        {/* Menu */}
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{
                            type: "spring",
                            bounce: 0.3,
                            duration: 0.3,
                          }}
                          className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                        >
                          {/* Guest Header */}
                          <div className="p-4 bg-slate-50 border-b border-slate-100">
                            <p className="text-xs font-black text-slate-900">
                              Welcome to CryptoCat
                            </p>
                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                              Virtual Trading Terminal
                            </p>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            <button
                              onClick={handleLoginClick}
                              className="w-full px-4 py-3 text-left text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                <polyline points="10 17 15 12 10 7" />
                                <line x1="15" x2="3" y1="12" y2="12" />
                              </svg>
                              Login
                            </button>

                            <button
                              onClick={handleLoginClick}
                              className="w-full px-4 py-3 text-left text-sm font-black text-sky-600 hover:bg-sky-50 transition-colors flex items-center gap-3 border-t border-slate-100"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <line x1="19" x2="19" y1="8" y2="14" />
                                <line x1="22" x2="16" y1="11" y2="11" />
                              </svg>
                              Create Account
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
