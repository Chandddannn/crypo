/**
 * Maps Internal IDs to Binance trading pairs (USDT).
 */
export interface BinanceCoinMetadata {
  id: string;
  symbol: string;
  name: string;
  binanceSymbol: string;
  logo: string;
}

export const SUPPORTED_COINS: BinanceCoinMetadata[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", binanceSymbol: "btcusdt", logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", binanceSymbol: "ethusdt", logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
  { id: "solana", symbol: "SOL", name: "Solana", binanceSymbol: "solusdt", logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
  { id: "ripple", symbol: "XRP", name: "Ripple", binanceSymbol: "xrpusdt", logo: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", binanceSymbol: "dogeusdt", logo: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png" },
  { id: "cardano", symbol: "ADA", name: "Cardano", binanceSymbol: "adausdt", logo: "https://assets.coingecko.com/coins/images/975/large/cardano.png" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", binanceSymbol: "dotusdt", logo: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin", binanceSymbol: "ltcusdt", logo: "https://assets.coingecko.com/coins/images/2/large/litecoin.png" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", binanceSymbol: "linkusdt", logo: "https://assets.coingecko.com/coins/images/877/large/chainlink-logo.png" },
  { id: "shiba-inu", symbol: "SHIB", name: "Shiba Inu", binanceSymbol: "shibusdt", logo: "https://assets.coingecko.com/coins/images/11939/large/shiba.png" },
  { id: "avalanche", symbol: "AVAX", name: "Avalanche", binanceSymbol: "avaxusdt", logo: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png" },
  { id: "stellar", symbol: "XLM", name: "Stellar", binanceSymbol: "xlmusdt", logo: "https://assets.coingecko.com/coins/images/100/large/stellar.png" },
  { id: "tron", symbol: "TRX", name: "TRON", binanceSymbol: "trxusdt", logo: "https://assets.coingecko.com/coins/images/1094/large/tron-logo.png" },
  { id: "monero", symbol: "XMR", name: "Monero", binanceSymbol: "xmrusdt", logo: "https://assets.coingecko.com/coins/images/69/large/monero_logo.png" },
  { id: "cosmos", symbol: "ATOM", name: "Cosmos", binanceSymbol: "atomusdt", logo: "https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png" },
  { id: "uniswap", symbol: "UNI", name: "Uniswap", binanceSymbol: "uniusdt", logo: "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png" },
  { id: "aptos", symbol: "APT", name: "Aptos", binanceSymbol: "aptusdt", logo: "https://assets.coingecko.com/coins/images/26455/large/aptos_round.png" },
  { id: "near", symbol: "NEAR", name: "NEAR Protocol", binanceSymbol: "nearusdt", logo: "https://assets.coingecko.com/coins/images/10365/large/near.png" },
  { id: "vechain", symbol: "VET", name: "VeChain", binanceSymbol: "vetusdt", logo: "https://assets.coingecko.com/coins/images/1167/large/Vechain-Logo-768x725.png" },
  { id: "filecoin", symbol: "FIL", name: "Filecoin", binanceSymbol: "filusdt", logo: "https://assets.coingecko.com/coins/images/12817/large/filecoin.png" },
  { id: "optimism", symbol: "OP", name: "Optimism", binanceSymbol: "opusdt", logo: "https://assets.coingecko.com/coins/images/25244/large/Optimism.png" },
  { id: "arbitrum", symbol: "ARB", name: "Arbitrum", binanceSymbol: "arbusdt", logo: "https://assets.coingecko.com/coins/images/16547/large/photo_2023-03-29_21.47.00.jpeg" },
  { id: "celestia", symbol: "TIA", name: "Celestia", binanceSymbol: "tiausdt", logo: "https://assets.coingecko.com/coins/images/31967/large/tia.png" },
  { id: "sei", symbol: "SEI", name: "Sei", binanceSymbol: "seiusdt", logo: "https://assets.coingecko.com/coins/images/30632/large/sei.png" },
  { id: "injective", symbol: "INJ", name: "Injective", binanceSymbol: "injusdt", logo: "https://assets.coingecko.com/coins/images/12882/large/Secondary_Logo.png" },
  { id: "fantom", symbol: "FTM", name: "Fantom", binanceSymbol: "ftmusdt", logo: "https://assets.coingecko.com/coins/images/4001/large/Fantom.png" },
  { id: "sui", symbol: "SUI", name: "Sui", binanceSymbol: "suiusdt", logo: "https://assets.coingecko.com/coins/images/26375/large/sui-ocean-square.png" },
  { id: "polygon", symbol: "MATIC", name: "Polygon", binanceSymbol: "maticusdt", logo: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png" },
  { id: "pepe", symbol: "PEPE", name: "Pepe", binanceSymbol: "pepeusdt", logo: "https://assets.coingecko.com/coins/images/29850/large/pepe-token-icon.png" },
  { id: "worldcoin", symbol: "WLD", name: "Worldcoin", binanceSymbol: "wldusdt", logo: "https://assets.coingecko.com/coins/images/31069/large/worldcoin.jpeg" },
];

export const COINGECKO_TO_BINANCE: Record<string, string> = SUPPORTED_COINS.reduce(
  (acc, coin) => ({ ...acc, [coin.id]: coin.binanceSymbol }),
  {}
);

export const BINANCE_TO_COIN_ID: Record<string, string> = Object.entries(COINGECKO_TO_BINANCE).reduce(
  (acc, [id, symbol]) => ({ ...acc, [symbol]: id }),
  {}
);

export const getBinanceSymbol = (id: string): string | null => {
  return COINGECKO_TO_BINANCE[id] || null;
};

export const getCoinId = (symbol: string): string | null => {
  return BINANCE_TO_COIN_ID[symbol.toLowerCase()] || null;
};
