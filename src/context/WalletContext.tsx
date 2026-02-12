"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getBinanceSymbol, getCoinId } from "@/utils/binance";
import {
  executeTrade,
  Position as EnginePosition,
  TradeRequest,
} from "@/utils/tradeEngine";

type TradeType = "BUY" | "SELL";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface Trade {
  id: string;
  type: TradeType;
  assetId: string;
  symbol: string;
  name: string;
  usdAmount: number;
  quantity: number;
  priceUsd: number;
  realizedPnlUsd?: number;
  timestamp: string;
}

export interface Position {
  assetId: string;
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPriceUsd: number;
}

export interface WalletState {
  user?: UserProfile;
  ownerName?: string;
  // Map of userId -> wallet data
  userWallets: Record<
    string,
    {
      balanceUsd: number;
      positions: Record<string, Position>;
      trades: Trade[];
    }
  >;
}

interface WalletContextValue extends Omit<WalletState, "userWallets"> {
  balanceUsd: number;
  positions: Record<string, Position>;
  trades: Trade[];
  prices: Record<string, number>;
  buy: (params: {
    assetId: string;
    symbol: string;
    name: string;
    usdAmount?: number;
    quantity?: number;
    priceUsd: number;
  }) => void;
  sell: (params: {
    assetId: string;
    symbol: string;
    name: string;
    usdAmount?: number;
    quantity?: number;
    priceUsd: number;
  }) => void;
  getPosition: (assetId: string) => Position | undefined;
  getUnrealizedPnl: (assetId: string, currentPriceUsd: number) => number;
  updatePrice: (assetId: string, priceUsd: number) => void;
  setOwnerName: (name: string) => void;
  setUser: (user: UserProfile | undefined) => void;
  subscribeToPrice: (assetId: string) => void;
  unsubscribeFromPrice: (assetId: string) => void;
  logout: () => void;
  lastSession: {
    user: UserProfile;
    balanceUsd: number;
    positions: Record<string, Position>;
    trades: Trade[];
  } | null;
}

const DEFAULT_BALANCE = 10000;
const STORAGE_KEY = "coinswitch_virtual_wallet_v2";

const defaultState: WalletState = {
  ownerName: "Demo Trader",
  userWallets: {},
};

