"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SUPPORTED_COINS } from "@/utils/binance";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface CoinSearchProps {
  placeholder?: string;
}

export default function CoinSearch({
  placeholder = "Search coins...",
}: CoinSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredCoins = useMemo(() => {
    if (searchQuery.trim() === "") {
      return SUPPORTED_COINS;
    }
    const query = searchQuery.toLowerCase();
    return SUPPORTED_COINS.filter(
      (coin) =>
        coin.name.toLowerCase().includes(query) ||
        coin.symbol.toLowerCase().includes(query) ||
        coin.id.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCoinClick = (coinId: string) => {
    router.push(`/coin/${coinId}`);
    setSearchQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-5 py-3 pl-12 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl
                   focus:border-blue-500 focus:outline-none transition-all duration-200 shadow-sm
                   placeholder:text-gray-400"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </div>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setIsOpen(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && filteredCoins.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-md border-2 border-gray-200
                     rounded-2xl shadow-2xl max-h-96 overflow-y-auto"
          >
            {filteredCoins.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="text-4xl mb-2">🔍</div>
                <p>No coins found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="p-2">
                {filteredCoins.map((coin, index) => (
                  <motion.button
                    key={coin.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    onClick={() => handleCoinClick(coin.id)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-blue-50
                             transition-colors duration-200 group"
                  >
                    {/* Coin Logo */}
                    <div
                      className="w-10 h-10 rounded-full bg-linear-to-br from-blue-100 to-purple-100
                                  flex items-center justify-center shrink-0 group-hover:scale-110
                                  transition-transform duration-200"
                    >
                      {coin.logo ? (
                        <Image
                          src={coin.logo}
                          alt={coin.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <span className="text-lg">🪙</span>
                      )}
                    </div>

                    {/* Coin Info */}
                    <div className="flex-1 text-left">
                      <div
                        className="font-semibold text-gray-800 group-hover:text-blue-600
                                    transition-colors"
                      >
                        {coin.name}
                      </div>
                      <div className="text-sm text-gray-500">{coin.symbol}</div>
                    </div>

                    {/* Arrow */}
                    <div
                      className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1
                                  transition-all duration-200"
                    >
                      →
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Quick Stats */}
            {searchQuery && (
              <div className="border-t border-gray-200 p-3 bg-gray-50/50 text-center text-sm text-gray-500">
                {filteredCoins.length} coin
                {filteredCoins.length !== 1 ? "s" : ""} found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
