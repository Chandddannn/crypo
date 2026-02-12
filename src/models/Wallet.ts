import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrade {
  id: string;
  type: 'BUY' | 'SELL';
  assetId: string;
  symbol: string;
  name: string;
  usdAmount: number;
  quantity: number;
  priceUsd: number;
  realizedPnlUsd?: number;
  timestamp: string;
}

export interface IPosition {
  assetId: string;
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPriceUsd: number;
}

export interface IWallet extends Document {
  userId: string;
  balanceUsd: number;
  positions: Map<string, IPosition>;
  trades: ITrade[];
  updatedAt: Date;
}

const TradeSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  assetId: { type: String, required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  usdAmount: { type: Number, required: true },
  quantity: { type: Number, required: true },
  priceUsd: { type: Number, required: true },
  realizedPnlUsd: { type: Number },
  timestamp: { type: String, required: true },
}, { _id: false });

const PositionSchema = new Schema({
  assetId: { type: String, required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  avgBuyPriceUsd: { type: Number, required: true },
}, { _id: false });

const WalletSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    balanceUsd: {
      type: Number,
      required: true,
      default: 10000,
    },
    positions: {
      type: Map,
      of: PositionSchema,
      default: {},
    },
    trades: {
      type: [TradeSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const Wallet: Model<IWallet> = mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);

export default Wallet;