const WalletContext = createContext<WalletContextValue | null>(null);

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<WalletState>(defaultState);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [hydrated, setHydrated] = useState(false);
  const [subscribedIds, setSubscribedIds] = useState<Set<string>>(new Set());
  const [lastSession, setLastSession] = useState<{
    user: UserProfile;
    balanceUsd: number;
    positions: Record<string, Position>;
    trades: Trade[];
  } | null>(null);
  const ws = useRef<WebSocket | null>(null);

  // Update lastSession when user is active
  useEffect(() => {
    if (state.user) {
      const active = state.userWallets[state.user.id];
      if (active) {
        setLastSession({
          user: state.user,
          balanceUsd: active.balanceUsd,
          positions: active.positions,
          trades: active.trades,
        });
      }
    }
  }, [state.user, state.userWallets]);

  // Hydrate from API on client
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadData = async () => {
      try {
        // Load user from localStorage (auth is still client-side for now)
        const rawUser = window.localStorage.getItem("coinswitch_user");
        let currentUser: UserProfile | undefined;
        if (rawUser) {
          currentUser = JSON.parse(rawUser);
        }

        const finalWallets: Record<
          string,
          {
            balanceUsd: number;
            positions: Record<string, Position>;
            trades: Trade[];
          }
        > = {};

        // Load wallet from MongoDB API if user is logged in
        if (currentUser?.id) {
          console.log("🔄 Loading wallet for user:", currentUser.id);
          const response = await fetch(`/api/wallet?userId=${currentUser.id}`);
          if (response.ok) {
            const walletData = await response.json();
            console.log(
              "✅ Wallet loaded - Balance:",
              walletData.balanceUsd,
              "Trades:",
              walletData.trades?.length || 0,
            );
            finalWallets[currentUser.id] = walletData;
          } else {
            console.log("⚠️ Wallet API error, using defaults");
            // If wallet doesn't exist, it will be created by the API
            finalWallets[currentUser.id] = {
              balanceUsd: DEFAULT_BALANCE,
              positions: {},
              trades: [],
            };
          }
        }

        setState({
          user: currentUser,
          ownerName: currentUser?.name || "Demo Trader",
          userWallets: finalWallets,
        });
      } catch (error) {
        console.error("Failed to hydrate wallet state:", error);
      } finally {
        setHydrated(true);
      }
    };

    loadData();
  }, []);

  // Persist specific user wallet to API
  useEffect(() => {
    if (!hydrated || !state.user?.id) return;

    const activeWalletData = state.userWallets[state.user.id];
    if (!activeWalletData) return;

    const saveData = async () => {
      try {
        console.log(
          "💾 Saving wallet - Balance:",
          activeWalletData.balanceUsd,
          "Trades:",
          activeWalletData.trades?.length || 0,
        );
        const response = await fetch("/api/wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: state.user?.id,
            walletData: activeWalletData,
          }),
        });
        if (response.ok) {
          console.log("✅ Wallet saved successfully");
        } else {
          console.error("❌ Failed to save wallet:", await response.text());
        }
      } catch (error) {
        console.error("❌ Failed to persist wallet state:", error);
      }
    };

    // Debounce saves or just save on state change
    const timeout = setTimeout(saveData, 1000);
    return () => clearTimeout(timeout);
  }, [state.userWallets, state.user?.id, hydrated]);

  // Active wallet helper
  const activeWallet = useMemo(() => {
    const userId = state.user?.id;
    if (!userId) {
      return {
        balanceUsd: 0,
        positions: {},
        trades: [],
      };
    }
    const wallet = state.userWallets[userId];
    if (wallet) return wallet;

    // Return a default wallet structure if not found
    return {
      balanceUsd: DEFAULT_BALANCE,
      positions: {},
      trades: [],
    };
  }, [state.user, state.userWallets]);

  // WebSocket for real-time prices
  useEffect(() => {
    const positionIds = Object.keys(activeWallet.positions);
    // Include some default popular coins if not already held
    const defaultIds = ["bitcoin", "ethereum", "solana"];
    const allIds = Array.from(
      new Set([...positionIds, ...defaultIds, ...Array.from(subscribedIds)]),
    );

    const symbols = allIds
      .map((id) => getBinanceSymbol(id))
      .filter((s): s is string => !!s);

    if (!symbols.length) return;

    // Close existing connection
    if (ws.current) {
      ws.current.onclose = null;
      ws.current.onerror = null;
      ws.current.onmessage = null;
      ws.current.close();
    }

    const streams = symbols.map((s) => `${s.toLowerCase()}@trade`).join("/");
    // Binance combined streams use /stream?streams= format
    const url =
      symbols.length > 1
        ? `wss://stream.binance.com/stream?streams=${streams}`
        : `wss://stream.binance.com/ws/${streams}`;

    const connect = () => {
      // Don't connect if the component is unmounting
      if (
        ws.current?.readyState === WebSocket.OPEN ||
        ws.current?.readyState === WebSocket.CONNECTING
      )
        return;

      console.log("Connecting to Binance WebSocket:", url);
      const socket = new WebSocket(url);
      ws.current = socket;

      socket.onopen = () => {
        console.log("Binance WebSocket Connected");
      };

      socket.onmessage = (event) => {
        try {
          const rawData = JSON.parse(event.data);
          // Combined streams wrap data in { stream: string, data: T }
          const data = symbols.length > 1 ? rawData.data : rawData;

          if (data.e === "trade") {
            const symbol = data.s.toLowerCase();
            const price = parseFloat(data.p);
            const coinId = getCoinId(symbol);

            if (coinId) {
              setPrices((prev) => {
                if (prev[coinId] === price) return prev;
                return { ...prev, [coinId]: price };
              });
            }
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      socket.onerror = (error) => {
        // Log more detail if available, though WebSocket error events are often opaque
        console.error("Binance WebSocket Error:", error);
      };

      socket.onclose = (event) => {
        console.log(
          `Binance WebSocket Closed: Code ${event.code}, Reason: ${event.reason || "No reason"}`,
        );
        // Reconnect after 5 seconds if closed unexpectedly (not by our code)
        // Code 1000 is normal closure
        if (event.code !== 1000 && ws.current === socket) {
          console.log("Attempting to reconnect in 5s...");
          setTimeout(connect, 5000);
        }
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.onclose = null; // Prevent reconnection
        ws.current.close();
      }
    };
  }, [
    Object.keys(activeWallet.positions).join(","),
    Array.from(subscribedIds).join(","),
  ]);

  const updatePrice = useCallback((assetId: string, priceUsd: number) => {
    setPrices((prev) => {
      if (prev[assetId] === priceUsd) return prev;
      return { ...prev, [assetId]: priceUsd };
    });
  }, []);

  const buy = useCallback(
    (params: {
      assetId: string;
      symbol: string;
      name: string;
      usdAmount?: number;
      quantity?: number;
      priceUsd: number;
    }) => {
      const userId = state.user?.id;
      if (!userId) return;

      setState((prev) => {
        const currentWallet = prev.userWallets[userId] ?? {
          balanceUsd: DEFAULT_BALANCE,
          positions: {},
          trades: [],
        };

        const currentPosition = currentWallet.positions[params.assetId];

        // Determine USD amount to spend:
        // 1. If explicit quantity provided, calculate USD amount based on current price.
        // 2. If usdAmount provided, use it directly.
        let usdToSpend = 0;
        if (params.usdAmount !== undefined) {
          usdToSpend = params.usdAmount;
        } else if (params.quantity !== undefined) {
          usdToSpend = params.quantity * params.priceUsd;
        }

        if (usdToSpend <= 0) return prev;

        const result = executeTrade(
          currentWallet.balanceUsd,
          currentPosition,
          params.priceUsd,
          {
            type: "BUY",
            assetId: params.assetId,
            symbol: params.symbol,
            name: params.name,
            amount: usdToSpend,
          },
        );

        if (!result.success) {
          console.error("Trade execution failed:", result.error);
          return prev;
        }

        const trade: Trade = {
          id: generateId(),
          type: "BUY",
          assetId: params.assetId,
          symbol: params.symbol,
          name: params.name,
          usdAmount: result.totalCostUsd - result.feeUsd,
          quantity: result.quantity,
          priceUsd: result.executedPrice,
          timestamp: new Date().toISOString(),
        };

        return {
          ...prev,
          userWallets: {
            ...prev.userWallets,
            [userId]: {
              balanceUsd: result.newBalance,
              positions: {
                ...currentWallet.positions,
                [params.assetId]: result.newPosition,
              },
              trades: [trade, ...currentWallet.trades],
            },
          },
        };
      });
    },
    [state.user],
  );

  const sell = useCallback(
    (params: {
      assetId: string;
      symbol: string;
      name: string;
      usdAmount?: number;
      quantity?: number;
      priceUsd: number;
    }) => {
      const userId = state.user?.id;
      if (!userId) return;

      setState((prev) => {
        const currentWallet = prev.userWallets[userId];
        if (!currentWallet) return prev;

        const currentPosition = currentWallet.positions[params.assetId];
        if (!currentPosition) return prev;

        // Determine quantity to sell:
        // 1. If explicit quantity provided (e.g. "Sell All"), use it.
        // 2. If usdAmount provided, calculate quantity based on current price.
        let quantityToSell = 0;
        if (params.quantity !== undefined) {
          quantityToSell = params.quantity;
        } else if (params.usdAmount !== undefined) {
          quantityToSell = params.usdAmount / params.priceUsd;
        }

        if (quantityToSell <= 0) return prev;

        const result = executeTrade(
          currentWallet.balanceUsd,
          currentPosition,
          params.priceUsd,
          {
            type: "SELL",
            assetId: params.assetId,
            symbol: params.symbol,
            name: params.name,
            amount: quantityToSell,
          },
        );

        if (!result.success) {
          console.error("Trade execution failed:", result.error);
          return prev;
        }

        const trade: Trade = {
          id: generateId(),
          type: "SELL",
          assetId: params.assetId,
          symbol: params.symbol,
          name: params.name,
          usdAmount: result.totalCostUsd, // Net proceeds
          quantity: result.quantity,
          priceUsd: result.executedPrice,
          realizedPnlUsd: result.realizedPnl,
          timestamp: new Date().toISOString(),
        };

        const newPositions = { ...currentWallet.positions };
        if (result.newPosition.quantity <= 0) {
          delete newPositions[params.assetId];
        } else {
          newPositions[params.assetId] = result.newPosition;
        }

        return {
          ...prev,
          userWallets: {
            ...prev.userWallets,
            [userId]: {
              balanceUsd: result.newBalance,
              positions: newPositions,
              trades: [trade, ...currentWallet.trades],
            },
          },
        };
      });
    },
    [state.user],
  );

  const getPosition = useCallback(
    (assetId: string) => activeWallet.positions[assetId],
    [activeWallet.positions],
  );

  const getUnrealizedPnl = useCallback(
    (assetId: string, currentPriceUsd: number) => {
      const pos = activeWallet.positions[assetId];
      if (!pos || !currentPriceUsd) return 0;
      return (currentPriceUsd - pos.avgBuyPriceUsd) * pos.quantity;
    },
    [activeWallet.positions],
  );

  const setOwnerName = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      ownerName: name.trim() || "Demo Trader",
    }));
  }, []);

  const setUser = useCallback((user: UserProfile | undefined) => {
    setState((prev) => {
      const newState = {
        ...prev,
        user,
        ownerName: user?.name ?? prev.ownerName ?? "Demo Trader",
      };

      // Initialize wallet for new user if it doesn't exist
      if (user?.id && !prev.userWallets[user.id]) {
        newState.userWallets = {
          ...prev.userWallets,
          [user.id]: {
            balanceUsd: DEFAULT_BALANCE,
            positions: {},
            trades: [],
          },
        };
      }
      return newState;
    });

    if (typeof window !== "undefined") {
      if (user) {
        window.localStorage.setItem("coinswitch_user", JSON.stringify(user));
      } else {
        window.localStorage.removeItem("coinswitch_user");
      }
    }
  }, []);

  const subscribeToPrice = useCallback((assetId: string) => {
    setSubscribedIds((prev) => {
      const next = new Set(prev);
      next.add(assetId);
      return next;
    });
  }, []);

  const unsubscribeFromPrice = useCallback((assetId: string) => {
    setSubscribedIds((prev) => {
      const next = new Set(prev);
      next.delete(assetId);
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    setUser(undefined);
    setLastSession(null);
  }, [setUser]);

  const value: WalletContextValue | null = useMemo(
    () =>
      hydrated
        ? {
            user: state.user,
            ownerName: state.ownerName,
            balanceUsd: activeWallet.balanceUsd,
            positions: activeWallet.positions,
            trades: activeWallet.trades,
            prices,
            buy,
            sell,
            getPosition,
            getUnrealizedPnl,
            updatePrice,
            setOwnerName,
            setUser,
            subscribeToPrice,
            unsubscribeFromPrice,
            logout,
            lastSession,
          }
        : null,
    [
      state.user,
      state.ownerName,
      activeWallet,
      prices,
      buy,
      sell,
      getPosition,
      getUnrealizedPnl,
      updatePrice,
      setOwnerName,
      setUser,
      subscribeToPrice,
      unsubscribeFromPrice,
      logout,
      hydrated,
      lastSession,
    ],
  );

  if (!hydrated) {
    // Avoid hydration mismatches; could render a splash screen here
    return null;
  }

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return ctx;
}
