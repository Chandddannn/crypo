"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout, trades, balanceUsd, lastSession } = useWallet();
  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showFlashback, setShowFlashback] = useState(false);

  useEffect(() => {
    if (!user) {
      if (lastSession) {
        setShowFlashback(true);
        const timer = setTimeout(() => {
          setShowFlashback(false);
          router.push("/login");
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        router.push("/login");
      }
    }
  }, [user, router, lastSession]);

  if (!user && !showFlashback) return null;

  // Use either active user data or last session data for the flashback
  const displayUser = user || lastSession?.user;
  const displayBalance = user ? balanceUsd : (lastSession?.balanceUsd || 0);
  const displayTrades = user ? trades : (lastSession?.trades || []);

  if (showFlashback && lastSession) {
    // Render a simplified "Portfolio flashback" version
    return (
      <main className="min-h-screen px-4 py-12 md:px-10 lg:px-16 bg-white animate-pulse">
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end opacity-50">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 ring-1 ring-sky-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-600">
                  Last Session Flashback
                </p>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
                {lastSession.user.name}&apos;s Dashboard
              </h1>
            </div>
            <div className="glass-panel min-w-[200px] p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total Equity</p>
              <p className="text-3xl font-black text-slate-900">
                {lastSession.balanceUsd.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </p>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3 opacity-40">
            <div className="glass-panel p-6 h-32 flex flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Open Positions</p>
              <span className="text-3xl font-black text-slate-900">{Object.keys(lastSession.positions).length}</span>
            </div>
            <div className="glass-panel p-6 h-32 flex flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Recent Trades</p>
              <span className="text-3xl font-black text-slate-900">{lastSession.trades.length}</span>
            </div>
            <div className="glass-panel p-6 h-32 flex flex-col justify-center bg-slate-900 text-white">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Session Status</p>
              <span className="text-xl font-black">Logged Out</span>
            </div>
          </div>

          <div className="glass-panel h-64 flex items-center justify-center border-dashed border-2 opacity-30">
            <p className="font-black uppercase tracking-[0.3em] text-slate-500">Restoring View...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setUser({
      ...user,
      name,
      avatarUrl
    });
    
    setSaveStatus("saved");
    setIsEditing(false);
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  const totalTrades = trades.length;
  const buyTrades = trades.filter(t => t.type === "BUY").length;
  const sellTrades = trades.filter(t => t.type === "SELL").length;
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:py-12 md:px-10 lg:px-16 bg-white transition-colors">
      <div className="mx-auto max-w-5xl space-y-8 sm:y-10">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push("/")}
            className="group flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 transition-all hover:text-slate-900"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-all group-hover:-translate-x-1 group-hover:bg-slate-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </div>
            Back to Dashboard
          </button>
          
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
          >
            Sign Out
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          </button>
        </div>

        <header className="flex flex-col items-start gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
              Profile
            </h1>
            <p className="max-w-xl text-xs sm:text-sm font-medium leading-relaxed text-slate-600">
              Update your personal details and security preferences.
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[320px_1fr]">
          {/* Sidebar / Profile Card */}
          <aside className="space-y-8">
            <div className="glass-panel overflow-hidden p-6 sm:p-8 text-center transition-all hover:shadow-2xl hover:shadow-slate-200/50">
              <div className="relative mx-auto mb-6 h-24 w-24 sm:h-32 sm:w-32">
                <div className="h-full w-full rounded-full bg-slate-50 p-1 ring-1 ring-slate-200">
                  <div className="h-full w-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl sm:text-4xl font-black text-slate-300">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg ring-4 ring-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-black text-slate-900">{user.name}</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">{user.email}</p>
              
              <div className="mt-8 pt-8 border-t border-slate-100/50 grid grid-cols-2 gap-4">
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Net Worth</p>
                  <p className="text-sm font-black text-slate-900 tabular-nums">{formatCurrency(balanceUsd)}</p>
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Activity</p>
                  <p className="text-sm font-black text-slate-900 tabular-nums">{totalTrades} Trades</p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Trading Performance</h3>
                <div className="h-4 w-4 text-emerald-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                </div>
              </div>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Buy Orders</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{buyTrades}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-rose-500" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sell Orders</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{sellTrades}</span>
                </div>
                <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div 
                    className="absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-1000" 
                    style={{ width: `${totalTrades > 0 ? (buyTrades / totalTrades) * 100 : 50}%` }}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content / Form */}
          <div className="min-w-0 space-y-8">
            <div className="glass-panel p-8">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Personal Information</h3>
                    <p className="text-xs font-medium text-slate-600">Your identity and public profile data.</p>
                  </div>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="rounded-full bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-900 ring-1 ring-slate-200 transition-all hover:bg-slate-100"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-8">
                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">Full Name</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-900 outline-none ring-sky-500/10 transition-all focus:border-sky-500 focus:ring-8 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-3.5 text-sm font-bold text-slate-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">Avatar URL</label>
                  <div className="relative">
                    <input
                      type="url"
                      disabled={!isEditing}
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-900 outline-none ring-sky-500/10 transition-all focus:border-sky-500 focus:ring-8 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                    <button
                      type="submit"
                      disabled={saveStatus === "saving"}
                      className="rounded-full bg-slate-900 px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-sky-600 hover:shadow-sky-500/30 active:scale-95 disabled:bg-slate-400"
                    >
                      {saveStatus === "saving" ? "Saving..." : "Save Profile"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setName(user.name);
                        setAvatarUrl(user.avatarUrl || "");
                      }}
                      className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                
                {saveStatus === "saved" && (
                  <div className="flex items-center gap-2 text-emerald-600 animate-in fade-in slide-in-from-left-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    <p className="text-[10px] font-black uppercase tracking-widest">Changes Saved</p>
                  </div>
                )}
              </form>
            </div>

            <div className="glass-panel p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-900 ring-1 ring-slate-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Security & Privacy</h3>
                  <p className="text-xs font-medium text-slate-600">Manage your password and authentication methods.</p>
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="group flex items-center justify-between p-5 rounded-2xl bg-white ring-1 ring-slate-100 transition-all hover:ring-slate-200 hover:shadow-lg hover:shadow-slate-100/50">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:text-slate-900 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4c.4-.4.6-1 .6-1.6V10l6.6-6.6c.4-.4.4-1 0-1.4l-2-2c-.4-.4-1-.4-1.4 0L10 6.6H7.4c-.6 0-1.2.2-1.6.6L4.4 8.6c-.4.4-.4 1 0 1.4l1.5 1.5L2 15v3Z"/><circle cx="17" cy="7" r="1"/></svg>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Password</p>
                      <p className="text-[10px] text-slate-500">Updated 90d ago</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest text-sky-600 hover:text-sky-700 transition-colors">Update</button>
                </div>
                
                <div className="group flex items-center justify-between p-5 rounded-2xl bg-white ring-1 ring-slate-100 transition-all hover:ring-slate-200 hover:shadow-lg hover:shadow-slate-100/50">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:text-emerald-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-wider">2-Factor Auth</p>
                      <p className="text-[10px] text-rose-500 font-bold uppercase">Disabled</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors">Enable</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
