# Context API Documentation: WalletContext

The `WalletContext` is the central "brain" of the CoinSwitch application. It manages all global states, including user authentication, real-time market prices, portfolio positions, and trade execution.

## 1. Overview
The context is implemented in [WalletContext.tsx](src/context/WalletContext.tsx). It uses a combination of `useState`, `useReducer` (implied via complex state updates), and `useEffect` to synchronize data between the UI, the local storage, and the server-side JSON database.

## 2. State Structure
The global state is defined by the `WalletState` interface:

```typescript
export interface WalletState {
  user?: UserProfile;          // Current logged-in user info
  ownerName?: string;         // Display name for the dashboard
  userWallets: Record<string, { // Map of all users' financial data
    balanceUsd: number;
    positions: Record<string, Position>;
    trades: Trade[];
  }>;
}
```

## 3. Core Capabilities

### 🛡️ Authentication & Session
- **`setUser(user)`**: Updates the active user and persists the profile to `localStorage` under the key `coinswitch_user`.
- **`logout()`**: Clears the active user and triggers a redirect to the login page.
- **`lastSession`**: Automatically tracks the last active user's data to enable the "Flashback" feature for logged-out users.

### 💰 Financial Operations
- **`buy(params)`**: 
  1. Validates available balance.
  2. Calculates quantity based on current market price.
  3. Updates the user's position and balance.
  4. Records the transaction in `trades`.
- **`sell(params)`**: 
  1. Validates that the user holds the asset.
  2. Calculates realized Profit/Loss (P&L).
  3. Updates balance and removes/reduces the position.

### 📊 Market Data (WebSocket)
- **Real-time Sync**: Automatically connects to the Binance WebSocket API.
- **Dynamic Subscription**: Subscribes to price streams for assets currently held in the portfolio or explicitly watched via `subscribeToPrice(assetId)`.
- **Global Prices**: Maintains a `prices` record mapping `coinId` to the latest numeric price.

## 4. Data Persistence (The Sync Cycle)
1. **Hydration**: On mount, the provider reads the active user from `localStorage` and fetches all wallet data from the `/api/wallet` endpoint.
2. **State Update**: When a trade occurs, the internal React state updates immediately for zero-latency UI feedback.
3. **Server Sync**: An `useEffect` hook watches for changes in `userWallets`. It debounces changes by 1000ms and sends a `POST` request to `/api/wallet` to update the server-side [wallets.json](data/wallets.json).

## 5. Usage in Components
To access the global state, any component within the provider can use the `useWallet` hook:

```tsx
const { balanceUsd, buy, prices } = useWallet();

const handleBuy = () => {
  buy({
    assetId: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    usdAmount: 100,
    priceUsd: prices["bitcoin"]
  });
};
```

---
*This context ensures that the application remains reactive, consistent, and persistent across all pages.*
