/**
 * Trade Execution Engine for Virtual Crypto Trading Simulator
 */

export interface Position {
  assetId: string;
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPriceUsd: number;
}

export type TradeType = "BUY" | "SELL";

export interface TradeRequest {
  type: TradeType;
  assetId: string;
  symbol: string;
  name: string;
  amount: number; // For BUY: amount in USD, For SELL: amount in Quantity
}

export interface TradeResult {
  success: boolean;
  error?: string;
  executedPrice: number;
  quantity: number;
  feeUsd: number;
  totalCostUsd: number;
  newBalance: number;
  newPosition: Position;
  realizedPnl?: number;
}

const TRANSACTION_FEE_RATE = 0.001; // 0.1%
const MIN_SLIPPAGE = 0.0001; // 0.01%
const MAX_SLIPPAGE = 0.0005; // 0.05%

/**
 * Pure function to execute a trade based on market conditions and user state.
 */
export function executeTrade(
  currentBalance: number,
  currentPosition: Position | undefined,
  targetPrice: number,
  request: TradeRequest
): TradeResult {
  // 1. Simulate Slippage (Spread)
  // For BUY: price goes slightly UP. For SELL: price goes slightly DOWN.
  const slippageFactor = MIN_SLIPPAGE + Math.random() * (MAX_SLIPPAGE - MIN_SLIPPAGE);
  const slippageMultiplier = request.type === "BUY" ? (1 + slippageFactor) : (1 - slippageFactor);
  const executedPrice = targetPrice * slippageMultiplier;

  if (request.type === "BUY") {
    const usdToSpend = request.amount;
    const feeUsd = usdToSpend * TRANSACTION_FEE_RATE;
    const totalCostUsd = usdToSpend + feeUsd;

    // Validation: Insufficient Buying Power
    if (totalCostUsd > currentBalance) {
      return {
        success: false,
        error: `Insufficient balance. Required: $${totalCostUsd.toFixed(2)} (including $${feeUsd.toFixed(2)} fee)`,
        executedPrice,
        quantity: 0,
        feeUsd,
        totalCostUsd,
        newBalance: currentBalance,
        newPosition: currentPosition || { assetId: request.assetId, symbol: request.symbol, name: request.name, quantity: 0, avgBuyPriceUsd: 0 }
      };
    }

    const quantityBought = usdToSpend / executedPrice;
    const oldQuantity = currentPosition?.quantity || 0;
    const oldAvgPrice = currentPosition?.avgBuyPriceUsd || 0;

    // Update Cost Basis (Weighted Average Formula)
    // New Avg Price = ((Old Qty * Old Avg Price) + (New Qty * Executed Price)) / (Old Qty + New Qty)
    const newQuantity = oldQuantity + quantityBought;
    const newAvgPrice = ((oldQuantity * oldAvgPrice) + (quantityBought * executedPrice)) / newQuantity;

    return {
      success: true,
      executedPrice,
      quantity: quantityBought,
      feeUsd,
      totalCostUsd,
      newBalance: currentBalance - totalCostUsd,
      newPosition: {
        assetId: request.assetId,
        symbol: request.symbol,
        name: request.name,
        quantity: newQuantity,
        avgBuyPriceUsd: newAvgPrice
      }
    };
  } else {
    // SELL Logic
    const quantityToSell = request.amount;
    const currentQuantity = currentPosition?.quantity || 0;

    // Validation: Insufficient Quantity
    if (quantityToSell > currentQuantity) {
      return {
        success: false,
        error: `Insufficient ${request.symbol.toUpperCase()} quantity. Available: ${currentQuantity.toFixed(8)}`,
        executedPrice,
        quantity: 0,
        feeUsd: 0,
        totalCostUsd: 0,
        newBalance: currentBalance,
        newPosition: currentPosition || { assetId: request.assetId, symbol: request.symbol, name: request.name, quantity: 0, avgBuyPriceUsd: 0 }
      };
    }

    const grossProceeds = quantityToSell * executedPrice;
    const feeUsd = grossProceeds * TRANSACTION_FEE_RATE;
    const netProceeds = grossProceeds - feeUsd;

    // Realized PnL Calculation
    const costOfQuantitySold = quantityToSell * (currentPosition?.avgBuyPriceUsd || 0);
    const realizedPnl = grossProceeds - costOfQuantitySold - feeUsd;

    const newQuantity = currentQuantity - quantityToSell;

    return {
      success: true,
      executedPrice,
      quantity: quantityToSell,
      feeUsd,
      totalCostUsd: netProceeds,
      newBalance: currentBalance + netProceeds,
      realizedPnl,
      newPosition: {
        assetId: request.assetId,
        symbol: request.symbol,
        name: request.name,
        quantity: newQuantity,
        // Avg Buy Price remains the same for the remaining quantity
        avgBuyPriceUsd: newQuantity > 0 ? (currentPosition?.avgBuyPriceUsd || 0) : 0
      }
    };
  }
}
