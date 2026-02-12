"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Trade {
  id: string;
  type: "BUY" | "SELL";
  assetId: string;
  symbol: string;
  name: string;
  usdAmount: number;
  quantity: number;
  priceUsd: number;
  realizedPnlUsd?: number;
  timestamp: string;
}

interface Position {
  assetId: string;
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPriceUsd: number;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  wallet: {
    balanceUsd: number;
    positionsCount: number;
    tradesCount: number;
    totalTrades: Trade[];
    positions: Record<string, Position>;
  } | null;
}

interface Stats {
  totalUsers: number;
  totalWallets: number;
  totalBalance: string;
  totalTrades: number;
  avgBalancePerUser: string;
  avgTradesPerUser: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Password protection
  useEffect(() => {
    const adminAuth = sessionStorage.getItem("admin_authenticated");
    if (adminAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, statsRes] = await Promise.all([
        fetch("/api/admin?action=users"),
        fetch("/api/admin?action=stats"),
      ]);

      if (usersRes.ok && statsRes.ok) {
        const usersData = await usersRes.json();
        const statsData = await statsRes.json();
        setUsers(usersData.users || []);
        setStats(statsData.stats);
      } else {
        const errorData = await usersRes
          .json()
          .catch(() => ({ error: "Failed to fetch data" }));
        setError(errorData.error || "Failed to load admin data");
      }
    } catch (error) {
      console.error("Failed to load admin data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to connect to server",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in production, use proper authentication
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";
    if (password === adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_authenticated", "true");
      setAuthError("");
    } else {
      setAuthError("Invalid password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
    router.push("/");
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin?userId=${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== userId));
        setShowDeleteConfirm(null);
        setSelectedUser(null);
        // Reload stats
        const statsRes = await fetch("/api/admin?action=stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-200"
        >
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🛡️</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Admin Access
            </h1>
            <p className="text-gray-600">Enter password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 text-sm transition-colors"
            >
              ← Back to Home
            </Link>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Demo Password:</strong>{" "}
              {process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123"}
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Change NEXT_PUBLIC_ADMIN_PASSWORD in .env.local for production!
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
              >
                ← Back to Home
              </Link>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                🛡️ Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Manage users and monitor platform activity
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-red-600 text-xl">⚠️</span>
              <div>
                <p className="text-red-800 font-semibold">Error loading data</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={loadData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon="👥"
              color="blue"
            />
            <StatCard
              title="Total Balance"
              value={`$${parseFloat(stats.totalBalance).toLocaleString()}`}
              icon="💰"
              color="green"
            />
            <StatCard
              title="Total Trades"
              value={stats.totalTrades}
              icon="📊"
              color="purple"
            />
            <StatCard
              title="Avg Balance/User"
              value={`$${parseFloat(stats.avgBalancePerUser).toLocaleString()}`}
              icon="💵"
              color="emerald"
            />
            <StatCard
              title="Avg Trades/User"
              value={parseFloat(stats.avgTradesPerUser).toFixed(1)}
              icon="📈"
              color="orange"
            />
            <StatCard
              title="Active Wallets"
              value={stats.totalWallets}
              icon="👛"
              color="pink"
            />
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Users</h2>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Balance
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Positions
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Trades
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Joined
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-800">
                          {user.name}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-600 text-sm">
                          {user.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-semibold text-green-600">
                          ${user.wallet?.balanceUsd.toLocaleString() || "0.00"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {user.wallet?.positionsCount || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {user.wallet?.tradesCount || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm mr-2"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(user.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">
                    User Details
                  </h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* User Info */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    Account Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-800">
                        {selectedUser.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-800">
                        {selectedUser.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">User ID</p>
                      <p className="font-mono text-xs text-gray-800">
                        {selectedUser.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Joined</p>
                      <p className="font-medium text-gray-800">
                        {new Date(selectedUser.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Wallet Info */}
                {selectedUser.wallet && (
                  <>
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">
                        Wallet
                      </h4>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">
                          Available Balance
                        </p>
                        <p className="text-3xl font-bold text-green-600">
                          $
                          {selectedUser.wallet.balanceUsd.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Positions */}
                    {Object.keys(selectedUser.wallet.positions).length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">
                          Positions (
                          {Object.keys(selectedUser.wallet.positions).length})
                        </h4>
                        <div className="space-y-2">
                          {Object.values(selectedUser.wallet.positions).map(
                            (position) => (
                              <div
                                key={position.assetId}
                                className="bg-blue-50 p-3 rounded-lg flex items-center justify-between"
                              >
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {position.name} (
                                    {position.symbol.toUpperCase()})
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Quantity: {position.quantity.toFixed(8)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-800">
                                    ${position.avgBuyPriceUsd.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Avg Buy Price
                                  </p>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {/* Trade History */}
                    {selectedUser.wallet.totalTrades.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">
                          Recent Trades (
                          {selectedUser.wallet.totalTrades.length})
                        </h4>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                          {selectedUser.wallet.totalTrades
                            .slice()
                            .reverse()
                            .slice(0, 20)
                            .map((trade) => (
                              <div
                                key={trade.id}
                                className={`p-3 rounded-lg ${
                                  trade.type === "BUY"
                                    ? "bg-green-50 border-l-4 border-green-500"
                                    : "bg-red-50 border-l-4 border-red-500"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-gray-800">
                                      <span
                                        className={
                                          trade.type === "BUY"
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }
                                      >
                                        {trade.type}
                                      </span>{" "}
                                      {trade.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {new Date(
                                        trade.timestamp,
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-gray-800">
                                      ${trade.usdAmount.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {trade.quantity.toFixed(8)}{" "}
                                      {trade.symbol.toUpperCase()}
                                    </p>
                                    {trade.realizedPnlUsd !== undefined && (
                                      <p
                                        className={`text-xs font-medium ${
                                          trade.realizedPnlUsd >= 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        P&L: ${trade.realizedPnlUsd.toFixed(2)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                ⚠️ Confirm Deletion
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this user and all their data?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    emerald: "from-emerald-500 to-emerald-600",
    orange: "from-orange-500 to-orange-600",
    pink: "from-pink-500 to-pink-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${colorMap[color]} rounded-2xl p-6 text-white shadow-lg`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-white/90 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </motion.div>
  );
}
